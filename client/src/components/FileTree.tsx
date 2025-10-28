import { useMemo, useState } from 'react'
import { useProjectStore } from '../store/projectStore'

type TreeNode = {
  name: string
  path: string
  children?: TreeNode[]
}

function buildTree(paths: string[]): TreeNode[] {
  const root: Record<string, TreeNode> = {}
  
  // Get all folder paths from marker files
  const folderPaths = new Set<string>()
  for (const p of paths) {
    if (p.endsWith('.folder')) {
      const folderPath = p.replace('.folder', '')
      if (folderPath) {
        folderPaths.add(folderPath)
      }
    }
  }
  
  // Process all paths (both files and folders)
  const allPaths = [...paths.filter(p => !p.endsWith('.folder')), ...Array.from(folderPaths)]
  
  for (const p of allPaths) {
    const parts = p.split('/')
    let cur = root
    let currPath = ''
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const isFile = i === parts.length - 1
      currPath = i === 0 ? part : currPath + '/' + part
      
      if (!cur[part]) {
        cur[part] = { 
          name: part, 
          path: currPath, 
          children: isFile ? undefined : {} as any 
        }
      }
      
      if (!isFile) {
        cur = cur[part].children as unknown as Record<string, TreeNode>
      }
    }
  }
  
  function toArray(obj: Record<string, TreeNode>): TreeNode[] {
    return Object.values(obj).map((n) => ({ 
      ...n, 
      children: n.children && !(Array.isArray(n.children)) ? toArray(n.children as any) : n.children 
    }))
  }
  return toArray(root)
}

export function FileTree() {
  const { files, activePath, setActivePath, upsertFile, deleteFile, deleteFolder, renameFile, autosave, saveToLocalStorage } = useProjectStore()
  const [newPath, setNewPath] = useState('')
  const [showFolderInput, setShowFolderInput] = useState(false)
  const [newFolderPath, setNewFolderPath] = useState('')
  const tree = useMemo(() => buildTree(Object.keys(files)), [files])

  const handleOpen = (path: string) => {
    setActivePath(path)
  }
  const handleCreate = () => {
    if (!newPath.trim()) return
    if (files[newPath]) return
    upsertFile(newPath, '')
    setNewPath('')
    if (autosave) saveToLocalStorage()
  }

  const handleCreateFolder = () => {
    if (!newFolderPath.trim()) return
    const folderPath = newFolderPath.endsWith('/') ? newFolderPath : newFolderPath + '/'
    if (files[folderPath]) return
    // Create a special folder marker file
    upsertFile(folderPath + '.folder', '')
    setNewFolderPath('')
    setShowFolderInput(false)
    if (autosave) saveToLocalStorage()
  }

  return (
    <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 10, height: '100%', overflow: 'auto', background: 'var(--panel)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 6 }}>
        <input placeholder="new file path (e.g. src/New.tsx)" value={newPath} onChange={(e) => setNewPath(e.target.value)} style={{ minWidth: 0, padding: '6px 10px', background: 'var(--btn-bg)', color: 'var(--text)', border: '1px solid var(--btn-border)', borderRadius: 8 }} />
        <button onClick={handleCreate} style={{ borderColor: 'var(--btn-border)', padding: '6px 10px' }}>Add</button>
      </div>
      
      {showFolderInput ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 6 }}>
          <input 
            placeholder="folder path (e.g. src/components)" 
            value={newFolderPath} 
            onChange={(e) => setNewFolderPath(e.target.value)}
            style={{ minWidth: 0, padding: '6px 10px', background: 'var(--btn-bg)', color: 'var(--text)', border: '1px solid var(--btn-border)', borderRadius: 8 }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateFolder()
              if (e.key === 'Escape') setShowFolderInput(false)
            }}
            autoFocus
          />
          <button onClick={handleCreateFolder} style={{ borderColor: 'var(--btn-border)', padding: '6px 10px', background: 'var(--success)' }}>Create</button>
        </div>
      ) : (
        <button 
          onClick={() => setShowFolderInput(true)}
          style={{ 
            borderColor: 'var(--btn-border)', 
            padding: '6px 10px', 
            background: 'var(--accent)',
            color: 'white',
            fontSize: '12px'
          }}
        >
          📁 New Folder
        </button>
      )}
      
      <div style={{ fontSize: 12, color: 'var(--muted)' }}>Click a file to open. Right-click entries for actions.</div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {tree.map((n) => (
          <TreeItem key={n.path} node={n} activePath={activePath} onOpen={handleOpen} onDelete={(p) => { deleteFile(p); if (autosave) saveToLocalStorage() }} onDeleteFolder={(p) => { deleteFolder(p); if (autosave) saveToLocalStorage() }} onRename={(oldP, newP) => { renameFile(oldP, newP); if (autosave) saveToLocalStorage() }} />
        ))}
      </ul>
    </div>
  )
}

function TreeItem({ node, activePath, onOpen, onDelete, onDeleteFolder, onRename }: { node: TreeNode; activePath: string; onOpen: (p: string) => void; onDelete: (p: string) => void; onDeleteFolder: (p: string) => void; onRename: (o: string, n: string) => void }) {
  const isDir = !!node.children
  const [open, setOpen] = useState(true)
  const [renaming, setRenaming] = useState(false)
  const [name, setName] = useState(node.path)
  const [hovered, setHovered] = useState(false)

  const handleRename = () => {
    setRenaming(true)
    setName(node.name)
  }

  const handleDelete = () => {
    const isFolder = isDir
    const message = isFolder 
      ? `Delete folder "${node.name}" and all its contents?` 
      : `Delete "${node.name}"?`
    
    if (window.confirm(message)) {
      if (isFolder) {
        onDeleteFolder(node.path)
      } else {
        onDelete(node.path)
      }
    }
  }

  const handleSaveRename = () => {
    if (name && name !== node.name) {
      const newPath = node.path.replace(node.name, name)
      onRename(node.path, newPath)
    }
    setRenaming(false)
  }

  return (
    <li>
      <div
        onClick={() => (isDir ? setOpen((v) => !v) : onOpen(node.path))}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onContextMenu={(e) => {
          e.preventDefault()
         }}
        style={{ 
          cursor: 'pointer', 
          padding: '6px 8px', 
          borderRadius: 6, 
          color: node.path === activePath ? 'var(--accent)' : undefined, 
          background: node.path === activePath ? 'rgba(106,162,255,0.08)' : undefined,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'all 0.2s ease'
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {isDir ? (open ? '📂 ' : '📁 ') : '📄 '} {node.name}
        </span>
        
        {/* Hover Actions */}
        {hovered && !renaming && (
          <div style={{ 
            display: 'flex', 
            gap: 4, 
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.2s ease'
          }}>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleRename()
              }}
              style={{
                padding: '2px 6px',
                fontSize: '10px',
                background: 'var(--btn-bg)',
                border: '1px solid var(--btn-border)',
                borderRadius: 4,
                color: 'var(--text)',
                cursor: 'pointer'
              }}
              title="Rename"
            >
              ✏️
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDelete()
              }}
              style={{
                padding: '2px 6px',
                fontSize: '10px',
                background: '#dc2626',
                border: '1px solid #b91c1c',
                borderRadius: 4,
                color: 'white',
                cursor: 'pointer'
              }}
              title="Delete"
            >
              🗑️
            </button>
          </div>
        )}
      </div>
      
      {renaming && (
        <div style={{ display: 'flex', gap: 6, paddingLeft: 8, paddingTop: 4, paddingBottom: 4 }}>
          <input 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            style={{ 
              flex: 1, 
              padding: '4px 8px',
              background: 'var(--btn-bg)',
              border: '1px solid var(--btn-border)',
              borderRadius: 4,
              color: 'var(--text)',
              fontSize: '12px'
            }}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveRename()
              if (e.key === 'Escape') setRenaming(false)
            }}
          />
          <button
            onClick={handleSaveRename}
            style={{
              padding: '4px 8px',
              fontSize: '10px',
              background: 'var(--success)',
              border: '1px solid #16a34a',
              borderRadius: 4,
              color: 'white',
              cursor: 'pointer'
            }}
          >
            ✓
          </button>
          <button 
            onClick={() => setRenaming(false)}
            style={{
              padding: '4px 8px',
              fontSize: '10px',
              background: 'var(--btn-bg)',
              border: '1px solid var(--btn-border)',
              borderRadius: 4,
              color: 'var(--text)',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>
      )}
      
      {isDir && open && (
        <ul style={{ listStyle: 'none', margin: 0, paddingLeft: 16 }}>
          {node.children!.map((c) => (
            <TreeItem key={c.path} node={c} activePath={activePath} onOpen={onOpen} onDelete={onDelete} onDeleteFolder={onDeleteFolder} onRename={onRename} />
          ))}
        </ul>
      )}
    </li>
  )
}



