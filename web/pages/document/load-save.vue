<template>
  <div class="card storage-card">
    <header class="storage-header">
      <div>
        <h1>Load & Save</h1>
        <p>Backup or restore the Document Management workspace.</p>
      </div>
      <div class="action-row">
        <button class="btn" type="button" @click="refreshState">Refresh</button>
        <label class="btn ghost" for="document-workspace-upload">
          Load Workspace
          <input
            id="document-workspace-upload"
            ref="fileInput"
            type="file"
            accept=".json"
            @change="handleImport"
          />
        </label>
        <button class="btn primary" type="button" @click="exportWorkspace">Save Workspace</button>
        <button class="btn danger" type="button" @click="clearWorkspace">Clear</button>
      </div>
    </header>

    <section class="storage-content">
      <h2>Current snapshot</h2>
      <pre>{{ formattedState }}</pre>
    </section>

    <p v-if="statusMessage" :class="['status', statusType]">
      {{ statusMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type {
} from '../../services/documentWorkspace'

const workspace = useDocumentWorkspace()

const workspaceState = ref(workspace.loadDocumentWorkspace())
const statusMessage = ref('')
const statusType = ref<'success' | 'error'>('success')
const fileInput = ref<HTMLInputElement | null>(null)
let unsubscribe: (() => void) | null = null

onMounted(() => {
  unsubscribe = workspace.subscribeDocumentWorkspace((state) => {
    workspaceState.value = state
  })
})

onUnmounted(() => {
  unsubscribe?.()
})

function refreshState() {
  workspaceState.value = workspace.loadDocumentWorkspace()
}

function exportWorkspace() {
  const payload = workspace.exportDocumentWorkspace()
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `CRA_Document_Workspace_${new Date().toISOString().split('T')[0]}.json`
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
      workspaceState.value = workspace.importDocumentWorkspace(parsed)
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
  workspaceState.value = workspace.clearDocumentWorkspace()
  showStatus('Workspace cleared.', 'success')
}

function showStatus(message: string, type: 'success' | 'error') {
  statusMessage.value = message
  statusType.value = type
  setTimeout(() => (statusMessage.value = ''), 4000)
}

const formattedState = computed(() => JSON.stringify(workspaceState.value, null, 2))
</script>

<style scoped>
.storage-card {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.storage-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 16px;
}

.action-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.action-row input[type='file'] {
  display: none;
}

.btn.ghost {
  background: transparent;
  border: 1px dashed var(--panel-border);
}

.storage-content pre {
  background: var(--surface);
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  padding: 20px;
  max-height: 320px;
  overflow: auto;
  font-size: 0.9rem;
  white-space: pre-wrap;
  word-break: break-word;
}

.status {
  font-weight: 600;
}

.status.success {
  color: var(--success);
}

.status.error {
  color: var(--danger);
}
</style>
