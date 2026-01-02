import { useCallback, useEffect, useState } from 'react';
import { CactusIndex } from '../classes/CactusIndex';
import { getErrorMessage } from '../utils/error';
import type {
  CactusIndexParams,
  CactusIndexAddParams,
  CactusIndexGetParams,
  CactusIndexGetResult,
  CactusIndexQueryParams,
  CactusIndexQueryResult,
  CactusIndexDeleteParams,
} from '../types/CactusIndex';

export const useCactusIndex = ({ name, embeddingDim }: CactusIndexParams) => {
  const [cactusIndex, setCactusIndex] = useState(
    () => new CactusIndex(name, embeddingDim)
  );

  // State
  const [isInitializing, setIsInitializing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCactusIndex(new CactusIndex(name, embeddingDim));

    setIsInitializing(false);
    setIsProcessing(false);
    setError(null);
  }, [name, embeddingDim]);

  useEffect(() => {
    return () => {
      cactusIndex.destroy().catch(() => {});
    };
  }, [cactusIndex]);

  const init = useCallback(async () => {
    if (isInitializing) {
      const message = 'CactusIndex is already initializing';
      setError(message);
      throw new Error(message);
    }

    setError(null);
    setIsInitializing(true);
    try {
      await cactusIndex.init();
    } catch (e) {
      setError(getErrorMessage(e));
      throw e;
    } finally {
      setIsInitializing(false);
    }
  }, [cactusIndex, isInitializing]);

  const add = useCallback(
    async ({
      ids,
      documents,
      metadatas,
      embeddings,
    }: CactusIndexAddParams): Promise<void> => {
      if (isProcessing) {
        const message = 'CactusIndex is already processing';
        setError(message);
        throw new Error(message);
      }

      setError(null);
      setIsProcessing(true);
      try {
        await cactusIndex.add({ ids, documents, metadatas, embeddings });
      } catch (e) {
        setError(getErrorMessage(e));
        throw e;
      } finally {
        setIsProcessing(false);
      }
    },
    [cactusIndex, isProcessing]
  );

  const _delete = useCallback(
    async ({ ids }: CactusIndexDeleteParams): Promise<void> => {
      if (isProcessing) {
        const message = 'CactusIndex is already processing';
        setError(message);
        throw new Error(message);
      }

      setError(null);
      setIsProcessing(true);
      try {
        await cactusIndex.delete({ ids });
      } catch (e) {
        setError(getErrorMessage(e));
        throw e;
      } finally {
        setIsProcessing(false);
      }
    },
    [cactusIndex, isProcessing]
  );

  const get = useCallback(
    async ({ ids }: CactusIndexGetParams): Promise<CactusIndexGetResult> => {
      if (isProcessing) {
        const message = 'CactusIndex is already processing';
        setError(message);
        throw new Error(message);
      }

      setError(null);
      setIsProcessing(true);
      try {
        return await cactusIndex.get({ ids });
      } catch (e) {
        setError(getErrorMessage(e));
        throw e;
      } finally {
        setIsProcessing(false);
      }
    },
    [cactusIndex, isProcessing]
  );

  const query = useCallback(
    async ({
      embeddings,
      options,
    }: CactusIndexQueryParams): Promise<CactusIndexQueryResult> => {
      if (isProcessing) {
        const message = 'CactusIndex is already processing';
        setError(message);
        throw new Error(message);
      }

      setError(null);
      setIsProcessing(true);
      try {
        return await cactusIndex.query({ embeddings, options });
      } catch (e) {
        setError(getErrorMessage(e));
        throw e;
      } finally {
        setIsProcessing(false);
      }
    },
    [cactusIndex, isProcessing]
  );

  const compact = useCallback(async () => {
    if (isProcessing) {
      const message = 'CactusIndex is already processing';
      setError(message);
      throw new Error(message);
    }

    setError(null);
    setIsProcessing(true);
    try {
      await cactusIndex.compact();
    } catch (e) {
      setError(getErrorMessage(e));
      throw e;
    } finally {
      setIsProcessing(false);
    }
  }, [cactusIndex, isProcessing]);

  const destroy = useCallback(async () => {
    setError(null);
    try {
      await cactusIndex.destroy();
    } catch (e) {
      setError(getErrorMessage(e));
      throw e;
    }
  }, [cactusIndex]);

  return {
    isInitializing,
    isProcessing,
    error,

    init,
    add,
    delete: _delete,
    get,
    query,
    compact,
    destroy,
  };
};
