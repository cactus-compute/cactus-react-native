export interface CactusLMParams {
  model?: string;
  contextSize?: number;
  corpusDir?: string;
}

export interface CactusLMDownloadParams {
  onProgress?: (progress: number) => void;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content?: string;
  images?: string[];
}

export interface Options {
  temperature?: number;
  topP?: number;
  topK?: number;
  maxTokens?: number;
  stopSequences?: string[];
}

export interface Tool {
  type: 'function';
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
  messages: Message[];
  options?: Options;
  tools?: Tool[];
  onToken?: (token: string) => void;
}

export interface CactusLMCompleteResult {
  success: boolean;
  response: string;
  functionCalls?: {
    name: string;
    arguments: { [key: string]: any };
  }[];
  timeToFirstTokenMs: number;
  totalTimeMs: number;
  tokensPerSecond: number;
  prefillTokens: number;
  decodeTokens: number;
  totalTokens: number;
}

export interface CactusLMEmbedParams {
  text: string;
}

export interface CactusLMEmbedResult {
  embedding: number[];
}

export interface CactusLMGetModelsParams {
  forceRefresh?: boolean;
}
