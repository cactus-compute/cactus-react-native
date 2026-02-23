import { Cactus, CactusFileSystem } from '../native';
import type {
  CactusVADParams,
  CactusVADDownloadParams,
  CactusVADVadParams,
  CactusVADResult,
} from '../types/CactusVAD';
import { getRegistry } from '../modelRegistry';
import type { CactusModel } from '../types/common';

export class CactusVAD {
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

  constructor({ model, options }: CactusVADParams = {}) {
    this.model = model ?? CactusVAD.defaultModel;
    this.options = {
      quantization:
        options?.quantization ?? CactusVAD.defaultOptions.quantization,
      pro: options?.pro ?? CactusVAD.defaultOptions.pro,
    };
  }

  public async download({
    onProgress,
  }: CactusVADDownloadParams = {}): Promise<void> {
    if (this.isModelPath(this.model)) {
      onProgress?.(1.0);
      return;
    }

    if (this.isDownloading) {
      throw new Error('CactusVAD is already downloading');
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
  }: CactusVADVadParams): Promise<CactusVADResult> {
    await this.init();
    return this.cactus.vad(audio, options);
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
