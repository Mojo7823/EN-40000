<template>
  <div class="conformance-page">
    <section class="card title-card">
      <div>
        <p class="eyebrow">Conformance Claim</p>
        <h1>Conformance Level</h1>
        <p class="muted">
          Declare the claimed assurance tier or conformance level and describe any scope limitations or dependencies.
        </p>
      </div>
      <div class="title-card-actions">
        <RouterLink class="btn ghost" to="/conformance/standards">Standards Conformance</RouterLink>
        <RouterLink class="btn ghost" to="/conformance/regulatory">Regulatory Conformance</RouterLink>
        <RouterLink class="btn ghost" to="/document/preview">Document Preview</RouterLink>
      </div>
    </section>

    <section class="card form-card">
      <header class="description-header">
        <p class="section-heading">3.3 Conformance Level</p>
        <p class="muted italic">
          Explain the claimed level (e.g., Basic, Substantial, High) and cite the controls or evaluation evidence that
          justify it.
        </p>
      </header>
      <RichTextEditor
        v-model="editorValue"
        min-height="260px"
        placeholder="State the claimed conformance level, supporting evidence, and any constraints or dependencies."
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
const editorValue = ref(initialState.conformanceClaim.conformanceLevelHtml || '')
const suppressNextSync = ref(false)
let unsubscribe: (() => void) | null = null

watch(editorValue, (value) => {
  if (suppressNextSync.value) {
    suppressNextSync.value = false
    return
  }
  updateConformanceClaimState({ conformanceLevelHtml: value })
})

function applyExternalState(state: DocumentWorkspaceState) {
  suppressNextSync.value = true
  editorValue.value = state.conformanceClaim.conformanceLevelHtml || ''
}

onMounted(() => {
  unsubscribe = subscribeDocumentWorkspace(applyExternalState)
})

onUnmounted(() => {
  unsubscribe?.()
})
</script>

<style scoped src="./ConformancePages.css"></style>

