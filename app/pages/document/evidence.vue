<template>
  <div class="p-6 space-y-6">
    <!-- Header Card -->
    <UCard>
      <template #header>
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Document Management</p>
            <h1 class="text-2xl font-bold mt-1">Evidence List</h1>
            <p class="text-gray-600 dark:text-gray-300 mt-2">
              Track references to supporting documentation and evidence that substantiate the claims made in the CRA technical documentation.
            </p>
          </div>
          <UButton to="/document/preview" color="gray" variant="ghost" icon="i-heroicons-arrow-right" trailing>
            Document Preview
          </UButton>
        </div>
      </template>

      <div class="prose dark:prose-invert max-w-none mb-6">
        <p class="text-sm">
          This section provides a centralized list of evidence references. Each entry can link to documents, test reports, design specifications, or other artifacts that support conformance claims.
        </p>
      </div>

      <div class="border-t border-gray-200 dark:border-gray-800 pt-6">
        <RichTextEditor v-model="form.evidenceListHtml" min-height="400px" placeholder="List evidence references and supporting documentation..." />
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
  evidenceListHtml: '',
})
const hydrating = ref(false)
let unsubscribe: (() => void) | null = null

function hydrate(state: DocumentWorkspaceState) {
  hydrating.value = true
  const evidenceList = state.documentEvidence?.evidenceListHtml || ''
  if (form.evidenceListHtml !== evidenceList) {
    form.evidenceListHtml = evidenceList
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
  () => form.evidenceListHtml,
  (value) => {
    if (hydrating.value) return
    workspace.updateDocumentEvidenceState({ evidenceListHtml: value })
  },
  { flush: 'sync' }
)
</script>
