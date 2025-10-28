export type BackendProjectPayload = {
	files: Record<string, { path: string; content: string }>
	activePath: string
}

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'
const TOKEN = import.meta.env.VITE_JWT || ''

export async function saveProject(projectId: string, payload: BackendProjectPayload) {
	await fetch(`${API_BASE}/projects/${encodeURIComponent(projectId)}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
		},
		body: JSON.stringify(payload),
	})
}

export async function loadProject(projectId: string) {
	const res = await fetch(`${API_BASE}/projects/${encodeURIComponent(projectId)}`)
	if (!res.ok) throw new Error('Failed to load project')
	return (await res.json()) as { projectId: string; files: BackendProjectPayload['files']; activePath: string }
}



