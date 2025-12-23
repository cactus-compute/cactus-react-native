import { Cactus } from '../native';

export class CactusConfig {
  private static readonly cactus = new Cactus();

  // Telemetry
  public static telemetryToken?: string;
  public static isTelemetryEnabled: boolean = true;

  // Hybrid mode
  public static cactusToken?: string;

  public static setTelemetry(token: string): void {
    CactusConfig.cactus.setTelemetryToken(token);
  }

  public static setProKey(token: string): void {
    CactusConfig.cactus.setProKey(token);
  }
}
