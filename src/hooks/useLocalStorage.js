import { useState, useEffect, useCallback } from 'react';

export const useLocalStorage = (key, initialValue) => {
  // Get from local storage then parse stored json or return initialValue
  const readValue = useCallback(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  // State to store our value
  const [storedValue, setStoredValue] = useState(readValue);
  const [isLoaded, setIsLoaded] = useState(false);

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback(
    (value) => {
      if (typeof window === 'undefined') {
        console.warn(`Cannot set localStorage key "${key}" on server side`);
        return;
      }

      try {
        // Allow value to be a function so we have same API as useState
        const newValue = value instanceof Function ? value(storedValue) : value;

        // Save to local storage
        window.localStorage.setItem(key, JSON.stringify(newValue));

        // Save state
        setStoredValue(newValue);

        // Dispatch a custom event so other hooks can listen
        window.dispatchEvent(new Event('local-storage-change'));
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Remove item from localStorage
  const removeValue = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
      window.dispatchEvent(new Event('local-storage-change'));
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Clear all localStorage
  const clearAll = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.clear();
      setStoredValue(initialValue);
      window.dispatchEvent(new Event('local-storage-change'));
    } catch (error) {
      console.warn('Error clearing localStorage:', error);
    }
  }, [initialValue]);

  // Listen for changes to this localStorage key from other tabs/windows
  useEffect(() => {
    setIsLoaded(true);

    const handleStorageChange = (e) => {
      if (e.key === key) {
        setStoredValue(e.newValue ? JSON.parse(e.newValue) : initialValue);
      }
    };

    const handleCustomEvent = () => {
      setStoredValue(readValue());
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage-change', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage-change', handleCustomEvent);
    };
  }, [key, initialValue, readValue]);

  // Check if we're on the client side
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return [storedValue, setValue, removeValue, clearAll, isLoaded];
};

// Hook for session storage
export const useSessionStorage = (key, initialValue) => {
  const readValue = useCallback(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  const [storedValue, setStoredValue] = useState(readValue);

  const setValue = useCallback(
    (value) => {
      if (typeof window === 'undefined') {
        console.warn(`Cannot set sessionStorage key "${key}" on server side`);
        return;
      }

      try {
        const newValue = value instanceof Function ? value(storedValue) : value;
        window.sessionStorage.setItem(key, JSON.stringify(newValue));
        setStoredValue(newValue);
      } catch (error) {
        console.warn(`Error setting sessionStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  const removeValue = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.sessionStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.warn(`Error removing sessionStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
};

// Hook for cookie storage
export const useCookie = (key, initialValue) => {
  const readCookie = useCallback(() => {
    if (typeof document === 'undefined') {
      return initialValue;
    }

    try {
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [name, value] = cookie.split('=').map((c) => c.trim());
        acc[name] = decodeURIComponent(value);
        return acc;
      }, {});

      return cookies[key] ? JSON.parse(cookies[key]) : initialValue;
    } catch (error) {
      console.warn(`Error reading cookie "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  const [storedValue, setStoredValue] = useState(readCookie);

  const setValue = useCallback(
    (value, options = {}) => {
      if (typeof document === 'undefined') {
        console.warn(`Cannot set cookie "${key}" on server side`);
        return;
      }

      try {
        const newValue = value instanceof Function ? value(storedValue) : value;

        let cookieString = `${key}=${encodeURIComponent(JSON.stringify(newValue))}`;

        if (options.maxAge) {
          cookieString += `; max-age=${options.maxAge}`;
        }

        if (options.expires) {
          cookieString += `; expires=${options.expires.toUTCString()}`;
        }

        if (options.path) {
          cookieString += `; path=${options.path}`;
        }

        if (options.domain) {
          cookieString += `; domain=${options.domain}`;
        }

        if (options.secure) {
          cookieString += `; secure`;
        }

        if (options.sameSite) {
          cookieString += `; samesite=${options.sameSite}`;
        }

        document.cookie = cookieString;
        setStoredValue(newValue);
      } catch (error) {
        console.warn(`Error setting cookie "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  const removeValue = useCallback(
    (options = {}) => {
      if (typeof document === 'undefined') {
        return;
      }

      try {
        document.cookie = `${key}=; max-age=0; ${options.path ? `path=${options.path}` : ''}`;
        setStoredValue(initialValue);
      } catch (error) {
        console.warn(`Error removing cookie "${key}":`, error);
      }
    },
    [key, initialValue]
  );

  return [storedValue, setValue, removeValue];
};

// Hook for indexedDB
export const useIndexedDB = (dbName, storeName) => {
  const [db, setDb] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const request = indexedDB.open(dbName, 1);

    request.onerror = () => {
      console.error('Failed to open IndexedDB');
    };

    request.onsuccess = (event) => {
      setDb(event.target.result);
      setIsReady(true);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'id' });
      }
    };
  }, [dbName, storeName]);

  const setItem = useCallback(
    async (key, value) => {
      if (!db || !isReady) return;

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put({ id: key, value });

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    },
    [db, isReady, storeName]
  );

  const getItem = useCallback(
    async (key) => {
      if (!db || !isReady) return null;

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(key);

        request.onsuccess = () => resolve(request.result?.value);
        request.onerror = () => reject(request.error);
      });
    },
    [db, isReady, storeName]
  );

  const removeItem = useCallback(
    async (key) => {
      if (!db || !isReady) return;

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(key);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    },
    [db, isReady, storeName]
  );

  const clear = useCallback(async () => {
    if (!db || !isReady) return;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }, [db, isReady, storeName]);

  return { setItem, getItem, removeItem, clear, isReady };
};

export default useLocalStorage;
