import Editor from '@monaco-editor/react'
import { useCallback, useMemo } from 'react'
import { useProjectStore } from '../store/projectStore'

export function EditorPane() {
  const { files, activePath, upsertFile, autosave, saveToLocalStorage } = useProjectStore()
  const content = useMemo(() => files[activePath]?.content ?? '', [files, activePath])

  const onChange = useCallback(
    (value?: string) => {
      if (activePath) {
        upsertFile(activePath, value ?? '')
        if (autosave) saveToLocalStorage()
      }
    },
    [activePath, upsertFile, autosave, saveToLocalStorage]
  )

  const language = useMemo(() => {
    if (activePath.endsWith('.ts') || activePath.endsWith('.tsx')) return 'typescript'
    if (activePath.endsWith('.js') || activePath.endsWith('.jsx')) return 'javascript'
    if (activePath.endsWith('.css')) return 'css'
    if (activePath.endsWith('.html')) return 'html'
    return 'plaintext'
  }, [activePath])

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--panel-border)', fontSize: 12, background: 'var(--panel)' }}>{activePath || 'No file selected'}</div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <Editor
          height="100%"
          defaultLanguage={language}
          path={activePath}
          value={content}
          onChange={onChange}
          options={{ fontSize: 14, minimap: { enabled: false }, wordWrap: 'on', theme: 'vs-dark' }}
        />
      </div>
    </div>
  )
}



