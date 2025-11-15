import { useCallback, useEffect, useRef, useState } from 'react';
import { CactusLM } from '../classes/CactusLM';
import type {
  CactusCompletionParams,
  CactusCompletionResult,
  CactusDownloadParams,
  CactusEmbeddingParams,
  CactusEmbeddingResult,
  CactusInitParams,
} from '../types/CactusLM';
import { getErrorMessage } from '../utils/error';

export const useCactusLM = () => {
  const cactusLMRef = useRef(new CactusLM());

  // State
  const [completion, setCompletion] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cactusLM = cactusLMRef.current;

    return () => {
      (async () => {
        await cactusLM.stop();
        await cactusLM.destroy();
      })();
    };
  }, []);

  const download = useCallback(
    async ({ model, onProgress }: CactusDownloadParams = {}) => {
      setError(null);

      try {
        await cactusLMRef.current.download({
          model,
          onProgress: (progress) => {
            setDownloadProgress(progress);
            onProgress?.(progress);
          },
        });
      } catch (e) {
        setError(getErrorMessage(e));
        throw e;
      }
    },
    []
  );

  const init = useCallback(
    async ({ model, contextSize }: CactusInitParams = {}) => {
      setError(null);

      setIsInitialized(false);
      try {
        await cactusLMRef.current.init({ model, contextSize });
        setIsInitialized(true);
      } catch (e) {
        setError(getErrorMessage(e));
        throw e;
      }
    },
    []
  );

  const complete = useCallback(
    async ({
      messages,
      options,
      onToken,
      model,
      contextSize,
    }: CactusCompletionParams): Promise<CactusCompletionResult> => {
      if (isGenerating) {
        const message = 'CactusLM is already generating';
        setError(message);
        throw new Error(message);
      }

      setError(null);

      await init({ model, contextSize });

      setCompletion('');
      setIsGenerating(true);
      try {
        return await cactusLMRef.current.complete({
          messages,
          options,
          onToken: (token) => {
            setCompletion((prev) => prev + token);
            onToken?.(token);
          },
          model,
          contextSize,
        });
      } catch (e) {
        setError(getErrorMessage(e));
        throw e;
      } finally {
        setIsGenerating(false);
      }
    },
    [init, isGenerating]
  );

  const embed = useCallback(
    async ({
      text,
      model,
    }: CactusEmbeddingParams): Promise<CactusEmbeddingResult> => {
      if (isGenerating) {
        const message = 'CactusLM is already generating';
        setError(message);
        throw new Error(message);
      }

      setError(null);

      await init({ model });

      setIsGenerating(true);
      try {
        return await cactusLMRef.current.embed({ text, model });
      } catch (e) {
        setError(getErrorMessage(e));
        throw e;
      } finally {
        setIsGenerating(false);
      }
    },
    [init, isGenerating]
  );

  const stop = useCallback(async () => {
    setError(null);

    try {
      await cactusLMRef.current.stop();
      setIsGenerating(false);
    } catch (e) {
      setError(getErrorMessage(e));
      throw e;
    }
  }, []);

  const reset = useCallback(async () => {
    setError(null);

    await stop();

    try {
      await cactusLMRef.current.reset();
    } catch (e) {
      setError(getErrorMessage(e));
      throw e;
    }
  }, [stop]);

  const destroy = useCallback(async () => {
    setError(null);

    await stop();

    try {
      await cactusLMRef.current.destroy();
      setIsInitialized(false);
    } catch (e) {
      setError(getErrorMessage(e));
      throw e;
    }
  }, [stop]);

  const getModels = useCallback(async () => {
    setError(null);

    try {
      return await cactusLMRef.current.getModels();
    } catch (e) {
      setError(getErrorMessage(e));
      throw e;
    }
  }, []);

  return {
    completion,
    isGenerating,
    isInitialized,
    downloadProgress,
    error,
    download,
    init,
    complete,
    embed,
    reset,
    stop,
    destroy,
    getModels,
  };
};
