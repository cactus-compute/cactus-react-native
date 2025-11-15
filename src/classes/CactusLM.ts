import { Cactus, CactusFileSystem } from '../native';
import type {
  CactusDownloadParams,
  CactusInitParams,
  CactusCompletionParams,
  CactusCompletionResult,
  CactusEmbeddingParams,
  CactusEmbeddingResult,
  CactusModel,
} from '../types/CactusLM';
import { Telemetry } from '../telemetry/Telemetry';
import { CactusConfig } from '../config/CactusConfig';
import { Database } from '../api/Database';
import { getErrorMessage } from '../utils/error';

export class CactusLM {
  private readonly cactus = new Cactus();

  private static readonly defaultModel = 'qwen3-0.6';
  private static readonly defaultContextSize = 2048;
  private static readonly defaultCompletionOptions = {
    maxTokens: 512,
  };
  private static readonly defaultEmbeddingBufferSize = 2048;

  private isDownloading = false;
  private initialized: { model: string; contextSize: number } | null = null;
  private isGenerating = false;

  public async download({
    model,
    onProgress,
  }: CactusDownloadParams = {}): Promise<void> {
    if (this.isDownloading) {
      throw new Error('CactusLM is already downloading');
    }

    model = model ?? CactusLM.defaultModel;

    if (await CactusFileSystem.modelExists(model)) {
      onProgress?.(1.0);
      return;
    }

    this.isDownloading = true;
    try {
      await CactusFileSystem.downloadModel(model, onProgress);
    } finally {
      this.isDownloading = false;
    }
  }

  public async init({
    model,
    contextSize,
  }: CactusInitParams = {}): Promise<void> {
    if (!Telemetry.isInitialized()) {
      await Telemetry.init(CactusConfig.telemetryToken);
    }

    model = model ?? CactusLM.defaultModel;
    contextSize = contextSize ?? CactusLM.defaultContextSize;

    if (
      this.initialized?.model === model &&
      this.initialized?.contextSize === contextSize
    ) {
      return;
    }

    if (this.initialized) {
      await this.cactus.destroy();
    }

    if (!(await CactusFileSystem.modelExists(model))) {
      throw new Error(`Model "${model}" is not downloaded`);
    }

    try {
      await this.cactus.init(
        await CactusFileSystem.getModelPath(model),
        contextSize
      );
      Telemetry.logInit(model, true);
      this.initialized = { model, contextSize };
    } catch (error) {
      Telemetry.logInit(model, false, getErrorMessage(error));
      throw error;
    }
  }

  public async complete({
    messages,
    options,
    onToken,
    model,
    contextSize,
  }: CactusCompletionParams): Promise<CactusCompletionResult> {
    if (this.isGenerating) {
      throw new Error('CactusLM is already generating');
    }

    model = model ?? this.initialized?.model ?? CactusLM.defaultModel;
    contextSize =
      contextSize ??
      this.initialized?.contextSize ??
      CactusLM.defaultContextSize;
    options = {
      ...CactusLM.defaultCompletionOptions,
      ...options,
    };

    await this.init({ model, contextSize });

    const responseBufferSize =
      8 * (options.maxTokens ?? CactusLM.defaultCompletionOptions.maxTokens) +
      256;

    this.isGenerating = true;
    try {
      const result = await this.cactus.complete(
        messages,
        responseBufferSize,
        options,
        onToken
      );
      Telemetry.logCompletion(
        model,
        result.success,
        result.success ? undefined : result.response,
        result
      );
      return result;
    } catch (error) {
      Telemetry.logCompletion(model, false, getErrorMessage(error));
      throw error;
    } finally {
      this.isGenerating = false;
    }
  }

  public async embed({
    text,
    model,
  }: CactusEmbeddingParams): Promise<CactusEmbeddingResult> {
    if (this.isGenerating) {
      throw new Error('CactusLM is already generating');
    }

    model = model ?? this.initialized?.model ?? CactusLM.defaultModel;

    await this.init({ model });

    this.isGenerating = true;
    try {
      const embedding = await this.cactus.embed(
        text,
        CactusLM.defaultEmbeddingBufferSize
      );
      Telemetry.logEmbedding(model, true);
      return { embedding };
    } catch (error) {
      Telemetry.logEmbedding(model, false, getErrorMessage(error));
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
    await this.stop();
    await this.cactus.destroy();

    this.initialized = null;
  }

  public async getModels(): Promise<CactusModel[]> {
    return Database.getModels();
  }
}
