<template>
  <div class="p-6 space-y-6">
    <!-- Header Card -->
    <UCard>
      <template #header>
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Document Convention</p>
            <h1 class="text-2xl font-bold mt-1">Notation</h1>
            <p class="text-sm font-medium text-gray-700 dark:text-gray-300">[Reference: Clause 4.2 - Notation]</p>
            <p class="text-gray-600 dark:text-gray-300 mt-2">
              This section explains symbols or technical notation adopted within the CRA documentation.
            </p>
          </div>
          <UButton to="/document/preview" color="gray" variant="ghost" icon="i-heroicons-arrow-right" trailing>
            Document Preview
          </UButton>
        </div>
      </template>

      <div class="prose dark:prose-invert max-w-none mb-6">
        <p class="text-lg font-semibold text-primary-600 dark:text-primary-400">4.2 Notation and Conventions</p>
        <p class="text-sm">
          Provide examples of notation used for requirement identifiers, security functional components, diagrams, or data structures.
        </p>
      </div>

      <div class="border-t border-gray-200 dark:border-gray-800 pt-6">
        <RichTextEditor v-model="form.notationHtml" min-height="300px" placeholder="Describe notation conventions used in this document..." />
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import type { DocumentWorkspaceState } from '~/services/documentWorkspace'

const workspace = useDocumentWorkspace()

const workspaceState = ref<DocumentWorkspaceState>(workspace.loadDocumentWorkspace())
const form = reactive({
  notationHtml: '',
})
const hydrating = ref(false)
let unsubscribe: (() => void) | null = null

function hydrate(state: DocumentWorkspaceState) {
  hydrating.value = true
  const notation = state.documentConvention.notationHtml || ''
  if (form.notationHtml !== notation) {
    form.notationHtml = notation
  }
  hydrating.value = false
}

onMounted(() => {
  hydrate(workspaceState.value)
  unsubscribe = workspace.subscribeDocumentWorkspace((state) => {
    workspaceState.value = state
    hydrate(state)
  })
})

onUnmounted(() => {
  unsubscribe?.()
})

watch(
  () => form.notationHtml,
  (value) => {
    if (hydrating.value) return
    workspace.updateDocumentConventionState({ notationHtml: value })
  },
  { flush: 'sync' }
)
</script>
