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
          This section describes the systematic approach taken to manage cybersecurity risks for <strong>{{ productName || '[Product Name]' }}</strong>. 
          The risk management process covers risk identification, risk analysis, risk evaluation, and risk treatment 
          throughout the product lifecycle.
        </p>
      </article>

      <div class="editor-section">
        <div class="editor-header">
          <button class="btn primary" @click="insertTemplate">
            <span style="margin-right: 8px;">📝</span>
            Insert Template
          </button>
        </div>
        <RichTextEditor v-model="form.generalApproachHtml" min-height="400px" />
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
  updateRiskManagementState,
  type DocumentWorkspaceState,
} from '../../services/documentWorkspace'

const workspaceState = ref<DocumentWorkspaceState>(loadDocumentWorkspace())
const form = reactive({
  generalApproachHtml: '',
})
const hydrating = ref(false)
let unsubscribe: (() => void) | null = null

const productName = computed(() => {
  return workspaceState.value.introduction?.productName || workspaceState.value.cover?.deviceName || ''
})

function hydrate(state: DocumentWorkspaceState) {
  hydrating.value = true
  const riskManagement = state.riskManagement || {
    generalApproachHtml: '',
  }
  form.generalApproachHtml = riskManagement.generalApproachHtml || ''
  hydrating.value = false
}

function insertTemplate() {
  const companyName = '[Company Name]'
  const productNamePlaceholder = productName.value || '[Product Name]'
  
  const template = `
<p><strong>Risk Management Framework Applied:</strong></p>
<p><em>[Describe the overall risk management approach used. Use own words or use this template:]</em></p>
<p>The ${companyName} has established a systematic risk management process that is applied throughout the product lifecycle. This process is based on the requirements of Clause 6 of EN 40000-1-2-2025 and includes the following elements:</p>

<ol>
  <li>
    <p><strong>Product Context Establishment</strong></p>
    <p>Defining the scope, intended use, operational environment, and users</p>
  </li>
  <li>
    <p><strong>Risk Acceptance Criteria</strong></p>
    <p>Establishing clear criteria for when risks are acceptable</p>
  </li>
  <li>
    <p><strong>Risk Assessment</strong> - Identifying assets, threats, and estimating risks</p>
  </li>
  <li>
    <p><strong>Risk Treatment</strong> - Applying avoidance, mitigation, acceptance, or transfer strategies</p>
  </li>
  <li>
    <p><strong>Risk Communication</strong> - Ensuring stakeholders are informed of relevant risks</p>
  </li>
  <li>
    <p><strong>Risk Monitoring and Review</strong> - Continuously monitoring and updating risk information</p>
  </li>
</ol>

<p><strong>Risk Management Process Diagram:</strong></p>
<p><em>[Include or reference a process flow diagram]</em></p>

<p><strong>Evidence Reference:</strong></p>
<p><strong>[EVD-RM-001]</strong> Risk Management Plan</p>

<p><strong>Risk Management Methodology:</strong></p>
<p>The following methodology is used for risk assessment and treatment:</p>
<p><em>[Describe the specific methodology]</em></p>
<p>"The ${companyName} uses a qualitative risk matrix approach based on..." or "The manufacturer uses CVSS scoring for vulnerability assessment..." or "The manufacturer applies threat modeling using STRIDE methodology..."</p>
`.trim()

  form.generalApproachHtml = template
  updateRiskManagementState({ generalApproachHtml: template })
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
  () => form.generalApproachHtml,
  (value) => {
    if (hydrating.value) return
    updateRiskManagementState({ generalApproachHtml: value })
  },
  { flush: 'sync' }
)
</script>

<style scoped src="./RiskManagement.css"></style>
