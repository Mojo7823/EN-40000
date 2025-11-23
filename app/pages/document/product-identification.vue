<template>
  <div class="container mx-auto p-6 space-y-6">
    <UCard>
      <template #header>
        <div class="flex flex-wrap justify-between items-start gap-4">
          <div>
            <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
              Introduction
            </p>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              Product Identification
            </h1>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Capture the detailed characteristics, differentiators, and positioning of the product for section 1.3 of the
              CRA documentation template.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <UButton
              variant="ghost"
              color="gray"
              to="/document/preview"
              icon="i-heroicons-eye"
            >
              Preview
            </UButton>
          </div>
        </div>
      </template>
    </UCard>

    <UCard>
      <form class="space-y-6" @submit.prevent>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <UFormField label="Product Name" name="productName">
            <UInput
              v-model="introductionFields.productName"
              placeholder="Product Name"
              size="lg"
            />
          </UFormField>
          <UFormField label="Product Version" name="productVersion">
            <UInput
              v-model="introductionFields.productVersion"
              placeholder="Version or release"
              size="lg"
            />
          </UFormField>
          <UFormField label="Product Type / Category" name="productType">
            <UInput
              v-model="introductionFields.productType"
              placeholder="e.g., Gateway Appliance"
              size="lg"
            />
          </UFormField>
        </div>

        <div class="space-y-2" role="group" :aria-labelledby="descriptionLabelId">
          <div class="space-y-1">
            <label :id="descriptionLabelId" class="text-sm font-semibold text-gray-900 dark:text-white">
              Product Description
            </label>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Provide a narrative summary of the architecture, deployment, and differentiators.
            </p>
          </div>
          <RichTextEditor
            v-model="form.productDescriptionHtml"
            min-height="220px"
            placeholder="Describe form factor, key modules, integrations, and any notable controls."
          />
        </div>

        <div class="space-y-2" role="group" :aria-labelledby="functionsLabelId">
          <div class="space-y-1">
            <label :id="functionsLabelId" class="text-sm font-semibold text-gray-900 dark:text-white">
              Key Product Functions
            </label>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              List the primary capabilities evaluated by this CRA submission.
            </p>
          </div>
          <RichTextEditor
            v-model="form.keyFunctionsHtml"
            min-height="200px"
            placeholder="Outline essential features with bullet or numbered lists."
          />
        </div>

        <UFormField label="Target Market" name="targetMarket" class="w-full">
          <template #description>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Specify the intended users or industries (e.g., Consumer, Enterprise, Industrial).
            </p>
          </template>
          <UTextarea
            v-model="form.targetMarket"
            :rows="4"
            placeholder="Target audience"
            size="lg"
            class="w-full"
          />
        </UFormField>
      </form>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type {
  DocumentWorkspaceState,
  ProductIdentificationState
} from '~/services/documentWorkspace'

const workspace = useDocumentWorkspace()

const workspaceState = ref(workspace.loadDocumentWorkspace())
const form = reactive<ProductIdentificationState>({ ...workspaceState.value.productIdentification })
const introductionFields = reactive({
  productName: workspaceState.value.introduction.productName,
  productVersion: workspaceState.value.introduction.productVersion,
  productType: workspaceState.value.introduction.productType,
})
const suppressNextSync = ref(false)
const suppressIntroSync = ref(false)
let unsubscribe: (() => void) | null = null
const descriptionLabelId = `product-description-label-${Math.random().toString(36).slice(2, 8)}`
const functionsLabelId = `product-functions-label-${Math.random().toString(36).slice(2, 8)}`

watch(
  form,
  (value) => {
    if (suppressNextSync.value) {
      suppressNextSync.value = false
      return
    }
    workspace.updateProductIdentificationState({ ...value })
  },
  { deep: true }
)

watch(
  introductionFields,
  (value) => {
    if (suppressIntroSync.value) {
      suppressIntroSync.value = false
      return
    }
    workspace.updateIntroductionState({
      productName: value.productName,
      productVersion: value.productVersion,
      productType: value.productType,
    })
  },
  { deep: true }
)

function applyExternalState(state: DocumentWorkspaceState) {
  workspaceState.value = state
  suppressNextSync.value = true
  Object.assign(form, state.productIdentification)
  suppressIntroSync.value = true
  introductionFields.productName = state.introduction.productName
  introductionFields.productVersion = state.introduction.productVersion
  introductionFields.productType = state.introduction.productType
}

onMounted(() => {
  unsubscribe = workspace.subscribeDocumentWorkspace((state) => {
    applyExternalState(state)
  })
})

onUnmounted(() => {
  unsubscribe?.()
})
</script>

