import { Cactus, CactusFileSystem } from '../native';
import type {
  CactusLMDownloadParams,
  CactusLMCompleteParams,
  CactusLMCompleteResult,
  CactusLMEmbedParams,
  CactusLMEmbedResult,
  CactusLMGetModelsParams,
  CactusLMParams,
} from '../types/CactusLM';
import type { CactusModel } from '../types/CactusModel';
import { Telemetry } from '../telemetry/Telemetry';
import { CactusConfig } from '../config/CactusConfig';
import { Database } from '../api/Database';
import { getErrorMessage } from '../utils/error';
import { RemoteLM } from '../api/RemoteLM';

export class CactusLM {
  private readonly cactus = new Cactus();

  private readonly model: string;
  private readonly contextSize: number;
  private readonly corpusDir?: string;

  private isDownloading = false;
  private isInitialized = false;
  private isGenerating = false;

  private static readonly defaultModel = 'qwen3-0.6';
  private static readonly defaultContextSize = 2048;
  private static readonly defaultCompleteOptions = {
    maxTokens: 512,
  };
  private static readonly defaultCompleteMode = 'local';
  private static readonly defaultEmbedBufferSize = 2048;

  private static readonly modelsInfoPath = 'models/info.json';

  constructor({ model, contextSize, corpusDir }: CactusLMParams = {}) {
    Telemetry.init(CactusConfig.telemetryToken);

    this.model = model ?? CactusLM.defaultModel;
    this.contextSize = contextSize ?? CactusLM.defaultContextSize;
    this.corpusDir = corpusDir;
  }

  public async download({
    onProgress,
  }: CactusLMDownloadParams = {}): Promise<void> {
    if (this.isDownloading) {
      throw new Error('CactusLM is already downloading');
    }

    if (await CactusFileSystem.modelExists(this.model)) {
      onProgress?.(1.0);
      return;
    }

    this.isDownloading = true;
    try {
      await CactusFileSystem.downloadModel(this.model, onProgress);
      await this.getModels({ forceRefresh: true });
    } finally {
      this.isDownloading = false;
    }
  }

  public async init(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (!(await CactusFileSystem.modelExists(this.model))) {
      throw new Error(`Model "${this.model}" is not downloaded`);
    }

    const modelPath = await CactusFileSystem.getModelPath(this.model);

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

  public async embed({
    text,
  }: CactusLMEmbedParams): Promise<CactusLMEmbedResult> {
    if (this.isGenerating) {
      throw new Error('CactusLM is already generating');
    }

    await this.init();

    this.isGenerating = true;
    try {
      const embedding = await this.cactus.embed(
        text,
        CactusLM.defaultEmbedBufferSize
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

  public async getModels({
    forceRefresh = false,
  }: CactusLMGetModelsParams = {}): Promise<CactusModel[]> {
    if (
      !forceRefresh &&
      (await CactusFileSystem.fileExists(CactusLM.modelsInfoPath))
    ) {
      try {
        return JSON.parse(
          await CactusFileSystem.readFile(CactusLM.modelsInfoPath)
        );
      } catch {
        // Delete corrupted models info
        await CactusFileSystem.deleteFile(CactusLM.modelsInfoPath);
      }
    }

    const models = await Database.getModels();

    for (const model of models) {
      model.isDownloaded = await CactusFileSystem.modelExists(model.slug);
    }

    await CactusFileSystem.writeFile(
      CactusLM.modelsInfoPath,
      JSON.stringify(models)
    );

    return models;
  }
}
