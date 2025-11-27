import { CactusConfig } from '../config/CactusConfig';
import { CactusImage } from '../native/CactusImage';
import type {
  CactusLMCompleteResult,
  Message,
  Options,
  Tool,
} from '../types/CactusLM';

export class RemoteLM {
  private static readonly completionsUrl =
    'https://openrouter.ai/api/v1/chat/completions';

  private static readonly defaultModel = 'google/gemini-2.5-flash-lite';

  public static async complete(
    messages: Message[],
    options?: Options,
    tools?: { type: 'function'; function: Tool }[],
    callback?: (token: string) => void
  ): Promise<CactusLMCompleteResult> {
    if (!CactusConfig.cactusToken) {
      throw new Error('cactusToken is required for hybrid completions');
    }

    const payload = JSON.stringify({
      model: this.defaultModel,
      messages: await this.transformMessages(messages),
      tools,
      temperature: options?.temperature,
      top_p: options?.topP,
      top_k: options?.topK,
      max_tokens: options?.maxTokens,
      stop: options?.stopSequences,
      stream: !!callback,
    });

    return callback
      ? await this.streamXHR(payload, callback)
      : await this.nonStreamFetch(payload);
  }

  private static getMimeType(filePath: string): string {
    const extension = filePath.toLowerCase().split('.').pop();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';
      default:
        throw new Error(`Unsupported image format: .${extension}`);
    }
  }

  private static async transformMessages(messages: Message[]) {
    const transformedMessages = [];

    for (const message of messages) {
      const content: {
        type: string;
        text?: string;
        image_url?: { url: string };
      }[] = [];

      if (message.content) {
        content.push({
          type: 'text',
          text: message.content,
        });
      }

      if (message.images) {
        for (const image of message.images) {
          const imagePath = image.replace('file://', '');
          const mimeType = this.getMimeType(imagePath);
          const base64Data = await CactusImage.base64(imagePath);

          content.push({
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${base64Data}`,
            },
          });
        }
      }

      transformedMessages.push({ role: message.role, content });
    }

    return transformedMessages;
  }

  private static streamXHR(
    payload: string,
    callback: (token: string) => void
  ): Promise<CactusLMCompleteResult> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.timeout = 3 * 60 * 1000; // 3 minutes
      xhr.ontimeout = () =>
        reject(new Error('Remote streaming completion timed out'));

      xhr.open('POST', this.completionsUrl);
      xhr.setRequestHeader(
        'Authorization',
        `Bearer ${CactusConfig.cactusToken}`
      );
      xhr.setRequestHeader('HTTP-Referer', 'https://cactuscompute.com');
      xhr.setRequestHeader('X-Title', 'Cactus React Native SDK');
      xhr.setRequestHeader('Content-Type', 'application/json');

      const startTime = performance.now();
      let lastIndex = 0;
      let buffer = '';
      let response = '';
      let toolCalls: { name: string; arguments: string }[] | undefined;
      let timeToFirstTokenMs = 0;
      let prefillTokens = 0;
      let decodeTokens = 0;
      let totalTokens = 0;

      xhr.onprogress = () => {
        const chunk = xhr.responseText.substring(lastIndex);
        lastIndex = xhr.responseText.length;

        buffer += chunk;

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) {
            continue;
          }

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') {
            continue;
          }

          try {
            const data = JSON.parse(jsonStr);

            if (timeToFirstTokenMs === 0) {
              timeToFirstTokenMs = performance.now() - startTime;
            }

            const toolCallChunks = data?.choices?.[0]?.delta?.tool_calls;
            if (toolCallChunks) {
              if (!toolCalls) {
                toolCalls = [];
              }

              for (const toolCallChunk of toolCallChunks) {
                const index = toolCallChunk.index;

                if (!toolCalls[index]) {
                  toolCalls[index] = { name: '', arguments: '' };
                }

                if (toolCallChunk.function?.name) {
                  toolCalls[index].name = toolCallChunk.function.name;
                }

                if (toolCallChunk.function?.arguments) {
                  toolCalls[index].arguments +=
                    toolCallChunk.function.arguments;
                }
              }
            }

            const content = data?.choices?.[0]?.delta?.content;
            if (content) {
              response += content;
              callback(content);
            }

            if (data?.usage) {
              prefillTokens = data.usage.prompt_tokens;
              decodeTokens = data.usage.completion_tokens;
              totalTokens = data.usage.total_tokens;
            }
          } catch {}
        }
      };

      xhr.onload = () => {
        const totalTimeMs = performance.now() - startTime;
        const functionCalls = toolCalls?.map((toolCall) => ({
          name: toolCall.name,
          arguments: JSON.parse(toolCall.arguments) as { [key: string]: any },
        }));

        resolve({
          success: true,
          response,
          functionCalls,
          timeToFirstTokenMs,
          totalTimeMs,
          tokensPerSecond: (decodeTokens * 1000) / totalTimeMs,
          prefillTokens,
          decodeTokens,
          totalTokens,
        });
      };

      xhr.onerror = () =>
        reject(new Error('Remote streaming completion failed'));

      xhr.send(payload);
    });
  }

  private static async nonStreamFetch(
    payload: string
  ): Promise<CactusLMCompleteResult> {
    const startTime = performance.now();

    const request = await fetch(this.completionsUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CactusConfig.cactusToken}`,
        'HTTP-Referer': 'https://cactuscompute.com',
        'X-Title': 'Cactus React Native SDK',
        'Content-Type': 'application/json',
      },
      body: payload,
    });

    if (!request.ok) {
      throw new Error('Remote completion failed');
    }

    const data = await request.json();

    const totalTimeMs = performance.now() - startTime;
    const decodeTokens = data.usage.completion_tokens;

    const toolCalls:
      | {
          function: {
            name: string;
            arguments: {
              [key: string]: any;
            };
          };
        }[]
      | undefined = data.choices[0].message.tool_calls;

    const functionCalls = toolCalls?.map((toolCall) => ({
      name: toolCall.function.name,
      arguments: toolCall.function.arguments,
    }));

    return {
      success: true,
      response: data.choices[0].message.content,
      functionCalls,
      timeToFirstTokenMs: totalTimeMs,
      totalTimeMs,
      tokensPerSecond: (decodeTokens * 1000) / totalTimeMs,
      prefillTokens: data.usage.prompt_tokens,
      decodeTokens,
      totalTokens: data.usage.total_tokens,
    };
  }
}
