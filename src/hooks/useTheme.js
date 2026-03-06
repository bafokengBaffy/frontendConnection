import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useLocalStorage } from './useLocalStorage';

// Create theme context
export const ThemeContext = createContext(null);

// Theme provider component
export const ThemeProvider = ({ children, defaultTheme = 'light' }) => {
  const [theme, setTheme] = useLocalStorage('theme', defaultTheme);
  const [systemTheme, setSystemTheme] = useState('light');
  const [isSystemPreference, setIsSystemPreference] = useState(false);

  // Detect system theme preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
      if (isSystemPreference) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [isSystemPreference, setTheme]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    const currentTheme = isSystemPreference ? systemTheme : theme;

    root.classList.remove('light', 'dark');
    root.classList.add(currentTheme);

    // Set color scheme meta tag
    document.querySelector('meta[name="color-scheme"]')?.setAttribute('content', currentTheme);

    // Dispatch theme change event
    window.dispatchEvent(new CustomEvent('themeChange', { detail: { theme: currentTheme } }));
  }, [theme, systemTheme, isSystemPreference]);

  const setLightTheme = useCallback(() => {
    setTheme('light');
    setIsSystemPreference(false);
  }, [setTheme]);

  const setDarkTheme = useCallback(() => {
    setTheme('dark');
    setIsSystemPreference(false);
  }, [setTheme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    setIsSystemPreference(false);
  }, [setTheme]);

  const setSystemThemePreference = useCallback(() => {
    setIsSystemPreference(true);
    setTheme(systemTheme);
  }, [systemTheme, setTheme]);

  const getCurrentTheme = useCallback(() => {
    return isSystemPreference ? systemTheme : theme;
  }, [isSystemPreference, systemTheme, theme]);

  const isDark = getCurrentTheme() === 'dark';
  const isLight = getCurrentTheme() === 'light';

  return (
    <ThemeContext.Provider
      value={{
        theme: getCurrentTheme(),
        setLightTheme,
        setDarkTheme,
        toggleTheme,
        setSystemThemePreference,
        isDark,
        isLight,
        isSystemPreference,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Hook for theme-aware values
export const useThemeValue = (lightValue, darkValue) => {
  const { isDark } = useTheme();
  return isDark ? darkValue : lightValue;
};

// Hook for responsive theme
export const useResponsiveTheme = (breakpoints = {}) => {
  const { theme } = useTheme();
  const [currentBreakpoint, setCurrentBreakpoint] = useState('xs');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      if (width >= 1536) setCurrentBreakpoint('xl');
      else if (width >= 1200) setCurrentBreakpoint('lg');
      else if (width >= 900) setCurrentBreakpoint('md');
      else if (width >= 600) setCurrentBreakpoint('sm');
      else setCurrentBreakpoint('xs');
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoints[currentBreakpoint] || theme;
};

// Hook for theme animation preferences
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};

// Hook for theme contrast preferences
export const useHighContrast = () => {
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setPrefersHighContrast(mediaQuery.matches);

    const handleChange = (e) => {
      setPrefersHighContrast(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersHighContrast;
};

// Hook for theme colors
export const useThemeColor = (colorPath) => {
  const { theme } = useTheme();
  const [computedColor, setComputedColor] = useState('');

  useEffect(() => {
    const computeColor = () => {
      const root = document.documentElement;
      const style = getComputedStyle(root);
      return style.getPropertyValue(colorPath)?.trim() || '';
    };

    setComputedColor(computeColor());

    const observer = new MutationObserver(() => {
      setComputedColor(computeColor());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, [colorPath, theme]);

  return computedColor;
};

export default useTheme;
