import axios from 'axios'

function resolveBaseURL(): string {
	const envUrl = (import.meta as any).env.VITE_API_BASE_URL
	if (envUrl) return envUrl
	// In dev, use Vite proxy at /api to avoid CORS and port juggling
	if ((import.meta as any).env.DEV) return '/api'
	// In prod, default to same host (no hardcoded port)
	if (typeof window !== 'undefined' && window.location) {
		const { protocol, hostname } = window.location
		return `${protocol}//${hostname}`
	}
	return 'http://localhost:8000'
}

// Use the resolved base URL instead of hardcoded port
const api = axios.create({
        baseURL: resolveBaseURL(),
        timeout: 60000
})

export default api
