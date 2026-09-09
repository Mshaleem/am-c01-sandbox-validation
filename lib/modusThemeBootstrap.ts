export function applyModusThemeFromStorage(): void {
  if (typeof document === 'undefined') return;
  try {
    const pref = localStorage.getItem('theme') || 'system';
    const sys = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const mode = pref === 'dark' || pref === 'light' ? pref : sys;
    const root = document.documentElement;
    root.setAttribute('data-theme', mode === 'dark' ? 'modus-modern-dark' : 'modus-modern-light');
    root.setAttribute('data-mode', mode);
    root.classList.remove('light', 'dark');
    root.classList.add(mode);
    localStorage.setItem('modus-theme-config', JSON.stringify({ theme: 'modus-modern', mode }));
  } catch {
    /* keep markup defaults */
  }
}
