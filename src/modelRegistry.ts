import type { CactusModel } from './types/common';

const VERSION = 'v1.7';

let registryPromise: Promise<{ [key: string]: CactusModel }> | null = null;

export function getRegistry(): Promise<{ [key: string]: CactusModel }> {
  return (registryPromise ??= fetchRegistry());
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
  const registry: { [key: string]: CactusModel } = {};

  for (const { id, siblings = [] } of models) {
    const weights: string[] = siblings
      .map((s: any) => s.rfilename)
      .filter((f: string) => f.startsWith('weights/') && f.endsWith('.zip'));

    if (
      !weights.some((f) => f.endsWith('-int4.zip')) ||
      !weights.some((f) => f.endsWith('-int8.zip'))
    )
      continue;

    const key = weights
      .find((f) => f.endsWith('-int4.zip'))!
      .replace('weights/', '')
      .replace('-int4.zip', '');

    const base = `https://huggingface.co/${id}/resolve/${VERSION}/weights/${key}`;

    registry[key] = {
      quantization: {
        int4: {
          sizeMb: 0,
          url: `${base}-int4.zip`,
          ...(weights.some((f) => f.endsWith('-int4-apple.zip'))
            ? { pro: { apple: `${base}-int4-apple.zip` } }
            : {}),
        },
        int8: {
          sizeMb: 0,
          url: `${base}-int8.zip`,
          ...(weights.some((f) => f.endsWith('-int8-apple.zip'))
            ? { pro: { apple: `${base}-int8-apple.zip` } }
            : {}),
        },
      },
    };
  }

  return registry;
}
