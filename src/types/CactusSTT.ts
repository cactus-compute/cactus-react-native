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
  confidenceThreshold?: number;
  cloudHandoffThreshold?: number;
  includeStopSequences?: boolean;
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
  cloudHandoff?: boolean;
  confidence?: number;
  timeToFirstTokenMs: number;
  totalTimeMs: number;
  prefillTokens: number;
  prefillTps: number;
  decodeTokens: number;
  decodeTps: number;
  totalTokens: number;
  ramUsageMb?: number;
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
  cloudHandoff?: boolean;
  cloudResult?: string;
  cloudJobId?: number;
  cloudResultJobId?: number;
  timeToFirstTokenMs?: number;
  totalTimeMs?: number;
  prefillTokens?: number;
  prefillTps?: number;
  decodeTokens?: number;
  decodeTps?: number;
  totalTokens?: number;
  ramUsageMb?: number;
}

export interface CactusSTTStreamTranscribeStopResult {
  success: boolean;
  confirmed: string;
}

export interface CactusSTTDetectLanguageOptions {
  useVad?: boolean;
}

export interface CactusSTTDetectLanguageParams {
  audio: string | number[];
  options?: CactusSTTDetectLanguageOptions;
}

export interface CactusSTTDetectLanguageResult {
  language: string;
  confidence?: number;
}
