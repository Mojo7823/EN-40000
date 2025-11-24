<script setup lang="ts">
const router = useRouter()
const workspace = useDocumentWorkspace()
const toast = useToast()
const fileInput = ref<HTMLInputElement | null>(null)

// Trigger file input for loading project files
function handleLoad() {
  fileInput.value?.click()
}

// Handle file import
function handleFileImport(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string
      const parsed = JSON.parse(content)
      workspace.importDocumentWorkspace(parsed)
      
      toast.add({
        title: 'Project Loaded',
        description: 'Your project has been loaded successfully.',
        color: 'green',
        icon: 'i-heroicons-check-circle'
      })
    } catch (error) {
      console.error('Import failed:', error)
      toast.add({
        title: 'Load Failed',
        description: 'Failed to load project. Please check the file format.',
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

// Navigate to cover page to start new project
function handleStartNew() {
  router.push('/document/cover')
}

// Save current workspace
function handleSave() {
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
      description: 'Your workspace has been saved successfully.',
      color: 'green',
      icon: 'i-heroicons-check-circle'
    })
  } catch (error) {
    console.error('Save failed:', error)
    toast.add({
      title: 'Save Failed',
      description: 'Failed to save workspace. Please try again.',
      color: 'red',
      icon: 'i-heroicons-x-circle'
    })
  }
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="text-center space-y-8 p-8">
      <!-- Welcome Section -->
      <div class="space-y-4">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white">
          Welcome to CRA Tool
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-400">
          Create and manage your Clinical Report Assessment documents
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
        <!-- Hidden file input -->
        <input
          ref="fileInput"
          type="file"
          accept=".json"
          class="hidden"
          @change="handleFileImport"
        />
        
        <!-- Load Button -->
        <UButton
          size="xl"
          color="primary"
          variant="outline"
          icon="i-heroicons-folder-open"
          @click="handleLoad"
          class="w-48"
        >
          Load Project
        </UButton>

        <!-- Start New Button -->
        <UButton
          size="xl"
          color="primary"
          icon="i-heroicons-plus-circle"
          @click="handleStartNew"
          class="w-48"
        >
          Start New
        </UButton>

        <!-- Save Button -->
        <UButton
          size="xl"
          color="primary"
          variant="outline"
          icon="i-heroicons-arrow-down-tray"
          @click="handleSave"
          class="w-48"
        >
          Save Project
        </UButton>
      </div>
    </div>
  </div>
</template>
