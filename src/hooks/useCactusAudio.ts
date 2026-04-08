import { useCallback, useEffect, useState, useRef } from 'react';
import { CactusAudio } from '../classes/CactusAudio';
import { CactusFileSystem } from '../native';
import { getErrorMessage } from '../utils/error';
import type {
  CactusAudioParams,
  CactusAudioDownloadParams,
  CactusAudioVADParams,
  CactusAudioVADResult,
  CactusAudioDiarizeParams,
  CactusAudioDiarizeResult,
  CactusAudioEmbedSpeakerParams,
  CactusAudioEmbedSpeakerResult,
} from '../types/CactusAudio';
import type { CactusModel } from '../types/common';

export const useCactusAudio = ({
  model = 'silero-vad',
  options: modelOptions = {
    quantization: undefined,
    pro: false,
  },
}: CactusAudioParams = {}) => {
  const [cactusAudio, setCactusAudio] = useState(
    () => new CactusAudio({ model, options: modelOptions })
  );

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
    const newInstance = new CactusAudio({
      model,
      options: {
        quantization: modelOptions.quantization,
        pro: modelOptions.pro,
      },
    });
    setCactusAudio(newInstance);

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
      cactusAudio.destroy().catch(() => {});
    };
  }, [cactusAudio]);

  const download = useCallback(
    async ({ onProgress }: CactusAudioDownloadParams = {}) => {
      if (isDownloading) {
        const message = 'CactusAudio is already downloading';
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
        await cactusAudio.download({
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
    [cactusAudio, isDownloading, isDownloaded]
  );

  const init = useCallback(async () => {
    if (isInitializing) {
      const message = 'CactusAudio is already initializing';
      setError(message);
      throw new Error(message);
    }

    setError(null);
    setIsInitializing(true);
    try {
      await cactusAudio.init();
    } catch (e) {
      setError(getErrorMessage(e));
      throw e;
    } finally {
      setIsInitializing(false);
    }
  }, [cactusAudio, isInitializing]);

  const vad = useCallback(
    async ({
      audio,
      options,
    }: CactusAudioVADParams): Promise<CactusAudioVADResult> => {
      setError(null);
      try {
        return await cactusAudio.vad({ audio, options });
      } catch (e) {
        setError(getErrorMessage(e));
        throw e;
      }
    },
    [cactusAudio]
  );

  const diarize = useCallback(
    async ({
      audio,
      options,
    }: CactusAudioDiarizeParams): Promise<CactusAudioDiarizeResult> => {
      setError(null);
      try {
        return await cactusAudio.diarize({ audio, options });
      } catch (e) {
        setError(getErrorMessage(e));
        throw e;
      }
    },
    [cactusAudio]
  );

  const embedSpeaker = useCallback(
    async ({
      audio,
    }: CactusAudioEmbedSpeakerParams): Promise<CactusAudioEmbedSpeakerResult> => {
      setError(null);
      try {
        return await cactusAudio.embedSpeaker({ audio });
      } catch (e) {
        setError(getErrorMessage(e));
        throw e;
      }
    },
    [cactusAudio]
  );

  const destroy = useCallback(async () => {
    setError(null);
    try {
      await cactusAudio.destroy();
    } catch (e) {
      setError(getErrorMessage(e));
      throw e;
    }
  }, [cactusAudio]);

  const getModels = useCallback(async (): Promise<CactusModel[]> => {
    setError(null);
    try {
      return await cactusAudio.getModels();
    } catch (e) {
      setError(getErrorMessage(e));
      throw e;
    }
  }, [cactusAudio]);

  return {
    isInitializing,
    isDownloaded,
    isDownloading,
    downloadProgress,
    error,

    download,
    init,
    vad,
    diarize,
    embedSpeaker,
    destroy,
    getModels,
  };
};
