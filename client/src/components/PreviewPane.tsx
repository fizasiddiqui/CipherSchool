import { SandpackProvider, SandpackPreview, SandpackLayout } from '@codesandbox/sandpack-react'
import type { SandpackFiles } from '@codesandbox/sandpack-react'
import { useMemo } from 'react'
import { useProjectStore } from '../store/projectStore'
import { LocalPreview } from './LocalPreview'

export function PreviewPane() {
  const { files, previewMode } = useProjectStore()
  const spFiles = useMemo(() => {
    const out: SandpackFiles = {}
    for (const [p, node] of Object.entries(files)) {
      out['/' + p] = node.content
    }
    return out
  }, [files])

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '6px 8px', borderBottom: '1px solid #e5e7eb', fontSize: 12 }}>Live Preview</div>
      <div style={{ flex: 1, minHeight: 0 }}>
        {previewMode === 'local' ? (
          <LocalPreview />
        ) : (
        <SandpackProvider
          template="react-ts"
          files={spFiles}
          customSetup={{
            dependencies: {
              react: '^18.2.0',
              'react-dom': '^18.2.0',
            },
          }}
          options={{ bundlerURL: 'https://sandpack.codesandbox.io', recompileMode: 'immediate', recompileDelay: 0, externalResources: [] }}
        >
          <SandpackLayout>
            <SandpackPreview style={{ height: '100%' }} showOpenInCodeSandbox={false} showRefreshButton />
          </SandpackLayout>
        </SandpackProvider>
        )}
      </div>
    </div>
  )
}



