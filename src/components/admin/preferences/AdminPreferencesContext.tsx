import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type AdminFontSize = 'pequeno' | 'normal' | 'grande' | 'extra';
export type AdminDensity = 'compacto' | 'normal' | 'confortavel';
export type AdminTypography = 'loie' | 'sistema' | 'serifada';

export interface AdminPreferences {
  fontSize: AdminFontSize;
  density: AdminDensity;
  typography: AdminTypography;
}

const DEFAULT: AdminPreferences = {
  fontSize: 'normal',
  density: 'normal',
  typography: 'loie',
};

const STORAGE_KEY = 'loie_admin_prefs_v1';

const FONT_SIZE_PX: Record<AdminFontSize, string> = {
  pequeno: '14px',
  normal:  '16px',
  grande:  '18px',
  extra:   '20px',
};

const DENSITY_SCALE: Record<AdminDensity, string> = {
  compacto:    '0.85',
  normal:      '1',
  confortavel: '1.2',
};

const TYPOGRAPHY_FAMILY: Record<AdminTypography, string> = {
  loie:     '"Sackers Gothic", sans-serif',
  sistema:  'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  serifada: '"Cormorant Garamond", Georgia, serif',
};

function loadFromStorage(): AdminPreferences {
  if (typeof window === 'undefined') return DEFAULT;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT;
    const parsed = JSON.parse(raw) as Partial<AdminPreferences>;
    return { ...DEFAULT, ...parsed };
  } catch {
    return DEFAULT;
  }
}

function saveToStorage(prefs: AdminPreferences) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* quota cheia ou bloqueado — ignora silenciosamente */
  }
}

interface ContextValue {
  prefs: AdminPreferences;
  setPrefs: (patch: Partial<AdminPreferences>) => void;
  reset: () => void;
}

const Context = createContext<ContextValue | null>(null);

export function AdminPreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefsState] = useState<AdminPreferences>(loadFromStorage);

  /* Aplica no <html> enquanto o admin está montado; restaura ao desmontar
     para não vazar para o site público. */
  useEffect(() => {
    const html = document.documentElement;
    const previous = {
      fontSize: html.style.fontSize,
      density: html.dataset.adminDensity,
      typography: html.style.fontFamily,
    };
    html.style.fontSize = FONT_SIZE_PX[prefs.fontSize];
    html.dataset.adminDensity = prefs.density;
    html.dataset.adminFontsize = prefs.fontSize;
    html.dataset.adminTypography = prefs.typography;
    html.style.setProperty('--admin-density-scale', DENSITY_SCALE[prefs.density]);
    html.style.setProperty('--admin-ui-font', TYPOGRAPHY_FAMILY[prefs.typography]);
    return () => {
      html.style.fontSize = previous.fontSize;
      html.style.fontFamily = previous.typography;
      delete html.dataset.adminDensity;
      delete html.dataset.adminFontsize;
      delete html.dataset.adminTypography;
      html.style.removeProperty('--admin-density-scale');
      html.style.removeProperty('--admin-ui-font');
    };
  }, [prefs]);

  const setPrefs = useCallback((patch: Partial<AdminPreferences>) => {
    setPrefsState((prev) => {
      const next: AdminPreferences = { ...prev, ...patch };
      saveToStorage(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    saveToStorage(DEFAULT);
    setPrefsState(DEFAULT);
  }, []);

  const value = useMemo<ContextValue>(() => ({ prefs, setPrefs, reset }), [prefs, setPrefs, reset]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useAdminPreferences(): ContextValue {
  const ctx = useContext(Context);
  if (!ctx) {
    // Fallback no-op para componentes que possam montar fora do provider.
    return {
      prefs: DEFAULT,
      setPrefs: () => {},
      reset: () => {},
    };
  }
  return ctx;
}
