<template>
  <div class="convention-page">
    <section class="card title-card">
      <div>
        <p class="eyebrow">Document Convention</p>
        <h1>Assessment Verdicts</h1>
        <p class="muted">
          Document the verdict categories, evaluation criteria, and how the overall conformance determination is made.
        </p>
      </div>
      <div class="title-card-actions">
        <RouterLink class="btn ghost" to="/document/preview">Go to Document Preview</RouterLink>
      </div>
    </section>

    <section class="card content-card">
      <article class="template-body">
        <p class="section-heading">4.4 Assessment Verdicts</p>
        <p class="reference-line">[Reference: Clause 4.4]</p>
        <p>
          Explain how each verdict is assigned, what criteria are considered by the assessor, and how the final CRA
          documentation verdict is recorded.
        </p>
      </article>

      <div class="notation-section">
        <p class="subheading">Verdict Categories</p>
        <RichTextEditor v-model="form.verdictCategoriesHtml" min-height="220px" />
      </div>

      <div class="notation-section">
        <p class="subheading">Assessment Criteria</p>
        <RichTextEditor v-model="form.assessmentCriteriaHtml" min-height="220px" />
      </div>

      <div class="notation-section">
        <p class="subheading">Overall Conformance Determination</p>
        <RichTextEditor v-model="form.overallDeterminationHtml" min-height="220px" />
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
  verdictCategoriesHtml: '',
  assessmentCriteriaHtml: '',
  overallDeterminationHtml: '',
})
const hydrating = ref(false)
let unsubscribe: (() => void) | null = null

function hydrate(state: DocumentWorkspaceState) {
  hydrating.value = true
  form.verdictCategoriesHtml = state.documentConvention.verdictCategoriesHtml
  form.assessmentCriteriaHtml = state.documentConvention.assessmentCriteriaHtml
  form.overallDeterminationHtml = state.documentConvention.overallDeterminationHtml
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
  () => form.verdictCategoriesHtml,
  (value) => {
    if (hydrating.value) return
    updateDocumentConventionState({ verdictCategoriesHtml: value })
  },
  { flush: 'sync' }
)

watch(
  () => form.assessmentCriteriaHtml,
  (value) => {
    if (hydrating.value) return
    updateDocumentConventionState({ assessmentCriteriaHtml: value })
  },
  { flush: 'sync' }
)

watch(
  () => form.overallDeterminationHtml,
  (value) => {
    if (hydrating.value) return
    updateDocumentConventionState({ overallDeterminationHtml: value })
  },
  { flush: 'sync' }
)
</script>

<style scoped src="./Convention.css"></style>
