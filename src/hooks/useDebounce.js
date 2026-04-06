/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback, useRef } from 'react';

export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Hook for debounced function
export const useDebouncedCallback = (callback, delay = 500, deps = []) => {
  const timeoutRef = useRef();
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay, deps]
  );
};

// Hook for debounced effect
export const useDebouncedEffect = (effect, delay = 500, deps = []) => {
  useEffect(() => {
    const handler = setTimeout(() => {
      effect();
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [...deps, delay, effect]);
};

// Hook for throttled function
export const useThrottle = (callback, delay = 500, deps = []) => {
  const lastRun = useRef(Date.now());
  const timeoutRef = useRef();

  return useCallback(
    (...args) => {
      const now = Date.now();

      if (now - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = now;
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(
          () => {
            callback(...args);
            lastRun.current = Date.now();
          },
          delay - (now - lastRun.current)
        );
      }
    },
    [delay, deps]
  );
};

// Hook for leading debounce (runs immediately then debounces)
export const useLeadingDebounce = (callback, delay = 500, deps = []) => {
  const timeoutRef = useRef();
  const shouldRun = useRef(true);

  return useCallback(
    (...args) => {
      if (shouldRun.current) {
        callback(...args);
        shouldRun.current = false;
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        shouldRun.current = true;
      }, delay);
    },
    [delay, deps]
  );
};

// Hook for trailing debounce (waits for pause before running)
export const useTrailingDebounce = (callback, delay = 500, deps = []) => {
  const timeoutRef = useRef();
  const lastArgs = useRef();

  return useCallback(
    (...args) => {
      lastArgs.current = args;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        if (lastArgs.current) {
          callback(...lastArgs.current);
        }
      }, delay);
    },
    [delay, deps]
  );
};

// Hook for debounced promise
export const useDebouncedPromise = (asyncFunction, delay = 500, deps = []) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const timeoutRef = useRef();
  const abortControllerRef = useRef();

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);

      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Abort previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      return new Promise((resolve, reject) => {
        timeoutRef.current = setTimeout(async () => {
          try {
            const result = await asyncFunction(...args, {
              signal: abortControllerRef.current.signal,
            });
            setData(result);
            setLoading(false);
            resolve(result);
          } catch (err) {
            if (err.name !== 'AbortError') {
              setError(err);
              setLoading(false);
              reject(err);
            }
          }
        }, delay);
      });
    },
    [delay, deps]
  );

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { execute, loading, error, data };
};

export default useDebounce;
