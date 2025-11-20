// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  
  modules: ['@nuxt/ui'],

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'CRA Tool',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'CRA Tool - Cyber Resilience Act Documentation Tool' }
      ]
    }
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://127.0.0.1:8000'
    }
  },

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/css/_variables.scss" as *;'
        }
      }
    }
  },

  nitro: {
    devProxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        prependPath: true
      }
    }
  },

  typescript: {
    strict: true,
    typeCheck: false
  }
})
