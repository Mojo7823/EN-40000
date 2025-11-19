<template>
  <div class="convention-page">
    <section class="card title-card">
      <div>
        <p class="eyebrow">Document Convention</p>
        <h1>Requirement Notation</h1>
        <p class="muted">
          Define how EN 40000 requirements are cited and how conformance statements are structured.
        </p>
      </div>
      <div class="title-card-actions">
        <RouterLink class="btn ghost" to="/document/preview">Go to Document Preview</RouterLink>
      </div>
    </section>

    <section class="card content-card">
      <article class="template-body">
        <p class="section-heading">4.3 Requirement Notation</p>
        <p class="reference-line">[Reference: Clause 4.3]</p>
        <p>
          Capture the clause reference style, the classification of requirements, and how each conformance statement should
          be completed.
        </p>
      </article>

      <div class="notation-section">
        <p class="subheading">Requirement Reference Format</p>
        <RichTextEditor v-model="form.requirementFormatHtml" min-height="220px" />
      </div>

      <div class="notation-section">
        <p class="subheading">Requirement Categories</p>
        <RichTextEditor v-model="form.requirementCategoriesHtml" min-height="220px" />
      </div>

      <div class="notation-section">
        <p class="subheading">Conformance Statement Format</p>
        <RichTextEditor v-model="form.conformanceFormatHtml" min-height="220px" />
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
  requirementFormatHtml: '',
  requirementCategoriesHtml: '',
  conformanceFormatHtml: '',
})
const hydrating = ref(false)
let unsubscribe: (() => void) | null = null

function hydrate(state: DocumentWorkspaceState) {
  hydrating.value = true
  form.requirementFormatHtml = state.documentConvention.requirementFormatHtml
  form.requirementCategoriesHtml = state.documentConvention.requirementCategoriesHtml
  form.conformanceFormatHtml = state.documentConvention.conformanceFormatHtml
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
  () => form.requirementFormatHtml,
  (value) => {
    if (hydrating.value) return
    updateDocumentConventionState({ requirementFormatHtml: value })
  },
  { flush: 'sync' }
)

watch(
  () => form.requirementCategoriesHtml,
  (value) => {
    if (hydrating.value) return
    updateDocumentConventionState({ requirementCategoriesHtml: value })
  },
  { flush: 'sync' }
)

watch(
  () => form.conformanceFormatHtml,
  (value) => {
    if (hydrating.value) return
    updateDocumentConventionState({ conformanceFormatHtml: value })
  },
  { flush: 'sync' }
)
</script>

<style scoped src="./Convention.css"></style>
