export interface CactusIndexParams {
  name: string;
  embeddingDim: number;
}

export interface CactusIndexAddParams {
  ids: number[];
  documents: string[];
  embeddings: number[][];
  metadatas?: string[];
}

export interface CactusIndexGetParams {
  ids: number[];
}

export interface CactusIndexGetResult {
  documents: string[];
  metadatas: string[];
  embeddings: number[][];
}

export interface IndexQueryOptions {
  topK?: number;
  scoreThreshold?: number;
}

export interface CactusIndexQueryParams {
  embeddings: number[][];
  options?: IndexQueryOptions;
}

export interface CactusIndexQueryResult {
  ids: number[][];
  scores: number[][];
}

export interface CactusIndexDeleteParams {
  ids: number[];
}
