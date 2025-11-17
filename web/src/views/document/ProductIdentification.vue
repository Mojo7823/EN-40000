<template>
  <div class="product-identification-page">
    <section class="card title-card">
      <div>
        <p class="eyebrow">Introduction</p>
        <h1>Product Identification</h1>
        <p class="muted">
          Capture the detailed characteristics, differentiators, and positioning of the product for section 1.3 of the
          CRA documentation template.
        </p>
      </div>
      <div class="title-card-actions">
        <RouterLink class="btn ghost" to="/document/preview">Go to Document Preview</RouterLink>
      </div>
    </section>

    <section class="card product-card">
      <form class="product-form" @submit.prevent>
        <div class="table-fields">
          <label class="field">
            <span>Product Name</span>
            <input v-model="introductionFields.productName" type="text" placeholder="Product Name" />
          </label>
          <label class="field">
            <span>Product Version</span>
            <input v-model="introductionFields.productVersion" type="text" placeholder="Version or release" />
          </label>
          <label class="field">
            <span>Product Type / Category</span>
            <input v-model="introductionFields.productType" type="text" placeholder="e.g., Gateway Appliance" />
          </label>
        </div>

        <div class="field rich-field" role="group" :aria-labelledby="descriptionLabelId">
          <div class="field-header">
            <span :id="descriptionLabelId">Product Description</span>
            <p class="muted">Provide a narrative summary of the architecture, deployment, and differentiators.</p>
          </div>
          <RichTextEditor
            v-model="form.productDescriptionHtml"
            min-height="220px"
            placeholder="Describe form factor, key modules, integrations, and any notable controls."
          />
        </div>

        <div class="field rich-field" role="group" :aria-labelledby="functionsLabelId">
          <div class="field-header">
            <span :id="functionsLabelId">Key Product Functions</span>
            <p class="muted">List the primary capabilities evaluated by this CRA submission.</p>
          </div>
          <RichTextEditor
            v-model="form.keyFunctionsHtml"
            min-height="200px"
            placeholder="Outline essential features with bullet or numbered lists."
          />
        </div>

        <label class="field">
          <div class="field-header">
            <span>Target Market</span>
            <p class="muted">Specify the intended users or industries (e.g., Consumer, Enterprise, Industrial).</p>
          </div>
          <textarea v-model="form.targetMarket" rows="4" placeholder="Target audience"></textarea>
        </label>
      </form>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import RichTextEditor from '../../components/RichTextEditor.vue'
import {
  loadDocumentWorkspace,
  subscribeDocumentWorkspace,
  type DocumentWorkspaceState,
  type ProductIdentificationState,
  updateProductIdentificationState,
  updateIntroductionState,
} from '../../services/documentWorkspace'

const workspaceState = ref(loadDocumentWorkspace())
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
    updateProductIdentificationState({ ...value })
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
    updateIntroductionState({
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
  unsubscribe = subscribeDocumentWorkspace((state) => {
    applyExternalState(state)
  })
})

onUnmounted(() => {
  unsubscribe?.()
})
</script>

<style scoped src="./ProductIdentification.css"></style>
