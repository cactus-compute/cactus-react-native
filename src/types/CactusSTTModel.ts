export interface CactusSTTModel {
  // API
  slug: string;
  sizeMb: number;
  downloadUrl: string;
  createdAt: Date;

  // Local
  isDownloaded: boolean;
}
