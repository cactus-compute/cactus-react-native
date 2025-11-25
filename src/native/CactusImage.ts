import { NitroModules } from 'react-native-nitro-modules';
import type { CactusImage as CactusImageSpec } from '../specs/CactusImage.nitro';

export class CactusImage {
  private static readonly hybridCactusImage =
    NitroModules.createHybridObject<CactusImageSpec>('CactusImage');

  public static base64(path: string): Promise<string> {
    return this.hybridCactusImage.base64(path);
  }

  public static resize(
    path: string,
    height: number,
    width: number,
    quality: number
  ): Promise<string> {
    return this.hybridCactusImage.resize(path, height, width, quality);
  }
}
