import type { HybridObject } from 'react-native-nitro-modules';

export interface CactusImage
  extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  base64(path: string): Promise<string>;
  resize(
    path: string,
    height: number,
    width: number,
    quality: number
  ): Promise<string>;
}
