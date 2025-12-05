import { NitroModules } from 'react-native-nitro-modules';
import type { Cactus as CactusSpec } from '../specs/Cactus.nitro';
import { CactusImage } from './CactusImage';
import type {
  CactusLMCompleteResult,
  Message,
  CompleteOptions,
  Tool,
} from '../types/CactusLM';
import type {
  CactusSTTTranscribeResult,
  TranscribeOptions,
} from '../types/CactusSTT';

export class Cactus {
  private readonly hybridCactus =
    NitroModules.createHybridObject<CactusSpec>('Cactus');

  public init(
    modelPath: string,
    contextSize: number,
    corpusDir?: string
  ): Promise<void> {
    return this.hybridCactus.init(modelPath, contextSize, corpusDir);
  }

  public async complete(
    messages: Message[],
    responseBufferSize: number,
    options?: CompleteOptions,
    tools?: { type: 'function'; function: Tool }[],
    callback?: (token: string, tokenId: number) => void
  ): Promise<CactusLMCompleteResult> {
    const messagesInternal: Message[] = [];
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i]!;
      const isLastMessage = i === messages.length - 1;

      if (!message.images || !isLastMessage) {
        messagesInternal.push({
          ...message,
          images: undefined,
        });
        continue;
      }

      const resizedImages: string[] = [];
      for (const imagePath of message.images) {
        const resizedImage = await CactusImage.resize(
          imagePath.replace('file://', ''),
          128,
          128,
          1
        );
        resizedImages.push(resizedImage);
      }

      messagesInternal.push({ ...message, images: resizedImages });
    }

    const messagesJson = JSON.stringify(messagesInternal);
    const optionsJson = options
      ? JSON.stringify({
          temperature: options.temperature,
          top_p: options.topP,
          top_k: options.topK,
          max_tokens: options.maxTokens,
          stop_sequences: options.stopSequences,
        })
      : undefined;
    const toolsJson = JSON.stringify(tools);

    const response = await this.hybridCactus.complete(
      messagesJson,
      responseBufferSize,
      optionsJson,
      toolsJson,
      callback
    );

    try {
      const parsed = JSON.parse(response);

      return {
        success: parsed.success,
        response: parsed.response,
        functionCalls: parsed.function_calls,
        timeToFirstTokenMs: parsed.time_to_first_token_ms,
        totalTimeMs: parsed.total_time_ms,
        tokensPerSecond: parsed.tokens_per_second,
        prefillTokens: parsed.prefill_tokens,
        decodeTokens: parsed.decode_tokens,
        totalTokens: parsed.total_tokens,
      };
    } catch {
      throw new Error('Unable to parse completion response');
    }
  }

  public async transcribe(
    audioFilePath: string,
    prompt: string,
    responseBufferSize: number,
    options?: TranscribeOptions,
    callback?: (token: string, tokenId: number) => void
  ): Promise<CactusSTTTranscribeResult> {
    const optionsJson = options
      ? JSON.stringify({
          temperature: options.temperature,
          top_p: options.topP,
          top_k: options.topK,
          max_tokens: options.maxTokens,
          stop_sequences: options.stopSequences,
        })
      : undefined;

    const response = await this.hybridCactus.transcribe(
      audioFilePath.replace('file://', ''),
      prompt,
      responseBufferSize,
      optionsJson,
      callback
    );

    try {
      const parsed = JSON.parse(response);

      return {
        success: parsed.success,
        response: parsed.response,
        timeToFirstTokenMs: parsed.time_to_first_token_ms,
        totalTimeMs: parsed.total_time_ms,
        tokensPerSecond: parsed.tokens_per_second,
        prefillTokens: parsed.prefill_tokens,
        decodeTokens: parsed.decode_tokens,
        totalTokens: parsed.total_tokens,
      };
    } catch {
      throw new Error('Unable to parse transcription response');
    }
  }

  public embed(text: string, embeddingBufferSize: number): Promise<number[]> {
    return this.hybridCactus.embed(text, embeddingBufferSize);
  }

  public async imageEmbed(
    imagePath: string,
    embeddingBufferSize: number
  ): Promise<number[]> {
    const resizedImage = await CactusImage.resize(
      imagePath.replace('file://', ''),
      128,
      128,
      1
    );
    return this.hybridCactus.imageEmbed(resizedImage, embeddingBufferSize);
  }

  public audioEmbed(
    audioPath: string,
    embeddingBufferSize: number
  ): Promise<number[]> {
    return this.hybridCactus.audioEmbed(
      audioPath.replace('file://', ''),
      embeddingBufferSize
    );
  }

  public reset(): Promise<void> {
    return this.hybridCactus.reset();
  }

  public stop(): Promise<void> {
    return this.hybridCactus.stop();
  }

  public destroy(): Promise<void> {
    return this.hybridCactus.destroy();
  }
}
