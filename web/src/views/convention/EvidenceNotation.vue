<template>
  <div class="convention-page">
    <section class="card title-card">
      <div>
        <p class="eyebrow">Document Convention</p>
        <h1>Evidence Notation</h1>
        <p class="muted">
          Define how supporting evidence is referenced and categorized throughout the CRA document.
        </p>
      </div>
      <div class="title-card-actions">
        <RouterLink class="btn ghost" to="/document/preview">Go to Document Preview</RouterLink>
      </div>
    </section>

    <section class="card content-card">
      <article class="template-body">
        <p class="section-heading">4.2 Evidence Notation</p>
        <p class="reference-line">[Reference: Clause 4.2]</p>
        <p>
          Capture the format for inline evidence references, organize the evidence categories you rely on, and provide
          exemplar citations the assessor can follow.
        </p>
      </article>

      <div class="notation-section">
        <p class="subheading">Evidence Reference Format</p>
        <RichTextEditor v-model="form.evidenceFormatHtml" min-height="220px" />
      </div>

      <div class="notation-section">
        <p class="subheading">Evidence Categories</p>
        <RichTextEditor v-model="form.evidenceCategoriesHtml" min-height="220px" />
      </div>

      <div class="notation-section">
        <p class="subheading">Example References</p>
        <RichTextEditor v-model="form.exampleReferencesHtml" min-height="220px" />
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
  evidenceFormatHtml: '',
  evidenceCategoriesHtml: '',
  exampleReferencesHtml: '',
})
const hydrating = ref(false)
let unsubscribe: (() => void) | null = null

function hydrate(state: DocumentWorkspaceState) {
  hydrating.value = true
  form.evidenceFormatHtml = state.documentConvention.evidenceFormatHtml
  form.evidenceCategoriesHtml = state.documentConvention.evidenceCategoriesHtml
  form.exampleReferencesHtml = state.documentConvention.exampleReferencesHtml
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
  () => form.evidenceFormatHtml,
  (value) => {
    if (hydrating.value) return
    updateDocumentConventionState({ evidenceFormatHtml: value })
  },
  { flush: 'sync' }
)

watch(
  () => form.evidenceCategoriesHtml,
  (value) => {
    if (hydrating.value) return
    updateDocumentConventionState({ evidenceCategoriesHtml: value })
  },
  { flush: 'sync' }
)

watch(
  () => form.exampleReferencesHtml,
  (value) => {
    if (hydrating.value) return
    updateDocumentConventionState({ exampleReferencesHtml: value })
  },
  { flush: 'sync' }
)
</script>

<style scoped src="./Convention.css"></style>
