import { useEffect, useMemo, useRef, useState } from 'react'
import { useProjectStore } from '../store/projectStore'

// Simple React compiler - bundles all files and renders them
export function LocalPreview() {
  const { files } = useProjectStore()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [error, setError] = useState<string | null>(null)

  const entryHtml = useMemo(() => files['index.html']?.content || '<div id="root"></div>', [files])

  useEffect(() => {
    try {
      setError(null)
      
      // Get all JS/TS files
      const jsFiles = Object.entries(files).filter(([path, file]) => 
        /\.(js|jsx|ts|tsx)$/.test(path) && file.content.trim()
      )
      
      if (jsFiles.length === 0) {
        setError('No JavaScript/TypeScript files found')
        return
      }

      console.log('Processing files:', jsFiles.map(([path]) => path))

      // Simple bundler: combine all files into one
      let bundledCode = ''
      
      // Create a simple module system
      const moduleExports = new Map<string, Array<{ name: string; value: string }>>()
      const moduleImports = new Map<string, Array<{ name: string; from: string }>>()
      
      // First pass: collect all exports
      for (const [path, file] of jsFiles) {
        const exports: Array<{ name: string; value: string }> = []
        const imports: Array<{ name: string; from: string }> = []
        
        // Find export default
        const defaultExportMatch = file.content.match(/export\s+default\s+(?:function\s+)?([A-Za-z_\$][\w\$]*)/)
        if (defaultExportMatch) {
          exports.push({ name: 'default', value: defaultExportMatch[1] })
        }
        
        // Find named exports
        const namedExports = file.content.match(/export\s+(?:function|const|let|var)\s+([A-Za-z_\$][\w\$]*)/g)
        if (namedExports) {
          namedExports.forEach(exp => {
            const match = exp.match(/export\s+(?:function|const|let|var)\s+([A-Za-z_\$][\w\$]*)/)
            if (match) {
              const name = match[1]
              exports.push({ name, value: name })
            }
          })
        }
        
        // Find imports
        const importMatches = file.content.match(/import\s+([A-Za-z_\$][\w\$]*)\s+from\s+['"]([^'"]+)['"]/g)
        if (importMatches) {
          importMatches.forEach(imp => {
            const match = imp.match(/import\s+([A-Za-z_\$][\w\$]*)\s+from\s+['"]([^'"]+)['"]/)
            if (match) {
              imports.push({ name: match[1], from: match[2] })
            }
          })
        }
        
        moduleExports.set(path, exports)
        moduleImports.set(path, imports)
      }
      
      // Process each file
      for (const [path, file] of jsFiles) {
        try {
          let code = file.content
          
          // Handle React imports - keep them as they are needed
          code = code.replace(/import\s+React[^;]+;?\s*/g, '')
          code = code.replace(/import\s+{([^}]+)}\s+from\s+['"]react['"];?\s*/g, '')
          
          // Remove other import statements (we'll handle them manually)
          code = code.replace(/import\s+[^;]+;?\s*/g, '')
          
          // Transform export default to regular function/const
          code = code.replace(/export\s+default\s+function\s+([A-Za-z_\$][\w\$]*)/g, 'function $1')
          code = code.replace(/export\s+default\s+/g, 'const __defaultExport = ')
          
          // Remove other export statements
          code = code.replace(/export\s+(?:function|const|let|var)\s+/g, '')
          
          // Add to bundled code
          bundledCode += `\n// === ${path} ===\n${code}\n`
          
        } catch (e: any) {
          console.warn(`Error processing ${path}:`, e)
          bundledCode += `\n// Error in ${path}: ${e}\n`
        }
      }

      // Create import resolution code
      let importResolutionCode = ''
      for (const [path, imports] of moduleImports) {
        for (const imp of imports) {
          // Resolve the import path
          let resolvedPath = imp.from
          if (imp.from.startsWith('./')) {
            const baseDir = path.includes('/') ? path.substring(0, path.lastIndexOf('/')) : ''
            resolvedPath = baseDir ? `${baseDir}/${imp.from.slice(2)}` : imp.from.slice(2)
          }
          
          // Find the actual file
          const candidates = [
            resolvedPath,
            `${resolvedPath}.js`,
            `${resolvedPath}.jsx`,
            `${resolvedPath}.ts`,
            `${resolvedPath}.tsx`
          ]
          const foundFile = candidates.find(c => files[c])
          
          if (foundFile) {
            // Create a simple variable assignment for the import
            importResolutionCode += `\n// Import resolution for ${path}\n`
            importResolutionCode += `const ${imp.name} = (() => {\n`
            
            // Get the exports from the target file
            const targetExports = moduleExports.get(foundFile) || []
            const defaultExport = targetExports.find(e => e.name === 'default')
            
            if (defaultExport) {
              importResolutionCode += `  return ${defaultExport.value};\n`
            } else {
              importResolutionCode += `  return null; // No default export found\n`
            }
            importResolutionCode += `})();\n`
          } else {
            importResolutionCode += `\n// Import not found: ${imp.name} from ${imp.from}\n`
            importResolutionCode += `const ${imp.name} = null;\n`
          }
        }
      }

      console.log('Bundled code:', bundledCode)
      console.log('Import resolution code:', importResolutionCode)
      
      // Create the HTML with React runtime
      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>React Preview</title>
  <style>
    body { 
      font-family: system-ui, -apple-system, sans-serif; 
      margin: 0; 
      padding: 16px; 
      background: #f5f5f5;
      color: #333;
    }
    #root { min-height: 100vh; }
  </style>
</head>
<body>
  ${entryHtml}
  
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script>
    // React and hooks declarations
    const { useState, useEffect, useRef, useMemo } = React;
    
    // Import resolution
    ${importResolutionCode}
    
    // Bundled code
    ${bundledCode}
    
    // Auto-detect and render the main component
    (function() {
      try {
        console.log('Starting component detection...');
        
        // Look for App component first
        let App = null;
        
        // Check if App is defined globally
        if (typeof App !== 'undefined') {
          console.log('Found App component globally');
          App = App;
        } else if (typeof __defaultExport !== 'undefined') {
          console.log('Found default export:', __defaultExport);
          App = __defaultExport;
        } else {
          // Look for any function that might be a React component
          const functions = Object.getOwnPropertyNames(window).filter(name => 
            typeof window[name] === 'function' && 
            name.charAt(0) === name.charAt(0).toUpperCase()
          );
          console.log('Available functions:', functions);
          if (functions.length > 0) {
            App = window[functions[0]];
            console.log('Using function:', functions[0]);
          }
        }
        
        console.log('Final App component:', App);
        
        if (App && typeof App === 'function') {
          console.log('Rendering App component...');
          const root = ReactDOM.createRoot(document.getElementById('root'));
          root.render(React.createElement(App));
          console.log('App component rendered successfully');
        } else {
          console.log('No valid App component found');
          document.getElementById('root').innerHTML = '<div style="padding: 20px; color: #666;">No React component found. Make sure you have a default export.</div>';
        }
      } catch (error) {
        console.error('Render error:', error);
        document.getElementById('root').innerHTML = '<div style="padding: 20px; color: red;">Error: ' + error.message + '</div>';
      }
    })();
  </script>
</body>
</html>`

      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      if (iframeRef.current) {
        iframeRef.current.src = url
      }
      
      return () => URL.revokeObjectURL(url)
    } catch (e: any) {
      setError(e?.message || 'Compile error')
    }
  }, [files, entryHtml])

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--panel-border)', fontSize: 12, background: 'var(--panel)', color: 'var(--text)' }}>
        🚀 React Compiler (Local)
      </div>
      {error && (
        <div style={{ color: 'tomato', padding: 12, fontSize: 12, background: '#2d1b1b', borderBottom: '1px solid #4a2a2a' }}>
          {error}
        </div>
      )}
      <iframe 
        ref={iframeRef} 
        style={{ border: 'none', flex: 1, background: 'white' }}
        title="React Preview"
      />
    </div>
  )
}


