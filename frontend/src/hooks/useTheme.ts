import { useCallback, useEffect, useState } from 'react'
import type { Theme } from '../types/theme'

const STORAGE_KEY = 'theme'
const ACCENT_HUE = 165
const ACCENT_BASE = { l: 0.78, c: 0.145 } // acento de marca, definido en el tema oscuro

const PALETTE: Record<Theme, Record<string, string>> = {
  dark: {
    bg: 'oklch(0.17 0.012 265)',
    surface: 'oklch(0.212 0.014 265)',
    surface2: 'oklch(0.245 0.014 265)',
    border: 'oklch(0.30 0.015 265)',
    text: 'oklch(0.965 0.005 265)',
    muted: 'oklch(0.70 0.012 265)',
  },
  light: {
    bg: 'oklch(0.985 0.004 265)',
    surface: 'oklch(1 0 0)',
    surface2: 'oklch(0.965 0.004 265)',
    border: 'oklch(0.90 0.006 265)',
    text: 'oklch(0.22 0.012 265)',
    muted: 'oklch(0.50 0.012 265)',
  },
}

function readInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'dark' || stored === 'light') return stored
  } catch {
    // Sin localStorage disponible, se usa el tema por defecto.
  }
  return 'dark'
}

// El acento en claro se deriva del mismo hue con menos luz y algo más de croma,
// en vez de mantener mecánicamente los mismos números para los dos temas.
function applyTheme(theme: Theme): void {
  const root = document.documentElement.style
  const palette = PALETTE[theme]
  Object.entries(palette).forEach(([key, value]) => root.setProperty(`--${key}`, value))

  const accent =
    theme === 'light'
      ? `oklch(0.52 ${Math.min(0.15, ACCENT_BASE.c * 1.05).toFixed(3)} ${ACCENT_HUE})`
      : `oklch(${ACCENT_BASE.l} ${ACCENT_BASE.c} ${ACCENT_HUE})`
  root.setProperty('--accent', accent)
  root.setProperty('--accent-ink', theme === 'dark' ? 'oklch(0.18 0.04 165)' : 'oklch(0.99 0 0)')
  document.body.style.background = palette.bg
}

export function useTheme(): { theme: Theme; toggleTheme: () => void } {
  const [theme, setTheme] = useState<Theme>(readInitialTheme)

  useEffect(() => {
    applyTheme(theme)
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // idem: sin persistencia si no hay localStorage.
    }
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }, [])

  return { theme, toggleTheme }
}
