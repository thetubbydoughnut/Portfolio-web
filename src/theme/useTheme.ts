import { useEffect, useState } from 'react';
import {
  applyTheme,
  initTheme,
  readStoredTheme,
  toggleTheme as toggleThemeHelper,
  type ThemeMode,
} from './theme';

/**
 * Minimal documentElement theme hook (§5a.4).
 * Defaults to the resolved theme after client init; toggling persists to localStorage.
 */
export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof document === 'undefined') return 'dark';
    const attr = document.documentElement.getAttribute('data-theme');
    if (attr === 'light' || attr === 'dark') return attr;
    return readStoredTheme() ?? 'dark';
  });

  useEffect(() => {
    const resolved = initTheme();
    setThemeState(resolved);
  }, []);

  const setTheme = (next: ThemeMode) => {
    applyTheme(next);
    setThemeState(next);
  };

  const toggleTheme = () => {
    const next = toggleThemeHelper(theme);
    setThemeState(next);
    return next;
  };

  return { theme, setTheme, toggleTheme };
}
