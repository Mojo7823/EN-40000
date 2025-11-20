export const useApi = () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase

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
