export type ThemeMode = 'dark' | 'light';

export const THEME_STORAGE_KEY = 'portfolio-theme';

export type ColorSchemePreference = 'dark' | 'light' | 'no-preference';

export type ResolveInitialThemeInput = {
  stored: string | null;
  prefersColorScheme: ColorSchemePreference;
};

/**
 * §5a.4 — dark on first visit if OS is dark or has no preference; otherwise light.
 * Stored user choice wins over OS until cleared.
 */
export function resolveInitialTheme({
  stored,
  prefersColorScheme,
}: ResolveInitialThemeInput): ThemeMode {
  if (stored === 'dark' || stored === 'light') {
    return stored;
  }
  if (prefersColorScheme === 'light') {
    return 'light';
  }
  return 'dark';
}

export type ApplyThemeOptions = {
  documentElement?: HTMLElement;
  localStorage?: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
  persist?: boolean;
};

export function applyTheme(
  theme: ThemeMode,
  options: ApplyThemeOptions = {}
): void {
  const el = options.documentElement ?? document.documentElement;
  const ls = options.localStorage ?? (typeof localStorage !== 'undefined' ? localStorage : null);
  el.setAttribute('data-theme', theme);
  if (options.persist !== false && ls) {
    ls.setItem(THEME_STORAGE_KEY, theme);
  }
}

export function readStoredTheme(
  ls: Pick<Storage, 'getItem'> | null = typeof localStorage !== 'undefined' ? localStorage : null
): ThemeMode | null {
  const value = ls?.getItem(THEME_STORAGE_KEY) ?? null;
  return value === 'dark' || value === 'light' ? value : null;
}

export function getOsColorScheme(
  mql: MediaQueryList | null = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null
): ColorSchemePreference {
  if (!mql) return 'no-preference';
  if (mql.matches) return 'dark';
  // If light media query would match when dark does not
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light';
  }
  return 'no-preference';
}

/** Apply the resolved theme once on the client (call from app entry). */
export function initTheme(): ThemeMode {
  const theme = resolveInitialTheme({
    stored: readStoredTheme(),
    prefersColorScheme: getOsColorScheme(),
  });
  applyTheme(theme);
  return theme;
}

export function toggleTheme(current?: ThemeMode | null): ThemeMode {
  const el = document.documentElement;
  const fromAttr = el.getAttribute('data-theme');
  const now: ThemeMode =
    current === 'dark' || current === 'light'
      ? current
      : fromAttr === 'light'
        ? 'light'
        : 'dark';
  const next: ThemeMode = now === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  return next;
}
