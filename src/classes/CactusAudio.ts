import { Cactus, CactusFileSystem } from '../native';
import type {
  CactusAudioParams,
  CactusAudioDownloadParams,
  CactusAudioVADParams,
  CactusAudioVADResult,
  CactusAudioDiarizeParams,
  CactusAudioDiarizeResult,
  CactusAudioEmbedSpeakerParams,
  CactusAudioEmbedSpeakerResult,
} from '../types/CactusAudio';
import { getRegistry } from '../modelRegistry';
import type { CactusModel } from '../types/common';

export class CactusAudio {
  private readonly cactus = new Cactus();

  private readonly model: string;
  private readonly options: {
    quantization: 'int4' | 'int8';
    pro: boolean;
  };

  private isDownloading = false;
  private isInitialized = false;

  private static readonly defaultModel = 'silero-vad';
  private static readonly defaultOptions = {
    quantization: 'int8' as const,
    pro: false,
  };

  constructor({ model, options }: CactusAudioParams = {}) {
    this.model = model ?? CactusAudio.defaultModel;
    this.options = {
      quantization:
        options?.quantization ?? CactusAudio.defaultOptions.quantization,
      pro: options?.pro ?? CactusAudio.defaultOptions.pro,
    };
  }

  public async download({
    onProgress,
  }: CactusAudioDownloadParams = {}): Promise<void> {
    if (this.isModelPath(this.model)) {
      onProgress?.(1.0);
      return;
    }

    if (this.isDownloading) {
      throw new Error('CactusAudio is already downloading');
    }

    if (await CactusFileSystem.modelExists(this.getModelName())) {
      console.log('Model already exists', this.getModelName());
      onProgress?.(1.0);
      return;
    }

    this.isDownloading = true;
    try {
      const registry = await getRegistry();
      const modelConfig =
        registry[this.model]?.quantization[this.options.quantization];
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
        console.log('Model does not exist', this.getModelName());
        throw new Error(
          `Model "${this.model}" with options ${JSON.stringify(this.options)} is not downloaded`
        );
      }
      modelPath = await CactusFileSystem.getModelPath(this.getModelName());
    }

    const cacheDir = await CactusFileSystem.getCactusDirectory();
    await this.cactus.setTelemetryEnvironment(cacheDir);
    await this.cactus.init(modelPath);
    this.isInitialized = true;
  }

  public async vad({
    audio,
    options,
  }: CactusAudioVADParams): Promise<CactusAudioVADResult> {
    await this.init();
    return this.cactus.vad(audio, options);
  }

  public async diarize({
    audio,
    options,
  }: CactusAudioDiarizeParams): Promise<CactusAudioDiarizeResult> {
    await this.init();
    return this.cactus.diarize(audio, options);
  }

  public async embedSpeaker({
    audio,
    options,
  }: CactusAudioEmbedSpeakerParams): Promise<CactusAudioEmbedSpeakerResult> {
    await this.init();
    return this.cactus.embedSpeaker(audio, options);
  }

  public async destroy(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    await this.cactus.destroy();
    this.isInitialized = false;
  }

  public async getModels(): Promise<CactusModel[]> {
    return Object.values(await getRegistry());
  }

  private isModelPath(model: string): boolean {
    return model.startsWith('file://') || model.startsWith('/');
  }

  public getModelName(): string {
    return `${this.model}-${this.options.quantization}${this.options.pro ? '-pro' : ''}`;
  }
}
