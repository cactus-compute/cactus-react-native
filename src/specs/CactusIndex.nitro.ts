import type { HybridObject } from 'react-native-nitro-modules';

interface CactusIndexGetResult {
  documents: string[];
  metadatas: string[];
  embeddings: number[][];
}

interface CactusIndexQueryResult {
  ids: number[][];
  scores: number[][];
}

export interface CactusIndex
  extends HybridObject<{ ios: 'c++'; android: 'c++' }> {
  init(indexPath: string, embeddingDim: number): Promise<void>;
  add(
    ids: number[],
    documents: string[],
    embeddings: number[][],
    metadatas?: string[]
  ): Promise<void>;
  _delete(ids: number[]): Promise<void>;
  get(ids: number[]): Promise<CactusIndexGetResult>;
  query(
    embeddings: number[][],
    optionsJson?: string
  ): Promise<CactusIndexQueryResult>;
  compact(): Promise<void>;
  destroy(): Promise<void>;
}
