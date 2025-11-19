<template>
  <div class="convention-page">
    <section class="card title-card">
      <div>
        <p class="eyebrow">Document Convention</p>
        <h1>Notation</h1>
        <p class="muted">
          Capture evidence notation, requirement notation, and assessment verdict guidance for Section 4 of the CRA documentation.
        </p>
      </div>
      <div class="title-card-actions">
        <RouterLink class="btn ghost" to="/document/preview">Go to Document Preview</RouterLink>
      </div>
    </section>

    <section class="card content-card">
      <article class="template-body">
        <p class="section-heading">Evidence Notation</p>
        <p class="reference-line">[Reference: Clause 4.2]</p>
        <p>Describe how evidence references are formatted, highlighted, and catalogued.</p>
      </article>
      <div class="notation-section">
        <RichTextEditor v-model="form.evidenceNotationHtml" min-height="220px" />
      </div>

      <article class="template-body" style="margin-top: 32px;">
        <p class="section-heading">Requirement Notation</p>
        <p class="reference-line">[Reference: Clause 4.3]</p>
        <p>Explain how EN 40000 requirements are cited and distinguish user guidance from normative text.</p>
      </article>
      <div class="notation-section">
        <RichTextEditor v-model="form.requirementNotationHtml" min-height="220px" />
      </div>

      <article class="template-body" style="margin-top: 32px;">
        <p class="section-heading">Assessment Verdicts</p>
        <p class="reference-line">[Reference: Clause 4.4]</p>
        <p>Outline the verdict categories and criteria for determining conformance.</p>
      </article>
      <div class="notation-section">
        <RichTextEditor v-model="form.assessmentVerdictsHtml" min-height="220px" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import RichTextEditor from '../../components/RichTextEditor.vue'
import {
  loadDocumentWorkspace,
  subscribeDocumentWorkspace,
  updateDocumentConventionState,
  type DocumentWorkspaceState,
} from '../../services/documentWorkspace'

const workspaceState = ref<DocumentWorkspaceState>(loadDocumentWorkspace())
const form = reactive({
  evidenceNotationHtml: '',
  requirementNotationHtml: '',
  assessmentVerdictsHtml: '',
})
const hydrating = ref(false)
let unsubscribe: (() => void) | null = null

function hydrate(state: DocumentWorkspaceState) {
  hydrating.value = true
  const documentConvention = state.documentConvention
  form.evidenceNotationHtml = documentConvention.evidenceNotationHtml
  form.requirementNotationHtml = documentConvention.requirementNotationHtml
  form.assessmentVerdictsHtml = documentConvention.assessmentVerdictsHtml
  hydrating.value = false
}

onMounted(() => {
  hydrate(workspaceState.value)
  unsubscribe = subscribeDocumentWorkspace((state) => {
    workspaceState.value = state
    hydrate(state)
  })
})

onUnmounted(() => {
  unsubscribe?.()
})

watch(
  () => form.evidenceNotationHtml,
  (value) => {
    if (hydrating.value) return
    updateDocumentConventionState({ evidenceNotationHtml: value })
  },
  { flush: 'sync' }
)

watch(
  () => form.requirementNotationHtml,
  (value) => {
    if (hydrating.value) return
    updateDocumentConventionState({ requirementNotationHtml: value })
  },
  { flush: 'sync' }
)

watch(
  () => form.assessmentVerdictsHtml,
  (value) => {
    if (hydrating.value) return
    updateDocumentConventionState({ assessmentVerdictsHtml: value })
  },
  { flush: 'sync' }
)
</script>

<style scoped src="./Convention.css"></style>
