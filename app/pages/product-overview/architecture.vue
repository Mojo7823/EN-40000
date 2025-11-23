<template>
  <div class="p-6 space-y-6">
    <!-- Header Card -->
    <UCard>
      <template #header>
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Product Architecture</p>
            <h1 class="text-2xl font-bold mt-1">Product Overview</h1>
            <p class="text-gray-600 dark:text-gray-300 mt-2">
              Capture the structure of the product, including key components, interactions, interfaces, and remote services.
              This content feeds section 2.2 of the CRA documentation.
            </p>
          </div>
          <div class="flex gap-2">
            <UButton
              to="/product-overview/description"
              color="gray"
              variant="ghost"
            >
              Product Description
            </UButton>
            <UButton
              to="/document/preview"
              color="gray"
              variant="ghost"
              icon="i-heroicons-arrow-right"
              trailing
            >
              Document Preview
            </UButton>
          </div>
        </div>
      </template>

      <div class="space-y-4">
        <!-- Template Header -->
        <div class="prose dark:prose-invert max-w-none">
          <p class="text-lg font-semibold text-primary-600 dark:text-primary-400">2.2 Product Architecture Overview</p>
          <p class="text-sm font-medium text-gray-700 dark:text-gray-300">[Reference: Clause 6.2.1.5 - Product architecture overview]</p>
          <p class="text-sm italic text-gray-600 dark:text-gray-400 mb-3">
            Provide a high-level architectural description of the product. Include the components, how they interact,
            external interfaces, and any remote data processing solutions.
          </p>
          <ul class="text-sm space-y-2 mb-4">
            <li><strong class="text-primary-600 dark:text-primary-400">Key Components:</strong> List each major component and its purpose.</li>
            <li><strong class="text-primary-600 dark:text-primary-400">Component Interactions:</strong> Describe how the components communicate or depend on each other.</li>
            <li><strong class="text-primary-600 dark:text-primary-400">External Interfaces:</strong> Include network ports, APIs, or physical connectors to external systems.</li>
            <li><strong class="text-primary-600 dark:text-primary-400">Remote Data Processing Solutions (RDPS):</strong> Mention cloud services, remote servers, or backend platforms that store or process data.</li>
            <li><strong class="text-primary-600 dark:text-primary-400">Evidence Reference:</strong> Reference the document or repository where architecture diagrams live.</li>
          </ul>
        </div>

        <UDivider />

        <!-- Rich Text Editor -->
        <RichTextEditor
          v-model="form.productArchitectureHtml"
          min-height="320px"
          placeholder="Provide the narrative for section 2.2 Product Architecture Overview"
        />
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import type {
  DocumentWorkspaceState,
  ProductOverviewState
} from '~/services/documentWorkspace'

const workspace = useDocumentWorkspace()

const workspaceState = ref(workspace.loadDocumentWorkspace())
const form = reactive<ProductOverviewState>({ ...workspaceState.value.productOverview })
const suppressNextSync = ref(false)
let unsubscribe: (() => void) | null = null

watch(
  form,
  (value) => {
    if (suppressNextSync.value) {
      suppressNextSync.value = false
      return
    }
    workspace.updateProductOverviewState({ ...value })
  },
  { deep: true }
)

function applyExternalState(state: DocumentWorkspaceState) {
  workspaceState.value = state
  suppressNextSync.value = true
  Object.assign(form, state.productOverview)
}

onMounted(() => {
  unsubscribe = workspace.subscribeDocumentWorkspace(applyExternalState)
})

onUnmounted(() => {
  unsubscribe?.()
})
</script>
