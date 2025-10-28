import './App.css'
import { useEffect } from 'react'
import { TopBar } from './components/TopBar'
import { FileTree } from './components/FileTree'
import { EditorPane } from './components/EditorPane'
import { PreviewPane } from './components/PreviewPane'
import { useProjectStore } from './store/projectStore'

function App() {
  const loadFromLocalStorage = useProjectStore((s) => s.loadFromLocalStorage)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get('projectId') || 'demo'
    loadFromLocalStorage(id)
  }, [loadFromLocalStorage])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopBar />
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 1fr', gap: 0, flex: 1, minHeight: 0 }}>
        <div style={{ borderRight: '1px solid #e5e7eb', minWidth: 0 }}>
          <FileTree />
        </div>
        <div style={{ borderRight: '1px solid #e5e7eb', minWidth: 0 }}>
          <EditorPane />
        </div>
        <div style={{ minWidth: 0 }}>
          <PreviewPane />
        </div>
      </div>
    </div>
  )
}

export default App
