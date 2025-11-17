# Cactus React Native

![Cactus Logo](assets/logo.png)

## Resources

[![cactus](https://img.shields.io/badge/cactus-000000?logo=github&logoColor=white)](https://github.com/cactus-compute/cactus) [![HuggingFace](https://img.shields.io/badge/HuggingFace-FFD21E?logo=huggingface&logoColor=black)](https://huggingface.co/Cactus-Compute/models?sort=downloads) [![Discord](https://img.shields.io/badge/Discord-5865F2?logo=discord&logoColor=white)](https://discord.gg/bNurx3AXTJ) [![Documentation](https://img.shields.io/badge/Documentation-4285F4?logo=googledocs&logoColor=white)](https://cactuscompute.com/docs/react-native)

## Installation

```bash
npm install cactus-react-native react-native-nitro-modules
```

## Language Models

### Class

```typescript
import { CactusLM, type Message } from "cactus-react-native";

const cactusLM = new CactusLM();
const messages: Message[] = [{ role: "user", content: "Hello, World!" }];

const result = await cactusLM.complete({ messages });
```

### Hook

```tsx
import { useCactusLM, type Message } from "cactus-react-native";

const App = () => {
  const cactusLM = useCactusLM();

  const handleComplete = async () => {
    const messages: Message[] = [{ role: "user", content: "Hello, World!" }];
    const result = await cactusLM.complete({ messages });
  };

  return (
    <Text>{cactusLM.completion}</Text>
  );
};
```

## API Reference

### CactusLM Class

#### Constructor

**`new CactusLM(params?: CactusLMParams)`**
- `model` - Model slug (default: "qwen3-0.6")
- `contextSize` - Context window size (default: 2048)

#### Methods

**`download(params?: CactusLMDownloadParams): Promise<void>`**
- Downloads the model from the server
- `onProgress` - Callback for download progress (0-1)

**`init(): Promise<void>`**
- Initializes the model for inference

**`complete(params: CactusLMCompleteParams): Promise<CactusLMCompleteResult>`**
- Generates text completion (initializes if needed)
- `messages` - Array of Message objects
- `options` - Generation options:
  - `temperature` - Sampling temperature (default: model-optimized)
  - `topP` - Nucleus sampling threshold (default: model-optimized)
  - `topK` - Top-K sampling limit (default: model-optimized)
  - `maxTokens` - Maximum tokens to generate (default: 512)
  - `stopSequences` - Array of strings to stop generation (default: undefined)
- `tools` - Array of Tool objects for function calling (default: undefined)
- `onToken` - Callback for streaming tokens

**`embed(params: CactusLMEmbedParams): Promise<CactusLMEmbedResult>`**
- Generates text embeddings (initializes if needed)
- `text` - Text to embed

**`stop(): Promise<void>`**
- Stops ongoing generation

**`reset(): Promise<void>`**
- Resets the model state

**`destroy(): Promise<void>`**
- Frees resources

**`getModels(params?: CactusLMGetModelsParams): Promise<CactusModel[]>`**
- Fetches available models and persists the results locally
- `forceRefresh` - Forces a fetch from the server and updates the local data (default: false)

### useCactusLM Hook

#### Return Values

**State:**
- `completion: string` - Current generated text
- `isGenerating: boolean` - Whether actively generating
- `isInitializing: boolean` - Whether model is initializing
- `isDownloaded: boolean` - Whether model is downloaded locally
- `isDownloading: boolean` - Whether model is downloading
- `downloadProgress: number` - Download progress (0-1)
- `error: string | null` - Last error message or null

**Methods:**
- `download(params?: CactusLMDownloadParams): Promise<void>`
- `init(): Promise<void>`
- `complete(params: CactusLMCompleteParams): Promise<CactusLMCompleteResult>`
- `embed(params: CactusLMEmbedParams): Promise<CactusLMEmbedResult>`
- `stop(): Promise<void>`
- `reset(): Promise<void>`
- `destroy(): Promise<void>`
- `getModels(params?: CactusLMGetModelsParams): Promise<CactusModel[]>`

## Type Definitions

### CactusLMParams
```typescript
interface CactusLMParams {
  model?: string;
  contextSize?: number;
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
  content: string;
}
```

### Options
```typescript
interface Options {
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
  type: 'function';
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
  options?: Options;
  tools?: Tool[];
  onToken?: (token: string) => void;
}
```

### CactusLMCompleteResult
```typescript
interface CactusLMCompleteResult {
  success: boolean;
  response: string;
  functionCalls?: { name: string; arguments: { [key: string]: any } }[];
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

### CactusLMGetModelsParams
```typescript
interface CactusLMGetModelsParams {
  forceRefresh?: boolean;
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
  createdAt: Date;
  isDownloaded: boolean;
}
```

## Configuration

### Telemetry

Cactus comes with powerful built-in telemetry that lets you monitor your projects. Create a token on the [Cactus dashboard](https://www.cactuscompute.com/dashboard) and get started with a one-line setup in your app

```typescript
import { CactusConfig } from "cactus-react-native";

CactusConfig.telemetryToken = "your-token-here";

// Disable telemetry
CactusConfig.isTelemetryEnabled = false;
```