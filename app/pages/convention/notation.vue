<template>
  <div class="container mx-auto p-6 space-y-6">
    <!-- Header Card -->
    <UCard
      class="border-primary-200 dark:border-primary-800 bg-gradient-to-r from-primary-50/80 via-white to-white dark:from-primary-950 dark:via-gray-950 dark:to-gray-900"
    >
      <template #header>
        <div class="flex items-start justify-between">
          <div>
            <p class="text-xs uppercase tracking-wide text-primary-700 dark:text-primary-300 font-semibold">Document Convention</p>
            <h1 class="text-3xl font-bold mt-2 text-gray-900 dark:text-white">Notation</h1>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
              This section explains symbols or technical notation adopted within the CRA documentation.
            </p>
          </div>
          <UButton to="/document/preview" color="primary" variant="soft" icon="i-heroicons-arrow-right" trailing>
            Document Preview
          </UButton>
        </div>
      </template>
    </UCard>

    <!-- Evidence Notation Card -->
    <UCard>
      <template #header>
        <div>
          <p class="text-xs uppercase tracking-wide text-primary-700 dark:text-primary-300 font-semibold">Clause 4.2</p>
          <h2 class="text-xl font-bold mt-2 text-gray-900 dark:text-white">Evidence Notation</h2>
        </div>
      </template>

      <div class="mb-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Describe how evidence references are formatted, highlighted, and catalogued.
        </p>
      </div>

      <RichTextEditor v-model="form.evidenceNotationHtml" min-height="220px" placeholder="Describe evidence notation conventions..." />
    </UCard>

    <!-- Requirement Notation Card -->
    <UCard>
      <template #header>
        <div>
          <p class="text-xs uppercase tracking-wide text-primary-700 dark:text-primary-300 font-semibold">Clause 4.3</p>
          <h2 class="text-xl font-bold mt-2 text-gray-900 dark:text-white">Requirement Notation</h2>
        </div>
      </template>

      <div class="mb-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Explain how EN 40000 requirements are cited and distinguish user guidance from normative text.
        </p>
      </div>

      <RichTextEditor v-model="form.requirementNotationHtml" min-height="220px" placeholder="Describe requirement notation conventions..." />
    </UCard>

    <!-- Assessment Verdicts Card -->
    <UCard>
      <template #header>
        <div>
          <p class="text-xs uppercase tracking-wide text-primary-700 dark:text-primary-300 font-semibold">Clause 4.4</p>
          <h2 class="text-xl font-bold mt-2 text-gray-900 dark:text-white">Assessment Verdicts</h2>
        </div>
      </template>

      <div class="mb-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Outline the verdict categories and criteria for determining conformance.
        </p>
      </div>

      <RichTextEditor v-model="form.assessmentVerdictsHtml" min-height="220px" placeholder="Describe assessment verdict criteria..." />
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import type { DocumentWorkspaceState } from '~/services/documentWorkspace'

const workspace = useDocumentWorkspace()

const workspaceState = ref<DocumentWorkspaceState>(workspace.loadDocumentWorkspace())
const form = reactive({
  evidenceNotationHtml: '',
  requirementNotationHtml: '',
  assessmentVerdictsHtml: '',
})
const hydrating = ref(false)
let unsubscribe: (() => void) | null = null

function hydrate(state: DocumentWorkspaceState) {
  hydrating.value = true
  const documentConvention = state.documentConvention
  form.evidenceNotationHtml = documentConvention.evidenceNotationHtml
  form.requirementNotationHtml = documentConvention.requirementNotationHtml
  form.assessmentVerdictsHtml = documentConvention.assessmentVerdictsHtml
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
  () => form.evidenceNotationHtml,
  (value) => {
    if (hydrating.value) return
    workspace.updateDocumentConventionState({ evidenceNotationHtml: value })
  },
  { flush: 'sync' }
)

watch(
  () => form.requirementNotationHtml,
  (value) => {
    if (hydrating.value) return
    workspace.updateDocumentConventionState({ requirementNotationHtml: value })
  },
  { flush: 'sync' }
)

watch(
  () => form.assessmentVerdictsHtml,
  (value) => {
    if (hydrating.value) return
    workspace.updateDocumentConventionState({ assessmentVerdictsHtml: value })
  },
  { flush: 'sync' }
)
</script>
