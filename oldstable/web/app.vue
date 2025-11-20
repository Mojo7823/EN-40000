<template>
  <div class="layout">
    <aside class="sidebar">
      <ClientOnly>
        <Sidebar />
      </ClientOnly>
    </aside>
    <header class="navbar">
      <div class="brand">CRA Tool</div>
      <div class="navbar-actions">
        <div class="status">
          <span>DB:</span>
          <span :class="['badge', health.status]">{{ health.status }} ({{ health.latency_ms }}ms)</span>
        </div>
        <button
          class="btn theme-toggle"
          type="button"
          :aria-label="themeToggleLabel"
          @click="toggleTheme"
        >
          <span class="theme-toggle-icon" aria-hidden="true">{{ theme === 'light' ? '🌙' : '🌞' }}</span>
          <span class="theme-toggle-text">{{ theme === 'light' ? 'Dark Mode' : 'Light Mode' }}</span>
        </button>
      </div>
    </header>
    <main class="main">
      <NuxtPage />
    </main>
  </div>
</template>

<script setup lang="ts">
type Health = { status: 'ok' | 'degraded' | string; latency_ms: number }

const health = ref<Health>({ status: 'degraded', latency_ms: 0 })
const THEME_KEY = 'cratool_theme'
const theme = ref<'light' | 'dark'>('light')

const themeToggleLabel = computed(() =>
  theme.value === 'light' ? 'Switch to dark mode' : 'Switch to light mode'
)

function applyTheme(value: 'light' | 'dark') {
  if (process.client) {
    const root = document.documentElement
    root.classList.remove('theme-light', 'theme-dark')
    root.classList.add(value === 'dark' ? 'theme-dark' : 'theme-light')
    localStorage.setItem(THEME_KEY, value)
  }
}

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}

async function poll() {
  try {
    const data = await $fetch<Health>('/api/health')
    if (data) {
      health.value = {
        status: data.status,
        latency_ms: data.latency_ms
      }
    }
  } catch {
    health.value = { status: 'degraded', latency_ms: 0 }
  }
}

watch(theme, (newTheme) => {
  applyTheme(newTheme)
})

onMounted(() => {
  if (process.client) {
    const storedTheme = localStorage.getItem(THEME_KEY)
    if (storedTheme === 'light' || storedTheme === 'dark') {
      theme.value = storedTheme
    }
    applyTheme(theme.value)
    poll()
    setInterval(poll, 5000)
  }
})
</script>

<style>
@import './assets/css/main.css';
</style>
