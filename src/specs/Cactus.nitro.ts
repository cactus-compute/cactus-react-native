import type { HybridObject } from 'react-native-nitro-modules';

export interface Cactus extends HybridObject<{ ios: 'c++'; android: 'c++' }> {
  init(
    modelPath: string,
    contextSize: number,
    corpusDir?: string
  ): Promise<void>;
  complete(
    messagesJson: string,
    responseBufferSize: number,
    optionsJson?: string,
    toolsJson?: string,
    callback?: (token: string, tokenId: number) => void
  ): Promise<string>;
  transcribe(
    audio: string | number[],
    prompt: string,
    responseBufferSize: number,
    optionsJson?: string,
    callback?: (token: string, tokenId: number) => void
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
  setTelemetryToken(token: string): void;
  setProKey(proKey: string): void;
}
