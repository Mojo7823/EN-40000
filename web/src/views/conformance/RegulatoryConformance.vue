<template>
  <div class="conformance-page">
    <section class="card title-card">
      <div>
        <p class="eyebrow">Conformance Claim</p>
        <h1>Regulatory Conformance</h1>
        <p class="muted">
          Document the directives, regulations, or sector-specific rules that this product adheres to as part of the CRA
          submission.
        </p>
      </div>
      <div class="title-card-actions">
        <RouterLink class="btn ghost" to="/conformance/standards">Standards Conformance</RouterLink>
        <RouterLink class="btn ghost" to="/conformance/level">Conformance Level</RouterLink>
        <RouterLink class="btn ghost" to="/document/preview">Document Preview</RouterLink>
      </div>
    </section>

    <section class="card form-card">
      <header class="description-header">
        <p class="section-heading">3.2 Regulatory Conformance</p>
        <p class="muted italic">
          Summarize CRA clauses, regional mandates, or industry frameworks (e.g., IEC, ETSI, medical, automotive)
          relevant to the product.
        </p>
      </header>
      <RichTextEditor
        v-model="editorValue"
        min-height="260px"
        placeholder="Describe regulatory frameworks, directives, and clauses satisfied by this product."
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import RichTextEditor from '../../components/RichTextEditor.vue'
import {
  loadDocumentWorkspace,
  subscribeDocumentWorkspace,
  updateConformanceClaimState,
  type DocumentWorkspaceState,
} from '../../services/documentWorkspace'

const initialState = loadDocumentWorkspace()
const editorValue = ref(initialState.conformanceClaim.regulatoryConformanceHtml || '')
const suppressNextSync = ref(false)
let unsubscribe: (() => void) | null = null

watch(editorValue, (value) => {
  if (suppressNextSync.value) {
    suppressNextSync.value = false
    return
  }
  updateConformanceClaimState({ regulatoryConformanceHtml: value })
})

function applyExternalState(state: DocumentWorkspaceState) {
  suppressNextSync.value = true
  editorValue.value = state.conformanceClaim.regulatoryConformanceHtml || ''
}

onMounted(() => {
  unsubscribe = subscribeDocumentWorkspace(applyExternalState)
})

onUnmounted(() => {
  unsubscribe?.()
})
</script>

<style scoped src="./ConformancePages.css"></style>

