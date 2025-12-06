import { NitroModules } from 'react-native-nitro-modules';
import type { CactusFileSystem as CactusFileSystemSpec } from '../specs/CactusFileSystem.nitro';

export class CactusFileSystem {
  private static readonly hybridCactusFileSystem =
    NitroModules.createHybridObject<CactusFileSystemSpec>('CactusFileSystem');

  public static getCactusDirectory(): Promise<string> {
    return this.hybridCactusFileSystem.getCactusDirectory();
  }

  public static fileExists(path: string): Promise<boolean> {
    return this.hybridCactusFileSystem.fileExists(path);
  }

  public static writeFile(path: string, content: string): Promise<void> {
    return this.hybridCactusFileSystem.writeFile(path, content);
  }

  public static readFile(path: string): Promise<string> {
    return this.hybridCactusFileSystem.readFile(path);
  }

  public static deleteFile(path: string): Promise<void> {
    return this.hybridCactusFileSystem.deleteFile(path);
  }

  public static modelExists(model: string): Promise<boolean> {
    return this.hybridCactusFileSystem.modelExists(model);
  }

  public static getModelPath(model: string): Promise<string> {
    return this.hybridCactusFileSystem.getModelPath(model);
  }

  public static downloadModel(
    model: string,
    url: string,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    return this.hybridCactusFileSystem.downloadModel(model, url, onProgress);
  }

  public static stopDownload(model: string): Promise<void> {
    return this.hybridCactusFileSystem.stopDownload(model);
  }

  public static deleteModel(model: string): Promise<void> {
    return this.hybridCactusFileSystem.deleteModel(model);
  }
}
