<template>
  <div class="p-6 space-y-6">
    <!-- Header Card -->
    <UCard>
      <template #header>
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Product Description</p>
            <h1 class="text-2xl font-bold mt-1">Product Overview</h1>
            <p class="text-gray-600 dark:text-gray-300 mt-2">
              Describe how the product is built, deployed, and operated. This content feeds section 2.1 of the CRA documentation.
            </p>
          </div>
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
      </template>

      <div class="space-y-4">
        <!-- Template Header -->
        <div class="prose dark:prose-invert max-w-none">
          <p class="text-lg font-semibold text-primary-600 dark:text-primary-400">2.1 Product Description</p>
          <p class="text-sm font-medium text-gray-700 dark:text-gray-300">[Reference: Clause 6.2 - Product Context]</p>
          <p class="text-sm italic text-gray-600 dark:text-gray-400 mb-3">
            Provide a detailed description of the product, including hardware, software, connectivity, user interface, and
            data processing characteristics.
          </p>
          <ul class="text-sm space-y-2 mb-4">
            <li><strong class="text-primary-600 dark:text-primary-400">Physical Characteristics:</strong> Describe hardware components, form factor, interfaces.</li>
            <li><strong class="text-primary-600 dark:text-primary-400">Software Characteristics:</strong> Describe software architecture, programming languages, frameworks.</li>
            <li><strong class="text-primary-600 dark:text-primary-400">Network Connectivity:</strong> Outline network capabilities, protocols, communication mechanisms.</li>
            <li><strong class="text-primary-600 dark:text-primary-400">User Interface:</strong> Explain how users interact with the product (GUI, API, CLI, physical controls).</li>
            <li><strong class="text-primary-600 dark:text-primary-400">Data Processing:</strong> Describe what types of data the product processes, stores, or transmits.</li>
          </ul>
        </div>

        <UDivider />

        <!-- Rich Text Editor -->
        <RichTextEditor
          v-model="form.productDescriptionHtml"
          min-height="320px"
          placeholder="Provide the narrative for section 2.1 Product Description"
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
