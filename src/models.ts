import type { CactusModel } from './types/common';

const models: { [key: string]: CactusModel } = {
  'silero-vad': {
    completion: false,
    tools: false,
    vision: false,
    embed: false,
    speech: true,
    quantization: {
      int4: {
        sizeMb: 1,
        url: 'https://huggingface.co/Cactus-Compute/silero-vad/resolve/main/weights/silero-vad-int4.zip',
      },
      int8: {
        sizeMb: 1,
        url: 'https://huggingface.co/Cactus-Compute/silero-vad/resolve/main/weights/silero-vad-int8.zip',
      },
    },
  },
  'moonshine-base': {
    completion: false,
    tools: false,
    vision: false,
    embed: false,
    speech: true,
    quantization: {
      int4: {
        sizeMb: 44,
        url: 'https://huggingface.co/Cactus-Compute/moonshine-base/resolve/main/weights/moonshine-base-int4.zip',
        pro: {
          apple:
            'https://huggingface.co/Cactus-Compute/moonshine-base/resolve/main/weights/moonshine-base-int4-apple.zip',
        },
      },
      int8: {
        sizeMb: 81,
        url: 'https://huggingface.co/Cactus-Compute/moonshine-base/resolve/main/weights/moonshine-base-int8.zip',
        pro: {
          apple:
            'https://huggingface.co/Cactus-Compute/moonshine-base/resolve/main/weights/moonshine-base-int8-apple.zip',
        },
      },
    },
  },
  'gemma-3-270m-it': {
    completion: true,
    tools: false,
    vision: false,
    embed: true,
    speech: false,
    quantization: {
      int4: {
        sizeMb: 115,
        url: 'https://huggingface.co/Cactus-Compute/gemma-3-270m-it/resolve/main/weights/gemma-3-270m-it-int4.zip',
      },
      int8: {
        sizeMb: 172,
        url: 'https://huggingface.co/Cactus-Compute/gemma-3-270m-it/resolve/main/weights/gemma-3-270m-it-int8.zip',
      },
    },
  },
  'functiongemma-270m-it': {
    completion: true,
    tools: true,
    vision: false,
    embed: true,
    speech: false,
    quantization: {
      int4: {
        sizeMb: 115,
        url: 'https://huggingface.co/Cactus-Compute/functiongemma-270m-it/resolve/main/weights/functiongemma-270m-it-int4.zip',
      },
      int8: {
        sizeMb: 172,
        url: 'https://huggingface.co/Cactus-Compute/functiongemma-270m-it/resolve/main/weights/functiongemma-270m-it-int8.zip',
      },
    },
  },
  'whisper-small': {
    completion: false,
    tools: false,
    vision: false,
    embed: true,
    speech: true,
    quantization: {
      int4: {
        sizeMb: 104,
        url: 'https://huggingface.co/Cactus-Compute/whisper-small/resolve/main/weights/whisper-small-int4.zip',
        pro: {
          apple:
            'https://huggingface.co/Cactus-Compute/whisper-small/resolve/main/weights/whisper-small-int4-apple.zip',
        },
      },
      int8: {
        sizeMb: 282,
        url: 'https://huggingface.co/Cactus-Compute/whisper-small/resolve/main/weights/whisper-small-int8.zip',
        pro: {
          apple:
            'https://huggingface.co/Cactus-Compute/whisper-small/resolve/main/weights/whisper-small-int8-apple.zip',
        },
      },
    },
  },
  'lfm2-350m': {
    completion: true,
    tools: true,
    vision: false,
    embed: true,
    speech: false,
    quantization: {
      int4: {
        sizeMb: 153,
        url: 'https://huggingface.co/Cactus-Compute/LFM2-350M/resolve/main/weights/lfm2-350m-int4.zip',
      },
      int8: {
        sizeMb: 233,
        url: 'https://huggingface.co/Cactus-Compute/LFM2-350M/resolve/main/weights/lfm2-350m-int8.zip',
      },
    },
  },
  'lfm2-vl-450m': {
    completion: true,
    tools: false,
    vision: true,
    embed: true,
    speech: false,
    quantization: {
      int4: {
        sizeMb: 318,
        url: 'https://huggingface.co/Cactus-Compute/LFM2-VL-450M/resolve/main/weights/lfm2-vl-450m-int4.zip',
        pro: {
          apple:
            'https://huggingface.co/Cactus-Compute/LFM2-VL-450M/resolve/main/weights/lfm2-vl-450m-int4-apple.zip',
        },
      },
      int8: {
        sizeMb: 480,
        url: 'https://huggingface.co/Cactus-Compute/LFM2-VL-450M/resolve/main/weights/lfm2-vl-450m-int8.zip',
        pro: {
          apple:
            'https://huggingface.co/Cactus-Compute/LFM2-VL-450M/resolve/main/weights/lfm2-vl-450m-int8-apple.zip',
        },
      },
    },
  },
  'qwen3-0.6b': {
    completion: true,
    tools: true,
    vision: false,
    embed: true,
    speech: false,
    quantization: {
      int4: {
        sizeMb: 234,
        url: 'https://huggingface.co/Cactus-Compute/Qwen3-0.6B/resolve/main/weights/qwen3-0.6b-int4.zip',
      },
      int8: {
        sizeMb: 394,
        url: 'https://huggingface.co/Cactus-Compute/Qwen3-0.6B/resolve/main/weights/qwen3-0.6b-int8.zip',
      },
    },
  },
  'qwen3-embedding-0.6b': {
    completion: false,
    tools: false,
    vision: false,
    embed: true,
    speech: false,
    quantization: {
      int4: {
        sizeMb: 234,
        url: 'https://huggingface.co/Cactus-Compute/Qwen3-Embedding-0.6B/resolve/main/weights/qwen3-embedding-0.6b-int4.zip',
      },
      int8: {
        sizeMb: 394,
        url: 'https://huggingface.co/Cactus-Compute/Qwen3-Embedding-0.6B/resolve/main/weights/qwen3-embedding-0.6b-int8.zip',
      },
    },
  },
  'nomic-embed-text-v2-moe': {
    completion: false,
    tools: false,
    vision: false,
    embed: true,
    speech: false,
    quantization: {
      int4: {
        sizeMb: 211,
        url: 'https://huggingface.co/Cactus-Compute/nomic-embed-text-v2-moe/resolve/main/weights/nomic-embed-text-v2-moe-int4.zip',
      },
      int8: {
        sizeMb: 456,
        url: 'https://huggingface.co/Cactus-Compute/nomic-embed-text-v2-moe/resolve/main/weights/nomic-embed-text-v2-moe-int8.zip',
      },
    },
  },
  'lfm2-700m': {
    completion: true,
    tools: true,
    vision: false,
    embed: true,
    speech: false,
    quantization: {
      int4: {
        sizeMb: 300,
        url: 'https://huggingface.co/Cactus-Compute/LFM2-700M/resolve/main/weights/lfm2-700m-int4.zip',
      },
      int8: {
        sizeMb: 467,
        url: 'https://huggingface.co/Cactus-Compute/LFM2-700M/resolve/main/weights/lfm2-700m-int8.zip',
      },
    },
  },
  'gemma-3-1b-it': {
    completion: true,
    tools: false,
    vision: false,
    embed: false,
    speech: false,
    quantization: {
      int4: {
        sizeMb: 320,
        url: 'https://huggingface.co/Cactus-Compute/gemma-3-1b-it/resolve/main/weights/gemma-3-1b-it-int4.zip',
      },
      int8: {
        sizeMb: 642,
        url: 'https://huggingface.co/Cactus-Compute/gemma-3-1b-it/resolve/main/weights/gemma-3-1b-it-int8.zip',
      },
    },
  },
  'whisper-medium': {
    completion: false,
    tools: false,
    vision: false,
    embed: true,
    speech: true,
    quantization: {
      int4: {
        sizeMb: 320,
        url: 'https://huggingface.co/Cactus-Compute/whisper-medium/resolve/main/weights/whisper-medium-int4.zip',
        pro: {
          apple:
            'https://huggingface.co/Cactus-Compute/whisper-medium/resolve/main/weights/whisper-medium-int4-apple.zip',
        },
      },
      int8: {
        sizeMb: 646,
        url: 'https://huggingface.co/Cactus-Compute/whisper-medium/resolve/main/weights/whisper-medium-int8.zip',
        pro: {
          apple:
            'https://huggingface.co/Cactus-Compute/whisper-medium/resolve/main/weights/whisper-medium-int8-apple.zip',
        },
      },
    },
  },
  'lfm2-1.2b': {
    completion: true,
    tools: true,
    vision: false,
    embed: true,
    speech: false,
    quantization: {
      int4: {
        sizeMb: 574,
        url: 'https://huggingface.co/Cactus-Compute/LFM2-1.2B/resolve/main/weights/lfm2-1.2b-int4.zip',
      },
      int8: {
        sizeMb: 1170,
        url: 'https://huggingface.co/Cactus-Compute/LFM2-1.2B/resolve/main/weights/lfm2-1.2b-int8.zip',
      },
    },
  },
  'lfm2.5-1.2b-instruct': {
    completion: true,
    tools: true,
    vision: false,
    embed: true,
    speech: false,
    quantization: {
      int4: {
        sizeMb: 474,
        url: 'https://huggingface.co/Cactus-Compute/LFM2.5-1.2B-Instruct/resolve/main/weights/lfm2.5-1.2b-instruct-int4.zip',
      },
      int8: {
        sizeMb: 722,
        url: 'https://huggingface.co/Cactus-Compute/LFM2.5-1.2B-Instruct/resolve/main/weights/lfm2.5-1.2b-instruct-int8.zip',
      },
    },
  },
  'lfm2.5-1.2b-thinking': {
    completion: true,
    tools: true,
    vision: false,
    embed: true,
    speech: false,
    quantization: {
      int4: {
        sizeMb: 574,
        url: 'https://huggingface.co/Cactus-Compute/LFM2.5-1.2B-Thinking/resolve/main/weights/lfm2.5-1.2b-thinking-int4.zip',
      },
      int8: {
        sizeMb: 1170,
        url: 'https://huggingface.co/Cactus-Compute/LFM2.5-1.2B-Thinking/resolve/main/weights/lfm2.5-1.2b-thinking-int8.zip',
      },
    },
  },
  'lfm2.5-vl-1.6b': {
    completion: true,
    tools: false,
    vision: true,
    embed: true,
    speech: false,
    quantization: {
      int4: {
        sizeMb: 954,
        url: 'https://huggingface.co/Cactus-Compute/LFM2.5-VL-1.6B/resolve/main/weights/lfm2.5-vl-1.6b-int4.zip',
        pro: {
          apple:
            'https://huggingface.co/Cactus-Compute/LFM2.5-VL-1.6B/resolve/main/weights/lfm2.5-vl-1.6b-int4-apple.zip',
        },
      },
      int8: {
        sizeMb: 1440,
        url: 'https://huggingface.co/Cactus-Compute/LFM2.5-VL-1.6B/resolve/main/weights/lfm2.5-vl-1.6b-int8.zip',
        pro: {
          apple:
            'https://huggingface.co/Cactus-Compute/LFM2.5-VL-1.6B/resolve/main/weights/lfm2.5-vl-1.6b-int8-apple.zip',
        },
      },
    },
  },
  'qwen3-1.7b': {
    completion: true,
    tools: true,
    vision: false,
    embed: true,
    speech: false,
    quantization: {
      int4: {
        sizeMb: 749,
        url: 'https://huggingface.co/Cactus-Compute/Qwen3-1.7B/resolve/main/weights/qwen3-1.7b-int4.zip',
      },
      int8: {
        sizeMb: 1161,
        url: 'https://huggingface.co/Cactus-Compute/Qwen3-1.7B/resolve/main/weights/qwen3-1.7b-int8.zip',
      },
    },
  },
  'lfm2-2.6b': {
    completion: true,
    tools: true,
    vision: false,
    embed: true,
    speech: false,
    quantization: {
      int4: {
        sizeMb: 1280,
        url: 'https://huggingface.co/Cactus-Compute/LFM2-2.6B/resolve/main/weights/lfm2-2.6b-int4.zip',
      },
      int8: {
        sizeMb: 2620,
        url: 'https://huggingface.co/Cactus-Compute/LFM2-2.6B/resolve/main/weights/lfm2-2.6b-int8.zip',
      },
    },
  },
};

export default models;
