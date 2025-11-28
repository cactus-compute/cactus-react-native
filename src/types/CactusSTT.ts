export interface CactusSTTParams {
  model?: string;
  contextSize?: number;
}

export interface CactusSTTDownloadParams {
  onProgress?: (progress: number) => void;
}

export interface TranscribeOptions {
  temperature?: number;
  topP?: number;
  topK?: number;
  maxTokens?: number;
  stopSequences?: string[];
}

export interface CactusSTTTranscribeParams {
  audioFilePath: string;
  prompt?: string;
  options?: TranscribeOptions;
  onToken?: (token: string) => void;
}

export interface CactusSTTTranscribeResult {
  success: boolean;
  response: string;
  timeToFirstTokenMs: number;
  totalTimeMs: number;
  tokensPerSecond: number;
  prefillTokens: number;
  decodeTokens: number;
  totalTokens: number;
}

export interface CactusSTTAudioEmbedParams {
  audioPath: string;
}

export interface CactusSTTAudioEmbedResult {
  embedding: number[];
}
