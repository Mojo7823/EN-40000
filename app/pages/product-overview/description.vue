<template>
  <div class="container mx-auto p-6 space-y-6">
    <UCard class="bg-gradient-to-r from-primary-50/80 via-white to-white dark:from-primary-950 dark:via-gray-950 dark:to-gray-900 border-primary-100 dark:border-primary-900">
      <div class="flex flex-wrap justify-between items-start gap-4">
        <div class="space-y-2">
          <p class="text-xs uppercase tracking-wide text-primary-700 dark:text-primary-300">
            Product Overview
          </p>
          <div class="space-y-1">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Product Description</h1>
            <p class="text-sm text-gray-700 dark:text-gray-200">
              Describe how the product is built, deployed, and operated. This content feeds section 2.1 of the CRA documentation.
            </p>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <UButton
            to="/document/preview"
            color="primary"
            variant="soft"
            icon="i-heroicons-arrow-right"
            trailing
          >
            Document Preview
          </UButton>
        </div>
      </div>
    </UCard>

    <UCard>
      <template #header>
        <div>
          <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Clause Context
          </p>
          <h3 class="text-lg font-semibold">2.1 Product Description</h3>
        </div>
      </template>

      <div class="prose dark:prose-invert max-w-none">
        <p class="text-sm font-medium text-gray-700 dark:text-gray-300">[Reference: Clause 6.2 - Product Context]</p>
        <p class="text-sm italic text-gray-600 dark:text-gray-400 mb-3">
          Provide a detailed description of the product, including hardware, software, connectivity, user interface, and
          data processing characteristics.
        </p>
        <ul class="text-sm space-y-2">
          <li><strong class="text-primary-600 dark:text-primary-400">Physical Characteristics:</strong> Describe hardware components, form factor, interfaces.</li>
          <li><strong class="text-primary-600 dark:text-primary-400">Software Characteristics:</strong> Describe software architecture, programming languages, frameworks.</li>
          <li><strong class="text-primary-600 dark:text-primary-400">Network Connectivity:</strong> Outline network capabilities, protocols, communication mechanisms.</li>
          <li><strong class="text-primary-600 dark:text-primary-400">User Interface:</strong> Explain how users interact with the product (GUI, API, CLI, physical controls).</li>
          <li><strong class="text-primary-600 dark:text-primary-400">Data Processing:</strong> Describe what types of data the product processes, stores, or transmits.</li>
        </ul>
      </div>
    </UCard>

    <UCard>
      <template #header>
        <div>
          <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Product Description Content
          </p>
          <h3 class="text-lg font-semibold">Detailed Description</h3>
        </div>
      </template>

      <div class="space-y-3">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Provide the narrative for section 2.1 Product Description covering all aspects listed above.
        </p>
        <RichTextEditor v-model="form.productDescriptionHtml" min-height="320px" />
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
