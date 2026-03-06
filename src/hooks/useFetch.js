import { useState, useEffect, useCallback, useRef } from 'react';
import { useDebounce } from './useDebounce';

export const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);

  const abortControllerRef = useRef();

  const fetchData = useCallback(async () => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        ...options,
        signal: abortControllerRef.current.signal,
      });

      setStatus(response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  useEffect(() => {
    fetchData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, status, refetch };
};

// Hook with debounce
export const useDebouncedFetch = (url, delay = 500, options = {}) => {
  const debouncedUrl = useDebounce(url, delay);
  return useFetch(debouncedUrl, options);
};

// Hook with retry
export const useFetchWithRetry = (url, options = {}, retryConfig = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const { maxRetries = 3, retryDelay = 1000, retryCondition = () => true } = retryConfig;

  const abortControllerRef = useRef();
  const timeoutRef = useRef();

  const fetchData = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setLoading(true);

    try {
      const response = await fetch(url, {
        ...options,
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      setError(null);
      setRetryCount(0);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err);

        // Retry logic
        if (retryCount < maxRetries && retryCondition(err)) {
          timeoutRef.current = setTimeout(
            () => {
              setRetryCount((prev) => prev + 1);
            },
            retryDelay * Math.pow(2, retryCount)
          ); // Exponential backoff
        }
      }
    } finally {
      setLoading(false);
    }
  }, [url, options, retryCount, maxRetries, retryDelay, retryCondition]);

  useEffect(() => {
    fetchData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [fetchData, retryCount]);

  const retry = useCallback(() => {
    setRetryCount(0);
    fetchData();
  }, [fetchData]);

  return { data, loading, error, retryCount, retry };
};

// Hook for paginated fetch
export const usePaginatedFetch = (baseUrl, options = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchPage = useCallback(
    async (pageNum) => {
      setLoading(true);

      try {
        const url = new URL(baseUrl);
        url.searchParams.append('page', pageNum);

        const response = await fetch(url, options);
        const result = await response.json();

        if (pageNum === 1) {
          setData(result.data || result);
        } else {
          setData((prev) => [...prev, ...(result.data || result)]);
        }

        setHasMore(result.hasMore || result.data?.length === result.limit);
        setTotal(result.total || data.length);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [baseUrl, options]
  );

  useEffect(() => {
    fetchPage(1);
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
      fetchPage(page + 1);
    }
  }, [loading, hasMore, page, fetchPage]);

  const refresh = useCallback(() => {
    setPage(1);
    fetchPage(1);
  }, [fetchPage]);

  return { data, loading, error, page, hasMore, total, loadMore, refresh };
};

// Hook for infinite scroll
export const useInfiniteScroll = (fetchMore, hasMore, options = {}) => {
  const [loading, setLoading] = useState(false);
  const observerRef = useRef();
  const { threshold = 0.8, rootMargin = '0px' } = options;

  const lastElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            setLoading(true);
            fetchMore().finally(() => setLoading(false));
          }
        },
        { threshold, rootMargin }
      );

      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore, fetchMore, threshold, rootMargin]
  );

  return { lastElementRef, loading };
};

// Hook for mutation (POST, PUT, DELETE)
export const useMutation = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(
    async (body, mutateOptions = {}) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(url, {
          method: mutateOptions.method || options.method || 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
            ...mutateOptions.headers,
          },
          body: JSON.stringify(body),
          ...options,
          ...mutateOptions,
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Mutation failed');
        }

        setData(result);
        mutateOptions.onSuccess?.(result);
        return result;
      } catch (err) {
        setError(err.message);
        mutateOptions.onError?.(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [url, options]
  );

  return { mutate, data, loading, error };
};

// Hook for lazy fetch (triggered manually)
export const useLazyFetch = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (url, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, options);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Request failed');
      }

      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return [fetchData, { data, loading, error }];
};

export default useFetch;
