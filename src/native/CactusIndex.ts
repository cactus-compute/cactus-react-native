import { NitroModules } from 'react-native-nitro-modules';
import type { CactusIndex as CactusIndexSpec } from '../specs/CactusIndex.nitro';
import type {
  CactusIndexGetResult,
  CactusIndexQueryResult,
  CactusIndexQueryOptions,
} from '../types/CactusIndex';

export class CactusIndex {
  private readonly hybridCactusIndex =
    NitroModules.createHybridObject<CactusIndexSpec>('CactusIndex');

  public init(indexPath: string, embeddingDim: number): Promise<void> {
    return this.hybridCactusIndex.init(indexPath, embeddingDim);
  }

  public add(
    ids: number[],
    documents: string[],
    embeddings: number[][],
    metadatas?: string[]
  ): Promise<void> {
    return this.hybridCactusIndex.add(ids, documents, embeddings, metadatas);
  }

  public delete(ids: number[]): Promise<void> {
    return this.hybridCactusIndex._delete(ids);
  }

  public get(ids: number[]): Promise<CactusIndexGetResult> {
    return this.hybridCactusIndex.get(ids);
  }

  public query(
    embeddings: number[][],
    options?: CactusIndexQueryOptions
  ): Promise<CactusIndexQueryResult> {
    const optionsJson = options
      ? JSON.stringify({
          top_k: options.topK,
          score_threshold: options.scoreThreshold,
        })
      : undefined;
    return this.hybridCactusIndex.query(embeddings, optionsJson);
  }

  public compact(): Promise<void> {
    return this.hybridCactusIndex.compact();
  }

  public destroy(): Promise<void> {
    return this.hybridCactusIndex.destroy();
  }
}
