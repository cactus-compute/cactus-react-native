import { type CactusModelOptions } from './common';

export interface CactusLMParams {
  model?: string;
  corpusDir?: string;
  cacheIndex?: boolean;
  options?: CactusModelOptions;
}

export interface CactusLMDownloadParams {
  onProgress?: (progress: number) => void;
}

export interface CactusLMMessage {
  role: 'user' | 'assistant' | 'system';
  content?: string;
  images?: string[];
}

export interface CactusLMCompleteOptions {
  temperature?: number;
  topP?: number;
  topK?: number;
  maxTokens?: number;
  stopSequences?: string[];
  forceTools?: boolean;
  telemetryEnabled?: boolean;
  confidenceThreshold?: number;
  toolRagTopK?: number;
  includeStopSequences?: boolean;
  useVad?: boolean;
}

export interface CactusLMTool {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: {
      [key: string]: {
        type: string;
        description: string;
      };
    };
    required: string[];
  };
}

export interface CactusLMCompleteParams {
  messages: CactusLMMessage[];
  options?: CactusLMCompleteOptions;
  tools?: CactusLMTool[];
  onToken?: (token: string) => void;
}

export interface CactusLMCompleteResult {
  success: boolean;
  response: string;
  functionCalls?: {
    name: string;
    arguments: { [key: string]: any };
  }[];
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

export interface CactusLMTokenizeParams {
  text: string;
}

export interface CactusLMTokenizeResult {
  tokens: number[];
}

export interface CactusLMScoreWindowParams {
  tokens: number[];
  start: number;
  end: number;
  context: number;
}

export interface CactusLMScoreWindowResult {
  score: number;
}

export interface CactusLMEmbedParams {
  text: string;
  normalize?: boolean;
}

export interface CactusLMEmbedResult {
  embedding: number[];
}

export interface CactusLMImageEmbedParams {
  imagePath: string;
}

export interface CactusLMImageEmbedResult {
  embedding: number[];
}
