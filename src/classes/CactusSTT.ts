import { Cactus, CactusFileSystem } from '../native';
import type {
  CactusSTTDownloadParams,
  CactusSTTTranscribeParams,
  CactusSTTTranscribeResult,
  CactusSTTParams,
  CactusSTTAudioEmbedParams,
  CactusSTTAudioEmbedResult,
  CactusSTTStreamTranscribeStartOptions,
  CactusSTTStreamTranscribeProcessParams,
  CactusSTTStreamTranscribeProcessResult,
  CactusSTTStreamTranscribeStopResult,
  CactusSTTDetectLanguageParams,
  CactusSTTDetectLanguageResult,
} from '../types/CactusSTT';
import { getRegistry } from '../modelRegistry';
import type { CactusModel } from '../types/common';

export class CactusSTT {
  private readonly cactus = new Cactus();

  private readonly model: string;
  private readonly options: {
    quantization: 'int4' | 'int8';
    pro: boolean;
  };

  private isDownloading = false;
  private isInitialized = false;
  private isGenerating = false;
  private isStreamTranscribing = false;

  private static readonly defaultModel = 'whisper-small';
  private static readonly defaultOptions = {
    quantization: 'int8' as const,
    pro: false,
  };
  private static readonly defaultPrompt =
    '<|startoftranscript|><|en|><|transcribe|><|notimestamps|>';
  private static readonly defaultTranscribeOptions = {
    maxTokens: 384,
  };
  private static readonly defaultEmbedBufferSize = 4096;

  constructor({ model, options }: CactusSTTParams = {}) {
    this.model = model ?? CactusSTT.defaultModel;
    this.options = {
      quantization:
        options?.quantization ?? CactusSTT.defaultOptions.quantization,
      pro: options?.pro ?? CactusSTT.defaultOptions.pro,
    };
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
      return await this.cactus.transcribe(
        audio,
        prompt,
        responseBufferSize,
        options,
        onToken
      );
    } finally {
      this.isGenerating = false;
    }
  }

  public async streamTranscribeStart(
    options?: CactusSTTStreamTranscribeStartOptions
  ): Promise<void> {
    if (this.isStreamTranscribing) {
      return;
    }

    await this.init();
    await this.cactus.streamTranscribeStart(options);
    this.isStreamTranscribing = true;
  }

  public async streamTranscribeProcess({
    audio,
  }: CactusSTTStreamTranscribeProcessParams): Promise<CactusSTTStreamTranscribeProcessResult> {
    if (!this.isStreamTranscribing) {
      throw new Error('CactusSTT stream transcribe is not started');
    }

    return this.cactus.streamTranscribeProcess(audio);
  }

  public async streamTranscribeStop(): Promise<CactusSTTStreamTranscribeStopResult> {
    if (!this.isStreamTranscribing) {
      throw new Error('CactusSTT stream transcribe is not started');
    }

    try {
      return await this.cactus.streamTranscribeStop();
    } finally {
      this.isStreamTranscribing = false;
    }
  }

  public async detectLanguage({
    audio,
    options,
  }: CactusSTTDetectLanguageParams): Promise<CactusSTTDetectLanguageResult> {
    if (this.isGenerating) {
      throw new Error('CactusSTT is already generating');
    }

    await this.init();

    this.isGenerating = true;
    try {
      return await this.cactus.detectLanguage(audio, options);
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
      return { embedding };
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

    if (this.isStreamTranscribing) {
      await this.cactus.streamTranscribeStop().catch(() => {});
      this.isStreamTranscribing = false;
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
