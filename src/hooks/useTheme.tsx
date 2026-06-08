import { useState, useEffect, useCallback, useMemo } from 'react';
import { createCtxWithName } from './createCtx';

export type Theme = 'light' | 'dark' | 'auto';

export interface ThemeHelpers {
  theme: Theme;
  setTheme: (t: Theme) => void;
  resolvedTheme: 'light' | 'dark';
  /** Convenience boolean — true when the resolved theme is dark. */
  isDark: boolean;
  toggle: () => void;
}

const [useThemeCtx, ThemeContextProvider] = createCtxWithName<ThemeHelpers>('ThemeContext');

const THEME_CYCLE: Theme[] = ['light', 'dark', 'auto'];

function getInitialTheme(): Theme {
  const saved = localStorage.getItem('coffee-calc-theme');
  if (saved === 'dark' || saved === 'light' || saved === 'auto') return saved;
  return 'auto';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // Resolve the actual applied theme (OS preference when auto)
  const resolvedTheme = useMemo(() => {
    if (theme === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
  }, [theme]);

  // Sync <html> class and localStorage on theme change
  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('coffee-calc-theme', theme);
    } catch {
      // Silent failure is intentional: theme preference is low-impact and has
      // a sensible default ('auto'). No user-facing notification needed.
    }
  }, [theme, resolvedTheme]);

  // Listen for OS-level preference changes (applies only when theme is 'auto')
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      if (theme === 'auto') {
        const root = document.documentElement;
        if (e.matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const idx = THEME_CYCLE.indexOf(prev);
      return THEME_CYCLE[(idx + 1) % THEME_CYCLE.length];
    });
  }, []);

  return (
    <ThemeContextProvider value={{ theme, setTheme, resolvedTheme, isDark: resolvedTheme === 'dark', toggle }}>
      {children}
    </ThemeContextProvider>
  );
}

export const useTheme = useThemeCtx;
