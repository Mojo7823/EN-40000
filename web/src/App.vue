<template>
  <div class="layout">
    <aside class="sidebar">
      <Sidebar />
    </aside>
    <header class="navbar">
      <div class="brand">CCGenTool2</div>
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
      <router-view />
    </main>
  </div>
  
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import Sidebar from './components/Sidebar.vue'
import api from './services/api'

type Health = { status: 'ok'|'degraded'|string, latency_ms: number }
const health = ref<Health>({ status: 'degraded', latency_ms: 0 })
const THEME_KEY = 'ccgentool2_theme'
const theme = ref<'light' | 'dark'>('light')

const themeToggleLabel = computed(() =>
  theme.value === 'light' ? 'Switch to dark mode' : 'Switch to light mode'
)

function applyTheme(value: 'light' | 'dark') {
  if (typeof document === 'undefined') {
    return
  }

  const root = document.documentElement
  root.classList.remove('theme-light', 'theme-dark')
  root.classList.add(value === 'dark' ? 'theme-dark' : 'theme-light')
  localStorage.setItem(THEME_KEY, value)
}

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}

async function poll() {
  try{
    const res = await api.get('/health')
    health.value = { status: res.data.status, latency_ms: res.data.latency_ms }
  } catch {
    health.value = { status: 'degraded', latency_ms: 0 }
  }
}

watch(theme, newTheme => {
  applyTheme(newTheme)
})

onMounted(() => {
  if (typeof localStorage !== 'undefined') {
    const storedTheme = localStorage.getItem(THEME_KEY)
    if (storedTheme === 'light' || storedTheme === 'dark') {
      theme.value = storedTheme
    }
  }

  applyTheme(theme.value)
  poll()
  setInterval(poll, 5000)
})
</script>

<style scoped>
.navbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.theme-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 13px;
}

.theme-toggle-icon {
  font-size: 16px;
  line-height: 1;
}

.theme-toggle-text {
  font-weight: 500;
}
</style>
