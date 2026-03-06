import { useEffect, useRef } from 'react';

export const useClickOutside = (handler, events = ['mousedown', 'touchstart']) => {
  const ref = useRef();

  useEffect(() => {
    const listener = (event) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, listener);
    });

    // Remove event listeners on cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, listener);
      });
    };
  }, [handler, events]);

  return ref;
};

// Hook for multiple refs
export const useClickOutsideMultiple = (handler, events = ['mousedown', 'touchstart']) => {
  const refs = useRef([]);

  useEffect(() => {
    const listener = (event) => {
      // Check if click is outside all refs
      const isOutside = refs.current.every((ref) => {
        return !ref || !ref.contains(event.target);
      });

      if (isOutside) {
        handler(event);
      }
    };

    events.forEach((event) => {
      document.addEventListener(event, listener);
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, listener);
      });
    };
  }, [handler, events]);

  const addRef = (index) => (el) => {
    if (el) {
      refs.current[index] = el;
    }
  };

  return { addRef, refs: refs.current };
};

// Hook for esc key press
export const useEscapeKey = (handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (event.key === 'Escape') {
        handler(event);
      }
    };

    document.addEventListener('keydown', listener);

    return () => {
      document.removeEventListener('keydown', listener);
    };
  }, [handler]);
};

// Hook for focus trap
export const useFocusTrap = (active = true) => {
  const ref = useRef();

  useEffect(() => {
    if (!active) return;

    const element = ref.current;
    if (!element) return;

    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    // Focus first element
    firstFocusable?.focus();

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [active]);

  return ref;
};

// Hook for click outside with dynamic handler
export const useDynamicClickOutside = (initialHandler, events = ['mousedown', 'touchstart']) => {
  const handlerRef = useRef(initialHandler);
  const ref = useRef();

  useEffect(() => {
    handlerRef.current = initialHandler;
  }, [initialHandler]);

  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handlerRef.current(event);
    };

    events.forEach((event) => {
      document.addEventListener(event, listener);
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, listener);
      });
    };
  }, [events]);

  return ref;
};

// Hook for click outside with exclude refs
export const useClickOutsideExclude = (
  handler,
  excludeRefs = [],
  events = ['mousedown', 'touchstart']
) => {
  const ref = useRef();

  useEffect(() => {
    const listener = (event) => {
      // Check if click is inside main ref
      if (ref.current && ref.current.contains(event.target)) {
        return;
      }

      // Check if click is inside any exclude ref
      const isInExclude = excludeRefs.some((excludeRef) => {
        return excludeRef.current && excludeRef.current.contains(event.target);
      });

      if (!isInExclude) {
        handler(event);
      }
    };

    events.forEach((event) => {
      document.addEventListener(event, listener);
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, listener);
      });
    };
  }, [handler, excludeRefs, events]);

  return ref;
};

export default useClickOutside;
