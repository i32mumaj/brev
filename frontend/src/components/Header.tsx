import type { Theme } from '../types/theme'

interface HeaderProps {
  theme: Theme
  onToggleTheme: () => void
}

export function Header({ theme, onToggleTheme }: HeaderProps) {
  const isLight = theme === 'light'

  return (
    <header className="header">
      <div className="header__brand">
        <span className="header__brand-name">brev</span>
        <span className="header__brand-tag mono">url shortener</span>
      </div>
      <div className="header__theme">
        <span className="header__theme-label mono">{isLight ? 'claro' : 'oscuro'}</span>
        <button
          type="button"
          className="theme-toggle"
          onClick={onToggleTheme}
          aria-label={isLight ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro'}
          aria-pressed={isLight}
        >
          <span className={`theme-toggle__knob${isLight ? ' theme-toggle__knob--light' : ''}`} />
        </button>
      </div>
    </header>
  )
}
