// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  srcDir: 'app',
  css: ['~/app.css'],

  modules: [
    '@nuxt/ui',
    '@nuxt/test-utils',
    '@nuxt/scripts',
    '@nuxt/image',
    '@nuxt/eslint',
    '@nuxt/content'
  ],

  hints: {
    hydration: false
  },

  routeRules: {
    '/api/items/**': { proxy: { to: 'http://localhost:8000/api/items/**' } },
    '/api/hello': { proxy: { to: 'http://localhost:8000/api/hello' } },
    '/api/health': { proxy: { to: 'http://localhost:8000/api/health' } }
  },

  nitro: {
    devProxy: {
      '/api/items': {
        target: 'http://localhost:8000/api/items',
        changeOrigin: true,
        prependPath: true
      },
      '/api/hello': {
        target: 'http://localhost:8000/api/hello',
        changeOrigin: true
      },
      '/api/health': {
        target: 'http://localhost:8000/api/health',
        changeOrigin: true
      }
    }
  }
})