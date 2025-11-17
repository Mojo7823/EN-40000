<template>
  <div class="card demo-card">
    <header class="demo-header">
      <div>
        <h1>Workspace Save / Load</h1>
        <p>Export or import the combined state of all demo pages.</p>
      </div>
      <div class="action-row">
        <button class="btn" type="button" @click="refreshState">Refresh</button>
        <label class="btn ghost" for="workspace-upload">
          Load Workspace
          <input id="workspace-upload" ref="fileInput" type="file" accept=".json" @change="handleImport" />
        </label>
        <button class="btn primary" type="button" @click="exportWorkspace">Save Workspace</button>
        <button class="btn danger" type="button" @click="clearWorkspace">Clear</button>
      </div>
    </header>

    <section class="demo-content">
      <h2>Current snapshot</h2>
      <pre>{{ formattedState }}</pre>
    </section>

    <p v-if="statusMessage" :class="['status', statusType]">
      {{ statusMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  clearDemoState,
  exportDemoState,
  importDemoState,
  loadDemoState,
} from '../../services/demoStorage'

const demoState = ref(loadDemoState())
const statusMessage = ref('')
const statusType = ref<'success' | 'error'>('success')
const fileInput = ref<HTMLInputElement | null>(null)

onMounted(() => refreshState())

function refreshState() {
  demoState.value = loadDemoState()
}

function exportWorkspace() {
  const payload = exportDemoState()
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `CRA Tool_Demo_${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  showStatus('Workspace saved!', 'success')
}

function handleImport(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string
      const parsed = JSON.parse(content)
      demoState.value = importDemoState(parsed)
      showStatus('Workspace loaded successfully.', 'success')
    } catch (error) {
      console.error(error)
      showStatus('Failed to import workspace. Please check the file format.', 'error')
    } finally {
      if (fileInput.value) {
        fileInput.value.value = ''
      }
    }
  }
  reader.readAsText(file)
}

function clearWorkspace() {
  demoState.value = clearDemoState()
  showStatus('Workspace cleared.', 'success')
}

function showStatus(message: string, type: 'success' | 'error') {
  statusMessage.value = message
  statusType.value = type
  setTimeout(() => (statusMessage.value = ''), 4000)
}

const formattedState = computed(() => JSON.stringify(demoState.value, null, 2))
</script>

<style scoped src="./StorageDemo.css"></style>
