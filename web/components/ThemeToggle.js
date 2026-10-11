'use client';

import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === 'dark';
  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${dark ? 'light' : 'dark'} mode`}
      aria-pressed={dark}
      title={`Switch to ${dark ? 'light' : 'dark'} mode`}
    >
      {dark ? (
        <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg>
      ) : (
        <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M20.2 15.5A8.5 8.5 0 0 1 8.5 3.8 8.6 8.6 0 1 0 20.2 15.5Z"/></svg>
      )}
      <span className="sr-only">{dark ? 'Dark mode is on' : 'Light mode is on'}</span>
    </button>
  );
}
