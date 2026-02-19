import { type CactusModelOptions } from './common';

export interface CactusSTTParams {
  model?: string;
  options?: CactusModelOptions;
}

export interface CactusSTTDownloadParams {
  onProgress?: (progress: number) => void;
}

export interface CactusSTTTranscribeOptions {
  temperature?: number;
  topP?: number;
  topK?: number;
  maxTokens?: number;
  stopSequences?: string[];
  useVad?: boolean;
  telemetryEnabled?: boolean;
}

export interface CactusSTTTranscribeParams {
  audio: string | number[];
  prompt?: string;
  options?: CactusSTTTranscribeOptions;
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

export interface CactusSTTStreamTranscribeStartOptions {
  confirmationThreshold?: number;
  minChunkSize?: number;
  telemetryEnabled?: boolean;
}

export interface CactusSTTStreamTranscribeProcessParams {
  audio: number[];
}

export interface CactusSTTStreamTranscribeProcessResult {
  success: boolean;
  confirmed: string;
  pending: string;
  bufferDurationMs?: number;
  confidence?: number;
  timeToFirstTokenMs?: number;
  totalTimeMs?: number;
}

export interface CactusSTTStreamTranscribeStopResult {
  success: boolean;
  confirmed: string;
}
