<template>
  <div class="product-overview-page">
    <section class="card title-card">
      <div>
        <p class="eyebrow">Product Overview</p>
        <h1>Product Description</h1>
        <p class="muted">
          Describe how the product is built, deployed, and operated. This content feeds section 2.1 of the CRA
          documentation.
        </p>
      </div>
      <div class="title-card-actions">
        <RouterLink class="btn ghost" to="/document/preview">Go to Document Preview</RouterLink>
      </div>
    </section>

    <section class="card form-card">
      <header class="description-header">
        <p class="section-heading">2.1 Product Description</p>
        <p class="reference-line">[Reference: Clause 6.2 - Product Context]</p>
        <p class="muted italic">
          Provide a detailed description of the product, including hardware, software, connectivity, user interface, and
          data processing characteristics.
        </p>
        <ul class="guidance-list">
          <li><strong>Physical Characteristics:</strong> Describe hardware components, form factor, interfaces.</li>
          <li><strong>Software Characteristics:</strong> Describe software architecture, programming languages, frameworks.</li>
          <li><strong>Network Connectivity:</strong> Outline network capabilities, protocols, communication mechanisms.</li>
          <li><strong>User Interface:</strong> Explain how users interact with the product (GUI, API, CLI, physical controls).</li>
          <li><strong>Data Processing:</strong> Describe what types of data the product processes, stores, or transmits.</li>
        </ul>
      </header>

      <RichTextEditor
        v-model="form.productDescriptionHtml"
        min-height="320px"
        placeholder="Provide the narrative for section 2.1 Product Description"
      />
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
  type ProductOverviewState,
  updateProductOverviewState,
} from '../../services/documentWorkspace'

const workspaceState = ref(loadDocumentWorkspace())
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
    updateProductOverviewState({ ...value })
  },
  { deep: true }
)

function applyExternalState(state: DocumentWorkspaceState) {
  workspaceState.value = state
  suppressNextSync.value = true
  Object.assign(form, state.productOverview)
}

onMounted(() => {
  unsubscribe = subscribeDocumentWorkspace(applyExternalState)
})

onUnmounted(() => {
  unsubscribe?.()
})
</script>

<style scoped src="./ProductDescription.css"></style>
