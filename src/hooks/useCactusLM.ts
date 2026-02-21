import { useCallback, useEffect, useState, useRef } from 'react';
import { CactusLM } from '../classes/CactusLM';
import { CactusFileSystem } from '../native';
import { getErrorMessage } from '../utils/error';
import type {
  CactusLMParams,
  CactusLMCompleteParams,
  CactusLMCompleteResult,
  CactusLMTokenizeParams,
  CactusLMTokenizeResult,
  CactusLMScoreWindowParams,
  CactusLMScoreWindowResult,
  CactusLMEmbedParams,
  CactusLMEmbedResult,
  CactusLMImageEmbedParams,
  CactusLMImageEmbedResult,
  CactusLMDownloadParams,
} from '../types/CactusLM';
import type { CactusModel } from '../types/common';

export const useCactusLM = ({
  model = 'qwen3-0.6b',
  corpusDir = undefined,
  cacheIndex = false,
  options: modelOptions = {
    quantization: undefined,
    pro: false,
  },
}: CactusLMParams = {}) => {
  const [cactusLM, setCactusLM] = useState(
    () => new CactusLM({ model, corpusDir, cacheIndex, options: modelOptions })
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
    const newInstance = new CactusLM({
      model,
      corpusDir,
      cacheIndex,
      options: {
        quantization: modelOptions.quantization,
        pro: modelOptions.pro,
      },
    });
    setCactusLM(newInstance);

    setCompletion('');
    setIsGenerating(false);
    setIsInitializing(false);
    setIsDownloaded(false);
    setIsDownloading(false);
    setDownloadProgress(0);
    setError(null);

    let mounted = true;
    CactusFileSystem.modelExists(newInstance.getModelName())
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
  }, [
    model,
    corpusDir,
    cacheIndex,
    modelOptions.quantization,
    modelOptions.pro,
  ]);

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

  const tokenize = useCallback(
    async ({
      text,
    }: CactusLMTokenizeParams): Promise<CactusLMTokenizeResult> => {
      if (isGenerating) {
        const message = 'CactusLM is already generating';
        setError(message);
        throw new Error(message);
      }

      setError(null);
      setIsGenerating(true);
      try {
        return await cactusLM.tokenize({ text });
      } catch (e) {
        setError(getErrorMessage(e));
        throw e;
      } finally {
        setIsGenerating(false);
      }
    },
    [cactusLM, isGenerating]
  );

  const scoreWindow = useCallback(
    async ({
      tokens,
      start,
      end,
      context,
    }: CactusLMScoreWindowParams): Promise<CactusLMScoreWindowResult> => {
      if (isGenerating) {
        const message = 'CactusLM is already generating';
        setError(message);
        throw new Error(message);
      }

      setError(null);
      setIsGenerating(true);
      try {
        return await cactusLM.scoreWindow({ tokens, start, end, context });
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
    async ({
      text,
      normalize = false,
    }: CactusLMEmbedParams): Promise<CactusLMEmbedResult> => {
      if (isGenerating) {
        const message = 'CactusLM is already generating';
        setError(message);
        throw new Error(message);
      }

      setError(null);
      setIsGenerating(true);
      try {
        return await cactusLM.embed({ text, normalize });
      } catch (e) {
        setError(getErrorMessage(e));
        throw e;
      } finally {
        setIsGenerating(false);
      }
    },
    [cactusLM, isGenerating]
  );

  const imageEmbed = useCallback(
    async ({
      imagePath,
    }: CactusLMImageEmbedParams): Promise<CactusLMImageEmbedResult> => {
      if (isGenerating) {
        const message = 'CactusLM is already generating';
        setError(message);
        throw new Error(message);
      }

      setError(null);
      setIsGenerating(true);
      try {
        return await cactusLM.imageEmbed({ imagePath });
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

  const getModels = useCallback(async (): Promise<CactusModel[]> => {
    setError(null);
    try {
      return await cactusLM.getModels();
    } catch (e) {
      setError(getErrorMessage(e));
      throw e;
    }
  }, [cactusLM]);

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
    tokenize,
    scoreWindow,
    embed,
    imageEmbed,
    reset,
    stop,
    destroy,
    getModels,
  };
};
