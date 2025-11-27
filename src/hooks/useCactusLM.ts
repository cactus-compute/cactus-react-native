import { useCallback, useEffect, useState, useRef } from 'react';
import { CactusLM } from '../classes/CactusLM';
import { CactusFileSystem } from '../native';
import { getErrorMessage } from '../utils/error';
import type {
  CactusLMParams,
  CactusLMCompleteResult,
  CactusLMEmbedParams,
  CactusLMEmbedResult,
  CactusLMGetModelsParams,
  CactusLMCompleteParams,
  CactusLMDownloadParams,
} from '../types/CactusLM';
import type { CactusModel } from '../types/CactusModel';

export const useCactusLM = ({
  model = 'qwen3-0.6',
  contextSize = 2048,
  corpusDir = undefined,
}: CactusLMParams = {}) => {
  const [cactusLM, setCactusLM] = useState(
    () => new CactusLM({ model, contextSize, corpusDir })
  );

  // State
  const [completion, setCompletion] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const currentModelRef = useRef(model);
  const currentDownloadIdRef = useRef(0);

  useEffect(() => {
    currentModelRef.current = model;
  }, [model]);

  useEffect(() => {
    setCactusLM(new CactusLM({ model, contextSize, corpusDir }));

    setCompletion('');
    setIsGenerating(false);
    setIsInitializing(false);
    setIsDownloaded(false);
    setIsDownloading(false);
    setDownloadProgress(0);
    setError(null);

    let mounted = true;
    CactusFileSystem.modelExists(model)
      .then((exists) => {
        if (!mounted) {
          return;
        }
        setIsDownloaded(exists);
      })
      .catch((e) => {
        if (!mounted) {
          return;
        }
        setIsDownloaded(false);
        setError(getErrorMessage(e));
      });

    return () => {
      mounted = false;
    };
  }, [model, contextSize, corpusDir]);

  useEffect(() => {
    return () => {
      cactusLM.destroy().catch(() => {});
    };
  }, [cactusLM]);

  const download = useCallback(
    async ({ onProgress }: CactusLMDownloadParams = {}) => {
      if (isDownloading) {
        const message = 'CactusLM is already downloading';
        setError(message);
        throw new Error(message);
      }

      setError(null);

      if (isDownloaded) {
        return;
      }

      const thisModel = currentModelRef.current;
      const thisDownloadId = ++currentDownloadIdRef.current;

      setDownloadProgress(0);
      setIsDownloading(true);
      try {
        await cactusLM.download({
          onProgress: (progress) => {
            if (
              currentModelRef.current !== thisModel ||
              currentDownloadIdRef.current !== thisDownloadId
            ) {
              return;
            }

            setDownloadProgress(progress);
            onProgress?.(progress);
          },
        });

        if (
          currentModelRef.current !== thisModel ||
          currentDownloadIdRef.current !== thisDownloadId
        ) {
          return;
        }

        setIsDownloaded(true);
      } catch (e) {
        if (
          currentModelRef.current !== thisModel ||
          currentDownloadIdRef.current !== thisDownloadId
        ) {
          return;
        }

        setError(getErrorMessage(e));
        throw e;
      } finally {
        if (
          currentModelRef.current !== thisModel ||
          currentDownloadIdRef.current !== thisDownloadId
        ) {
          return;
        }

        setIsDownloading(false);
        setDownloadProgress(0);
      }
    },
    [cactusLM, isDownloading, isDownloaded]
  );

  const init = useCallback(async () => {
    if (isInitializing) {
      const message = 'CactusLM is already initializing';
      setError(message);
      throw new Error(message);
    }

    setError(null);
    setIsInitializing(true);
    try {
      await cactusLM.init();
    } catch (e) {
      setError(getErrorMessage(e));
      throw e;
    } finally {
      setIsInitializing(false);
    }
  }, [cactusLM, isInitializing]);

  const complete = useCallback(
    async ({
      messages,
      options,
      tools,
      onToken,
      mode,
    }: CactusLMCompleteParams): Promise<CactusLMCompleteResult> => {
      if (isGenerating) {
        const message = 'CactusLM is already generating';
        setError(message);
        throw new Error(message);
      }

      setError(null);
      setCompletion('');
      setIsGenerating(true);
      try {
        return await cactusLM.complete({
          messages,
          options,
          tools,
          onToken: (token) => {
            setCompletion((prev) => prev + token);
            onToken?.(token);
          },
          mode,
        });
      } catch (e) {
        setError(getErrorMessage(e));
        throw e;
      } finally {
        setIsGenerating(false);
      }
    },
    [cactusLM, isGenerating]
  );

  const embed = useCallback(
    async ({ text }: CactusLMEmbedParams): Promise<CactusLMEmbedResult> => {
      if (isGenerating) {
        const message = 'CactusLM is already generating';
        setError(message);
        throw new Error(message);
      }

      setError(null);
      setIsGenerating(true);
      try {
        return await cactusLM.embed({ text });
      } catch (e) {
        setError(getErrorMessage(e));
        throw e;
      } finally {
        setIsGenerating(false);
      }
    },
    [cactusLM, isGenerating]
  );

  const stop = useCallback(async () => {
    setError(null);
    try {
      await cactusLM.stop();
    } catch (e) {
      setError(getErrorMessage(e));
      throw e;
    }
  }, [cactusLM]);

  const reset = useCallback(async () => {
    setError(null);
    try {
      await cactusLM.reset();
    } catch (e) {
      setError(getErrorMessage(e));
      throw e;
    } finally {
      setCompletion('');
    }
  }, [cactusLM]);

  const destroy = useCallback(async () => {
    setError(null);
    try {
      await cactusLM.destroy();
    } catch (e) {
      setError(getErrorMessage(e));
      throw e;
    } finally {
      setCompletion('');
    }
  }, [cactusLM]);

  const getModels = useCallback(
    async ({ forceRefresh }: CactusLMGetModelsParams = {}): Promise<
      CactusModel[]
    > => {
      setError(null);
      try {
        return await cactusLM.getModels({ forceRefresh });
      } catch (e) {
        setError(getErrorMessage(e));
        throw e;
      }
    },
    [cactusLM]
  );

  return {
    completion,
    isGenerating,
    isInitializing,
    isDownloaded,
    isDownloading,
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
