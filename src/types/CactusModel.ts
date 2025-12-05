export interface CactusModel {
  // API
  name: string;
  slug: string;
  quantization: number;
  sizeMb: number;
  downloadUrl: string;
  supportsToolCalling: boolean;
  supportsVision: boolean;
  supportsCompletion: boolean;
  createdAt: Date;

  // Local
  isDownloaded: boolean;
}
