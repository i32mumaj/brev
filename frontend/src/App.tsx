import { useState } from 'react'
import { Header } from './components/Header'
import { ListPage } from './pages/ListPage'
import { DetailPage } from './pages/DetailPage'
import { useTheme } from './hooks/useTheme'
import { useMyLinks } from './hooks/useMyLinks'

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
        <DetailPage code={view.code} theme={theme} onBack={() => setView({ name: 'list' })} />
      )}
    </div>
  )
}

export default App
