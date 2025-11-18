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
          Select the overall status and provide context for partial or non-conformance claims.
        </p>
      </header>

      <div class="conformance-level-status-grid">
        <label v-for="option in levelOptions" :key="option.value" class="status-option">
          <input
            type="checkbox"
            :checked="form.statuses.includes(option.value)"
            @change="onStatusToggle(option.value, $event)"
          />
          <span>{{ option.label }}</span>
        </label>
      </div>
      <p class="small-note">Select the status that best represents the overall CRA readiness.</p>

      <div class="justification-editor">
        <p class="section-subtitle">Justification for Partial Conformance (if applicable)</p>
        <RichTextEditor
          v-model="form.justificationHtml"
          min-height="220px"
          placeholder="Explain which requirements are not met and why. Cite remediation plans or mitigating controls."
        />
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
  updateConformanceClaimState,
  type DocumentWorkspaceState,
} from '../../services/documentWorkspace'
import type { ConformanceLevelState, ConformanceLevelStatus } from '../../types/conformance'
import { CONFORMANCE_LEVEL_OPTIONS } from '../../constants/conformance'

const levelOptions = CONFORMANCE_LEVEL_OPTIONS
const initialState = loadDocumentWorkspace()
const form = reactive<ConformanceLevelState>({
  statuses: [...initialState.conformanceClaim.conformanceLevel.statuses],
  justificationHtml: initialState.conformanceClaim.conformanceLevel.justificationHtml ?? '',
})

const suppressNextSync = ref(false)
let unsubscribe: (() => void) | null = null

watch(
  form,
  () => {
    if (suppressNextSync.value) {
      suppressNextSync.value = false
      return
    }
    persistState()
  },
  { deep: true }
)

function persistState() {
  updateConformanceClaimState({
    conformanceLevel: {
      statuses: [...form.statuses],
      justificationHtml: form.justificationHtml,
    },
  })
}

function applyExternalState(state: DocumentWorkspaceState) {
  suppressNextSync.value = true
  form.statuses = [...state.conformanceClaim.conformanceLevel.statuses]
  form.justificationHtml = state.conformanceClaim.conformanceLevel.justificationHtml ?? ''
}

function onStatusToggle(status: ConformanceLevelStatus, event: Event) {
  const checked = (event.target as HTMLInputElement).checked
  if (checked) {
    if (!form.statuses.includes(status)) {
      form.statuses = [...form.statuses, status]
    }
  } else {
    form.statuses = form.statuses.filter((value) => value !== status)
  }
}

onMounted(() => {
  unsubscribe = subscribeDocumentWorkspace(applyExternalState)
})

onUnmounted(() => {
  unsubscribe?.()
})
</script>

<style scoped src="./ConformancePages.css"></style>
