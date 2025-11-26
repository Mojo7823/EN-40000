<template>
  <div class="container mx-auto p-6 space-y-6">
    <!-- Header Card -->
    <UCard
      class="border-primary-200 dark:border-primary-800 bg-gradient-to-r from-primary-50/80 via-white to-white dark:from-primary-950 dark:via-gray-950 dark:to-gray-900"
    >
      <template #header>
        <div class="flex items-start justify-between">
          <div>
            <p class="text-xs uppercase tracking-wide text-primary-700 dark:text-primary-300 font-semibold">Section 5</p>
            <h1 class="text-3xl font-bold mt-2 text-gray-900 dark:text-white">Risk Management Elements</h1>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
              [Reference: Clause 6 - Risk management elements]
            </p>
          </div>
          <UButton to="/document/preview" color="primary" variant="soft" icon="i-heroicons-arrow-right" trailing>
            Document Preview
          </UButton>
        </div>
      </template>
    </UCard>

    <!-- Section 5.1 Card -->
    <UCard>
      <template #header>
        <div>
          <p class="text-xs uppercase tracking-wide text-primary-700 dark:text-primary-300 font-semibold">Section 5.1</p>
          <h2 class="text-xl font-bold mt-2 text-gray-900 dark:text-white">General Approach to Risk Management</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">[Reference: Clause 6.1 - General]</p>
        </div>
      </template>

      <div class="prose dark:prose-invert max-w-none mb-6">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          This section describes how <strong>{{ productName }}</strong> applies risk management throughout its lifecycle
          to ensure an appropriate level of cybersecurity.
        </p>
      </div>
    </UCard>

    <!-- Risk Management Framework Editor Card -->
    <UCard>
      <template #header>
        <div>
          <p class="text-xs uppercase tracking-wide text-primary-700 dark:text-primary-300 font-semibold">Content</p>
          <h2 class="text-xl font-bold mt-2 text-gray-900 dark:text-white">Risk Management Framework Applied</h2>
        </div>
      </template>

      <RichTextEditor v-model="form.generalApproachHtml" min-height="400px" placeholder="Describe the risk management framework applied..." />
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import type { DocumentWorkspaceState } from '~/services/documentWorkspace'

const workspace = useDocumentWorkspace()

const workspaceState = ref<DocumentWorkspaceState>(workspace.loadDocumentWorkspace())
const form = reactive({
  generalApproachHtml: '',
})
const hydrating = ref(false)
let unsubscribe: (() => void) | null = null

const productName = computed(() => {
  return workspaceState.value.introduction?.productName || workspaceState.value.cover?.deviceName || '[Product Name]'
})

function hydrate(state: DocumentWorkspaceState) {
  hydrating.value = true
  const riskManagement = state.riskManagement || {
    generalApproachHtml: '',
  }
  form.generalApproachHtml = riskManagement.generalApproachHtml || ''
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
  () => form.generalApproachHtml,
  (value) => {
    if (hydrating.value) return
    workspace.updateRiskManagementState({ generalApproachHtml: value })
  },
  { flush: 'sync' }
)
</script>
