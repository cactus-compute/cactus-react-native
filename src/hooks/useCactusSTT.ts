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
  CactusSTTStreamTranscribeStartOptions,
  CactusSTTStreamTranscribeProcessParams,
  CactusSTTStreamTranscribeProcessResult,
  CactusSTTStreamTranscribeStopResult,
} from '../types/CactusSTT';
import type { CactusModel } from '../types/common';

export const useCactusSTT = ({
  model = 'whisper-small',
  options: modelOptions = {
    quantization: undefined,
    pro: false,
  },
}: CactusSTTParams = {}) => {
  const [cactusSTT, setCactusSTT] = useState(
    () => new CactusSTT({ model, options: modelOptions })
  );

  // State
  const [transcription, setTranscription] = useState('');
  const [streamTranscription, setStreamTranscription] = useState('');
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
    const newInstance = new CactusSTT({
      model,
      options: {
        quantization: modelOptions.quantization,
        pro: modelOptions.pro,
      },
    });
    setCactusSTT(newInstance);

    setTranscription('');
    setStreamTranscription('');
    setIsGenerating(false);
    setIsStreamTranscribing(false);
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
  }, [model, modelOptions.quantization, modelOptions.pro]);

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

  const streamTranscribeStart = useCallback(
    async (options?: CactusSTTStreamTranscribeStartOptions) => {
      if (isStreamTranscribing) {
        return;
      }

      setError(null);
      setStreamTranscription('');
      setIsStreamTranscribing(true);
      try {
        await cactusSTT.streamTranscribeStart(options);
      } catch (e) {
        setError(getErrorMessage(e));
        setIsStreamTranscribing(false);
        throw e;
      }
    },
    [cactusSTT, isStreamTranscribing]
  );

  const streamTranscribeProcess = useCallback(
    async ({
      audio,
    }: CactusSTTStreamTranscribeProcessParams): Promise<CactusSTTStreamTranscribeProcessResult> => {
      setError(null);
      try {
        const result = await cactusSTT.streamTranscribeProcess({ audio });
        setStreamTranscription(result.confirmed);
        return result;
      } catch (e) {
        setError(getErrorMessage(e));
        throw e;
      }
    },
    [cactusSTT]
  );

  const streamTranscribeStop =
    useCallback(async (): Promise<CactusSTTStreamTranscribeStopResult> => {
      setError(null);
      try {
        const result = await cactusSTT.streamTranscribeStop();
        setStreamTranscription(result.confirmed);
        setIsStreamTranscribing(false);
        return result;
      } catch (e) {
        setError(getErrorMessage(e));
        throw e;
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
      setStreamTranscription('');
      setIsStreamTranscribing(false);
    }
  }, [cactusSTT]);

  const getModels = useCallback(async (): Promise<CactusModel[]> => {
    setError(null);
    try {
      return cactusSTT.getModels();
    } catch (e) {
      setError(getErrorMessage(e));
      throw e;
    }
  }, [cactusSTT]);

  return {
    transcription,
    streamTranscription,
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
    streamTranscribeStart,
    streamTranscribeProcess,
    streamTranscribeStop,
    reset,
    stop,
    destroy,
    getModels,
  };
};
