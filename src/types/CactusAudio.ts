import type { CactusModelOptions } from './common';

export interface CactusAudioParams {
  model?: string;
  options?: CactusModelOptions;
}

export interface CactusAudioDownloadParams {
  onProgress?: (progress: number) => void;
}

export interface CactusAudioVADOptions {
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

export interface CactusAudioVADSegment {
  start: number;
  end: number;
}

export interface CactusAudioVADParams {
  audio: string | number[];
  options?: CactusAudioVADOptions;
}

export interface CactusAudioVADResult {
  segments: CactusAudioVADSegment[];
  totalTime: number;
  ramUsage: number;
}

export interface CactusAudioDiarizeOptions {
  stepMs?: number;
  threshold?: number;
  numSpeakers?: number;
  minSpeakers?: number;
  maxSpeakers?: number;
}

export interface CactusAudioDiarizeParams {
  audio: string | number[];
  options?: CactusAudioDiarizeOptions;
}

export interface CactusAudioDiarizeResult {
  success: boolean;
  error: string | null;
  numSpeakers: number;
  scores: number[];
  totalTimeMs: number;
  ramUsageMb: number;
}

export interface CactusAudioEmbedSpeakerOptions {
  stepMs?: number;
  threshold?: number;
  maskWeights?: number[];
  maskNumFrames?: number;
}

export interface CactusAudioEmbedSpeakerParams {
  audio: string | number[];
  options?: CactusAudioEmbedSpeakerOptions;
}

export interface CactusAudioEmbedSpeakerResult {
  success: boolean;
  error: string | null;
  embedding: number[];
  totalTimeMs: number;
  ramUsageMb: number;
}
