'use client';

import { createContext, useContext, useEffect, useLayoutEffect, useState } from 'react';

const ThemeContext = createContext(null);
const STORAGE_KEY = 'stillpoint-theme';

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    let savedTheme = null;
    try {
      savedTheme = window.localStorage.getItem(STORAGE_KEY);
    } catch {}
    const initialTheme = savedTheme === 'dark' || savedTheme === 'light'
      ? savedTheme
      : document.documentElement.dataset.theme || 'light';
    document.documentElement.dataset.theme = initialTheme;
    setTheme(initialTheme);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.dataset.theme = theme;
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {}
  }, [theme, ready]);

  function toggleTheme() {
    setTheme(current => current === 'dark' ? 'light' : 'dark');
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
