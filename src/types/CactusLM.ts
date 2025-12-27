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

export interface CompleteOptions {
  temperature?: number;
  topP?: number;
  topK?: number;
  maxTokens?: number;
  stopSequences?: string[];
  forceTools?: boolean;
}

export interface Tool {
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
  options?: CompleteOptions;
  tools?: Tool[];
  onToken?: (token: string) => void;
  mode?: 'local' | 'hybrid';
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
