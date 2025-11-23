<template>
  <div class="p-6 space-y-6">
    <!-- Header Card -->
    <UCard>
      <template #header>
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Introduction</p>
            <h1 class="text-2xl font-bold mt-1">Product Identification</h1>
            <p class="text-gray-600 dark:text-gray-300 mt-2">
              Capture the detailed characteristics, differentiators, and positioning of the product for section 1.3 of the
              CRA documentation template.
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

      <div class="space-y-6">
        <!-- Basic Product Info -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <UFormGroup label="Product Name">
            <UInput
              v-model="introductionFields.productName"
              placeholder="Product Name"
              icon="i-heroicons-cube"
            />
          </UFormGroup>
          <UFormGroup label="Product Version">
            <UInput
              v-model="introductionFields.productVersion"
              placeholder="Version or release"
              icon="i-heroicons-tag"
            />
          </UFormGroup>
          <UFormGroup label="Product Type / Category">
            <UInput
              v-model="introductionFields.productType"
              placeholder="e.g., Gateway Appliance"
              icon="i-heroicons-squares-2x2"
            />
          </UFormGroup>
        </div>

        <UDivider />

        <!-- Product Description -->
        <div>
          <div class="mb-3">
            <h3 class="text-base font-semibold">Product Description</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Provide a narrative summary of the architecture, deployment, and differentiators.
            </p>
          </div>
          <RichTextEditor
            v-model="form.productDescriptionHtml"
            min-height="220px"
            placeholder="Describe form factor, key modules, integrations, and any notable controls."
          />
        </div>

        <UDivider />

        <!-- Key Product Functions -->
        <div>
          <div class="mb-3">
            <h3 class="text-base font-semibold">Key Product Functions</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              List the primary capabilities evaluated by this CRA submission.
            </p>
          </div>
          <RichTextEditor
            v-model="form.keyFunctionsHtml"
            min-height="200px"
            placeholder="Outline essential features with bullet or numbered lists."
          />
        </div>

        <UDivider />

        <!-- Target Market -->
        <div>
          <div class="mb-3">
            <h3 class="text-base font-semibold">Target Market</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Specify the intended users or industries (e.g., Consumer, Enterprise, Industrial).
            </p>
          </div>
          <UTextarea
            v-model="form.targetMarket"
            :rows="4"
            placeholder="Target audience"
          />
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue'
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
