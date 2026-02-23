export interface CactusModel {
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

export interface CactusModelOptions {
  quantization?: 'int4' | 'int8';
  pro?: boolean;
}
