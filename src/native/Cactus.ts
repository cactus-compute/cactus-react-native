import { NitroModules } from 'react-native-nitro-modules';
import type { Cactus as CactusSpec } from '../specs/Cactus.nitro';
import type {
  CactusLMCompleteResult,
  Message,
  Options,
  Tool,
} from '../types/CactusLM';

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
    options?: Options,
    tools?: Tool[],
    callback?: (token: string, tokenId: number) => void
  ): Promise<CactusLMCompleteResult> {
    const messagesJson = JSON.stringify(messages);
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

  public embed(text: string, embeddingBufferSize: number): Promise<number[]> {
    return this.hybridCactus.embed(text, embeddingBufferSize);
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
