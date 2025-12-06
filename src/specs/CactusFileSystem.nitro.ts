import type { HybridObject } from 'react-native-nitro-modules';

export interface CactusFileSystem extends HybridObject<{
  ios: 'swift';
  android: 'kotlin';
}> {
  // General
  getCactusDirectory(): Promise<string>;
  // File
  fileExists(path: string): Promise<boolean>;
  writeFile(path: string, content: string): Promise<void>;
  readFile(path: string): Promise<string>;
  deleteFile(path: string): Promise<void>;
  // Model
  modelExists(model: string): Promise<boolean>;
  getModelPath(model: string): Promise<string>;
  stopDownload(model: string): Promise<void>;
  downloadModel(
    model: string,
    from: string,
    callback?: (progress: number) => void
  ): Promise<void>;
  deleteModel(model: string): Promise<void>;
}
