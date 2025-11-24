<template>
  <div class="container mx-auto p-6 space-y-6">
    <!-- Header Card -->
    <UCard
      class="border-primary-200 dark:border-primary-800 bg-gradient-to-r from-primary-50/80 via-white to-white dark:from-primary-950 dark:via-gray-950 dark:to-gray-900"
    >
      <template #header>
        <div class="flex items-start justify-between">
          <div>
            <p class="text-xs uppercase tracking-wide text-primary-700 dark:text-primary-300 font-semibold">Risk Management Elements</p>
            <h1 class="text-3xl font-bold mt-2 text-gray-900 dark:text-white">Product Context Establishment</h1>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Describe how {{ productName }} operates, where it is deployed, and who interacts with it so
              that risk assessments can stay grounded in the real-world context.
            </p>
          </div>
          <UButton to="/document/preview" color="primary" variant="soft" icon="i-heroicons-arrow-right" trailing>
            Document Preview
          </UButton>
        </div>
      </template>
    </UCard>

    <!-- Product Context Card -->
    <UCard>
      <template #header>
        <div>
          <p class="text-xs uppercase tracking-wide text-primary-700 dark:text-primary-300 font-semibold">Clause Reference</p>
          <h2 class="text-xl font-bold mt-2 text-gray-900 dark:text-white">6.2 Product Context</h2>
        </div>
      </template>

      <div class="prose dark:prose-invert max-w-none">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          The product context provides the foundation for all risk management activities. It captures the product's
          intended purpose, market positioning, operational environments, and the user communities who interact with it.
        </p>
      </div>
    </UCard>

    <!-- Intended Purpose Card -->
    <UCard>
      <template #header>
        <div>
          <p class="text-xs uppercase tracking-wide text-primary-700 dark:text-primary-300 font-semibold">Section 1</p>
          <h2 class="text-xl font-bold mt-2 text-gray-900 dark:text-white">Intended Purpose Narrative</h2>
        </div>
      </template>

      <div class="mb-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Detail what the product is designed and marketed to do, including the environments and users it targets.
        </p>
      </div>

      <RichTextEditor v-model="form.intendedPurposeHtml" min-height="280px" placeholder="Describe the intended purpose of the product..." />
    </UCard>

    <!-- Specific Intended Uses Card -->
    <UCard>
      <template #header>
        <div>
          <p class="text-xs uppercase tracking-wide text-primary-700 dark:text-primary-300 font-semibold">Section 2</p>
          <h2 class="text-xl font-bold mt-2 text-gray-900 dark:text-white">Specific Intended Uses</h2>
        </div>
      </template>

      <div class="mb-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          List the discrete business or mission use cases that define success for the product.
        </p>
      </div>

      <RichTextEditor v-model="form.specificIntendedUsesHtml" min-height="220px" placeholder="List specific intended uses..." />
    </UCard>

    <!-- Foreseeable Use & Misuse Card -->
    <UCard>
      <template #header>
        <div>
          <p class="text-xs uppercase tracking-wide text-primary-700 dark:text-primary-300 font-semibold">Section 3</p>
          <h2 class="text-xl font-bold mt-2 text-gray-900 dark:text-white">Reasonably Foreseeable Use & Misuse</h2>
        </div>
      </template>

      <div class="mb-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Identify foreseeable uses (even if unintended) and note any misuse considerations captured in the risk assessment.
        </p>
      </div>

      <RichTextEditor v-model="form.foreseeableUseHtml" min-height="280px" placeholder="Describe foreseeable uses and potential misuse..." />
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
    const currentContext = workspaceState.value.riskManagement?.productContext
    workspace.updateRiskManagementState({
      productContext: {
        intendedPurposeHtml: normalizeRichTextValue(value),
        specificIntendedUsesHtml: form.specificIntendedUsesHtml,
        foreseeableUseHtml: form.foreseeableUseHtml,
        evidenceEntries: currentContext?.evidenceEntries || []
      }
    })
  },
  { flush: 'sync' }
)

watch(
  () => form.specificIntendedUsesHtml,
  (value) => {
    if (hydrating.value) return
    const currentContext = workspaceState.value.riskManagement?.productContext
    workspace.updateRiskManagementState({
      productContext: {
        intendedPurposeHtml: form.intendedPurposeHtml,
        specificIntendedUsesHtml: normalizeRichTextValue(value),
        foreseeableUseHtml: form.foreseeableUseHtml,
        evidenceEntries: currentContext?.evidenceEntries || []
      }
    })
  },
  { flush: 'sync' }
)

watch(
  () => form.foreseeableUseHtml,
  (value) => {
    if (hydrating.value) return
    const currentContext = workspaceState.value.riskManagement?.productContext
    workspace.updateRiskManagementState({
      productContext: {
        intendedPurposeHtml: form.intendedPurposeHtml,
        specificIntendedUsesHtml: form.specificIntendedUsesHtml,
        foreseeableUseHtml: normalizeRichTextValue(value),
        evidenceEntries: currentContext?.evidenceEntries || []
      }
    })
  },
  { flush: 'sync' }
)
</script>
