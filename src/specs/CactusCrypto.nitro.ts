import type { HybridObject } from 'react-native-nitro-modules';

export interface CactusCrypto extends HybridObject<{
  ios: 'swift';
  android: 'kotlin';
}> {
  uuidv5(namespaceUuid: string, name: string): Promise<string>;
}
