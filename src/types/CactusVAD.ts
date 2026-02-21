import type { CactusModelOptions } from './common';

export interface CactusVADParams {
  model?: string;
  options?: CactusModelOptions;
}

export interface CactusVADDownloadParams {
  onProgress?: (progress: number) => void;
}

export interface CactusVADOptions {
  threshold?: number;
  negThreshold?: number;
  minSpeechDurationMs?: number;
  maxSpeechDurationS?: number;
  minSilenceDurationMs?: number;
  speechPadMs?: number;
  windowSizeSamples?: number;
  samplingRate?: number;
  minSilenceAtMaxSpeech?: number;
  useMaxPossSilAtMaxSpeech?: boolean;
}

export interface CactusVADSegment {
  start: number;
  end: number;
}

export interface CactusVADResult {
  segments: CactusVADSegment[];
  totalTime: number;
  ramUsage: number;
}

export interface CactusVADVadParams {
  audio: string | number[];
  options?: CactusVADOptions;
}
