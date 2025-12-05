import { Cactus, CactusFileSystem } from '../native';
import type {
  CactusSTTDownloadParams,
  CactusSTTTranscribeParams,
  CactusSTTTranscribeResult,
  CactusSTTParams,
  CactusSTTAudioEmbedParams,
  CactusSTTAudioEmbedResult,
} from '../types/CactusSTT';
import { Telemetry } from '../telemetry/Telemetry';
import { CactusConfig } from '../config/CactusConfig';
import { Database } from '../api/Database';
import { getErrorMessage } from '../utils/error';
import type { CactusSTTModel } from '../types/CactusSTTModel';

export class CactusSTT {
  private readonly cactus = new Cactus();

  private readonly model: string;
  private readonly contextSize: number;

  private isDownloading = false;
  private isInitialized = false;
  private isGenerating = false;

  private static readonly defaultModel = 'whisper-small';
  private static readonly defaultContextSize = 2048;
  private static readonly defaultPrompt =
    '<|startoftranscript|><|en|><|transcribe|><|notimestamps|>';
  private static readonly defaultTranscribeOptions = {
    maxTokens: 512,
  };
  private static readonly defaultEmbedBufferSize = 4096;

  constructor({ model, contextSize }: CactusSTTParams = {}) {
    Telemetry.init(CactusConfig.telemetryToken);

    this.model = model ?? CactusSTT.defaultModel;
    this.contextSize = contextSize ?? CactusSTT.defaultContextSize;
  }

  public async download({
    onProgress,
  }: CactusSTTDownloadParams = {}): Promise<void> {
    if (this.isDownloading) {
      throw new Error('CactusSTT is already downloading');
    }

    if (await CactusFileSystem.modelExists(this.model)) {
      onProgress?.(1.0);
      return;
    }

    this.isDownloading = true;
    try {
      const model = await Database.getSTTModel(this.model);
      await CactusFileSystem.downloadModel(
        this.model,
        model.downloadUrl,
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

    if (!(await CactusFileSystem.modelExists(this.model))) {
      throw new Error(`Model "${this.model}" is not downloaded`);
    }

    const modelPath = await CactusFileSystem.getModelPath(this.model);

    try {
      await this.cactus.init(modelPath, this.contextSize);
      Telemetry.logInit(this.model, true);
      this.isInitialized = true;
    } catch (error) {
      Telemetry.logInit(this.model, false, getErrorMessage(error));
      throw error;
    }
  }

  public async transcribe({
    audioFilePath,
    prompt,
    options,
    onToken,
  }: CactusSTTTranscribeParams): Promise<CactusSTTTranscribeResult> {
    if (this.isGenerating) {
      throw new Error('CactusSTT is already generating');
    }

    await this.init();

    prompt = prompt ?? CactusSTT.defaultPrompt;
    options = { ...CactusSTT.defaultTranscribeOptions, ...options };

    const responseBufferSize =
      8 * (options.maxTokens ?? CactusSTT.defaultTranscribeOptions.maxTokens) +
      256;

    this.isGenerating = true;
    try {
      const result = await this.cactus.transcribe(
        audioFilePath,
        prompt,
        responseBufferSize,
        options,
        onToken
      );
      Telemetry.logTranscribe(
        this.model,
        result.success,
        result.success ? undefined : result.response,
        result
      );
      return result;
    } catch (error) {
      Telemetry.logTranscribe(this.model, false, getErrorMessage(error));
      throw error;
    } finally {
      this.isGenerating = false;
    }
  }

  public async audioEmbed({
    audioPath,
  }: CactusSTTAudioEmbedParams): Promise<CactusSTTAudioEmbedResult> {
    if (this.isGenerating) {
      throw new Error('CactusSTT is already generating');
    }

    await this.init();

    this.isGenerating = true;
    try {
      const embedding = await this.cactus.audioEmbed(
        audioPath,
        CactusSTT.defaultEmbedBufferSize
      );
      Telemetry.logAudioEmbedding(this.model, true);
      return { embedding };
    } catch (error) {
      Telemetry.logAudioEmbedding(this.model, false, getErrorMessage(error));
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

  public async getModels(): Promise<CactusSTTModel[]> {
    const models = await Database.getSTTModels();
    for (const model of models) {
      model.isDownloaded = await CactusFileSystem.modelExists(model.slug);
    }
    return models;
  }
}
