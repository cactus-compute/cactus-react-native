import { useCallback, useEffect, useState, useRef } from 'react';
import { CactusSTT } from '../classes/CactusSTT';
import { CactusFileSystem } from '../native';
import { getErrorMessage } from '../utils/error';
import type {
  CactusSTTParams,
  CactusSTTTranscribeResult,
  CactusSTTTranscribeParams,
  CactusSTTDownloadParams,
  CactusSTTAudioEmbedParams,
  CactusSTTAudioEmbedResult,
  CactusSTTStreamTranscribeInsertParams,
  CactusSTTStreamTranscribeProcessParams,
  CactusSTTStreamTranscribeProcessResult,
  CactusSTTStreamTranscribeFinalizeResult,
} from '../types/CactusSTT';
import type { CactusModel } from '../types/common';

export const useCactusSTT = ({
  model = 'whisper-small',
  contextSize = 2048,
  options = {
    quantization: 'int4',
    pro: false,
  },
}: CactusSTTParams = {}) => {
  const [cactusSTT, setCactusSTT] = useState(
    () => new CactusSTT({ model, contextSize, options })
  );

  // State
  const [transcription, setTranscription] = useState('');
  const [streamTranscribeConfirmed, setStreamTranscribeConfirmed] =
    useState('');
  const [streamTranscribePending, setStreamTranscribePending] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isStreamTranscribing, setIsStreamTranscribing] = useState(false);
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
    setCactusSTT(
      new CactusSTT({
        model,
        contextSize,
        options: {
          quantization: options.quantization,
          pro: options.pro,
        },
      })
    );

    setTranscription('');
    setStreamTranscribeConfirmed('');
    setStreamTranscribePending('');
    setIsGenerating(false);
    setIsStreamTranscribing(false);
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
  }, [model, contextSize, options.quantization, options.pro]);

  useEffect(() => {
    return () => {
      cactusSTT.destroy().catch(() => {});
    };
  }, [cactusSTT]);

  const download = useCallback(
    async ({ onProgress }: CactusSTTDownloadParams = {}) => {
      if (isDownloading) {
        const message = 'CactusSTT is already downloading';
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
        await cactusSTT.download({
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
    [cactusSTT, isDownloading, isDownloaded]
  );

  const init = useCallback(async () => {
    if (isInitializing) {
      const message = 'CactusSTT is already initializing';
      setError(message);
      throw new Error(message);
    }

    setError(null);
    setIsInitializing(true);
    try {
      await cactusSTT.init();
    } catch (e) {
      setError(getErrorMessage(e));
      throw e;
    } finally {
      setIsInitializing(false);
    }
  }, [cactusSTT, isInitializing]);

  const transcribe = useCallback(
    async ({
      audio,
      prompt,
      options,
      onToken,
    }: CactusSTTTranscribeParams): Promise<CactusSTTTranscribeResult> => {
      if (isGenerating) {
        const message = 'CactusSTT is already generating';
        setError(message);
        throw new Error(message);
      }

      setError(null);
      setTranscription('');
      setIsGenerating(true);
      try {
        return await cactusSTT.transcribe({
          audio,
          prompt,
          options,
          onToken: (token) => {
            setTranscription((prev) => prev + token);
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
    [cactusSTT, isGenerating]
  );

  const audioEmbed = useCallback(
    async ({
      audioPath,
    }: CactusSTTAudioEmbedParams): Promise<CactusSTTAudioEmbedResult> => {
      if (isGenerating) {
        const message = 'CactusSTT is already generating';
        setError(message);
        throw new Error(message);
      }

      setError(null);
      setIsGenerating(true);
      try {
        return await cactusSTT.audioEmbed({ audioPath });
      } catch (e) {
        setError(getErrorMessage(e));
        throw e;
      } finally {
        setIsGenerating(false);
      }
    },
    [cactusSTT, isGenerating]
  );

  const streamTranscribeInit = useCallback(async () => {
    if (isStreamTranscribing) {
      return;
    }

    setError(null);
    setStreamTranscribeConfirmed('');
    setStreamTranscribePending('');
    setIsStreamTranscribing(true);
    try {
      await cactusSTT.streamTranscribeInit();
    } catch (e) {
      setError(getErrorMessage(e));
      setIsStreamTranscribing(false);
      throw e;
    }
  }, [cactusSTT, isStreamTranscribing]);

  const streamTranscribeInsert = useCallback(
    async ({ audio }: CactusSTTStreamTranscribeInsertParams): Promise<void> => {
      setError(null);
      try {
        await cactusSTT.streamTranscribeInsert({ audio });
      } catch (e) {
        setError(getErrorMessage(e));
        throw e;
      }
    },
    [cactusSTT]
  );

  const streamTranscribeProcess = useCallback(
    async ({
      options,
    }: CactusSTTStreamTranscribeProcessParams = {}): Promise<CactusSTTStreamTranscribeProcessResult> => {
      setError(null);
      try {
        const result = await cactusSTT.streamTranscribeProcess({ options });
        setStreamTranscribeConfirmed((prev) => prev + result.confirmed);
        setStreamTranscribePending(result.pending);
        return result;
      } catch (e) {
        setError(getErrorMessage(e));
        throw e;
      }
    },
    [cactusSTT]
  );

  const streamTranscribeFinalize =
    useCallback(async (): Promise<CactusSTTStreamTranscribeFinalizeResult> => {
      setError(null);
      try {
        const result = await cactusSTT.streamTranscribeFinalize();
        setStreamTranscribeConfirmed((prev) => prev + result.confirmed);
        setStreamTranscribePending('');
        setIsStreamTranscribing(false);
        return result;
      } catch (e) {
        setError(getErrorMessage(e));
        throw e;
      }
    }, [cactusSTT]);

  const streamTranscribeDestroy = useCallback(async (): Promise<void> => {
    setError(null);
    try {
      await cactusSTT.streamTranscribeDestroy();
    } catch (e) {
      setError(getErrorMessage(e));
      throw e;
    } finally {
      setIsStreamTranscribing(false);
      setStreamTranscribePending('');
    }
  }, [cactusSTT]);

  const stop = useCallback(async () => {
    setError(null);
    try {
      await cactusSTT.stop();
    } catch (e) {
      setError(getErrorMessage(e));
      throw e;
    }
  }, [cactusSTT]);

  const reset = useCallback(async () => {
    setError(null);
    try {
      await cactusSTT.reset();
    } catch (e) {
      setError(getErrorMessage(e));
      throw e;
    } finally {
      setTranscription('');
    }
  }, [cactusSTT]);

  const destroy = useCallback(async () => {
    setError(null);
    try {
      await cactusSTT.destroy();
    } catch (e) {
      setError(getErrorMessage(e));
      throw e;
    } finally {
      setTranscription('');
      setStreamTranscribeConfirmed('');
      setStreamTranscribePending('');
      setIsStreamTranscribing(false);
    }
  }, [cactusSTT]);

  const getModels = useCallback(async (): Promise<CactusModel[]> => {
    setError(null);
    try {
      return await cactusSTT.getModels();
    } catch (e) {
      setError(getErrorMessage(e));
      throw e;
    }
  }, [cactusSTT]);

  return {
    transcription,
    streamTranscribeConfirmed,
    streamTranscribePending,
    isGenerating,
    isStreamTranscribing,
    isInitializing,
    isDownloaded,
    isDownloading,
    downloadProgress,
    error,

    download,
    init,
    transcribe,
    audioEmbed,
    streamTranscribeInit,
    streamTranscribeInsert,
    streamTranscribeProcess,
    streamTranscribeFinalize,
    streamTranscribeDestroy,
    reset,
    stop,
    destroy,
    getModels,
  };
};
