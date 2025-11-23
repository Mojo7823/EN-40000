<template>
  <div class="p-6 space-y-6">
    <!-- Header Card -->
    <UCard>
      <template #header>
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Risk Management Elements</p>
            <h1 class="text-2xl font-bold mt-1">Product Context Establishment</h1>
            <p class="text-gray-600 dark:text-gray-300 mt-2">
              Describe how {{ productName }} operates, where it is deployed, and who interacts with it so
              that risk assessments can stay grounded in the real-world context.
            </p>
          </div>
          <UButton to="/document/preview" color="gray" variant="ghost" icon="i-heroicons-arrow-right" trailing>
            Document Preview
          </UButton>
        </div>
      </template>

      <div class="prose dark:prose-invert max-w-none mb-6">
        <p class="text-lg font-semibold text-primary-600 dark:text-primary-400">Product Context</p>
        <p class="text-sm font-medium text-gray-700 dark:text-gray-300">[Reference: Clause 6.2 - Product context]</p>
        <p class="text-sm">
          The product context provides the foundation for all risk management activities. It captures the product's
          intended purpose, market positioning, operational environments, and the user communities who interact with it.
        </p>
      </div>

      <div class="space-y-6">
        <!-- Intended Purpose -->
        <div class="border-t border-gray-200 dark:border-gray-800 pt-6">
          <div class="mb-3">
            <h3 class="text-base font-semibold">Intended Purpose Narrative</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Detail what the product is designed and marketed to do, including the environments and users it targets.
            </p>
          </div>
          <RichTextEditor v-model="form.intendedPurposeHtml" min-height="280px" />
        </div>

        <UDivider />

        <!-- Specific Intended Uses -->
        <div>
          <div class="mb-3">
            <h3 class="text-base font-semibold">Specific Intended Uses</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              List the discrete business or mission use cases that define success for the product.
            </p>
          </div>
          <RichTextEditor v-model="form.specificIntendedUsesHtml" min-height="220px" />
        </div>

        <UDivider />

        <!-- Foreseeable Use & Misuse -->
        <div>
          <div class="mb-3">
            <h3 class="text-base font-semibold">Reasonably Foreseeable Use & Misuse</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Identify foreseeable uses (even if unintended) and note any misuse considerations captured in the risk assessment.
            </p>
          </div>
          <RichTextEditor v-model="form.foreseeableUseHtml" min-height="280px" />
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import type { DocumentWorkspaceState } from '~/services/documentWorkspace'

const workspace = useDocumentWorkspace()

const workspaceState = ref<DocumentWorkspaceState>(workspace.loadDocumentWorkspace())
const hydrating = ref(false)
const form = reactive({
  intendedPurposeHtml: '',
  specificIntendedUsesHtml: '',
  foreseeableUseHtml: '',
})
let unsubscribe: (() => void) | null = null

const productName = computed(() => {
  return workspaceState.value.introduction?.productName || workspaceState.value.cover?.deviceName || '[Product Name]'
})

function hydrate(state: DocumentWorkspaceState) {
  hydrating.value = true
  const productContext = state.riskManagement?.productContext
  const nextIntendedPurpose = productContext?.intendedPurposeHtml || ''
  const nextSpecificUses = productContext?.specificIntendedUsesHtml || ''
  const nextForeseeableUse = productContext?.foreseeableUseHtml || ''

  if (form.intendedPurposeHtml !== nextIntendedPurpose) {
    form.intendedPurposeHtml = nextIntendedPurpose
  }
  if (form.specificIntendedUsesHtml !== nextSpecificUses) {
    form.specificIntendedUsesHtml = nextSpecificUses
  }
  if (form.foreseeableUseHtml !== nextForeseeableUse) {
    form.foreseeableUseHtml = nextForeseeableUse
  }
  hydrating.value = false
}

function normalizeRichTextValue(value?: string) {
  return value ?? ''
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
  () => form.intendedPurposeHtml,
  (value) => {
    if (hydrating.value) return
    workspace.updateRiskManagementState({ 
      productContext: { 
        intendedPurposeHtml: normalizeRichTextValue(value),
        specificIntendedUsesHtml: form.specificIntendedUsesHtml,
        foreseeableUseHtml: form.foreseeableUseHtml
      } 
    })
  },
  { flush: 'sync' }
)

watch(
  () => form.specificIntendedUsesHtml,
  (value) => {
    if (hydrating.value) return
    workspace.updateRiskManagementState({ 
      productContext: { 
        intendedPurposeHtml: form.intendedPurposeHtml,
        specificIntendedUsesHtml: normalizeRichTextValue(value),
        foreseeableUseHtml: form.foreseeableUseHtml
      } 
    })
  },
  { flush: 'sync' }
)

watch(
  () => form.foreseeableUseHtml,
  (value) => {
    if (hydrating.value) return
    workspace.updateRiskManagementState({ 
      productContext: { 
        intendedPurposeHtml: form.intendedPurposeHtml,
        specificIntendedUsesHtml: form.specificIntendedUsesHtml,
        foreseeableUseHtml: normalizeRichTextValue(value)
      } 
    })
  },
  { flush: 'sync' }
)
</script>
