<template>
  <div class="risk-general-approach-page">
    <section class="card title-card">
      <div>
        <p class="eyebrow">Risk Management Elements</p>
        <h1>General Approach to Risk Management</h1>
        <p class="muted">
          Document the overall risk management framework and approach used to identify, assess, and mitigate cybersecurity risks throughout the product lifecycle.
        </p>
      </div>
      <div class="title-card-actions">
        <RouterLink class="btn ghost" to="/document/preview">Go to Document Preview</RouterLink>
      </div>
    </section>

    <section class="card content-card">
      <article class="template-body">
        <p class="section-heading">5.1 General Approach to Risk Management</p>
        <p class="reference-line">[Reference: Clause 5 - Risk Management]</p>
        <p>
          This section describes the systematic approach taken to manage cybersecurity risks for the product. 
          The risk management process covers risk identification, risk analysis, risk evaluation, and risk treatment 
          throughout the product lifecycle.
        </p>
      </article>

      <div class="risk-section">
        <p class="subheading">Risk Management Framework</p>
        <p class="guidance-text">
          Describe the risk management framework or standard applied (e.g., ISO 31000, ISO/IEC 27005, NIST Cybersecurity Framework).
        </p>
        <RichTextEditor v-model="form.frameworkHtml" min-height="200px" />
      </div>

      <div class="risk-section">
        <p class="subheading">Risk Identification Process</p>
        <p class="guidance-text">
          Explain how cybersecurity risks are identified, including threat modeling, vulnerability assessments, 
          and consideration of attack scenarios.
        </p>
        <RichTextEditor v-model="form.identificationHtml" min-height="200px" />
      </div>

      <div class="risk-section">
        <p class="subheading">Risk Analysis and Evaluation</p>
        <p class="guidance-text">
          Describe how identified risks are analyzed and evaluated, including likelihood and impact assessment, 
          risk scoring methodology, and risk prioritization criteria.
        </p>
        <RichTextEditor v-model="form.analysisHtml" min-height="200px" />
      </div>

      <div class="risk-section">
        <p class="subheading">Risk Treatment Approach</p>
        <p class="guidance-text">
          Explain the strategies for treating identified risks (e.g., risk mitigation, risk acceptance, risk transfer, risk avoidance) 
          and how treatment measures are selected and implemented.
        </p>
        <RichTextEditor v-model="form.treatmentHtml" min-height="200px" />
      </div>

      <div class="risk-section">
        <p class="subheading">Monitoring and Review</p>
        <p class="guidance-text">
          Describe how risks are continuously monitored and reviewed throughout the product lifecycle, 
          including procedures for handling newly discovered vulnerabilities.
        </p>
        <RichTextEditor v-model="form.monitoringHtml" min-height="200px" />
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
  updateRiskManagementState,
  type DocumentWorkspaceState,
} from '../../services/documentWorkspace'

const workspaceState = ref<DocumentWorkspaceState>(loadDocumentWorkspace())
const form = reactive({
  frameworkHtml: '',
  identificationHtml: '',
  analysisHtml: '',
  treatmentHtml: '',
  monitoringHtml: '',
})
const hydrating = ref(false)
let unsubscribe: (() => void) | null = null

function hydrate(state: DocumentWorkspaceState) {
  hydrating.value = true
  const riskManagement = state.riskManagement || {
    frameworkHtml: '',
    identificationHtml: '',
    analysisHtml: '',
    treatmentHtml: '',
    monitoringHtml: '',
  }
  form.frameworkHtml = riskManagement.frameworkHtml || ''
  form.identificationHtml = riskManagement.identificationHtml || ''
  form.analysisHtml = riskManagement.analysisHtml || ''
  form.treatmentHtml = riskManagement.treatmentHtml || ''
  form.monitoringHtml = riskManagement.monitoringHtml || ''
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
  () => form.frameworkHtml,
  (value) => {
    if (hydrating.value) return
    updateRiskManagementState({ frameworkHtml: value })
  },
  { flush: 'sync' }
)

watch(
  () => form.identificationHtml,
  (value) => {
    if (hydrating.value) return
    updateRiskManagementState({ identificationHtml: value })
  },
  { flush: 'sync' }
)

watch(
  () => form.analysisHtml,
  (value) => {
    if (hydrating.value) return
    updateRiskManagementState({ analysisHtml: value })
  },
  { flush: 'sync' }
)

watch(
  () => form.treatmentHtml,
  (value) => {
    if (hydrating.value) return
    updateRiskManagementState({ treatmentHtml: value })
  },
  { flush: 'sync' }
)

watch(
  () => form.monitoringHtml,
  (value) => {
    if (hydrating.value) return
    updateRiskManagementState({ monitoringHtml: value })
  },
  { flush: 'sync' }
)
</script>

<style scoped src="./RiskManagement.css"></style>
