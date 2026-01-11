import type { CactusModel } from './types/common';

const models: { [key: string]: CactusModel } = {
  'gemma-3-270m-it': {
    completion: true,
    tools: false,
    vision: false,
    embed: true,
    speech: false,
    quantization: {
      int4: {
        sizeMb: 115,
        url: 'https://vlqqczxwyaodtcdmdmlw.supabase.co/storage/v1/object/public/cactus-models/v1.5/int4/gemma-3-270m-it.zip',
      },
      int8: {
        sizeMb: 172,
        url: 'https://vlqqczxwyaodtcdmdmlw.supabase.co/storage/v1/object/public/cactus-models/v1.5/int8/gemma-3-270m-it.zip',
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
        url: 'https://vlqqczxwyaodtcdmdmlw.supabase.co/storage/v1/object/public/cactus-models/v1.5/int4/functiongemma-270m-it.zip',
      },
      int8: {
        sizeMb: 172,
        url: 'https://vlqqczxwyaodtcdmdmlw.supabase.co/storage/v1/object/public/cactus-models/v1.5/int8/functiongemma-270m-it.zip',
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
        url: 'https://vlqqczxwyaodtcdmdmlw.supabase.co/storage/v1/object/public/cactus-models/v1.5/int4/whisper-small.zip',
        pro: {
          apple:
            'https://vlqqczxwyaodtcdmdmlw.supabase.co/storage/v1/object/public/cactus-models/v1.5/int4/pro/apple/whisper-small.zip',
        },
      },
      int8: {
        sizeMb: 282,
        url: 'https://vlqqczxwyaodtcdmdmlw.supabase.co/storage/v1/object/public/cactus-models/v1.5/int8/whisper-small.zip',
        pro: {
          apple:
            'https://vlqqczxwyaodtcdmdmlw.supabase.co/storage/v1/object/public/cactus-models/v1.5/int8/pro/apple/whisper-small.zip',
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
        url: 'https://vlqqczxwyaodtcdmdmlw.supabase.co/storage/v1/object/public/cactus-models/v1.5/int4/lfm2-350m.zip',
      },
      int8: {
        sizeMb: 233,
        url: 'https://vlqqczxwyaodtcdmdmlw.supabase.co/storage/v1/object/public/cactus-models/v1.5/int8/lfm2-350m.zip',
      },
    },
  },
  'smollm2-360m-instruct': {
    completion: true,
    tools: false,
    vision: false,
    embed: true,
    speech: false,
    quantization: {
      int4: {
        sizeMb: 140,
        url: 'https://vlqqczxwyaodtcdmdmlw.supabase.co/storage/v1/object/public/cactus-models/v1.5/int4/smollm2-360m-instruct.zip',
      },
      int8: {
        sizeMb: 227,
        url: 'https://vlqqczxwyaodtcdmdmlw.supabase.co/storage/v1/object/public/cactus-models/v1.5/int8/smollm2-360m-instruct.zip',
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
        url: 'https://vlqqczxwyaodtcdmdmlw.supabase.co/storage/v1/object/public/cactus-models/v1.5/int4/lfm2-vl-450m.zip',
        pro: {
          apple:
            'https://vlqqczxwyaodtcdmdmlw.supabase.co/storage/v1/object/public/cactus-models/v1.5/int4/pro/apple/lfm2-vl-450m.zip',
        },
      },
      int8: {
        sizeMb: 480,
        url: 'https://vlqqczxwyaodtcdmdmlw.supabase.co/storage/v1/object/public/cactus-models/v1.5/int8/lfm2-vl-450m.zip',
        pro: {
          apple:
            'https://vlqqczxwyaodtcdmdmlw.supabase.co/storage/v1/object/public/cactus-models/v1.5/int8/pro/apple/lfm2-vl-450m.zip',
        },
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
        url: 'https://vlqqczxwyaodtcdmdmlw.supabase.co/storage/v1/object/public/cactus-models/v1.5/int4/nomic-embed-text-v2-moe.zip',
      },
      int8: {
        sizeMb: 456,
        url: 'https://vlqqczxwyaodtcdmdmlw.supabase.co/storage/v1/object/public/cactus-models/v1.5/int8/nomic-embed-text-v2-moe.zip',
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
        url: 'https://vlqqczxwyaodtcdmdmlw.supabase.co/storage/v1/object/public/cactus-models/v1.5/int4/qwen3-0.6b.zip',
      },
      int8: {
        sizeMb: 394,
        url: 'https://vlqqczxwyaodtcdmdmlw.supabase.co/storage/v1/object/public/cactus-models/v1.5/int8/qwen3-0.6b.zip',
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
        url: 'https://vlqqczxwyaodtcdmdmlw.supabase.co/storage/v1/object/public/cactus-models/v1.5/int4/qwen3-embedding-0.6b.zip',
      },
      int8: {
        sizeMb: 394,
        url: 'https://vlqqczxwyaodtcdmdmlw.supabase.co/storage/v1/object/public/cactus-models/v1.5/int8/qwen3-embedding-0.6b.zip',
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
        url: 'https://vlqqczxwyaodtcdmdmlw.supabase.co/storage/v1/object/public/cactus-models/v1.5/int4/lfm2-700m.zip',
      },
      int8: {
        sizeMb: 467,
        url: 'https://vlqqczxwyaodtcdmdmlw.supabase.co/storage/v1/object/public/cactus-models/v1.5/int8/lfm2-700m.zip',
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
        url: 'https://vlqqczxwyaodtcdmdmlw.supabase.co/storage/v1/object/public/cactus-models/v1.5/int4/gemma-3-1b-it.zip',
      },
      int8: {
        sizeMb: 642,
        url: 'https://vlqqczxwyaodtcdmdmlw.supabase.co/storage/v1/object/public/cactus-models/v1.5/int8/gemma-3-1b-it.zip',
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
        url: 'https://vlqqczxwyaodtcdmdmlw.supabase.co/storage/v1/object/public/cactus-models/v1.5/int4/whisper-medium.zip',
        pro: {
          apple:
            'https://vlqqczxwyaodtcdmdmlw.supabase.co/storage/v1/object/public/cactus-models/v1.5/int4/pro/apple/whisper-medium.zip',
        },
      },
      int8: {
        sizeMb: 646,
        url: 'https://vlqqczxwyaodtcdmdmlw.supabase.co/storage/v1/object/public/cactus-models/v1.5/int8/whisper-medium.zip',
        pro: {
          apple:
            'https://vlqqczxwyaodtcdmdmlw.supabase.co/storage/v1/object/public/cactus-models/v1.5/int8/pro/apple/whisper-medium.zip',
        },
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
        url: 'https://vlqqczxwyaodtcdmdmlw.supabase.co/storage/v1/object/public/cactus-models/v1.5/int4/lfm2.5-1.2b-instruct.zip',
      },
      int8: {
        sizeMb: 722,
        url: 'https://vlqqczxwyaodtcdmdmlw.supabase.co/storage/v1/object/public/cactus-models/v1.5/int8/lfm2.5-1.2b-instruct.zip',
      },
    },
  },
  'lfm2-1.2b-rag': {
    completion: true,
    tools: true,
    vision: false,
    embed: true,
    speech: false,
    quantization: {
      int4: {
        sizeMb: 474,
        url: 'https://vlqqczxwyaodtcdmdmlw.supabase.co/storage/v1/object/public/cactus-models/v1.5/int4/lfm2-1.2b-rag.zip',
      },
      int8: {
        sizeMb: 722,
        url: 'https://vlqqczxwyaodtcdmdmlw.supabase.co/storage/v1/object/public/cactus-models/v1.5/int8/lfm2-1.2b-rag.zip',
      },
    },
  },
  'lfm2-1.2b-tool': {
    completion: true,
    tools: true,
    vision: false,
    embed: true,
    speech: false,
    quantization: {
      int4: {
        sizeMb: 474,
        url: 'https://vlqqczxwyaodtcdmdmlw.supabase.co/storage/v1/object/public/cactus-models/v1.5/int4/lfm2-1.2b-tool.zip',
      },
      int8: {
        sizeMb: 722,
        url: 'https://vlqqczxwyaodtcdmdmlw.supabase.co/storage/v1/object/public/cactus-models/v1.5/int8/lfm2-1.2b-tool.zip',
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
        url: 'https://vlqqczxwyaodtcdmdmlw.supabase.co/storage/v1/object/public/cactus-models/v1.5/int4/lfm2.5-vl-1.6b.zip',
        pro: {
          apple:
            'https://vlqqczxwyaodtcdmdmlw.supabase.co/storage/v1/object/public/cactus-models/v1.5/int4/pro/apple/lfm2.5-vl-1.6b.zip',
        },
      },
      int8: {
        sizeMb: 1440,
        url: 'https://vlqqczxwyaodtcdmdmlw.supabase.co/storage/v1/object/public/cactus-models/v1.5/int8/lfm2.5-vl-1.6b.zip',
        pro: {
          apple:
            'https://vlqqczxwyaodtcdmdmlw.supabase.co/storage/v1/object/public/cactus-models/v1.5/int8/pro/apple/lfm2.5-vl-1.6b.zip',
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
        url: 'https://vlqqczxwyaodtcdmdmlw.supabase.co/storage/v1/object/public/cactus-models/v1.5/int4/qwen3-1.7b.zip',
      },
      int8: {
        sizeMb: 1161,
        url: 'https://vlqqczxwyaodtcdmdmlw.supabase.co/storage/v1/object/public/cactus-models/v1.5/int8/qwen3-1.7b.zip',
      },
    },
  },
  'smollm2-1.7b-instruct': {
    completion: true,
    tools: false,
    vision: false,
    embed: true,
    speech: false,
    quantization: {
      int4: {
        sizeMb: 801,
        url: 'https://vlqqczxwyaodtcdmdmlw.supabase.co/storage/v1/object/public/cactus-models/v1.5/int4/smollm2-1.7b-instruct.zip',
      },
      int8: {
        sizeMb: 1161,
        url: 'https://vlqqczxwyaodtcdmdmlw.supabase.co/storage/v1/object/public/cactus-models/v1.5/int8/smollm2-1.7b-instruct.zip',
      },
    },
  },
};

export default models;
