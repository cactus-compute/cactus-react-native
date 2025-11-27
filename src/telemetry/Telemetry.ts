import { Database } from '../api/Database';
import {
  CactusCrypto,
  CactusDeviceInfo,
  CactusFileSystem,
  CactusUtil,
} from '../native';
import { CactusConfig } from '../config/CactusConfig';
import { packageVersion } from '../constants/packageVersion';
import type { CactusLMCompleteResult } from '../types/CactusLM';

export interface LogRecord {
  // Framework
  framework: 'react-native';
  framework_version: string;

  // Event
  event_type: 'init' | 'completion' | 'embedding';
  model: string;
  success: boolean;
  message?: string;

  // Telemetry
  telemetry_token?: string;
  project_id?: string;
  device_id?: string;

  // LM
  tokens?: number;
  response_time?: number;
  ttft?: number;
  tps?: number;
}

export class Telemetry {
  private static cactusTelemetryToken?: string;
  private static projectId?: string;
  private static deviceId?: string;

  private static readonly namespaceUrl = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
  private static readonly logBufferPaths = {
    init: 'logs/init.json',
    completion: 'logs/completion.json',
    embedding: 'logs/embedding.json',
  };

  private static async handleLog(logRecord: LogRecord) {
    if (!this.isInitialized()) {
      return;
    }

    if (!CactusConfig.isTelemetryEnabled) {
      return;
    }

    const logBufferPath = this.logBufferPaths[logRecord.event_type];

    let logs = [];
    if (await CactusFileSystem.fileExists(logBufferPath)) {
      try {
        logs = JSON.parse(await CactusFileSystem.readFile(logBufferPath));
      } catch {
        // Delete corrupted log buffer
        await CactusFileSystem.deleteFile(logBufferPath);
      }
    }
    logs.push(logRecord);

    try {
      await Database.sendLogRecords(logs);

      if (await CactusFileSystem.fileExists(logBufferPath)) {
        await CactusFileSystem.deleteFile(logBufferPath);
      }
    } catch {
      await CactusFileSystem.writeFile(logBufferPath, JSON.stringify(logs));
    }
  }

  public static isInitialized(): boolean {
    return !!(this.projectId && this.deviceId);
  }

  public static async init(cactusTelemetryToken?: string): Promise<void> {
    if (this.isInitialized()) {
      return;
    }

    if (!CactusConfig.isTelemetryEnabled) {
      return;
    }

    this.cactusTelemetryToken = cactusTelemetryToken;

    const appIdentifier = await CactusDeviceInfo.getAppIdentifier();
    const name = `https://cactus-react-native/${appIdentifier}/v1`;
    this.projectId = await CactusCrypto.uuidv5(this.namespaceUrl, name);

    const deviceInfo = await CactusDeviceInfo.getDeviceInfo();
    try {
      this.deviceId =
        (await CactusUtil.getDeviceId()) ??
        (await Database.registerDevice(deviceInfo));
    } catch (error) {
      console.log(error);
    }
  }

  public static logInit(
    model: string,
    success: boolean,
    message?: string
  ): Promise<void> {
    return this.handleLog({
      framework: 'react-native',
      framework_version: packageVersion,
      event_type: 'init',
      model,
      success,
      message,
      telemetry_token: this.cactusTelemetryToken,
      project_id: this.projectId,
      device_id: this.deviceId,
    });
  }

  public static logCompletion(
    model: string,
    success: boolean,
    message?: string,
    result?: CactusLMCompleteResult
  ): Promise<void> {
    return this.handleLog({
      framework: 'react-native',
      framework_version: packageVersion,
      event_type: 'completion',
      model,
      success,
      message,
      telemetry_token: this.cactusTelemetryToken,
      project_id: this.projectId,
      device_id: this.deviceId,
      tokens: result?.totalTokens,
      response_time: result?.totalTimeMs,
      ttft: result?.timeToFirstTokenMs,
      tps: result?.tokensPerSecond,
    });
  }

  public static logEmbedding(
    model: string,
    success: boolean,
    message?: string
  ): Promise<void> {
    return this.handleLog({
      framework: 'react-native',
      framework_version: packageVersion,
      event_type: 'embedding',
      model,
      success,
      message,
      telemetry_token: this.cactusTelemetryToken,
      project_id: this.projectId,
      device_id: this.deviceId,
    });
  }
}
