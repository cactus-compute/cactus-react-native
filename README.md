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

Transcribe audio files to text with streaming support.

#### Class

```typescript
import { CactusSTT } from 'cactus-react-native';

const cactusSTT = new CactusSTT({ model: 'whisper-small' });

await cactusSTT.init();

const result = await cactusSTT.transcribe({
  audioFilePath: 'path/to/audio.wav',
  onToken: (token) => console.log('Token:', token)
});

console.log('Transcription:', result.response);
```

#### Hook

```tsx
import { useCactusSTT } from 'cactus-react-native';

const App = () => {
  const cactusSTT = useCactusSTT({ model: 'whisper-small' });

  const handleTranscribe = async () => {
    const result = await cactusSTT.transcribe({
      audioFilePath: 'path/to/audio.wav',
    });
    console.log('Transcription:', result.response);
  };

  return (
    <>
      <Button onPress={handleTranscribe} title="Transcribe" />
      <Text>{cactusSTT.transcription}</Text>
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

## API Reference

### CactusLM Class

#### Constructor

**`new CactusLM(params?: CactusLMParams)`**

**Parameters:**
- `model` - Model slug (default: `'qwen3-0.6'`).
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
- `tools` - Array of `Tool` objects for function calling (default: `undefined`).
- `onToken` - Callback for streaming tokens.
- `mode` - Completion mode: `'local'` | `'hybrid'` (default: `'local'`)

**`embed(params: CactusLMEmbedParams): Promise<CactusLMEmbedResult>`**

Generates embeddings for the given text. Automatically calls `init()` if not already initialized. Throws an error if a generation (completion or embedding) is already in progress.

**Parameters:**
- `text` - Text to embed.

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
- `model` - Model slug (default: `'whisper-small'`).
- `contextSize` - Context window size (default: `2048`).

#### Methods

**`download(params?: CactusSTTDownloadParams): Promise<void>`**

Downloads the model. If the model is already downloaded, returns immediately with progress `1`. Throws an error if a download is already in progress.

**Parameters:**
- `onProgress` - Callback for download progress (0-1).

**`init(): Promise<void>`**

Initializes the model and prepares it for inference. Safe to call multiple times (idempotent). Throws an error if the model is not downloaded yet.

**`transcribe(params: CactusSTTTranscribeParams): Promise<CactusSTTTranscribeResult>`**

Transcribes audio to text with optional streaming support. Automatically calls `init()` if not already initialized. Throws an error if a generation is already in progress.

**Parameters:**
- `audioFilePath` - Path to the audio file.
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
- `isGenerating: boolean` - Whether the model is currently generating (transcription or embedding). Both operations share this flag.
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
- `stop(): Promise<void>` - Stops ongoing generation. Clears any errors.
- `reset(): Promise<void>` - Resets the model's internal state. Also clears the `transcription` state.
- `destroy(): Promise<void>` - Releases all resources associated with the model. Clears the `transcription` state. Automatically called when the component unmounts.
- `getModels(): Promise<CactusSTTModel[]>` - Fetches available STT models from the database and checks their download status.

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

### CactusLMEmbedParams

```typescript
interface CactusLMEmbedParams {
  text: string;
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
  audioFilePath: string;
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
