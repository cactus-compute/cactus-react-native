export interface CactusModel {
  completion: boolean;
  tools: boolean;
  vision: boolean;
  embed: boolean;
  speech: boolean;
  quantization: {
    int4: {
      sizeMb: number;
      url: string;
      pro?: {
        apple: string;
      };
    };
    int8: {
      sizeMb: number;
      url: string;
      pro?: {
        apple: string;
      };
    };
  };
}

export interface ModelOptions {
  quantization: 'int4' | 'int8';
  pro: boolean;
}
