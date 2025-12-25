import { NitroModules } from 'react-native-nitro-modules';
import type { CactusUtil as CactusUtilSpec } from '../specs/CactusUtil.nitro';
import { Platform } from 'react-native';
import { CactusFileSystem } from './CactusFileSystem';
import { CactusConfig } from '../config/CactusConfig';
import { Database } from '../api/Database';

export class CactusUtil {
  private static readonly hybridCactusUtil =
    NitroModules.createHybridObject<CactusUtilSpec>('CactusUtil');

  public static async registerApp(encryptedData: string): Promise<string> {
    if (Platform.OS === 'android') {
      const cactusDirectory = await CactusFileSystem.getCactusDirectory();
      this.hybridCactusUtil.setAndroidDataDirectory(cactusDirectory);
    }

    return this.hybridCactusUtil.registerApp(encryptedData);
  }

  public static async getDeviceId(): Promise<string | null> {
    if (Platform.OS === 'android') {
      const cactusDirectory = await CactusFileSystem.getCactusDirectory();
      this.hybridCactusUtil.setAndroidDataDirectory(cactusDirectory);
    }

    const deviceId = await this.hybridCactusUtil.getDeviceId(
      CactusConfig.cactusProKey
    );

    if (!deviceId) {
      return null;
    }

    if (deviceId?.indexOf('|') !== -1) {
      const parts = deviceId.split('|');
      CactusConfig.cactusProKey = parts[1];
      return await Database.registerDevice({ deviceId: parts[0] });
    }

    return deviceId;
  }
}
