import { useCallback, useEffect, useState, useRef } from 'react';
import { CactusVAD } from '../classes/CactusVAD';
import { CactusFileSystem } from '../native';
import { getErrorMessage } from '../utils/error';
import type {
  CactusVADParams,
  CactusVADDownloadParams,
  CactusVADVadParams,
  CactusVADResult,
} from '../types/CactusVAD';
import type { CactusModel } from '../types/common';

export const useCactusVAD = ({
  model = 'silero-vad',
  options: modelOptions = {
    quantization: undefined,
    pro: false,
  },
}: CactusVADParams = {}) => {
  const [cactusVAD, setCactusVAD] = useState(
    () => new CactusVAD({ model, options: modelOptions })
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
    const newInstance = new CactusVAD({
      model,
      options: {
        quantization: modelOptions.quantization,
        pro: modelOptions.pro,
      },
    });
    setCactusVAD(newInstance);

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
      cactusVAD.destroy().catch(() => {});
    };
  }, [cactusVAD]);

  const download = useCallback(
    async ({ onProgress }: CactusVADDownloadParams = {}) => {
      if (isDownloading) {
        const message = 'CactusVAD is already downloading';
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
        await cactusVAD.download({
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
    [cactusVAD, isDownloading, isDownloaded]
  );

  const init = useCallback(async () => {
    if (isInitializing) {
      const message = 'CactusVAD is already initializing';
      setError(message);
      throw new Error(message);
    }

    setError(null);
    setIsInitializing(true);
    try {
      await cactusVAD.init();
    } catch (e) {
      setError(getErrorMessage(e));
      throw e;
    } finally {
      setIsInitializing(false);
    }
  }, [cactusVAD, isInitializing]);

  const vad = useCallback(
    async ({
      audio,
      options,
    }: CactusVADVadParams): Promise<CactusVADResult> => {
      setError(null);
      try {
        return await cactusVAD.vad({ audio, options });
      } catch (e) {
        setError(getErrorMessage(e));
        throw e;
      }
    },
    [cactusVAD]
  );

  const destroy = useCallback(async () => {
    setError(null);
    try {
      await cactusVAD.destroy();
    } catch (e) {
      setError(getErrorMessage(e));
      throw e;
    }
  }, [cactusVAD]);

  const getModels = useCallback(async (): Promise<CactusModel[]> => {
    setError(null);
    try {
      return await cactusVAD.getModels();
    } catch (e) {
      setError(getErrorMessage(e));
      throw e;
    }
  }, [cactusVAD]);

  return {
    isInitializing,
    isDownloaded,
    isDownloading,
    downloadProgress,
    error,

    download,
    init,
    vad,
    destroy,
    getModels,
  };
};
