import type { CactusModel } from './types/common';

const RUNTIME_VERSION = '1.13.0';

let registryPromise: Promise<{ [key: string]: CactusModel }> | null = null;

export function getRegistry(): Promise<{ [key: string]: CactusModel }> {
  return (registryPromise ??= fetchRegistry());
}

function parseVersionTag(tag: string): [number, number, number] | null {
  const m = tag.match(/^v(\d+)\.(\d+)(?:\.(\d+))?$/);
  if (!m) return null;
  return [+m[1]!, +m[2]!, +(m[3] ?? '0')];
}

function compareVersions(
  a: [number, number, number],
  b: [number, number, number]
): number {
  return a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
}

async function resolveWeightVersion(modelId: string): Promise<string> {
  const runtime = parseVersionTag(`v${RUNTIME_VERSION}`);
  if (!runtime) throw new Error(`Invalid runtime version: ${RUNTIME_VERSION}`);

  const res = await fetch(`https://huggingface.co/api/models/${modelId}/refs`);
  if (!res.ok)
    throw new Error(`Failed to fetch refs for ${modelId}: ${res.status}`);

  const { tags = [] } = (await res.json()) as { tags: { name: string }[] };

  const compatible = tags
    .map((t) => t.name)
    .filter((name) => parseVersionTag(name) !== null)
    .filter((name) => compareVersions(parseVersionTag(name)!, runtime) <= 0)
    .sort((a, b) => compareVersions(parseVersionTag(b)!, parseVersionTag(a)!));

  if (!compatible.length) throw new Error('No compatible weight version found');
  return compatible[0]!;
}

async function fetchRegistry(): Promise<{ [key: string]: CactusModel }> {
  const response = await fetch(
    'https://huggingface.co/api/models?author=Cactus-Compute&full=true'
  ).catch((e) => {
    registryPromise = null;
    throw e;
  });
  if (!response.ok) {
    registryPromise = null;
    throw new Error(`Failed to fetch model registry: ${response.status}`);
  }

  const models: any[] = await response.json();
  if (!models.length) return {};

  const registry: { [key: string]: CactusModel } = {};

  await Promise.all(
    models.map(async ({ id, siblings = [], tags = [] }) => {
      const weights: string[] = (siblings as any[])
        .map((s: any) => s.rfilename as string)
        .filter((f) => f.startsWith('weights/') && f.endsWith('.zip'));

      if (
        !weights.some((f) => f.endsWith('-int4.zip')) ||
        !weights.some((f) => f.endsWith('-int8.zip'))
      )
        return;

      const version = await resolveWeightVersion(id).catch(() => null);
      if (!version) return;

      const key = weights
        .find((f) => f.endsWith('-int4.zip'))!
        .replace('weights/', '')
        .replace('-int4.zip', '');

      const base = `https://huggingface.co/${id}/resolve/${version}/weights/${key}`;

      const tree = await fetch(
        `https://huggingface.co/api/models/${id}/tree/${version}/weights`
      )
        .then((r) =>
          r.ok ? (r.json() as Promise<{ path: string; size?: number }[]>) : null
        )
        .catch(() => null);

      const sizeMb = (suffix: string) =>
        Math.round(
          (tree?.find((f) => f.path === `weights/${key}${suffix}`)?.size ?? 0) /
            (1024 * 1024)
        );

      registry[key] = {
        slug: key,
        capabilities: (tags as string[]).filter((t) => !t.includes(':')),
        quantization: {
          int4: {
            sizeMb: sizeMb('-int4.zip'),
            url: `${base}-int4.zip`,
            ...(weights.some((f) => f.endsWith('-int4-apple.zip'))
              ? { pro: { apple: `${base}-int4-apple.zip` } }
              : {}),
          },
          int8: {
            sizeMb: sizeMb('-int8.zip'),
            url: `${base}-int8.zip`,
            ...(weights.some((f) => f.endsWith('-int8-apple.zip'))
              ? { pro: { apple: `${base}-int8-apple.zip` } }
              : {}),
          },
        },
      };
    })
  );

  return registry;
}
