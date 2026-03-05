![Cactus Logo](assets/logo.png)

## Resources

[![cactus](https://img.shields.io/badge/cactus-000000?logo=github&logoColor=white)](https://github.com/cactus-compute/cactus) [![HuggingFace](https://img.shields.io/badge/HuggingFace-FFD21E?logo=huggingface&logoColor=black)](https://huggingface.co/Cactus-Compute/models?sort=downloads) [![Discord](https://img.shields.io/badge/Discord-5865F2?logo=discord&logoColor=white)](https://discord.gg/bNurx3AXTJ) [![Documentation](https://img.shields.io/badge/Documentation-4285F4?logo=googledocs&logoColor=white)](https://cactuscompute.com/docs/react-native)

## Installation

```bash
npm install cactus-react-native react-native-nitro-modules
```

## Quick Start

Get started with Cactus in just a few lines of code:

```typescript
import { CactusLM, type CactusLMMessage } from 'cactus-react-native';

// Create a new instance
const cactusLM = new CactusLM();

// Download the model
await cactusLM.download({
  onProgress: (progress) => console.log(`Download: ${Math.round(progress * 100)}%`)
});

// Generate a completion
const messages: CactusLMMessage[] = [
  { role: 'user', content: 'What is the capital of France?' }
];

const result = await cactusLM.complete({ messages });
console.log(result.response); // "The capital of France is Paris."

// Clean up resources
await cactusLM.destroy();
```

**Using the React Hook:**

```tsx
import { useCactusLM } from 'cactus-react-native';

const App = () => {
  const cactusLM = useCactusLM();

  useEffect(() => {
    // Download the model if not already available
    if (!cactusLM.isDownloaded) {
      cactusLM.download();
    }
  }, []);

  const handleGenerate = () => {
    // Generate a completion
    cactusLM.complete({
      messages: [{ role: 'user', content: 'Hello!' }],
    });
  };

  if (cactusLM.isDownloading) {
    return (
      <Text>
        Downloading model: {Math.round(cactusLM.downloadProgress * 100)}%
      </Text>
    );
  }

  return (
    <>
      <Button onPress={handleGenerate} title="Generate" />
      <Text>{cactusLM.completion}</Text>
    </>
  );
};
```

## Language Model

### Model Options

Choose model quantization and NPU acceleration with Pro models.

```typescript
import { CactusLM } from 'cactus-react-native';

// Use int8 for better accuracy (default)
const cactusLM = new CactusLM({
  model: 'lfm2-vl-450m',
  options: {
    quantization: 'int8', // 'int4' or 'int8'
    pro: false
  }
});

// Use pro models for NPU acceleration
const cactusPro = new CactusLM({
  model: 'lfm2-vl-450m',
  options: {
    quantization: 'int8',
    pro: true
  }
});
```

### Completion

Generate text responses from the model by providing a conversation history.

#### Class

```typescript
import { CactusLM, type CactusLMMessage } from 'cactus-react-native';

const cactusLM = new CactusLM();

const messages: CactusLMMessage[] = [{ role: 'user', content: 'Hello, World!' }];
const onToken = (token: string) => { console.log('Token:', token) };

const result = await cactusLM.complete({ messages, onToken });
console.log('Completion result:', result);
```

#### Hook

```tsx
import { useCactusLM, type CactusLMMessage } from 'cactus-react-native';

const App = () => {
  const cactusLM = useCactusLM();

  const handleComplete = async () => {
    const messages: CactusLMMessage[] = [{ role: 'user', content: 'Hello, World!' }];

    const result = await cactusLM.complete({ messages });
    console.log('Completion result:', result);
  };

  return (
    <>
      <Button title="Complete" onPress={handleComplete} />
      <Text>{cactusLM.completion}</Text>
    </>
  );
};
```

### Vision

Vision allows you to pass images along with text prompts, enabling the model to analyze and understand visual content.

#### Class

```typescript
import { CactusLM, type CactusLMMessage } from 'cactus-react-native';

// Vision-capable model
const cactusLM = new CactusLM({ model: 'lfm2-vl-450m' });

const messages: CactusLMMessage[] = [
  {
    role: 'user',
    content: "What's in the image?",
    images: ['path/to/your/image'],
  },
];

const result = await cactusLM.complete({ messages });
console.log('Response:', result.response);
```

#### Hook

```tsx
import { useCactusLM, type CactusLMMessage } from 'cactus-react-native';

const App = () => {
  // Vision-capable model
  const cactusLM = useCactusLM({ model: 'lfm2-vl-450m' });

  const handleAnalyze = async () => {
    const messages: CactusLMMessage[] = [
      {
        role: 'user',
        content: "What's in the image?",
        images: ['path/to/your/image'],
      },
    ];

    await cactusLM.complete({ messages });
  };

  return (
    <>
      <Button title="Analyze Image" onPress={handleAnalyze} />
      <Text>{cactusLM.completion}</Text>
    </>
  );
};
```

### Tool Calling

Enable the model to generate function calls by defining available tools and their parameters.

#### Class

```typescript
import { CactusLM, type CactusLMMessage, type CactusLMTool } from 'cactus-react-native';

const tools: CactusLMTool[] = [
  {
    name: 'get_weather',
    description: 'Get current weather for a location',
    parameters: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'City name',
        },
      },
      required: ['location'],
    },
  },
];

const cactusLM = new CactusLM();

const messages: CactusLMMessage[] = [
  { role: 'user', content: "What's the weather in San Francisco?" },
];

const result = await cactusLM.complete({ messages, tools });
console.log('Response:', result.response);
console.log('Function calls:', result.functionCalls);
```

#### Hook

```tsx
import { useCactusLM, type CactusLMMessage, type CactusLMTool } from 'cactus-react-native';

const tools: CactusLMTool[] = [
  {
    name: 'get_weather',
    description: 'Get current weather for a location',
    parameters: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'City name',
        },
      },
      required: ['location'],
    },
  },
];

const App = () => {
  const cactusLM = useCactusLM();

  const handleComplete = async () => {
    const messages: CactusLMMessage[] = [
      { role: 'user', content: "What's the weather in San Francisco?" },
    ];

    const result = await cactusLM.complete({ messages, tools });
    console.log('Response:', result.response);
    console.log('Function calls:', result.functionCalls);
  };

  return <Button title="Complete" onPress={handleComplete} />;
};
```

### RAG (Retrieval Augmented Generation)

RAG allows you to provide a corpus of documents that the model can reference during generation, enabling it to answer questions based on your data.

#### Class

```typescript
import { CactusLM, type CactusLMMessage } from 'cactus-react-native';

const cactusLM = new CactusLM({
  corpusDir: 'path/to/your/corpus', // Directory containing .txt files
});

const messages: CactusLMMessage[] = [
  { role: 'user', content: 'What information is in the documents?' },
];

const result = await cactusLM.complete({ messages });
console.log(result.response);
```

#### Hook

```tsx
import { useCactusLM, type CactusLMMessage } from 'cactus-react-native';

const App = () => {
  const cactusLM = useCactusLM({
    corpusDir: 'path/to/your/corpus', // Directory containing .txt files
  });

  const handleAsk = async () => {
    const messages: CactusLMMessage[] = [
      { role: 'user', content: 'What information is in the documents?' },
    ];

    await cactusLM.complete({ messages });
  };

  return (
    <>
      <Button title="Ask Question" onPress={handleAsk} />
      <Text>{cactusLM.completion}</Text>
    </>
  );
};
```

### Tokenization

Convert text into tokens using the model's tokenizer.

#### Class

```typescript
import { CactusLM } from 'cactus-react-native';

const cactusLM = new CactusLM();

const result = await cactusLM.tokenize({ text: 'Hello, World!' });
console.log('Token IDs:', result.tokens);
```

#### Hook

```tsx
import { useCactusLM } from 'cactus-react-native';

const App = () => {
  const cactusLM = useCactusLM();

  const handleTokenize = async () => {
    const result = await cactusLM.tokenize({ text: 'Hello, World!' });
    console.log('Token IDs:', result.tokens);
  };

  return <Button title="Tokenize" onPress={handleTokenize} />;
};
```

### Score Window

Calculate perplexity scores for a window of tokens within a sequence.

#### Class

```typescript
import { CactusLM } from 'cactus-react-native';

const cactusLM = new CactusLM();

const tokens = [123, 456, 789, 101, 112];
const result = await cactusLM.scoreWindow({
  tokens,
  start: 1,
  end: 3,
  context: 2
});
console.log('Score:', result.score);
```

#### Hook

```tsx
import { useCactusLM } from 'cactus-react-native';

const App = () => {
  const cactusLM = useCactusLM();

  const handleScoreWindow = async () => {
    const tokens = [123, 456, 789, 101, 112];
    const result = await cactusLM.scoreWindow({
      tokens,
      start: 1,
      end: 3,
      context: 2
    });
    console.log('Score:', result.score);
  };

  return <Button title="Score Window" onPress={handleScoreWindow} />;
};
```

### Embedding

Convert text and images into numerical vector representations that capture semantic meaning, useful for similarity search and semantic understanding.

#### Text Embedding

##### Class

```typescript
import { CactusLM } from 'cactus-react-native';

const cactusLM = new CactusLM();

const result = await cactusLM.embed({ text: 'Hello, World!' });
console.log('Embedding vector:', result.embedding);
console.log('Embedding vector length:', result.embedding.length);
```

##### Hook

```tsx
import { useCactusLM } from 'cactus-react-native';

const App = () => {
  const cactusLM = useCactusLM();

  const handleEmbed = async () => {
    const result = await cactusLM.embed({ text: 'Hello, World!' });
    console.log('Embedding vector:', result.embedding);
    console.log('Embedding vector length:', result.embedding.length);
  };

  return <Button title="Embed" onPress={handleEmbed} />;
};
```

#### Image Embedding

##### Class

```typescript
import { CactusLM } from 'cactus-react-native';

const cactusLM = new CactusLM({ model: 'lfm2-vl-450m' });

const result = await cactusLM.imageEmbed({ imagePath: 'path/to/your/image.jpg' });
console.log('Image embedding vector:', result.embedding);
console.log('Embedding vector length:', result.embedding.length);
```

##### Hook

```tsx
import { useCactusLM } from 'cactus-react-native';

const App = () => {
  const cactusLM = useCactusLM({ model: 'lfm2-vl-450m' });

  const handleImageEmbed = async () => {
    const result = await cactusLM.imageEmbed({ imagePath: 'path/to/your/image.jpg' });
    console.log('Image embedding vector:', result.embedding);
    console.log('Embedding vector length:', result.embedding.length);
  };

  return <Button title="Embed Image" onPress={handleImageEmbed} />;
};
```

## Speech-to-Text (STT)

The `CactusSTT` class provides audio transcription and audio embedding capabilities using speech-to-text models such as Whisper and Moonshine.

### Transcription

Transcribe audio to text with streaming support. Accepts either a file path or raw PCM audio samples.

#### Class

```typescript
import { CactusSTT } from 'cactus-react-native';

const cactusSTT = new CactusSTT({ model: 'whisper-small' });

// Transcribe from file path
const result = await cactusSTT.transcribe({
  audio: 'path/to/audio.wav',
  onToken: (token) => console.log('Token:', token)
});

console.log('Transcription:', result.response);

// Or transcribe from raw PCM samples
const pcmSamples: number[] = [/* ... */];
const result2 = await cactusSTT.transcribe({
  audio: pcmSamples,
  onToken: (token) => console.log('Token:', token)
});

console.log('Transcription:', result2.response);
```

#### Hook

```tsx
import { useCactusSTT } from 'cactus-react-native';

const App = () => {
  const cactusSTT = useCactusSTT({ model: 'whisper-small' });

  const handleTranscribe = async () => {
    // Transcribe from file path
    const result = await cactusSTT.transcribe({
      audio: 'path/to/audio.wav',
    });
    console.log('Transcription:', result.response);

    const pcmSamples: number[] = [/* ... */];
    const result2 = await cactusSTT.transcribe({
      audio: pcmSamples,
    });
    console.log('Transcription:', result2.response);
  };

  return (
    <>
      <Button onPress={handleTranscribe} title="Transcribe" />
      <Text>{cactusSTT.transcription}</Text>
    </>
  );
};
```

### Streaming Transcription

Transcribe audio in real-time with incremental results. Each call to `streamTranscribeProcess` feeds an audio chunk and returns the currently confirmed and pending text.

#### Class

```typescript
import { CactusSTT } from 'cactus-react-native';

const cactusSTT = new CactusSTT({ model: 'whisper-small' });

await cactusSTT.streamTranscribeStart({
  confirmationThreshold: 0.99,  // confidence required to confirm text
  minChunkSize: 32000,          // minimum samples before processing
});

const audioChunk: number[] = [/* PCM samples as bytes */];
const result = await cactusSTT.streamTranscribeProcess({ audio: audioChunk });

console.log('Confirmed:', result.confirmed);
console.log('Pending:', result.pending);

const final = await cactusSTT.streamTranscribeStop();
console.log('Final confirmed:', final.confirmed);
```

#### Hook

```tsx
import { useCactusSTT } from 'cactus-react-native';

const App = () => {
  const cactusSTT = useCactusSTT({ model: 'whisper-small' });

  const handleStart = async () => {
    await cactusSTT.streamTranscribeStart({ confirmationThreshold: 0.99 });
  };

  const handleChunk = async (audioChunk: number[]) => {
    const result = await cactusSTT.streamTranscribeProcess({ audio: audioChunk });
    console.log('Confirmed:', result.confirmed);
    console.log('Pending:', result.pending);
  };

  const handleStop = async () => {
    const final = await cactusSTT.streamTranscribeStop();
    console.log('Final:', final.confirmed);
  };

  return (
    <>
      <Button onPress={handleStart} title="Start" />
      <Button onPress={handleStop} title="Stop" />
      <Text>{cactusSTT.streamTranscribeConfirmed}</Text>
      <Text>{cactusSTT.streamTranscribePending}</Text>
    </>
  );
};
```

### Audio Embedding

Generate embeddings from audio files for audio understanding.

#### Class

```typescript
import { CactusSTT } from 'cactus-react-native';

const cactusSTT = new CactusSTT();

const result = await cactusSTT.audioEmbed({
  audioPath: 'path/to/audio.wav'
});

console.log('Audio embedding vector:', result.embedding);
console.log('Embedding vector length:', result.embedding.length);
```

#### Hook

```tsx
import { useCactusSTT } from 'cactus-react-native';

const App = () => {
  const cactusSTT = useCactusSTT();

  const handleAudioEmbed = async () => {
    const result = await cactusSTT.audioEmbed({
      audioPath: 'path/to/audio.wav'
    });
    console.log('Audio embedding vector:', result.embedding);
    console.log('Embedding vector length:', result.embedding.length);
  };

  return <Button title="Embed Audio" onPress={handleAudioEmbed} />;
};
```

## Voice Activity Detection (VAD)

The `CactusVAD` class detects speech segments in audio, returning timestamped intervals where speech is present.

### Class

```typescript
import { CactusVAD } from 'cactus-react-native';

const cactusVAD = new CactusVAD({ model: 'silero-vad' });

const result = await cactusVAD.vad({
  audio: 'path/to/audio.wav',
  options: {
    threshold: 0.5,
    minSpeechDurationMs: 250,
    minSilenceDurationMs: 100,
  }
});

console.log('Speech segments:', result.segments);
// [{ start: 0, end: 16000 }, { start: 32000, end: 48000 }, ...]
console.log('Total time (ms):', result.totalTime);
```

### Hook

```tsx
import { useCactusVAD } from 'cactus-react-native';

const App = () => {
  const cactusVAD = useCactusVAD({ model: 'silero-vad' });

  const handleVAD = async () => {
    const result = await cactusVAD.vad({
      audio: 'path/to/audio.wav',
    });
    console.log('Speech segments:', result.segments);
  };

  return <Button title="Detect Speech" onPress={handleVAD} />;
};
```

## Vector Index

The `CactusIndex` class provides a vector database for storing and querying embeddings with metadata. Enabling similarity search and retrieval.

### Creating and Initializing an Index

#### Class

```typescript
import { CactusIndex } from 'cactus-react-native';

const cactusIndex = new CactusIndex('my-index', 1024);
await cactusIndex.init();
```

#### Hook

```tsx
import { useCactusIndex } from 'cactus-react-native';

const App = () => {
  const cactusIndex = useCactusIndex({
    name: 'my-index',
    embeddingDim: 1024
  });

  const handleInit = async () => {
    await cactusIndex.init();
  };

  return <Button title="Initialize Index" onPress={handleInit} />
};
```

### Adding Documents

Add documents with their embeddings and metadata to the index.

#### Class

```typescript
import { CactusIndex } from 'cactus-react-native';

const cactusIndex = new CactusIndex('my-index', 1024);
await cactusIndex.init();

await cactusIndex.add({
  ids: [1, 2, 3],
  documents: ['First document', 'Second document', 'Third document'],
  embeddings: [
    [0.1, 0.2, ...],
    [0.3, 0.4, ...],
    [0.5, 0.6, ...]
  ],
  metadatas: ['metadata1', 'metadata2', 'metadata3']
});
```

#### Hook

```tsx
import { useCactusIndex } from 'cactus-react-native';

const App = () => {
  const cactusIndex = useCactusIndex({
    name: 'my-index',
    embeddingDim: 1024
  });

  const handleAdd = async () => {
    await cactusIndex.add({
      ids: [1, 2, 3],
      documents: ['First document', 'Second document', 'Third document'],
      embeddings: [
        [0.1, 0.2, ...],
        [0.3, 0.4, ...],
        [0.5, 0.6, ...]
      ],
      metadatas: ['metadata1', 'metadata2', 'metadata3']
    });
  };

  return <Button title="Add Documents" onPress={handleAdd} />;
};
```

### Querying the Index

Search for similar documents using embedding vectors.

#### Class

```typescript
import { CactusIndex } from 'cactus-react-native';

const cactusIndex = new CactusIndex('my-index', 1024);
await cactusIndex.init();

const result = await cactusIndex.query({
  embeddings: [[0.1, 0.2, ...]],
  options: {
    topK: 5,
    scoreThreshold: 0.7
  }
});

console.log('IDs:', result.ids);
console.log('Scores:', result.scores);
```

#### Hook

```tsx
import { useCactusIndex } from 'cactus-react-native';

const App = () => {
  const cactusIndex = useCactusIndex({
    name: 'my-index',
    embeddingDim: 1024
  });

  const handleQuery = async () => {
    const result = await cactusIndex.query({
      embeddings: [[0.1, 0.2, ...]],
      options: {
        topK: 5,
        scoreThreshold: 0.7
      }
    });
    console.log('IDs:', result.ids);
    console.log('Scores:', result.scores);
  };

  return <Button title="Query Index" onPress={handleQuery} />;
};
```

### Retrieving Documents

Get documents by their IDs.

#### Class

```typescript
import { CactusIndex } from 'cactus-react-native';

const cactusIndex = new CactusIndex('my-index', 1024);
await cactusIndex.init();

const result = await cactusIndex.get({ ids: [1, 2, 3] });
console.log('Documents:', result.documents);
console.log('Metadatas:', result.metadatas);
console.log('Embeddings:', result.embeddings);
```

#### Hook

```tsx
import { useCactusIndex } from 'cactus-react-native';

const App = () => {
  const cactusIndex = useCactusIndex({
    name: 'my-index',
    embeddingDim: 1024
  });

  const handleGet = async () => {
    const result = await cactusIndex.get({ ids: [1, 2, 3] });
    console.log('Documents:', result.documents);
    console.log('Metadatas:', result.metadatas);
    console.log('Embeddings:', result.embeddings);
  };

  return <Button title="Get Documents" onPress={handleGet} />;
};
```

### Deleting Documents

Mark documents as deleted by their IDs.

#### Class

```typescript
import { CactusIndex } from 'cactus-react-native';

const cactusIndex = new CactusIndex('my-index', 1024);
await cactusIndex.init();

await cactusIndex.delete({ ids: [1, 2, 3] });
```

#### Hook

```tsx
import { useCactusIndex } from 'cactus-react-native';

const App = () => {
  const cactusIndex = useCactusIndex({
    name: 'my-index',
    embeddingDim: 1024
  });

  const handleDelete = async () => {
    await cactusIndex.delete({ ids: [1, 2, 3] });
  };

  return <Button title="Delete Documents" onPress={handleDelete} />;
};
```

### Compacting the Index

Optimize the index by removing deleted documents and reorganizing data.

#### Class

```typescript
import { CactusIndex } from 'cactus-react-native';

const cactusIndex = new CactusIndex('my-index', 1024);
await cactusIndex.init();

await cactusIndex.compact();
```

#### Hook

```tsx
import { useCactusIndex } from 'cactus-react-native';

const App = () => {
  const cactusIndex = useCactusIndex({
    name: 'my-index',
    embeddingDim: 1024
  });

  const handleCompact = async () => {
    await cactusIndex.compact();
  };

  return <Button title="Compact Index" onPress={handleCompact} />;
};
```

## API Reference

### CactusLM Class

#### Constructor

**`new CactusLM(params?: CactusLMParams)`**

**Parameters:**
- `model` - Model slug or absolute path to a model file (default: `'qwen3-0.6b'`).
- `corpusDir` - Directory containing text files for RAG (default: `undefined`).
- `cacheIndex` - Whether to cache the RAG corpus index on disk (default: `false`).
- `options` - Model options for quantization and NPU acceleration:
  - `quantization` - Quantization type: `'int4'` | `'int8'` (default: `'int8'`).
  - `pro` - Enable NPU-accelerated models (default: `false`).

#### Methods

**`download(params?: CactusLMDownloadParams): Promise<void>`**

Downloads the model. If the model is already downloaded, returns immediately with progress `1`. Throws an error if a download is already in progress.

**Parameters:**
- `onProgress` - Callback for download progress (0-1).

**`init(): Promise<void>`**

Initializes the model and prepares it for inference. Safe to call multiple times (idempotent). Throws an error if the model is not downloaded yet.

**`complete(params: CactusLMCompleteParams): Promise<CactusLMCompleteResult>`**

Performs text completion with optional streaming and tool support. Automatically calls `init()` if not already initialized. Throws an error if a generation (completion or embedding) is already in progress.

**Parameters:**
- `messages` - Array of `CactusLMMessage` objects.
- `options` - Generation options:
  - `temperature` - Sampling temperature.
  - `topP` - Nucleus sampling threshold.
  - `topK` - Top-K sampling limit.
  - `maxTokens` - Maximum number of tokens to generate (default: `512`).
  - `stopSequences` - Array of strings to stop generation.
  - `forceTools` - Force the model to call one of the provided tools (default: `false`).
  - `telemetryEnabled` - Enable telemetry for this request (default: `true`).
  - `confidenceThreshold` - Confidence threshold below which cloud handoff is triggered (default: `0.7`).
  - `toolRagTopK` - Number of tools to select via RAG when tool list is large (default: `2`).
  - `includeStopSequences` - Whether to include stop sequences in the response (default: `false`).
  - `useVad` - Whether to use VAD preprocessing (default: `true`).
- `tools` - Array of `CactusLMTool` objects for function calling.
- `onToken` - Callback for streaming tokens.

**`tokenize(params: CactusLMTokenizeParams): Promise<CactusLMTokenizeResult>`**

Converts text into tokens using the model's tokenizer.

**Parameters:**
- `text` - Text to tokenize.

**`scoreWindow(params: CactusLMScoreWindowParams): Promise<CactusLMScoreWindowResult>`**

Calculates the log-probability score for a window of tokens within a sequence.

**Parameters:**
- `tokens` - Array of token IDs.
- `start` - Start index of the window.
- `end` - End index of the window.
- `context` - Number of context tokens before the window.

**`embed(params: CactusLMEmbedParams): Promise<CactusLMEmbedResult>`**

Generates embeddings for the given text. Automatically calls `init()` if not already initialized. Throws an error if a generation (completion or embedding) is already in progress.

**Parameters:**
- `text` - Text to embed.
- `normalize` - Whether to normalize the embedding vector (default: `false`).

**`imageEmbed(params: CactusLMImageEmbedParams): Promise<CactusLMImageEmbedResult>`**

Generates embeddings for the given image. Requires a vision-capable model. Automatically calls `init()` if not already initialized. Throws an error if a generation (completion or embedding) is already in progress.

**Parameters:**
- `imagePath` - Path to the image file.

**`stop(): Promise<void>`**

Stops ongoing generation.

**`reset(): Promise<void>`**

Resets the model's internal state, clearing any cached context. Automatically calls `stop()` first.

**`destroy(): Promise<void>`**

Releases all resources associated with the model. Automatically calls `stop()` first. Safe to call even if the model is not initialized.

**`getModels(): Promise<CactusModel[]>`**

Returns available models.

**`getModelName(): string`**

Returns the model slug or path the instance was created with.

### useCactusLM Hook

The `useCactusLM` hook manages a `CactusLM` instance with reactive state. When model parameters (`model`, `corpusDir`, `cacheIndex`, `options`) change, the hook creates a new instance and resets all state. The hook automatically cleans up resources when the component unmounts.

#### State

- `completion: string` - Current generated text. Automatically accumulated during streaming. Cleared before each new completion and when calling `reset()` or `destroy()`.
- `isGenerating: boolean` - Whether the model is currently running an operation. Shared by `complete`, `tokenize`, `scoreWindow`, `embed`, and `imageEmbed`.
- `isInitializing: boolean` - Whether the model is initializing.
- `isDownloaded: boolean` - Whether the model is downloaded locally. Automatically checked when the hook mounts or model changes.
- `isDownloading: boolean` - Whether the model is being downloaded.
- `downloadProgress: number` - Download progress (0-1). Reset to `0` after download completes.
- `error: string | null` - Last error message from any operation, or `null` if there is no error. Cleared before starting new operations.

#### Methods

- `download(params?: CactusLMDownloadParams): Promise<void>` - Downloads the model. Updates `isDownloading` and `downloadProgress` state during download. Sets `isDownloaded` to `true` on success.
- `init(): Promise<void>` - Initializes the model for inference. Sets `isInitializing` to `true` during initialization.
- `complete(params: CactusLMCompleteParams): Promise<CactusLMCompleteResult>` - Generates text completions. Automatically accumulates tokens in the `completion` state during streaming. Sets `isGenerating` to `true` while generating. Clears `completion` before starting.
- `tokenize(params: CactusLMTokenizeParams): Promise<CactusLMTokenizeResult>` - Converts text into tokens. Sets `isGenerating` to `true` during operation.
- `scoreWindow(params: CactusLMScoreWindowParams): Promise<CactusLMScoreWindowResult>` - Calculates log-probability scores for a window of tokens. Sets `isGenerating` to `true` during operation.
- `embed(params: CactusLMEmbedParams): Promise<CactusLMEmbedResult>` - Generates embeddings for the given text. Sets `isGenerating` to `true` during operation.
- `imageEmbed(params: CactusLMImageEmbedParams): Promise<CactusLMImageEmbedResult>` - Generates embeddings for the given image. Sets `isGenerating` to `true` while generating.
- `stop(): Promise<void>` - Stops ongoing generation. Clears any errors.
- `reset(): Promise<void>` - Resets the model's internal state, clearing cached context. Also clears the `completion` state.
- `destroy(): Promise<void>` - Releases all resources associated with the model. Clears the `completion` state. Automatically called when the component unmounts.
- `getModels(): Promise<CactusModel[]>` - Returns available models.

### CactusSTT Class

#### Constructor

**`new CactusSTT(params?: CactusSTTParams)`**

**Parameters:**
- `model` - Model slug or absolute path to a model file (default: `'whisper-small'`).
- `options` - Model options for quantization and NPU acceleration:
  - `quantization` - Quantization type: `'int4'` | `'int8'` (default: `'int8'`).
  - `pro` - Enable NPU-accelerated models (default: `false`).

#### Methods

**`download(params?: CactusSTTDownloadParams): Promise<void>`**

Downloads the model. If the model is already downloaded, returns immediately with progress `1`. Throws an error if a download is already in progress.

**Parameters:**
- `onProgress` - Callback for download progress (0-1).

**`init(): Promise<void>`**

Initializes the model and prepares it for inference. Safe to call multiple times (idempotent). Throws an error if the model is not downloaded yet.

**`transcribe(params: CactusSTTTranscribeParams): Promise<CactusSTTTranscribeResult>`**

Transcribes audio to text with optional streaming support. Accepts either a file path or raw PCM audio samples. Automatically calls `init()` if not already initialized. Throws an error if a generation is already in progress.

**Parameters:**
- `audio` - Path to the audio file or raw PCM samples as a byte array.
- `prompt` - Optional prompt to guide transcription (default: `'<|startoftranscript|><|en|><|transcribe|><|notimestamps|>'`).
- `options` - Transcription options:
  - `temperature` - Sampling temperature.
  - `topP` - Nucleus sampling threshold.
  - `topK` - Top-K sampling limit.
  - `maxTokens` - Maximum number of tokens to generate (default: `384`).
  - `stopSequences` - Array of strings to stop generation.
  - `useVad` - Whether to apply VAD to strip silence before transcription (default: `true`).
  - `telemetryEnabled` - Enable telemetry for this request (default: `true`).
  - `confidenceThreshold` - Confidence threshold for quality assessment (default: `0.7`).
  - `cloudHandoffThreshold` - Max entropy threshold above which cloud handoff is triggered.
  - `includeStopSequences` - Whether to include stop sequences in the response (default: `false`).
- `onToken` - Callback for streaming tokens.

**`streamTranscribeStart(options?: CactusSTTStreamTranscribeStartOptions): Promise<void>`**

Starts a streaming transcription session. Automatically calls `init()` if not already initialized. If a session is already active, returns immediately.

**Parameters:**
- `confirmationThreshold` - Fuzzy match ratio required to confirm a transcription segment (default: `0.99`).
- `minChunkSize` - Minimum number of audio samples before processing (default: `32000`).
- `telemetryEnabled` - Enable telemetry for this session (default: `true`).

**`streamTranscribeProcess(params: CactusSTTStreamTranscribeProcessParams): Promise<CactusSTTStreamTranscribeProcessResult>`**

Feeds audio samples into the streaming session and returns the current transcription state. Throws an error if no session is active.

**Parameters:**
- `audio` - PCM audio samples as a byte array.

**`streamTranscribeStop(): Promise<CactusSTTStreamTranscribeStopResult>`**

Stops the streaming session and returns the final confirmed transcription text. Throws an error if no session is active.

**`detectLanguage(params: CactusSTTDetectLanguageParams): Promise<CactusSTTDetectLanguageResult>`**

Detects the spoken language in the given audio. Automatically calls `init()` if not already initialized. Throws an error if a generation is already in progress.

**Parameters:**
- `audio` - Path to the audio file or raw PCM samples as a byte array.
- `options`:
  - `useVad` - Whether to apply VAD before detection (default: `true`).

**`audioEmbed(params: CactusSTTAudioEmbedParams): Promise<CactusSTTAudioEmbedResult>`**

Generates embeddings for the given audio file. Automatically calls `init()` if not already initialized. Throws an error if a generation is already in progress.

**Parameters:**
- `audioPath` - Path to the audio file.

**`stop(): Promise<void>`**

Stops ongoing transcription or embedding generation.

**`reset(): Promise<void>`**

Resets the model's internal state. Automatically calls `stop()` first.

**`destroy(): Promise<void>`**

Releases all resources associated with the model. Stops any active streaming session. Automatically calls `stop()` first. Safe to call even if the model is not initialized.

**`getModels(): Promise<CactusModel[]>`**

Returns available speech-to-text models.

**`getModelName(): string`**

Returns the model slug or path the instance was created with.

### useCactusSTT Hook

The `useCactusSTT` hook manages a `CactusSTT` instance with reactive state. When model parameters (`model`, `options`) change, the hook creates a new instance and resets all state. The hook automatically cleans up resources when the component unmounts.

#### State

- `transcription: string` - Current transcription text. Automatically accumulated during streaming. Cleared before each new transcription and when calling `reset()` or `destroy()`.
- `streamTranscribeConfirmed: string` - Accumulated confirmed text from the active streaming session. Updated after each successful `streamTranscribeProcess` call and finalized by `streamTranscribeStop`.
- `streamTranscribePending: string` - Uncommitted (in-progress) text from the current audio chunk. Cleared when the session stops.
- `isGenerating: boolean` - Whether the model is currently transcribing or embedding. Both operations share this flag.
- `isStreamTranscribing: boolean` - Whether a streaming transcription session is currently active.
- `isInitializing: boolean` - Whether the model is initializing.
- `isDownloaded: boolean` - Whether the model is downloaded locally. Automatically checked when the hook mounts or model changes.
- `isDownloading: boolean` - Whether the model is being downloaded.
- `downloadProgress: number` - Download progress (0-1). Reset to `0` after download completes.
- `error: string | null` - Last error message from any operation, or `null` if there is no error. Cleared before starting new operations.

#### Methods

- `download(params?: CactusSTTDownloadParams): Promise<void>` - Downloads the model. Updates `isDownloading` and `downloadProgress` state during download. Sets `isDownloaded` to `true` on success.
- `init(): Promise<void>` - Initializes the model for inference. Sets `isInitializing` to `true` during initialization.
- `transcribe(params: CactusSTTTranscribeParams): Promise<CactusSTTTranscribeResult>` - Transcribes audio to text. Automatically accumulates tokens in the `transcription` state during streaming. Sets `isGenerating` to `true` while generating. Clears `transcription` before starting.
- `audioEmbed(params: CactusSTTAudioEmbedParams): Promise<CactusSTTAudioEmbedResult>` - Generates embeddings for the given audio. Sets `isGenerating` to `true` during operation.
- `streamTranscribeStart(options?: CactusSTTStreamTranscribeStartOptions): Promise<void>` - Starts a streaming transcription session. If a session is already active, returns immediately. Clears `streamTranscribeConfirmed` and `streamTranscribePending` before starting. Sets `isStreamTranscribing` to `true`.
- `streamTranscribeProcess(params: CactusSTTStreamTranscribeProcessParams): Promise<CactusSTTStreamTranscribeProcessResult>` - Feeds audio and returns incremental results. Appends confirmed text to `streamTranscribeConfirmed` and updates `streamTranscribePending`.
- `streamTranscribeStop(): Promise<CactusSTTStreamTranscribeStopResult>` - Stops the session and returns the final result. Sets `isStreamTranscribing` to `false`. Appends final confirmed text to `streamTranscribeConfirmed` and clears `streamTranscribePending`.
- `stop(): Promise<void>` - Stops ongoing generation. Clears any errors.
- `reset(): Promise<void>` - Resets the model's internal state. Also clears the `transcription` state.
- `destroy(): Promise<void>` - Releases all resources associated with the model. Clears the `transcription`, `streamTranscribeConfirmed`, and `streamTranscribePending` state. Automatically called when the component unmounts.
- `getModels(): Promise<CactusModel[]>` - Returns available speech-to-text models.

### CactusVAD Class

#### Constructor

**`new CactusVAD(params?: CactusVADParams)`**

**Parameters:**
- `model` - Model slug or absolute path to a VAD model file (default: `'silero-vad'`).
- `options` - Model options:
  - `quantization` - Quantization type: `'int4'` | `'int8'` (default: `'int8'`).
  - `pro` - Enable NPU-accelerated models (default: `false`).

#### Methods

**`download(params?: CactusVADDownloadParams): Promise<void>`**

Downloads the VAD model. If the model is already downloaded, returns immediately with progress `1`. Throws an error if a download is already in progress.

**Parameters:**
- `onProgress` - Callback for download progress (0-1).

**`init(): Promise<void>`**

Initializes the VAD model. Safe to call multiple times (idempotent). Throws an error if the model is not downloaded yet.

**`vad(params: CactusVADVadParams): Promise<CactusVADResult>`**

Runs voice activity detection on the given audio. Automatically calls `init()` if not already initialized.

**Parameters:**
- `audio` - Path to the audio file or raw PCM samples as a byte array.
- `options` - VAD options:
  - `threshold` - Speech probability threshold (default: model default).
  - `negThreshold` - Silence probability threshold.
  - `minSpeechDurationMs` - Minimum speech segment duration in ms.
  - `maxSpeechDurationS` - Maximum speech segment duration in seconds.
  - `minSilenceDurationMs` - Minimum silence duration before ending a segment.
  - `speechPadMs` - Padding added to each speech segment in ms.
  - `windowSizeSamples` - Processing window size in samples.
  - `samplingRate` - Audio sampling rate.
  - `minSilenceAtMaxSpeech` - Minimum silence at max speech duration.
  - `useMaxPossSilAtMaxSpeech` - Whether to use maximum possible silence at max speech.

**`destroy(): Promise<void>`**

Releases all resources associated with the model. Safe to call even if the model is not initialized.

**`getModels(): Promise<CactusModel[]>`**

Returns available VAD models.

**`getModelName(): string`**

Returns the model slug or path the instance was created with.

### useCactusVAD Hook

The `useCactusVAD` hook manages a `CactusVAD` instance with reactive state. When model parameters (`model`, `options`) change, the hook creates a new instance and resets all state. The hook automatically cleans up resources when the component unmounts.

#### State

- `isInitializing: boolean` - Whether the model is initializing.
- `isDownloaded: boolean` - Whether the model is downloaded locally. Automatically checked when the hook mounts or model changes.
- `isDownloading: boolean` - Whether the model is being downloaded.
- `downloadProgress: number` - Download progress (0-1). Reset to `0` after download completes.
- `error: string | null` - Last error message, or `null`.

#### Methods

- `download(params?: CactusVADDownloadParams): Promise<void>` - Downloads the model. Updates `isDownloading` and `downloadProgress` state during download. Sets `isDownloaded` to `true` on success.
- `init(): Promise<void>` - Initializes the model.
- `vad(params: CactusVADVadParams): Promise<CactusVADResult>` - Runs voice activity detection.
- `destroy(): Promise<void>` - Releases all resources. Automatically called when the component unmounts.
- `getModels(): Promise<CactusModel[]>` - Returns available VAD models.

### CactusIndex Class

#### Constructor

**`new CactusIndex(name: string, embeddingDim: number)`**

**Parameters:**
- `name` - Name of the index.
- `embeddingDim` - Dimension of the embedding vectors.

#### Methods

**`init(): Promise<void>`**

Initializes the index and prepares it for operations. Must be called before using any other methods.

**`add(params: CactusIndexAddParams): Promise<void>`**

Adds documents with their embeddings and metadata to the index.

**Parameters:**
- `ids` - Array of document IDs.
- `documents` - Array of document texts.
- `embeddings` - Array of embedding vectors (each vector must match `embeddingDim`).
- `metadatas` - Optional array of metadata strings.

**`query(params: CactusIndexQueryParams): Promise<CactusIndexQueryResult>`**

Searches for similar documents using embedding vectors.

**Parameters:**
- `embeddings` - Array of query embedding vectors.
- `options` - Query options:
  - `topK` - Number of top results to return (default: 10).
  - `scoreThreshold` - Minimum similarity score threshold (default: -1.0).

**`get(params: CactusIndexGetParams): Promise<CactusIndexGetResult>`**

Retrieves documents by their IDs.

**Parameters:**
- `ids` - Array of document IDs to retrieve.

**`delete(params: CactusIndexDeleteParams): Promise<void>`**

Deletes documents from the index by their IDs.

**Parameters:**
- `ids` - Array of document IDs to delete.

**`compact(): Promise<void>`**

Optimizes the index by removing deleted documents and reorganizing data for better performance. Call after a series of deletions.

**`destroy(): Promise<void>`**

Releases all resources associated with the index from memory.

### useCactusIndex Hook

The `useCactusIndex` hook manages a `CactusIndex` instance with reactive state. When index parameters (`name` or `embeddingDim`) change, the hook creates a new instance and resets all state. The hook automatically cleans up resources when the component unmounts.

#### State

- `isInitializing: boolean` - Whether the index is initializing.
- `isProcessing: boolean` - Whether the index is processing an operation (add, query, get, delete, or compact).
- `error: string | null` - Last error message from any operation, or `null` if there is no error. Cleared before starting new operations.

#### Methods

- `init(): Promise<void>` - Initializes the index. Sets `isInitializing` to `true` during initialization.
- `add(params: CactusIndexAddParams): Promise<void>` - Adds documents to the index. Sets `isProcessing` to `true` during operation.
- `query(params: CactusIndexQueryParams): Promise<CactusIndexQueryResult>` - Searches for similar documents. Sets `isProcessing` to `true` during operation.
- `get(params: CactusIndexGetParams): Promise<CactusIndexGetResult>` - Retrieves documents by IDs. Sets `isProcessing` to `true` during operation.
- `delete(params: CactusIndexDeleteParams): Promise<void>` - Deletes documents. Sets `isProcessing` to `true` during operation.
- `compact(): Promise<void>` - Optimizes the index. Sets `isProcessing` to `true` during operation.
- `destroy(): Promise<void>` - Releases all resources. Automatically called when the component unmounts.

### getRegistry

**`getRegistry(): Promise<{ [key: string]: CactusModel }>`**

Returns all available models from HuggingFace, keyed by model slug. Result is cached across calls.

```typescript
import { getRegistry } from 'cactus-react-native';

const registry = await getRegistry();
const model = registry['qwen3-0.6b'];
console.log(model.quantization.int4.url);
```

## Type Definitions

### CactusLMParams

```typescript
interface CactusLMParams {
  model?: string;
  corpusDir?: string;
  cacheIndex?: boolean;
  options?: CactusModelOptions;
}
```

### CactusLMDownloadParams

```typescript
interface CactusLMDownloadParams {
  onProgress?: (progress: number) => void;
}
```

### CactusLMMessage

```typescript
interface CactusLMMessage {
  role: 'user' | 'assistant' | 'system';
  content?: string;
  images?: string[];
}
```

### CactusLMCompleteOptions

```typescript
interface CactusLMCompleteOptions {
  temperature?: number;
  topP?: number;
  topK?: number;
  maxTokens?: number;
  stopSequences?: string[];
  forceTools?: boolean;
  telemetryEnabled?: boolean;
  confidenceThreshold?: number;
  toolRagTopK?: number;
  includeStopSequences?: boolean;
  useVad?: boolean;
}
```

### CactusLMTool

```typescript
interface CactusLMTool {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: {
      [key: string]: {
        type: string;
        description: string;
      };
    };
    required: string[];
  };
}
```

### CactusLMCompleteParams

```typescript
interface CactusLMCompleteParams {
  messages: CactusLMMessage[];
  options?: CactusLMCompleteOptions;
  tools?: CactusLMTool[];
  onToken?: (token: string) => void;
}
```

### CactusLMCompleteResult

```typescript
interface CactusLMCompleteResult {
  success: boolean;
  response: string;
  functionCalls?: {
    name: string;
    arguments: { [key: string]: any };
  }[];
  cloudHandoff?: boolean;
  confidence?: number;
  timeToFirstTokenMs: number;
  totalTimeMs: number;
  prefillTokens: number;
  prefillTps: number;
  decodeTokens: number;
  decodeTps: number;
  totalTokens: number;
  ramUsageMb?: number;
}
```

### CactusLMTokenizeParams

```typescript
interface CactusLMTokenizeParams {
  text: string;
}
```

### CactusLMTokenizeResult

```typescript
interface CactusLMTokenizeResult {
  tokens: number[];
}
```

### CactusLMScoreWindowParams

```typescript
interface CactusLMScoreWindowParams {
  tokens: number[];
  start: number;
  end: number;
  context: number;
}
```

### CactusLMScoreWindowResult

```typescript
interface CactusLMScoreWindowResult {
  score: number;
}
```

### CactusLMEmbedParams

```typescript
interface CactusLMEmbedParams {
  text: string;
  normalize?: boolean;
}
```

### CactusLMEmbedResult

```typescript
interface CactusLMEmbedResult {
  embedding: number[];
}
```

### CactusLMImageEmbedParams

```typescript
interface CactusLMImageEmbedParams {
  imagePath: string;
}
```

### CactusLMImageEmbedResult

```typescript
interface CactusLMImageEmbedResult {
  embedding: number[];
}
```

### CactusModel

```typescript
interface CactusModel {
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
```

### CactusModelOptions

```typescript
interface CactusModelOptions {
  quantization?: 'int4' | 'int8';
  pro?: boolean;
}
```

### CactusSTTParams

```typescript
interface CactusSTTParams {
  model?: string;
  options?: CactusModelOptions;
}
```

### CactusSTTDownloadParams

```typescript
interface CactusSTTDownloadParams {
  onProgress?: (progress: number) => void;
}
```

### CactusSTTTranscribeOptions

```typescript
interface CactusSTTTranscribeOptions {
  temperature?: number;
  topP?: number;
  topK?: number;
  maxTokens?: number;
  stopSequences?: string[];
  useVad?: boolean;
  telemetryEnabled?: boolean;
  confidenceThreshold?: number;
  cloudHandoffThreshold?: number;
  includeStopSequences?: boolean;
}
```

### CactusSTTTranscribeParams

```typescript
interface CactusSTTTranscribeParams {
  audio: string | number[];
  prompt?: string;
  options?: CactusSTTTranscribeOptions;
  onToken?: (token: string) => void;
}
```

### CactusSTTTranscribeResult

```typescript
interface CactusSTTTranscribeResult {
  success: boolean;
  response: string;
  cloudHandoff?: boolean;
  confidence?: number;
  timeToFirstTokenMs: number;
  totalTimeMs: number;
  prefillTokens: number;
  prefillTps: number;
  decodeTokens: number;
  decodeTps: number;
  totalTokens: number;
  ramUsageMb?: number;
}
```

### CactusSTTAudioEmbedParams

```typescript
interface CactusSTTAudioEmbedParams {
  audioPath: string;
}
```

### CactusSTTAudioEmbedResult

```typescript
interface CactusSTTAudioEmbedResult {
  embedding: number[];
}
```

### CactusSTTStreamTranscribeStartOptions

```typescript
interface CactusSTTStreamTranscribeStartOptions {
  confirmationThreshold?: number;
  minChunkSize?: number;
  telemetryEnabled?: boolean;
}
```

### CactusSTTStreamTranscribeProcessParams

```typescript
interface CactusSTTStreamTranscribeProcessParams {
  audio: number[];
}
```

### CactusSTTStreamTranscribeProcessResult

```typescript
interface CactusSTTStreamTranscribeProcessResult {
  success: boolean;
  confirmed: string;
  pending: string;
  bufferDurationMs?: number;
  confidence?: number;
  cloudHandoff?: boolean;
  cloudResult?: string;
  cloudJobId?: number;
  cloudResultJobId?: number;
  timeToFirstTokenMs?: number;
  totalTimeMs?: number;
  prefillTokens?: number;
  prefillTps?: number;
  decodeTokens?: number;
  decodeTps?: number;
  totalTokens?: number;
  ramUsageMb?: number;
}
```

### CactusSTTStreamTranscribeStopResult

```typescript
interface CactusSTTStreamTranscribeStopResult {
  success: boolean;
  confirmed: string;
}
```

### CactusSTTDetectLanguageOptions

```typescript
interface CactusSTTDetectLanguageOptions {
  useVad?: boolean;
}
```

### CactusSTTDetectLanguageParams

```typescript
interface CactusSTTDetectLanguageParams {
  audio: string | number[];
  options?: CactusSTTDetectLanguageOptions;
}
```

### CactusSTTDetectLanguageResult

```typescript
interface CactusSTTDetectLanguageResult {
  language: string;
  confidence?: number;
}
```

### CactusVADParams

```typescript
interface CactusVADParams {
  model?: string;
  options?: CactusModelOptions;
}
```

### CactusVADDownloadParams

```typescript
interface CactusVADDownloadParams {
  onProgress?: (progress: number) => void;
}
```

### CactusVADOptions

```typescript
interface CactusVADOptions {
  threshold?: number;
  negThreshold?: number;
  minSpeechDurationMs?: number;
  maxSpeechDurationS?: number;
  minSilenceDurationMs?: number;
  speechPadMs?: number;
  windowSizeSamples?: number;
  samplingRate?: number;
  minSilenceAtMaxSpeech?: number;
  useMaxPossSilAtMaxSpeech?: boolean;
}
```

### CactusVADSegment

```typescript
interface CactusVADSegment {
  start: number;
  end: number;
}
```

### CactusVADResult

```typescript
interface CactusVADResult {
  segments: CactusVADSegment[];
  totalTime: number;
  ramUsage: number;
}
```

### CactusVADVadParams

```typescript
interface CactusVADVadParams {
  audio: string | number[];
  options?: CactusVADOptions;
}
```

### CactusIndexParams

```typescript
interface CactusIndexParams {
  name: string;
  embeddingDim: number;
}
```

### CactusIndexAddParams

```typescript
interface CactusIndexAddParams {
  ids: number[];
  documents: string[];
  embeddings: number[][];
  metadatas?: string[];
}
```

### CactusIndexGetParams

```typescript
interface CactusIndexGetParams {
  ids: number[];
}
```

### CactusIndexGetResult

```typescript
interface CactusIndexGetResult {
  documents: string[];
  metadatas: string[];
  embeddings: number[][];
}
```

### CactusIndexQueryOptions

```typescript
interface CactusIndexQueryOptions {
  topK?: number;
  scoreThreshold?: number;
}
```

### CactusIndexQueryParams

```typescript
interface CactusIndexQueryParams {
  embeddings: number[][];
  options?: CactusIndexQueryOptions;
}
```

### CactusIndexQueryResult

```typescript
interface CactusIndexQueryResult {
  ids: number[][];
  scores: number[][];
}
```

### CactusIndexDeleteParams

```typescript
interface CactusIndexDeleteParams {
  ids: number[];
}
```

## Performance Tips

- **Model Selection** - Choose smaller models for faster inference on mobile devices.
- **Memory Management** - Always call `destroy()` when you're done with models to free up resources.
- **VAD** - Use `useVad: true` (the default) when transcribing audio with silence, to strip non-speech regions and speed up transcription.

## Example App

Check out [our example app](/example) for a complete React Native implementation.
