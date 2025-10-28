import { useEffect, useState } from 'react'
import { useProjectStore } from '../store/projectStore'
import { BackendButtons } from './BackendButtons'

export function TopBar() {
  const { projectId, setProjectId, saveToLocalStorage, autosave, setAutosave, previewMode, setPreviewMode } = useProjectStore()
  const [tempId, setTempId] = useState(projectId)

  useEffect(() => setTempId(projectId), [projectId])

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderBottom: '1px solid var(--panel-border)', background: 'var(--panel)', position: 'sticky', top: 0, zIndex: 10 }}>
      <div style={{ fontWeight: 700, letterSpacing: 0.4 }}>CipherStudio</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 12 }}>
        <label style={{ color: 'var(--muted)', fontSize: 12 }}>projectId</label>
        <input value={tempId} onChange={(e) => setTempId(e.target.value)} style={{ padding: '6px 10px', background: 'var(--btn-bg)', color: 'var(--text)', border: '1px solid var(--btn-border)', borderRadius: 8 }} />
        <button onClick={() => setProjectId(tempId)} style={{ padding: '8px 12px', background: 'linear-gradient(180deg, var(--btn-bg), #0d1420)', borderColor: 'var(--btn-border)' }}>Set</button>
        <button onClick={saveToLocalStorage} style={{ padding: '8px 12px', borderColor: 'var(--btn-border)' }}>Save</button>
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--muted)' }}>
          <input type="checkbox" checked={autosave} onChange={(e) => setAutosave(e.target.checked)} /> Autosave
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ color: 'var(--muted)', fontSize: 12 }}>Preview</label>
          <select value={previewMode} onChange={(e) => setPreviewMode(e.target.value as any)} style={{ padding: '6px 10px', background: 'var(--btn-bg)', color: 'var(--text)', border: '1px solid var(--btn-border)', borderRadius: 8 }}>
            <option value="sandpack">Sandpack</option>
            <option value="local">Local</option>
          </select>
        </div>
        <BackendButtons />
      </div>
    </div>
  )
}


