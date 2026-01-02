import type { HybridObject } from 'react-native-nitro-modules';

export interface CactusUtil
  extends HybridObject<{ ios: 'c++'; android: 'c++' }> {
  registerApp(encryptedData: string): Promise<string>;
  getDeviceId(token?: string): Promise<string | null>;
  setAndroidDataDirectory(dataDir: string): Promise<void>;
}
