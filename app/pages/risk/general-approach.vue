<template>
  <div class="p-6 space-y-6">
    <!-- Header Card -->
    <UCard>
      <template #header>
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Risk Management Elements</p>
            <h1 class="text-2xl font-bold mt-1">General Approach to Risk Management</h1>
            <p class="text-gray-600 dark:text-gray-300 mt-2">
              Document the overall risk management framework and approach used to identify, assess, and mitigate cybersecurity risks throughout the product lifecycle.
            </p>
          </div>
          <UButton to="/document/preview" color="gray" variant="ghost" icon="i-heroicons-arrow-right" trailing>
            Document Preview
          </UButton>
        </div>
      </template>

      <div class="prose dark:prose-invert max-w-none mb-6">
        <p class="text-lg font-semibold text-primary-600 dark:text-primary-400">5.1 General Approach to Risk Management</p>
        <p class="text-sm font-medium text-gray-700 dark:text-gray-300">[Reference: Clause 5 - Risk Management]</p>
        <p class="text-sm">
          This section describes the systematic approach taken to manage cybersecurity risks for <strong>{{ productName }}</strong>. 
          The risk management process covers risk identification, risk analysis, risk evaluation, and risk treatment 
          throughout the product lifecycle.
        </p>
      </div>

      <div class="border-t border-gray-200 dark:border-gray-800 pt-6">
        <RichTextEditor v-model="form.generalApproachHtml" min-height="400px" />
      </div>
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
