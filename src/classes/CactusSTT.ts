import { Cactus, CactusFileSystem } from '../native';
import type {
  CactusSTTDownloadParams,
  CactusSTTTranscribeParams,
  CactusSTTTranscribeResult,
  CactusSTTParams,
  CactusSTTAudioEmbedParams,
  CactusSTTAudioEmbedResult,
  CactusSTTStreamTranscribeInsertParams,
  CactusSTTStreamTranscribeProcessParams,
  CactusSTTStreamTranscribeProcessResult,
  CactusSTTStreamTranscribeFinalizeResult,
} from '../types/CactusSTT';
import { Telemetry } from '../telemetry/Telemetry';
import { CactusConfig } from '../config/CactusConfig';
import { getErrorMessage } from '../utils/error';
import models from '../models';
import type { ModelOptions, CactusModel } from '../types/common';

export class CactusSTT {
  private readonly cactus = new Cactus();

  private readonly model: string;
  private readonly contextSize: number;
  private readonly modelOptions: ModelOptions;

  private isDownloading = false;
  private isInitialized = false;
  private isGenerating = false;

  private isStreamTranscribeInitialized = false;

  private static readonly defaultModel = 'whisper-small';
  private static readonly defaultContextSize = 2048;
  private static readonly defaultModelOptions: ModelOptions = {
    quantization: 'int4',
    pro: false,
  };
  private static readonly defaultPrompt =
    '<|startoftranscript|><|en|><|transcribe|><|notimestamps|>';
  private static readonly defaultTranscribeOptions = {
    maxTokens: 512,
  };
  private static readonly defaultEmbedBufferSize = 4096;

  constructor({ model, contextSize, modelOptions }: CactusSTTParams = {}) {
    Telemetry.init(CactusConfig.telemetryToken);

    this.model = model ?? CactusSTT.defaultModel;
    this.contextSize = contextSize ?? CactusSTT.defaultContextSize;
    this.modelOptions = modelOptions ?? CactusSTT.defaultModelOptions;
  }

  public async download({
    onProgress,
  }: CactusSTTDownloadParams = {}): Promise<void> {
    if (this.isModelPath(this.model)) {
      onProgress?.(1.0);
      return;
    }

    if (this.isDownloading) {
      throw new Error('CactusSTT is already downloading');
    }

    if (await CactusFileSystem.modelExists(this.model)) {
      onProgress?.(1.0);
      return;
    }

    this.isDownloading = true;
    try {
      const modelConfig =
        models[this.model]?.quantization[this.modelOptions.quantization];
      const url = this.modelOptions.pro
        ? modelConfig?.pro?.apple
        : modelConfig?.url;

      if (!url) {
        throw new Error(`Model ${this.model} with specified options not found`);
      }

      await CactusFileSystem.downloadModel(this.model, url, onProgress);
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
      if (!(await CactusFileSystem.modelExists(this.model))) {
        throw new Error(`Model "${this.model}" is not downloaded`);
      }
      modelPath = await CactusFileSystem.getModelPath(this.model);
    }

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
    audio,
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
        audio,
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

  public async streamTranscribeInit(): Promise<void> {
    if (this.isStreamTranscribeInitialized) {
      return;
    }

    await this.init();

    try {
      await this.cactus.streamTranscribeInit();
      this.isStreamTranscribeInitialized = true;
    } catch (error) {
      throw error;
    }
  }

  public async streamTranscribeInsert({
    audio,
  }: CactusSTTStreamTranscribeInsertParams): Promise<void> {
    if (!this.isStreamTranscribeInitialized) {
      throw new Error('CactusSTT stream transcribe is not initialized');
    }

    try {
      await this.cactus.streamTranscribeInsert(audio);
    } catch (error) {
      throw error;
    }
  }

  public async streamTranscribeProcess({
    options,
  }: CactusSTTStreamTranscribeProcessParams = {}): Promise<CactusSTTStreamTranscribeProcessResult> {
    if (!this.isStreamTranscribeInitialized) {
      throw new Error('CactusSTT stream transcribe is not initialized');
    }

    try {
      const result = await this.cactus.streamTranscribeProcess(options);
      return result;
    } catch (error) {
      throw error;
    }
  }

  public async streamTranscribeFinalize(): Promise<CactusSTTStreamTranscribeFinalizeResult> {
    if (!this.isStreamTranscribeInitialized) {
      throw new Error('CactusSTT stream transcribe is not initialized');
    }

    try {
      const result = await this.cactus.streamTranscribeFinalize();
      return result;
    } catch (error) {
      throw error;
    }
  }

  public async streamTranscribeDestroy(): Promise<void> {
    if (!this.isStreamTranscribeInitialized) {
      return;
    }

    try {
      await this.cactus.streamTranscribeDestroy();
      this.isStreamTranscribeInitialized = false;
    } catch (error) {
      throw error;
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
    await this.streamTranscribeDestroy();
    await this.cactus.destroy();

    this.isInitialized = false;
  }

  public getModels(): CactusModel[] {
    return Object.values(models).filter((model) => model.speech);
  }

  private isModelPath(model: string): boolean {
    return model.startsWith('file://') || model.startsWith('/');
  }
}
