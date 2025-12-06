import type { HybridObject } from 'react-native-nitro-modules';

export interface DeviceInfo {
  brand: string;
  model: string;
  device_id?: string;
  os: string;
  os_version: string;
}

export interface CactusDeviceInfo extends HybridObject<{
  ios: 'swift';
  android: 'kotlin';
}> {
  getAppIdentifier(): Promise<string | undefined>;
  getDeviceInfo(): Promise<DeviceInfo>;
}
