export const useApi = () => {
  const config = useRuntimeConfig()
  let baseURL = config.public.apiBase

  // In dev, use Vite proxy at /api to avoid CORS if using default local address
  if (import.meta.dev && baseURL === 'http://127.0.0.1:8000') {
    baseURL = '/api'
  }

  return {
    get: async (url: string, options = {}) => {
      return await $fetch(url, {
        method: 'GET',
        baseURL,
        ...options
      })
    },
    post: async (url: string, data: any, options = {}) => {
      return await $fetch(url, {
        method: 'POST',
        baseURL,
        body: data,
        ...options
      })
    },
    put: async (url: string, data: any, options = {}) => {
      return await $fetch(url, {
        method: 'PUT',
        baseURL,
        body: data,
        ...options
      })
    },
    delete: async (url: string, options = {}) => {
      return await $fetch(url, {
        method: 'DELETE',
        baseURL,
        ...options
      })
    }
  }
}
