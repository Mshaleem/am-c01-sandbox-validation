(function () {
  try {
    var pref = localStorage.getItem('theme') || 'system';
    var sys = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    var mode = pref === 'dark' || pref === 'light' ? pref : sys;
    var root = document.documentElement;
    root.setAttribute('data-theme', mode === 'dark' ? 'modus-modern-dark' : 'modus-modern-light');
    root.setAttribute('data-mode', mode);
    root.classList.remove('light', 'dark');
    root.classList.add(mode);
    localStorage.setItem('modus-theme-config', JSON.stringify({ theme: 'modus-modern', mode: mode }));
  } catch (e) {
    /* keep markup defaults */
  }
})();
