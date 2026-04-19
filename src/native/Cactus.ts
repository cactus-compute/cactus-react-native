import { NitroModules } from 'react-native-nitro-modules';
import type { Cactus as CactusSpec } from '../specs/Cactus.nitro';
import { CactusImage } from './CactusImage';
import type {
  CactusLMCompleteResult,
  CactusLMPrefillResult,
  CactusLMMessage,
  CactusLMCompleteOptions,
  CactusLMTool,
} from '../types/CactusLM';
import type {
  CactusSTTTranscribeResult,
  CactusSTTTranscribeOptions,
  CactusSTTStreamTranscribeStartOptions,
  CactusSTTStreamTranscribeProcessResult,
  CactusSTTStreamTranscribeStopResult,
  CactusSTTDetectLanguageOptions,
  CactusSTTDetectLanguageResult,
} from '../types/CactusSTT';
import type {
  CactusAudioVADOptions,
  CactusAudioVADResult,
  CactusAudioDiarizeOptions,
  CactusAudioDiarizeResult,
  CactusAudioEmbedSpeakerOptions,
  CactusAudioEmbedSpeakerResult,
} from '../types/CactusAudio';

export class Cactus {
  private readonly hybridCactus =
    NitroModules.createHybridObject<CactusSpec>('Cactus');

  public init(
    modelPath: string,
    corpusDir?: string,
    cacheIndex?: boolean
  ): Promise<void> {
    return this.hybridCactus.init(modelPath, corpusDir, cacheIndex ?? false);
  }

  public async complete(
    messages: CactusLMMessage[],
    responseBufferSize: number,
    options?: CactusLMCompleteOptions,
    tools?: { type: 'function'; function: CactusLMTool }[],
    callback?: (token: string, tokenId: number) => void,
    audio?: number[]
  ): Promise<CactusLMCompleteResult> {
    const messagesInternal: CactusLMMessage[] = [];
    for (const message of messages) {
      if (!message.images) {
        messagesInternal.push(message);
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
          force_tools: options.forceTools,
          telemetry_enabled: options.telemetryEnabled,
          confidence_threshold: options.confidenceThreshold,
          tool_rag_top_k: options.toolRagTopK,
          include_stop_sequences: options.includeStopSequences,
          use_vad: options.useVad,
          enable_thinking_if_supported: options.enableThinking,
        })
      : undefined;
    const toolsJson = JSON.stringify(tools);

    const response = await this.hybridCactus.complete(
      messagesJson,
      responseBufferSize,
      optionsJson,
      toolsJson,
      callback,
      audio
    );

    try {
      const parsed = JSON.parse(response);

      return {
        success: parsed.success,
        response: parsed.response,
        thinking: parsed.thinking,
        functionCalls: parsed.function_calls,
        cloudHandoff: parsed.cloud_handoff,
        confidence: parsed.confidence,
        timeToFirstTokenMs: parsed.time_to_first_token_ms,
        totalTimeMs: parsed.total_time_ms,
        prefillTokens: parsed.prefill_tokens,
        prefillTps: parsed.prefill_tps,
        decodeTokens: parsed.decode_tokens,
        decodeTps: parsed.decode_tps,
        totalTokens: parsed.total_tokens,
        ramUsageMb: parsed.ram_usage_mb,
      };
    } catch {
      throw new Error('Unable to parse completion response');
    }
  }

  public async prefill(
    messages: CactusLMMessage[],
    responseBufferSize: number,
    options?: CactusLMCompleteOptions,
    tools?: { type: 'function'; function: CactusLMTool }[],
    audio?: number[]
  ): Promise<CactusLMPrefillResult> {
    const messagesJson = JSON.stringify(messages);
    const optionsJson = options
      ? JSON.stringify({
          temperature: options.temperature,
          top_p: options.topP,
          top_k: options.topK,
          max_tokens: options.maxTokens,
          stop_sequences: options.stopSequences,
          force_tools: options.forceTools,
          telemetry_enabled: options.telemetryEnabled,
          confidence_threshold: options.confidenceThreshold,
          tool_rag_top_k: options.toolRagTopK,
          include_stop_sequences: options.includeStopSequences,
          use_vad: options.useVad,
          enable_thinking_if_supported: options.enableThinking,
        })
      : undefined;
    const toolsJson = JSON.stringify(tools);

    const response = await this.hybridCactus.prefill(
      messagesJson,
      responseBufferSize,
      optionsJson,
      toolsJson,
      audio
    );

    try {
      const parsed = JSON.parse(response);

      return {
        success: parsed.success,
        error: parsed.error,
        prefillTokens: parsed.prefill_tokens,
        prefillTps: parsed.prefill_tps,
        totalTimeMs: parsed.total_time_ms,
        ramUsageMb: parsed.ram_usage_mb,
      };
    } catch {
      throw new Error('Unable to parse prefill response');
    }
  }

  public tokenize(text: string): Promise<number[]> {
    return this.hybridCactus.tokenize(text);
  }

  public async scoreWindow(
    tokens: number[],
    start: number,
    end: number,
    context: number
  ): Promise<number> {
    const response = await this.hybridCactus.scoreWindow(
      tokens,
      start,
      end,
      context
    );
    try {
      const parsed = JSON.parse(response);
      return parsed.logprob;
    } catch {
      throw new Error('Unable to parse score window response');
    }
  }

  public async transcribe(
    audio: string | number[],
    prompt: string,
    responseBufferSize: number,
    options?: CactusSTTTranscribeOptions,
    callback?: (token: string, tokenId: number) => void
  ): Promise<CactusSTTTranscribeResult> {
    if (typeof audio === 'string') {
      audio = audio.replace('file://', '');
    }

    const optionsJson = options
      ? JSON.stringify({
          temperature: options.temperature,
          top_p: options.topP,
          top_k: options.topK,
          max_tokens: options.maxTokens,
          stop_sequences: options.stopSequences,
          use_vad: options.useVad,
          telemetry_enabled: options.telemetryEnabled,
          confidence_threshold: options.confidenceThreshold,
          cloud_handoff_threshold: options.cloudHandoffThreshold,
          include_stop_sequences: options.includeStopSequences,
        })
      : undefined;

    const response = await this.hybridCactus.transcribe(
      audio,
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
        cloudHandoff: parsed.cloud_handoff,
        confidence: parsed.confidence,
        timeToFirstTokenMs: parsed.time_to_first_token_ms,
        totalTimeMs: parsed.total_time_ms,
        prefillTokens: parsed.prefill_tokens,
        prefillTps: parsed.prefill_tps,
        decodeTokens: parsed.decode_tokens,
        decodeTps: parsed.decode_tps,
        totalTokens: parsed.total_tokens,
        ramUsageMb: parsed.ram_usage_mb,
      };
    } catch {
      throw new Error('Unable to parse transcription response');
    }
  }

  public streamTranscribeStart(
    options?: CactusSTTStreamTranscribeStartOptions
  ): Promise<void> {
    const optionsJson = options
      ? JSON.stringify({
          confirmation_threshold: options.confirmationThreshold,
          min_chunk_size: options.minChunkSize,
          telemetry_enabled: options.telemetryEnabled,
          language: options.language,
        })
      : undefined;
    return this.hybridCactus.streamTranscribeStart(optionsJson);
  }

  public async streamTranscribeProcess(
    audio: number[]
  ): Promise<CactusSTTStreamTranscribeProcessResult> {
    const response = await this.hybridCactus.streamTranscribeProcess(audio);
    try {
      const parsed = JSON.parse(response);
      return {
        success: parsed.success,
        confirmed: parsed.confirmed,
        pending: parsed.pending,
        bufferDurationMs: parsed.buffer_duration_ms,
        confidence: parsed.confidence,
        cloudHandoff: parsed.cloud_handoff,
        cloudResult: parsed.cloud_result,
        cloudJobId: parsed.cloud_job_id,
        cloudResultJobId: parsed.cloud_result_job_id,
        timeToFirstTokenMs: parsed.time_to_first_token_ms,
        totalTimeMs: parsed.total_time_ms,
        prefillTokens: parsed.prefill_tokens,
        prefillTps: parsed.prefill_tps,
        decodeTokens: parsed.decode_tokens,
        decodeTps: parsed.decode_tps,
        totalTokens: parsed.total_tokens,
        ramUsageMb: parsed.ram_usage_mb,
      };
    } catch {
      throw new Error('Unable to parse stream transcribe process response');
    }
  }

  public async detectLanguage(
    audio: string | number[],
    options?: CactusSTTDetectLanguageOptions
  ): Promise<CactusSTTDetectLanguageResult> {
    if (typeof audio === 'string') {
      audio = audio.replace('file://', '');
    }

    const optionsJson = options
      ? JSON.stringify({ use_vad: options.useVad })
      : undefined;

    const response = await this.hybridCactus.detectLanguage(
      audio,
      1024,
      optionsJson
    );

    try {
      const parsed = JSON.parse(response);

      return {
        language: parsed.language,
        confidence: parsed.confidence,
      };
    } catch {
      throw new Error('Unable to parse detect language response');
    }
  }

  public async streamTranscribeStop(): Promise<CactusSTTStreamTranscribeStopResult> {
    const response = await this.hybridCactus.streamTranscribeStop();
    try {
      const parsed = JSON.parse(response);
      return { success: parsed.success, confirmed: parsed.confirmed };
    } catch {
      throw new Error('Unable to parse stream transcribe stop response');
    }
  }

  public async vad(
    audio: string | number[],
    options?: CactusAudioVADOptions
  ): Promise<CactusAudioVADResult> {
    if (typeof audio === 'string') {
      audio = audio.replace('file://', '');
    }
    const optionsJson = options
      ? JSON.stringify({
          threshold: options.threshold,
          neg_threshold: options.negThreshold,
          min_speech_duration_ms: options.minSpeechDurationMs,
          max_speech_duration_s: options.maxSpeechDurationS,
          min_silence_duration_ms: options.minSilenceDurationMs,
          speech_pad_ms: options.speechPadMs,
          window_size_samples: options.windowSizeSamples,
          sampling_rate: options.samplingRate,
          min_silence_at_max_speech: options.minSilenceAtMaxSpeech,
          use_max_poss_sil_at_max_speech: options.useMaxPossSilAtMaxSpeech,
        })
      : undefined;
    const response = await this.hybridCactus.vad(audio, 65536, optionsJson);
    try {
      const parsed = JSON.parse(response);
      return {
        segments: parsed.segments.map((s: { start: number; end: number }) => ({
          start: s.start,
          end: s.end,
        })),
        totalTime: parsed.total_time_ms,
        ramUsage: parsed.ram_usage_mb,
      };
    } catch {
      throw new Error('Unable to parse VAD response');
    }
  }

  public embed(
    text: string,
    embeddingBufferSize: number,
    normalize: boolean
  ): Promise<number[]> {
    return this.hybridCactus.embed(text, embeddingBufferSize, normalize);
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

  public async diarize(
    audio: string | number[],
    options?: CactusAudioDiarizeOptions
  ): Promise<CactusAudioDiarizeResult> {
    if (typeof audio === 'string') {
      audio = audio.replace('file://', '');
    }
    const optionsJson = options
      ? JSON.stringify({
          step_ms: options.stepMs,
          threshold: options.threshold,
          num_speakers: options.numSpeakers,
          min_speakers: options.minSpeakers,
          max_speakers: options.maxSpeakers,
        })
      : undefined;
    const response = await this.hybridCactus.diarize(
      audio,
      2 * 1024 * 1024,
      optionsJson
    );
    try {
      const parsed = JSON.parse(response);
      return {
        success: parsed.success,
        error: parsed.error,
        numSpeakers: parsed.num_speakers,
        scores: parsed.scores,
        totalTimeMs: parsed.total_time_ms,
        ramUsageMb: parsed.ram_usage_mb,
      };
    } catch {
      throw new Error('Unable to parse diarize response');
    }
  }

  public async embedSpeaker(
    audio: string | number[],
    options?: CactusAudioEmbedSpeakerOptions
  ): Promise<CactusAudioEmbedSpeakerResult> {
    if (typeof audio === 'string') {
      audio = audio.replace('file://', '');
    }
    const optionsJson = options
      ? JSON.stringify({
          step_ms: options.stepMs,
          threshold: options.threshold,
        })
      : undefined;
    const response = await this.hybridCactus.embedSpeaker(
      audio,
      65536,
      optionsJson,
      options?.maskWeights,
      options?.maskNumFrames
    );
    try {
      const parsed = JSON.parse(response);
      return {
        success: parsed.success,
        error: parsed.error,
        embedding: parsed.embedding,
        totalTimeMs: parsed.total_time_ms,
        ramUsageMb: parsed.ram_usage_mb,
      };
    } catch {
      throw new Error('Unable to parse embed speaker response');
    }
  }

  public async ragQuery(
    query: string,
    topK: number = 5
  ): Promise<{
    chunks: { score: number; source: string; content: string }[];
    error?: string;
  }> {
    const response = await this.hybridCactus.ragQuery(query, 65536, topK);
    try {
      return JSON.parse(response);
    } catch {
      throw new Error('Unable to parse RAG query response');
    }
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

  public setTelemetryEnvironment(cacheDir: string): Promise<void> {
    return this.hybridCactus.setTelemetryEnvironment(cacheDir);
  }
}
