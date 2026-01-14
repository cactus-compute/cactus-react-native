import { Cactus, CactusFileSystem } from '../native';
import type {
  CactusLMDownloadParams,
  CactusLMCompleteParams,
  CactusLMCompleteResult,
  CactusLMTokenizeParams,
  CactusLMTokenizeResult,
  CactusLMScoreWindowParams,
  CactusLMScoreWindowResult,
  CactusLMEmbedParams,
  CactusLMEmbedResult,
  CactusLMImageEmbedParams,
  CactusLMImageEmbedResult,
  CactusLMParams,
} from '../types/CactusLM';
import { Telemetry } from '../telemetry/Telemetry';
import { CactusConfig } from '../config/CactusConfig';
import { getErrorMessage } from '../utils/error';
import { RemoteLM } from '../api/RemoteLM';
import models from '../models';
import type { CactusModel } from '../types/common';

export class CactusLM {
  private readonly cactus = new Cactus();

  private readonly model: string;
  private readonly contextSize: number;
  private readonly corpusDir?: string;
  private readonly options: {
    quantization: 'int4' | 'int8';
    pro: boolean;
  };

  private isDownloading = false;
  private isInitialized = false;
  private isGenerating = false;

  private static readonly defaultModel = 'qwen3-0.6b';
  private static readonly defaultContextSize = 2048;
  private static readonly defaultOptions = {
    quantization: 'int4' as const,
    pro: false,
  };
  private static readonly quantizationExceptions: {
    [model: string]: 'int4' | 'int8';
  } = {
    'gemma-3-270m-it': 'int8' as const,
    'functiongemma-270m-it': 'int8' as const,
  };
  private static readonly defaultCompleteOptions = {
    maxTokens: 512,
  };
  private static readonly defaultCompleteMode = 'local';
  private static readonly defaultEmbedBufferSize = 2048;

  constructor({ model, contextSize, corpusDir, options }: CactusLMParams = {}) {
    Telemetry.init(CactusConfig.telemetryToken);

    this.model = model ?? CactusLM.defaultModel;
    this.contextSize = contextSize ?? CactusLM.defaultContextSize;
    this.corpusDir = corpusDir;
    this.options = {
      quantization:
        options?.quantization ??
        CactusLM.quantizationExceptions[this.model] ??
        CactusLM.defaultOptions.quantization,
      pro: options?.pro ?? CactusLM.defaultOptions.pro,
    };
  }

  public async download({
    onProgress,
  }: CactusLMDownloadParams = {}): Promise<void> {
    if (this.isModelPath(this.model)) {
      onProgress?.(1.0);
      return;
    }

    if (this.isDownloading) {
      throw new Error('CactusLM is already downloading');
    }

    if (await CactusFileSystem.modelExists(this.getModelName())) {
      console.log('Model already exists', this.getModelName());
      onProgress?.(1.0);
      return;
    }

    this.isDownloading = true;
    try {
      const modelConfig =
        models[this.model]?.quantization[this.options.quantization];
      const url = this.options.pro ? modelConfig?.pro?.apple : modelConfig?.url;

      if (!url) {
        throw new Error(`Model ${this.model} with specified options not found`);
      }

      await CactusFileSystem.downloadModel(
        this.getModelName(),
        url,
        onProgress
      );
    } finally {
      this.isDownloading = false;
    }
  }

  public async init(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    let modelPath: string;
    if (this.isModelPath(this.model)) {
      modelPath = this.model.replace('file://', '');
    } else {
      if (!(await CactusFileSystem.modelExists(this.getModelName()))) {
        console.log('Model not found:', this.getModelName());
        throw new Error(
          `Model "${this.model}" with options ${JSON.stringify(this.options)} is not downloaded`
        );
      }
      modelPath = await CactusFileSystem.getModelPath(this.getModelName());
    }

    try {
      await this.cactus.init(modelPath, this.contextSize, this.corpusDir);
      Telemetry.logInit(this.model, true);
      this.isInitialized = true;
    } catch (error) {
      Telemetry.logInit(this.model, false, getErrorMessage(error));
      throw error;
    }
  }

  public async complete({
    messages,
    options,
    tools,
    onToken,
    mode,
  }: CactusLMCompleteParams): Promise<CactusLMCompleteResult> {
    if (this.isGenerating) {
      throw new Error('CactusLM is already generating');
    }

    options = { ...CactusLM.defaultCompleteOptions, ...options };
    const toolsInternal = tools?.map((tool) => ({
      type: 'function' as const,
      function: tool,
    }));
    mode = mode ?? CactusLM.defaultCompleteMode;

    const responseBufferSize =
      8 * (options.maxTokens ?? CactusLM.defaultCompleteOptions.maxTokens) +
      256;

    try {
      await this.init();

      this.isGenerating = true;
      const result = await this.cactus.complete(
        messages,
        responseBufferSize,
        options,
        toolsInternal,
        onToken
      );
      Telemetry.logCompletion(
        this.model,
        result.success,
        result.success ? undefined : result.response,
        result
      );
      return result;
    } catch (localError) {
      if (mode === 'local') {
        Telemetry.logCompletion(this.model, false, getErrorMessage(localError));
        throw localError;
      }

      Telemetry.logCompletion(
        this.model,
        false,
        `Local completion error: ${getErrorMessage(localError)}. Falling back to remote completion.`
      );

      try {
        return RemoteLM.complete(messages, options, toolsInternal, onToken);
      } catch (remoteError) {
        throw new Error(
          `Remote completion error: ${getErrorMessage(remoteError)}`
        );
      }
    } finally {
      this.isGenerating = false;
    }
  }

  public async tokenize({
    text,
  }: CactusLMTokenizeParams): Promise<CactusLMTokenizeResult> {
    return { tokens: await this.cactus.tokenize(text) };
  }

  public async scoreWindow({
    tokens,
    start,
    end,
    context,
  }: CactusLMScoreWindowParams): Promise<CactusLMScoreWindowResult> {
    return {
      score: await this.cactus.scoreWindow(tokens, start, end, context),
    };
  }

  public async embed({
    text,
    normalize = false,
  }: CactusLMEmbedParams): Promise<CactusLMEmbedResult> {
    if (this.isGenerating) {
      throw new Error('CactusLM is already generating');
    }

    await this.init();

    this.isGenerating = true;
    try {
      const embedding = await this.cactus.embed(
        text,
        CactusLM.defaultEmbedBufferSize,
        normalize
      );
      Telemetry.logEmbedding(this.model, true);
      return { embedding };
    } catch (error) {
      Telemetry.logEmbedding(this.model, false, getErrorMessage(error));
      throw error;
    } finally {
      this.isGenerating = false;
    }
  }

  public async imageEmbed({
    imagePath,
  }: CactusLMImageEmbedParams): Promise<CactusLMImageEmbedResult> {
    if (this.isGenerating) {
      throw new Error('CactusLM is already generating');
    }

    await this.init();

    this.isGenerating = true;
    try {
      const embedding = await this.cactus.imageEmbed(
        imagePath,
        CactusLM.defaultEmbedBufferSize
      );
      Telemetry.logImageEmbedding(this.model, true);
      return { embedding };
    } catch (error) {
      Telemetry.logImageEmbedding(this.model, false, getErrorMessage(error));
      throw error;
    } finally {
      this.isGenerating = false;
    }
  }

  public stop(): Promise<void> {
    return this.cactus.stop();
  }

  public async reset(): Promise<void> {
    await this.stop();
    return this.cactus.reset();
  }

  public async destroy(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    await this.stop();
    await this.cactus.destroy();

    this.isInitialized = false;
  }

  public getModels(): CactusModel[] {
    return Object.values(models).filter((model) => model.completion);
  }

  private isModelPath(model: string): boolean {
    return model.startsWith('file://') || model.startsWith('/');
  }

  private getModelName(): string {
    return `${this.model}-${this.options.quantization}${this.options.pro ? '-pro' : ''}`;
  }
}
