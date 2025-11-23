<template>
  <div class="container mx-auto p-6">
    <UCard>
      <template #header>
        <div class="flex flex-wrap justify-between items-start gap-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Load & Save</h1>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Backup or restore the Document Management workspace.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <UButton
              variant="ghost"
              color="gray"
              icon="i-heroicons-arrow-path"
              @click="refreshState"
            >
              Refresh
            </UButton>
            <UButton
              variant="outline"
              color="primary"
              icon="i-heroicons-arrow-up-tray"
              @click="triggerFileInput"
            >
              Load Workspace
            </UButton>
            <input
              ref="fileInput"
              type="file"
              accept=".json"
              class="hidden"
              @change="handleImport"
            />
            <UButton
              color="primary"
              icon="i-heroicons-arrow-down-tray"
              @click="exportWorkspace"
            >
              Save Workspace
            </UButton>
            <UButton
              color="red"
              variant="soft"
              icon="i-heroicons-trash"
              @click="confirmClear"
            >
              Clear
            </UButton>
          </div>
        </div>
      </template>

      <div class="space-y-4">
        <div>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Current Snapshot
          </h2>
          <pre class="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-5 max-h-80 overflow-auto text-sm font-mono whitespace-pre-wrap break-words">{{ formattedState }}</pre>
        </div>
      </div>
    </UCard>

    <!-- Confirm Clear Modal -->
    <UModal v-model:open="showClearModal" title="Clear Workspace?" description="Are you sure you want to clear the entire workspace? This action cannot be undone.">
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" color="gray" @click="showClearModal = false">
            Cancel
          </UButton>
          <UButton color="red" @click="clearWorkspace">
            Clear Workspace
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
const workspace = useDocumentWorkspace()
const toast = useToast()

const workspaceState = ref(workspace.loadDocumentWorkspace())
const fileInput = ref<HTMLInputElement | null>(null)
const showClearModal = ref(false)
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
  toast.add({
    title: 'Refreshed',
    description: 'Workspace state refreshed successfully.',
    color: 'green',
    icon: 'i-heroicons-check-circle'
  })
}

function triggerFileInput() {
  fileInput.value?.click()
}

function exportWorkspace() {
  try {
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
    
    toast.add({
      title: 'Workspace Saved',
      description: 'Your workspace has been exported successfully.',
      color: 'green',
      icon: 'i-heroicons-check-circle'
    })
  } catch (error) {
    console.error('Export failed:', error)
    toast.add({
      title: 'Export Failed',
      description: 'Failed to export workspace. Please try again.',
      color: 'red',
      icon: 'i-heroicons-x-circle'
    })
  }
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
      
      toast.add({
        title: 'Workspace Loaded',
        description: 'Your workspace has been imported successfully.',
        color: 'green',
        icon: 'i-heroicons-check-circle'
      })
    } catch (error) {
      console.error('Import failed:', error)
      toast.add({
        title: 'Import Failed',
        description: 'Failed to import workspace. Please check the file format.',
        color: 'red',
        icon: 'i-heroicons-x-circle'
      })
    } finally {
      if (fileInput.value) {
        fileInput.value.value = ''
      }
    }
  }
  reader.readAsText(file)
}

function confirmClear() {
  showClearModal.value = true
}

function clearWorkspace() {
  workspaceState.value = workspace.clearDocumentWorkspace()
  showClearModal.value = false
  
  toast.add({
    title: 'Workspace Cleared',
    description: 'All workspace data has been cleared.',
    color: 'orange',
    icon: 'i-heroicons-trash'
  })
}

const formattedState = computed(() => JSON.stringify(workspaceState.value, null, 2))
</script>
