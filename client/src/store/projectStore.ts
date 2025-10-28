import { create } from 'zustand';

export type FileNode = {
	path: string; // e.g. src/App.tsx
	content: string;
};

export type ProjectState = {
	projectId: string;
	files: Record<string, FileNode>; // key is path
	activePath: string;
	autosave: boolean;
	previewMode: 'sandpack' | 'local';
	setProjectId: (id: string) => void;
	setActivePath: (path: string) => void;
	upsertFile: (path: string, content?: string) => void;
	deleteFile: (path: string) => void;
	deleteFolder: (path: string) => void;
	renameFile: (oldPath: string, newPath: string) => void;
	setAutosave: (value: boolean) => void;
	setPreviewMode: (mode: 'sandpack' | 'local') => void;
	loadFromLocalStorage: (id: string) => void;
	saveToLocalStorage: () => void;
};

const DEFAULT_FILES: Record<string, FileNode> = {
	'index.html': {
		path: 'index.html',
		content:
			`<!doctype html>\n<html>\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>CipherStudio</title>\n  </head>\n  <body>\n    <div id="root"></div>\n  </body>\n</html>\n`,
	},
	'App.js': {
		path: 'App.js',
		content:
			`import React, { useState } from "react";
import Product from "./Product";

function App() {
  const products = [
    { id: 1, name: "Laptop", price: 60000 },
    { id: 2, name: "Headphones", price: 2000 },
    { id: 3, name: "Smartphone", price: 25000 },
  ];

  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>🛒 React Shopping Cart</h1>

      <h2>Products</h2>
      <ul>
        {products.map((item) => (
          <Product key={item.id} product={item} addToCart={addToCart} />
        ))}
      </ul>

      <h2>Cart ({cart.length} items)</h2>
      <ul>
        {cart.map((item, index) => (
          <li key={index}>
            {item.name} - ₹{item.price}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;`,
	},
	'Product.js': {
		path: 'Product.js',
		content:
			`import React from "react";

function Product({ product, addToCart }) {
  return (
    <li style={{ margin: "10px 0" }}>
      {product.name} - ₹{product.price}{" "}
      <button onClick={() => addToCart(product)}>Add to Cart</button>
    </li>
  );
}

export default Product;`,
	},
};

export const useProjectStore = create<ProjectState>((set, get) => ({
	projectId: 'demo',
	files: DEFAULT_FILES,
	activePath: 'App.js',
	autosave: true,
	previewMode: 'local',
	setProjectId: (id) => set({ projectId: id }),
	setActivePath: (path) => set({ activePath: path }),
	upsertFile: (path, content) =>
		set((state) => {
			const existing = state.files[path];
			const updated: FileNode = {
				path,
				content: content ?? existing?.content ?? '',
			};
			const files = { ...state.files, [path]: updated };
			return { files };
		}),
	deleteFile: (path) =>
		set((state) => {
			const files = { ...state.files };
			delete files[path];
			const activePath = state.activePath === path ? Object.keys(files)[0] ?? '' : state.activePath;
			return { files, activePath };
		}),
	deleteFolder: (path) =>
		set((state) => {
			const files = { ...state.files };
			const folderPath = path.endsWith('/') ? path : path + '/';
			
			// Delete all files that start with the folder path
			Object.keys(files).forEach(filePath => {
				if (filePath.startsWith(folderPath)) {
					delete files[filePath];
				}
			});
			
			// Also delete the folder marker if it exists
			delete files[folderPath + '.folder'];
			
			const activePath = state.activePath.startsWith(folderPath) ? Object.keys(files)[0] ?? '' : state.activePath;
			return { files, activePath };
		}),
	renameFile: (oldPath, newPath) =>
		set((state) => {
			if (!state.files[oldPath]) return {} as any;
			const files = { ...state.files };
			const node = files[oldPath];
			delete files[oldPath];
			files[newPath] = { path: newPath, content: node.content };
			const activePath = state.activePath === oldPath ? newPath : state.activePath;
			return { files, activePath };
		}),
	setAutosave: (value) => set({ autosave: value }),
	setPreviewMode: (mode) => set({ previewMode: mode }),
	loadFromLocalStorage: (id) => {
		const raw = localStorage.getItem(`cipherstudio:${id}`);
		if (raw) {
			try {
				const parsed = JSON.parse(raw) as { files: Record<string, FileNode>; activePath?: string };
				set({ projectId: id, files: parsed.files, activePath: parsed.activePath || Object.keys(parsed.files)[0] });
				return;
			} catch {}
		}
		// fallback default
		set({ projectId: id, files: DEFAULT_FILES, activePath: 'src/App.tsx' });
	},
	saveToLocalStorage: () => {
		const { projectId, files, activePath } = get();
		localStorage.setItem(`cipherstudio:${projectId}`, JSON.stringify({ files, activePath }));
	},
}));



