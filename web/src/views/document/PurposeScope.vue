<template>
  <div class="purpose-scope-page">
    <section class="card title-card">
      <div>
        <p class="eyebrow">Introduction</p>
        <h1>Purpose and Scope</h1>
        <p class="muted">
          Document how the {{ productNameDisplay }} assessment aligns with EN 40000-1-2-2025 Clause 1 and capture the
          lifecycle coverage, timeline, and methodology.
        </p>
      </div>
      <div class="title-card-actions">
        <RouterLink class="btn ghost" to="/document/preview">Go to Document Preview</RouterLink>
      </div>
    </section>

    <section class="card template-card">
      <article class="template-body">
        <p class="section-heading">1.2 Purpose and Scope</p>
        <p class="reference-line">[Reference: Clause 1 - Scope]</p>
        <p>
          This conformance report documents the assessment of <strong>{{ productNameDisplay }}</strong> against the
          requirements specified in EN 40000-1-2-2025: “Cybersecurity requirements for products with digital elements -
          Part 1-2: Principles for cyber resilience.”
        </p>
        <p>
          The standard specifies general cybersecurity principles and risk management activities applicable to all
          products with digital elements throughout their lifecycle. This report demonstrates how
          <strong>{{ productNameDisplay }}</strong> ensures and maintains an appropriate level of cybersecurity based on
          identified risks.
        </p>
      </article>

      <div class="scoped-section">
        <p class="subheading">Scope of Assessment</p>
        <p>
          This assessment covers the following lifecycle phases of <strong>{{ productNameDisplay }}</strong>. Select the
          phases that apply:
        </p>
        <ul class="scope-list">
          <li v-for="phase in lifecyclePhases" :key="phase">
            <button
              type="button"
              class="scope-button"
              :class="{ selected: isPhaseSelected(phase) }"
              @click="togglePhase(phase)"
            >
              <span>{{ isPhaseSelected(phase) ? '☑' : '☐' }}</span>
              <span>{{ phase }}</span>
            </button>
          </li>
        </ul>
      </div>

      <div class="assessment-period">
        <p class="subheading">Assessment Period</p>
        <div class="date-grid">
          <label class="field">
            <span>Start Date</span>
            <input v-model="form.assessmentStart" type="date" />
          </label>
          <label class="field">
            <span>End Date</span>
            <input v-model="form.assessmentEnd" type="date" />
          </label>
        </div>
      </div>

      <div class="methodology-section">
        <p class="subheading">Assessment Methodology</p>
        <p class="muted">
          Describe the methodology used (e.g., document review, interviews, technical testing, code review, penetration
          testing).
        </p>
        <RichTextEditor v-model="form.methodologyHtml" min-height="220px" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import RichTextEditor from '../../components/RichTextEditor.vue'
import {
  loadDocumentWorkspace,
  subscribeDocumentWorkspace,
  updatePurposeScopeState,
  type DocumentWorkspaceState,
  type PurposeScopeState,
} from '../../services/documentWorkspace'

const lifecyclePhases = [
  'Concept and planning',
  'Design and development',
  'Implementation',
  'Verification and validation',
  'Production and distribution',
  'Deployment and operation',
  'Maintenance and support',
  'Decommissioning',
]

const workspaceState = ref<DocumentWorkspaceState>(loadDocumentWorkspace())
const form = reactive<PurposeScopeState>({
  scopeSelections: [...workspaceState.value.purposeScope.scopeSelections],
  assessmentStart: workspaceState.value.purposeScope.assessmentStart,
  assessmentEnd: workspaceState.value.purposeScope.assessmentEnd,
  methodologyHtml: workspaceState.value.purposeScope.methodologyHtml,
})
const suppressNextSync = ref(false)
let unsubscribe: (() => void) | null = null

const introduction = computed(() => workspaceState.value.introduction)
const cover = computed(() => workspaceState.value.cover)
const productNameDisplay = computed(
  () => introduction.value.productName?.trim() || cover.value.deviceName?.trim() || 'Product Name'
)

watch(
  form,
  (value) => {
    if (suppressNextSync.value) {
      suppressNextSync.value = false
      return
    }
    updatePurposeScopeState({
      scopeSelections: [...value.scopeSelections],
      assessmentStart: value.assessmentStart,
      assessmentEnd: value.assessmentEnd,
      methodologyHtml: value.methodologyHtml,
    })
  },
  { deep: true }
)

function isPhaseSelected(phase: string) {
  return form.scopeSelections.includes(phase)
}

function togglePhase(phase: string) {
  const index = form.scopeSelections.indexOf(phase)
  if (index === -1) {
    form.scopeSelections.push(phase)
  } else {
    form.scopeSelections.splice(index, 1)
  }
}

function applyExternalState(state: DocumentWorkspaceState) {
  workspaceState.value = state
  suppressNextSync.value = true
  form.scopeSelections.splice(0, form.scopeSelections.length, ...state.purposeScope.scopeSelections)
  form.assessmentStart = state.purposeScope.assessmentStart
  form.assessmentEnd = state.purposeScope.assessmentEnd
  form.methodologyHtml = state.purposeScope.methodologyHtml
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

<style scoped src="./PurposeScope.css"></style>
