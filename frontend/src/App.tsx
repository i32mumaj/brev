import { lazy, Suspense, useState } from 'react'
import { Header } from './components/Header'
import { ListPage } from './pages/ListPage'
import { useTheme } from './hooks/useTheme'
import { useMyLinks } from './hooks/useMyLinks'

// The detail view is the only one that draws charts, so recharts is loaded with it.
const DetailPage = lazy(() => import('./pages/DetailPage').then((module) => ({ default: module.DetailPage })))

type View = { name: 'list' } | { name: 'detail'; code: string }

function App() {
  const { theme, toggleTheme } = useTheme()
  const { links, loading, error, creating, create, remove, refresh } = useMyLinks()
  const [view, setView] = useState<View>({ name: 'list' })

  return (
    <div className="container">
      <Header theme={theme} onToggleTheme={toggleTheme} />

      {view.name === 'list' ? (
        <ListPage
          links={links}
          loading={loading}
          error={error}
          creating={creating}
          onCreate={create}
          onOpen={(code) => setView({ name: 'detail', code })}
          onRemove={remove}
          onRetry={refresh}
        />
      ) : (
        <Suspense fallback={<p className="state-message">Cargando…</p>}>
          <DetailPage code={view.code} onBack={() => setView({ name: 'list' })} />
        </Suspense>
      )}
    </div>
  )
}

export default App
