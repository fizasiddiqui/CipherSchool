import { useState } from 'react'
import { useProjectStore } from '../store/projectStore'
import { saveProject, loadProject } from '../lib/backend'

export function BackendButtons() {
  const { projectId, files, activePath, setProjectId, upsertFile, setActivePath } = useProjectStore()
  const [loading, setLoading] = useState(false)

  const onSave = async () => {
    setLoading(true)
    try {
      await saveProject(projectId, { files, activePath })
      alert('Saved to backend')
    } catch (e) {
      alert('Failed to save to backend')
    } finally {
      setLoading(false)
    }
  }
  const onLoad = async () => {
    setLoading(true)
    try {
      const res = await loadProject(projectId)
      for (const [p, node] of Object.entries(res.files)) upsertFile(p, node.content)
      if (res.activePath) setActivePath(res.activePath)
      setProjectId(res.projectId)
      alert('Loaded from backend')
    } catch (e) {
      alert('Failed to load from backend')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button onClick={onSave} disabled={loading}>{loading ? 'Saving...' : 'Save to Backend'}</button>
      <button onClick={onLoad} disabled={loading}>{loading ? 'Loading...' : 'Load from Backend'}</button>
    </div>
  )
}



