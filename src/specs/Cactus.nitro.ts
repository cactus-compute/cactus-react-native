import type { HybridObject } from 'react-native-nitro-modules';

export interface Cactus extends HybridObject<{ ios: 'c++'; android: 'c++' }> {
  init(
    modelPath: string,
    corpusDir?: string,
    cacheIndex?: boolean
  ): Promise<void>;
  complete(
    messagesJson: string,
    responseBufferSize: number,
    optionsJson?: string,
    toolsJson?: string,
    callback?: (token: string, tokenId: number) => void
  ): Promise<string>;
  tokenize(text: string): Promise<number[]>;
  scoreWindow(
    tokens: number[],
    start: number,
    end: number,
    context: number
  ): Promise<string>;
  transcribe(
    audio: string | number[],
    prompt: string,
    responseBufferSize: number,
    optionsJson?: string,
    callback?: (token: string, tokenId: number) => void
  ): Promise<string>;
  detectLanguage(
    audio: string | number[],
    responseBufferSize: number,
    optionsJson?: string
  ): Promise<string>;
  streamTranscribeStart(optionsJson?: string): Promise<void>;
  streamTranscribeProcess(audio: number[]): Promise<string>;
  streamTranscribeStop(): Promise<string>;
  vad(
    audio: string | number[],
    responseBufferSize: number,
    optionsJson?: string
  ): Promise<string>;
  embed(
    text: string,
    embeddingBufferSize: number,
    normalize: boolean
  ): Promise<number[]>;
  imageEmbed(imagePath: string, embeddingBufferSize: number): Promise<number[]>;
  audioEmbed(audioPath: string, embeddingBufferSize: number): Promise<number[]>;
  reset(): Promise<void>;
  stop(): Promise<void>;
  destroy(): Promise<void>;
  setTelemetryEnvironment(cacheDir: string): Promise<void>;
}
