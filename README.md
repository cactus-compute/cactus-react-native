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
import { CactusLM, type Message } from 'cactus-react-native';

// Create a new instance
const cactusLM = new CactusLM();

// Download the model
await cactusLM.download({
  onProgress: (progress) => console.log(`Download: ${Math.round(progress * 100)}%`)
});

// Generate a completion
const messages: Message[] = [
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

### Completion

Generate text responses from the model by providing a conversation history.

#### Class

```typescript
import { CactusLM, type Message } from 'cactus-react-native';

const cactusLM = new CactusLM();

const messages: Message[] = [{ role: 'user', content: 'Hello, World!' }];
const onToken = (token: string) => { console.log('Token:', token) };

const result = await cactusLM.complete({ messages, onToken });
console.log('Completion result:', result);
```

#### Hook

```tsx
import { useCactusLM, type Message } from 'cactus-react-native';

const App = () => {
  const cactusLM = useCactusLM();

  const handleComplete = async () => {
    const messages: Message[] = [{ role: 'user', content: 'Hello, World!' }];

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
import { CactusLM, type Message } from 'cactus-react-native';

// Vision-capable model
const cactusLM = new CactusLM({ model: 'lfm2-vl-450m' });

const messages: Message[] = [
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
import { useCactusLM, type Message } from 'cactus-react-native';

const App = () => {
  // Vision-capable model
  const cactusLM = useCactusLM({ model: 'lfm2-vl-450m' });

  const handleAnalyze = async () => {
    const messages: Message[] = [
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
import { CactusLM, type Message, type Tool } from 'cactus-react-native';

const tools: Tool[] = [
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

const messages: Message[] = [
  { role: 'user', content: "What's the weather in San Francisco?" },
];

const result = await cactusLM.complete({ messages, tools });
console.log('Response:', result.response);
console.log('Function calls:', result.functionCalls);
```

#### Hook

```tsx
import { useCactusLM, type Message, type Tool } from 'cactus-react-native';

const tools: Tool[] = [
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
    const messages: Message[] = [
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
import { CactusLM, type Message } from 'cactus-react-native';

const cactusLM = new CactusLM({
  corpusDir: 'path/to/your/corpus', // Directory containing .txt files
});

const messages: Message[] = [
  { role: 'user', content: 'What information is in the documents?' },
];

const result = await cactusLM.complete({ messages });
console.log(result.response);
```

#### Hook

```tsx
import { useCactusLM, type Message } from 'cactus-react-native';

const App = () => {
  const cactusLM = useCactusLM({
    corpusDir: 'path/to/your/corpus', // Directory containing .txt files
  });

  const handleAsk = async () => {
    const messages: Message[] = [
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

### Hybrid Mode (Cloud Fallback)

The CactusLM supports a hybrid completion mode that falls back to a cloud-based LLM provider `OpenRouter` if local inference fails.

#### Class

```typescript
import { CactusLM, type Message } from 'cactus-react-native';

const cactusLM = new CactusLM();

const messages: Message[] = [
  { role: 'user', content: 'Hello, World!' }
];

// Falls back to remote if local fails
const result = await cactusLM.complete({
  messages,
  mode: 'hybrid'
});
```

#### Hook

```tsx
import { useCactusLM, type Message } from 'cactus-react-native';

const App = () => {
  const cactusLM = useCactusLM();

  const handleComplete = async () => {
    const messages: Message[] = [
      { role: 'user', content: 'Hello, World!' }
    ];

    // Falls back to remote if local fails
    await cactusLM.complete({
      messages,
      mode: 'hybrid'
    });
  };

  return (
    <>
      <Button title="Complete" onPress={handleComplete} />
      <Text>{cactusLM.completion}</Text>
    </>
  );
};
```

## Speech-to-Text (STT)

The `CactusSTT` class provides audio transcription and audio embedding capabilities using Whisper models.

### Transcription

Transcribe audio to text with streaming support. Accepts either a file path or raw PCM audio samples.

#### Class

```typescript
import { CactusSTT } from 'cactus-react-native';

const cactusSTT = new CactusSTT({ model: 'whisper-small' });

await cactusSTT.init();

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

Transcribe audio in real-time with incremental results.

#### Class

```typescript
import { CactusSTT } from 'cactus-react-native';

const cactusSTT = new CactusSTT({ model: 'whisper-small' });

await cactusSTT.streamTranscribeInit();

const audioChunk: number[] = [/* PCM samples */];
await cactusSTT.streamTranscribeInsert({ audio: audioChunk });

const result = await cactusSTT.streamTranscribeProcess({
  options: { confirmationThreshold: 0.95 }
});

console.log('Confirmed:', result.confirmed);
console.log('Pending:', result.pending);

const final = await cactusSTT.streamTranscribeFinalize();
await cactusSTT.streamTranscribeDestroy();
```

#### Hook

```tsx
import { useCactusSTT } from 'cactus-react-native';

const App = () => {
  const cactusSTT = useCactusSTT({ model: 'whisper-small' });

  const handleStream = async () => {
    await cactusSTT.streamTranscribeInit();

    const audioChunk: number[] = [/* PCM samples */];
    await cactusSTT.streamTranscribeInsert({ audio: audioChunk });

    await cactusSTT.streamTranscribeProcess();
  };

  return (
    <>
      <Button onPress={handleStream} title="Stream" />
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

await cactusSTT.init();

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
- `model` - Model slug or absolute path to Cactus model (default: `'qwen3-0.6'`).
- `contextSize` - Context window size (default: `2048`).
- `corpusDir` - Directory containing text files for RAG (default: `undefined`).

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
- `messages` - Array of `Message` objects.
- `options` - Generation options:
  - `temperature` - Sampling temperature (default: model-optimized).
  - `topP` - Nucleus sampling threshold (default: model-optimized).
  - `topK` - Top-K sampling limit (default: model-optimized).
  - `maxTokens` - Maximum number of tokens to generate (default: `512`).
  - `stopSequences` - Array of strings to stop generation (default: `undefined`).
  - `forceTools` - Force the model to call one of the provided tools (default: `false`).
- `tools` - Array of `Tool` objects for function calling (default: `undefined`).
- `onToken` - Callback for streaming tokens.
- `mode` - Completion mode: `'local'` | `'hybrid'` (default: `'local'`)

**`tokenize(params: CactusLMTokenizeParams): Promise<CactusLMTokenizeResult>`**

Converts text into tokens using the model's tokenizer.

**Parameters:**
- `text` - Text to tokenize.

**`scoreWindow(params: CactusLMScoreWindowParams): Promise<CactusLMScoreWindowResult>`**

Calculates perplexity scores for a window of tokens within a sequence.

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

Fetches available models from the database and checks their download status.

### useCactusLM Hook

The `useCactusLM` hook manages a `CactusLM` instance with reactive state. When model parameters (`model`, `contextSize`, or `corpusDir`) change, the hook creates a new instance and resets all state. The hook automatically cleans up resources when the component unmounts.

#### State

- `completion: string` - Current generated text. Automatically accumulated during streaming. Cleared before each new completion and when calling `reset()` or `destroy()`.
- `isGenerating: boolean` - Whether the model is currently generating (completion or embedding). Both operations share this flag.
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
- `scoreWindow(params: CactusLMScoreWindowParams): Promise<CactusLMScoreWindowResult>` - Calculates perplexity scores for a window of tokens. Sets `isGenerating` to `true` during operation.
- `embed(params: CactusLMEmbedParams): Promise<CactusLMEmbedResult>` - Generates embeddings for the given text. Sets `isGenerating` to `true` during operation.
- `imageEmbed(params: CactusLMImageEmbedParams): Promise<CactusLMImageEmbedResult>` - Generates embeddings for the given image. Sets `isGenerating` to `true` while generating.
- `stop(): Promise<void>` - Stops ongoing generation. Clears any errors.
- `reset(): Promise<void>` - Resets the model's internal state, clearing cached context. Also clears the `completion` state.
- `destroy(): Promise<void>` - Releases all resources associated with the model. Clears the `completion` state. Automatically called when the component unmounts.
- `getModels(): Promise<CactusModel[]>` - Fetches available models from the database and checks their download status.

### CactusSTT Class

#### Constructor

**`new CactusSTT(params?: CactusSTTParams)`**

**Parameters:**
- `model` - Model slug or absolute path to Cactus model (default: `'qwen3-0.6'`).
- `contextSize` - Context window size (default: `2048`).

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
- `audio` - Path to the audio file or raw PCM samples.
- `prompt` - Optional prompt to guide transcription (default: `'<|startoftranscript|><|en|><|transcribe|><|notimestamps|>'`).
- `options` - Transcription options:
  - `temperature` - Sampling temperature (default: model-optimized).
  - `topP` - Nucleus sampling threshold (default: model-optimized).
  - `topK` - Top-K sampling limit (default: model-optimized).
  - `maxTokens` - Maximum number of tokens to generate (default: `512`).
  - `stopSequences` - Array of strings to stop generation (default: `undefined`).
- `onToken` - Callback for streaming tokens.

**`audioEmbed(params: CactusSTTAudioEmbedParams): Promise<CactusSTTAudioEmbedResult>`**

Generates embeddings for the given audio file. Automatically calls `init()` if not already initialized. Throws an error if a generation is already in progress.

**Parameters:**
- `audioPath` - Path to the audio file.

**`streamTranscribeInit(): Promise<void>`**

Initializes a streaming transcription session. Automatically calls `init()` if not already initialized.

**`streamTranscribeInsert(params: CactusSTTStreamTranscribeInsertParams): Promise<void>`**

Inserts PCM audio samples into the streaming buffer.

**Parameters:**
- `audio` - Array of PCM audio samples.

**`streamTranscribeProcess(params?: CactusSTTStreamTranscribeProcessParams): Promise<CactusSTTStreamTranscribeProcessResult>`**

Processes accumulated audio and returns incremental transcription results.

**Parameters:**
- `options` - Processing options:
  - `confirmationThreshold` - Confidence threshold for confirming text.

**`streamTranscribeFinalize(): Promise<CactusSTTStreamTranscribeFinalizeResult>`**

Finalizes the streaming session and returns remaining transcription text.

**`streamTranscribeDestroy(): Promise<void>`**

Destroys the streaming session and releases resources.

**`stop(): Promise<void>`**

Stops ongoing transcription or embedding generation.

**`reset(): Promise<void>`**

Resets the model's internal state. Automatically calls `stop()` first.

**`destroy(): Promise<void>`**

Releases all resources associated with the model. Automatically calls `stop()` first. Safe to call even if the model is not initialized.

**`getModels(): Promise<CactusSTTModel[]>`**

Fetches available STT models from the database and checks their download status.

### useCactusSTT Hook

The `useCactusSTT` hook manages a `CactusSTT` instance with reactive state. When model parameters (`model`, `contextSize`) change, the hook creates a new instance and resets all state. The hook automatically cleans up resources when the component unmounts.

#### State

- `transcription: string` - Current transcription text. Automatically accumulated during streaming. Cleared before each new transcription and when calling `reset()` or `destroy()`.
- `streamTranscribeConfirmed: string` - Accumulated confirmed text from streaming transcription.
- `streamTranscribePending: string` - Current pending text from streaming transcription.
- `isGenerating: boolean` - Whether the model is currently generating (transcription or embedding). Both operations share this flag.
- `isStreamTranscribing: boolean` - Whether a streaming transcription session is active.
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
- `streamTranscribeInit(): Promise<void>` - Initializes a streaming transcription session. Sets `isStreamTranscribing` to `true`.
- `streamTranscribeInsert(params: CactusSTTStreamTranscribeInsertParams): Promise<void>` - Inserts audio chunks into the streaming buffer.
- `streamTranscribeProcess(params?: CactusSTTStreamTranscribeProcessParams): Promise<CactusSTTStreamTranscribeProcessResult>` - Processes audio and returns results. Automatically accumulates confirmed text in `streamTranscribeConfirmed` and updates `streamTranscribePending`.
- `streamTranscribeFinalize(): Promise<CactusSTTStreamTranscribeFinalizeResult>` - Finalizes streaming and returns remaining text.
- `streamTranscribeDestroy(): Promise<void>` - Destroys the streaming session. Sets `isStreamTranscribing` to `false`.
- `stop(): Promise<void>` - Stops ongoing generation. Clears any errors.
- `reset(): Promise<void>` - Resets the model's internal state. Also clears the `transcription` state.
- `destroy(): Promise<void>` - Releases all resources associated with the model. Clears the `transcription` state. Automatically called when the component unmounts.
- `getModels(): Promise<CactusSTTModel[]>` - Fetches available STT models from the database and checks their download status.

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

## Type Definitions

### CactusLMParams

```typescript
interface CactusLMParams {
  model?: string;
  contextSize?: number;
  corpusDir?: string;
}
```

### CactusLMDownloadParams

```typescript
interface CactusLMDownloadParams {
  onProgress?: (progress: number) => void;
}
```

### Message

```typescript
interface Message {
  role: 'user' | 'assistant' | 'system';
  content?: string;
  images?: string[];
}
```

### CompleteOptions

```typescript
interface CompleteOptions {
  temperature?: number;
  topP?: number;
  topK?: number;
  maxTokens?: number;
  stopSequences?: string[];
  forceTools?: boolean;
}
```

### Tool

```typescript
interface Tool {
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
  messages: Message[];
  options?: CompleteOptions;
  tools?: Tool[];
  onToken?: (token: string) => void;
  mode?: 'local' | 'hybrid';
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
  timeToFirstTokenMs: number;
  totalTimeMs: number;
  tokensPerSecond: number;
  prefillTokens: number;
  decodeTokens: number;
  totalTokens: number;
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
  name: string;
  slug: string;
  quantization: number;
  sizeMb: number;
  downloadUrl: string;
  supportsToolCalling: boolean;
  supportsVision: boolean;
  supportsCompletion: boolean;
  createdAt: Date;
  isDownloaded: boolean;
}
```

### CactusSTTModel

```typescript
interface CactusSTTModel {
  slug: string;
  sizeMb: number;
  downloadUrl: string;
  createdAt: Date;
  isDownloaded: boolean;
}
```

### CactusSTTParams

```typescript
interface CactusSTTParams {
  model?: string;
  contextSize?: number;
}
```

### CactusSTTDownloadParams

```typescript
interface CactusSTTDownloadParams {
  onProgress?: (progress: number) => void;
}

```

### TranscribeOptions

```ts
interface TranscribeOptions {
  temperature?: number;
  topP?: number;
  topK?: number;
  maxTokens?: number;
  stopSequences?: string[];
}
```

### CactusSTTTranscribeParams

```typescript
interface CactusSTTTranscribeParams {
  audio: string | number[];
  prompt?: string;
  options?: TranscribeOptions;
  onToken?: (token: string) => void;
}
```

### CactusSTTTranscribeResult

```typescript
interface CactusSTTTranscribeResult {
  success: boolean;
  response: string;
  timeToFirstTokenMs: number;
  totalTimeMs: number;
  tokensPerSecond: number;
  prefillTokens: number;
  decodeTokens: number;
  totalTokens: number;
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

### CactusSTTStreamTranscribeInsertParams

```typescript
interface CactusSTTStreamTranscribeInsertParams {
  audio: number[];
}
```

### StreamTranscribeProcessOptions

```typescript
interface StreamTranscribeProcessOptions {
  confirmationThreshold?: number;
}
```

### CactusSTTStreamTranscribeProcessParams

```typescript
interface CactusSTTStreamTranscribeProcessParams {
  options?: StreamTranscribeProcessOptions;
}
```

### CactusSTTStreamTranscribeProcessResult

```typescript
interface CactusSTTStreamTranscribeProcessResult {
  success: boolean;
  confirmed: string;
  pending: string;
}
```

### CactusSTTStreamTranscribeFinalizeResult

```typescript
interface CactusSTTStreamTranscribeFinalizeResult {
  success: boolean;
  confirmed: string;
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

### IndexQueryOptions

```typescript
interface IndexQueryOptions {
  topK?: number;
  scoreThreshold?: number;
}
```

### CactusIndexQueryParams

```typescript
interface CactusIndexQueryParams {
  embeddings: number[][];
  options?: IndexQueryOptions;
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

## Configuration

### Telemetry

Cactus offers powerful telemetry for all your projects. Create a token on the [Cactus dashboard](https://www.cactuscompute.com/dashboard).

```typescript
import { CactusConfig } from 'cactus-react-native';

// Enable Telemetry for your project
CactusConfig.telemetryToken = 'your-telemetry-token-here';

// Disable telemetry
CactusConfig.isTelemetryEnabled = false;
```

### Hybrid Mode

Enable cloud fallback.

```typescript
import { CactusConfig } from 'cactus-react-native';

// Set your Cactus token for hybrid mode
CactusConfig.cactusToken = 'your-cactus-token-here';
```

## Performance Tips

- **Model Selection** - Choose smaller models for faster inference on mobile devices.
- **Context Size** - Reduce the context size to lower memory usage.
- **Memory Management** - Always call `destroy()` when you're done with models to free up resources.

## Example App

Check out [our example app](/example) for a complete React Native implementation.
