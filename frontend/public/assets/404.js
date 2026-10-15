// Follow the theme saved by the app (same key as useTheme), if there is one.
try {
  if (localStorage.getItem('theme') === 'light') {
    document.documentElement.style.setProperty('--bg', 'oklch(0.985 0.004 265)');
    document.documentElement.style.setProperty('--surface', 'oklch(1 0 0)');
    document.documentElement.style.setProperty('--border', 'oklch(0.90 0.006 265)');
    document.documentElement.style.setProperty('--text', 'oklch(0.22 0.012 265)');
    document.documentElement.style.setProperty('--muted', 'oklch(0.50 0.012 265)');
    document.documentElement.style.setProperty('--accent', 'oklch(0.52 0.15 165)');
    document.documentElement.style.setProperty('--accent-ink', 'oklch(0.99 0 0)');
  }
} catch {}
