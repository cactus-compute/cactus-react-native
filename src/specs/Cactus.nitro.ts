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
  embed(text: string, embeddingBufferSize: number): Promise<number[]>;
  reset(): Promise<void>;
  stop(): Promise<void>;
  destroy(): Promise<void>;
}
