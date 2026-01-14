import { type ModelOptions } from './common';

export interface CactusSTTParams {
  model?: string;
  contextSize?: number;
  options?: ModelOptions;
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
  audio: string | number[];
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

export interface CactusSTTStreamTranscribeInsertParams {
  audio: number[];
}

export interface StreamTranscribeProcessOptions {
  confirmationThreshold?: number;
}

export interface CactusSTTStreamTranscribeProcessParams {
  options?: StreamTranscribeProcessOptions;
}

export interface CactusSTTStreamTranscribeProcessResult {
  success: boolean;
  confirmed: string;
  pending: string;
}

export interface CactusSTTStreamTranscribeFinalizeResult {
  success: boolean;
  confirmed: string;
}
