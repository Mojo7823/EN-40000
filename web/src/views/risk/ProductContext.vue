<template>
  <div class="risk-product-context-page">
    <section class="card title-card">
      <div>
        <p class="eyebrow">Risk Management Elements</p>
        <h1>Product Context Establishment</h1>
        <p class="muted">
          Describe how {{ productName || '[Product Name]' }} operates, where it is deployed, and who interacts with it so
          that risk assessments can stay grounded in the real-world context.
        </p>
      </div>
      <div class="title-card-actions">
        <RouterLink class="btn ghost" to="/document/preview">Go to Document Preview</RouterLink>
      </div>
    </section>

    <section class="card content-card">
      <article class="template-body">
        <p class="section-heading">5.1.1 Product Context Establishment</p>
        <p class="reference-line">[Reference: Clause 6.1.1 - Product Context]</p>
        <p>
          Capture the scope, operational environment, and stakeholder ecosystem that define the cybersecurity
          expectations for this product. Use the templates below to quickly insert clause-compliant starter content.
        </p>
      </article>

      <div class="risk-editor-card">
        <div class="risk-editor-header">
          <div>
            <p class="subheading">Scope &amp; Intended Use</p>
            <p class="guidance-text">
              Summarize what the product is designed to do, primary variants, and lifecycle assumptions.
            </p>
          </div>
          <button class="btn primary" type="button" @click="insertScopeTemplate">
            <span style="margin-right: 8px">📝</span>
            Insert Template
          </button>
        </div>
        <RichTextEditor v-model="form.scopeDefinitionHtml" min-height="280px" />
      </div>

      <div class="risk-editor-card">
        <div class="risk-editor-header">
          <div>
            <p class="subheading">Operational Environment &amp; Dependencies</p>
            <p class="guidance-text">
              Detail deployment locations, connectivity, safety constraints, and external services relied upon.
            </p>
          </div>
          <button class="btn primary" type="button" @click="insertEnvironmentTemplate">
            <span style="margin-right: 8px">📝</span>
            Insert Template
          </button>
        </div>
        <RichTextEditor v-model="form.operationalEnvironmentHtml" min-height="280px" />
      </div>

      <div class="risk-editor-card">
        <div class="risk-editor-header">
          <div>
            <p class="subheading">Stakeholders &amp; User Profiles</p>
            <p class="guidance-text">
              Identify operator roles, privileged users, supply-chain partners, and remote support parties.
            </p>
          </div>
          <button class="btn primary" type="button" @click="insertStakeholderTemplate">
            <span style="margin-right: 8px">📝</span>
            Insert Template
          </button>
        </div>
        <RichTextEditor v-model="form.stakeholderProfilesHtml" min-height="280px" />
      </div>
    </section>

    <section class="card content-card">
      <RiskEvidenceTracker
        :model-value="evidenceEntries"
        title="Evidence Tracker"
        description="Link supporting documentation that proves the product context has been reviewed."
        @update:modelValue="handleEvidenceChange"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import RichTextEditor from '../../components/RichTextEditor.vue'
import RiskEvidenceTracker from '../../components/RiskEvidenceTracker.vue'
import {
  RISK_PRODUCT_CONTEXT_SECTION_KEY,
  loadDocumentWorkspace,
  subscribeDocumentWorkspace,
  updateRiskManagementState,
  type DocumentWorkspaceState,
  type RiskEvidenceEntry,
} from '../../services/documentWorkspace'

const workspaceState = ref<DocumentWorkspaceState>(loadDocumentWorkspace())
const hydrating = ref(false)
const form = reactive({
  scopeDefinitionHtml: '',
  operationalEnvironmentHtml: '',
  stakeholderProfilesHtml: '',
})
const evidenceEntries = ref<RiskEvidenceEntry[]>([])
let unsubscribe: (() => void) | null = null

const productName = computed(() => {
  return workspaceState.value.introduction?.productName || workspaceState.value.cover?.deviceName || ''
})

function hydrate(state: DocumentWorkspaceState) {
  hydrating.value = true
  const productContext = state.riskManagement?.productContext
  const nextScope = productContext?.scopeDefinitionHtml || ''
  const nextEnvironment = productContext?.operationalEnvironmentHtml || ''
  const nextStakeholders = productContext?.stakeholderProfilesHtml || ''
  const nextEvidence = normalizeEvidenceEntries(productContext?.evidenceEntries)

  if (form.scopeDefinitionHtml !== nextScope) {
    form.scopeDefinitionHtml = nextScope
  }
  if (form.operationalEnvironmentHtml !== nextEnvironment) {
    form.operationalEnvironmentHtml = nextEnvironment
  }
  if (form.stakeholderProfilesHtml !== nextStakeholders) {
    form.stakeholderProfilesHtml = nextStakeholders
  }
  if (!areEvidenceEntriesEqual(evidenceEntries.value, nextEvidence)) {
    evidenceEntries.value = nextEvidence
  }
  hydrating.value = false
}

function normalizeEvidenceEntries(entries?: RiskEvidenceEntry[]) {
  if (entries && entries.length) {
    return entries.map((entry) => ({ ...entry }))
  }
  return [
    {
      id: `${RISK_PRODUCT_CONTEXT_SECTION_KEY}-evidence`,
      sectionKey: RISK_PRODUCT_CONTEXT_SECTION_KEY,
      title: 'Product Context Evidence Reference',
      referenceId: '',
      descriptionHtml: '',
      status: 'not_started',
    },
  ]
}

function areEvidenceEntriesEqual(a: RiskEvidenceEntry[], b: RiskEvidenceEntry[]) {
  if (a.length !== b.length) return false
  return a.every((entry, index) => {
    const next = b[index]
    return (
      entry.id === next.id &&
      entry.sectionKey === next.sectionKey &&
      entry.title === next.title &&
      entry.referenceId === next.referenceId &&
      entry.descriptionHtml === next.descriptionHtml &&
      entry.status === next.status
    )
  })
}

function handleEvidenceChange(entries: RiskEvidenceEntry[]) {
  const nextEntries = entries.map((entry) => ({ ...entry }))
  if (areEvidenceEntriesEqual(evidenceEntries.value, nextEntries)) {
    return
  }
  evidenceEntries.value = nextEntries
  if (hydrating.value) return
  updateRiskManagementState({ productContext: { evidenceEntries: nextEntries } })
}

function getCurrentFieldValue(
  field: 'scopeDefinitionHtml' | 'operationalEnvironmentHtml' | 'stakeholderProfilesHtml'
) {
  const productContext = workspaceState.value.riskManagement?.productContext
  return productContext?.[field] ?? ''
}

function normalizeRichTextValue(value?: string) {
  return value ?? ''
}

function insertScopeTemplate() {
  const productLabel = productName.value || '[Product Name]'
  const template = `
<p><span style="color: #7c3aed"><strong>[Template]</strong> Use this block to describe the scope and intent of the product.</span></p>
<p>The ${productLabel} is intended for deployment within <em>[operational domain]</em> and enables <em>[primary business capability]</em>.</p>
<ul>
  <li><strong>Primary variants:</strong> [Model numbers or firmware branches]</li>
  <li><strong>Lifecycle assumptions:</strong> Development → Deployment → Support as defined in Clause 6.1.1</li>
  <li><strong>Safety or regulatory boundaries:</strong> [List mandatory standards or jurisdictions]</li>
</ul>
<p><span style="color: #7c3aed">[Replace purple guidance text with the final narrative.]</span></p>
`.trim()
  form.scopeDefinitionHtml = template
  updateRiskManagementState({ productContext: { scopeDefinitionHtml: template } })
}

function insertEnvironmentTemplate() {
  const productLabel = productName.value || '[Product Name]'
  const template = `
<p><span style="color: #7c3aed"><strong>[Template]</strong> Document hosting environments, connectivity, and dependencies.</span></p>
<p>${productLabel} operates within <em>[cloud/on-prem/embedded]</em> environments and relies on the following:</p>
<ul>
  <li><strong>Connectivity:</strong> [LAN/WAN/Cellular protocols, remote access requirements]</li>
  <li><strong>External services:</strong> [Identity providers, telemetry pipelines, OTA platforms]</li>
  <li><strong>Environmental constraints:</strong> [Temperature, safety zones, redundancy expectations]</li>
</ul>
<p><span style="color: #7c3aed">[Note any constrained interfaces or zero-trust patterns mandated by Clause 6.1.1.]</span></p>
`.trim()
  form.operationalEnvironmentHtml = template
  updateRiskManagementState({ productContext: { operationalEnvironmentHtml: template } })
}

function insertStakeholderTemplate() {
  const productLabel = productName.value || '[Product Name]'
  const template = `
<p><span style="color: #7c3aed"><strong>[Template]</strong> Identify the people that can influence risk posture.</span></p>
<p>The following stakeholder groups interact with ${productLabel}:</p>
<ol>
  <li><strong>Primary operators:</strong> [e.g., clinical staff, field engineers] with privileges limited to [controls].</li>
  <li><strong>Privileged maintainers:</strong> [e.g., manufacturer DevSecOps] responsible for secure updates and diagnostics.</li>
  <li><strong>External parties:</strong> [Supply-chain partners, managed service providers, regulators] receiving curated data.</li>
</ol>
<p><span style="color: #7c3aed">[Reference stakeholder communication plans or SLAs backing this section.]</span></p>
`.trim()
  form.stakeholderProfilesHtml = template
  updateRiskManagementState({ productContext: { stakeholderProfilesHtml: template } })
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
  () => form.scopeDefinitionHtml,
  (value) => {
    if (hydrating.value) return
    const normalizedValue = normalizeRichTextValue(value)
    if (normalizedValue === getCurrentFieldValue('scopeDefinitionHtml')) {
      return
    }
    updateRiskManagementState({ productContext: { scopeDefinitionHtml: normalizedValue } })
  },
  { flush: 'sync' }
)

watch(
  () => form.operationalEnvironmentHtml,
  (value) => {
    if (hydrating.value) return
    const normalizedValue = normalizeRichTextValue(value)
    if (normalizedValue === getCurrentFieldValue('operationalEnvironmentHtml')) {
      return
    }
    updateRiskManagementState({ productContext: { operationalEnvironmentHtml: normalizedValue } })
  },
  { flush: 'sync' }
)

watch(
  () => form.stakeholderProfilesHtml,
  (value) => {
    if (hydrating.value) return
    const normalizedValue = normalizeRichTextValue(value)
    if (normalizedValue === getCurrentFieldValue('stakeholderProfilesHtml')) {
      return
    }
    updateRiskManagementState({ productContext: { stakeholderProfilesHtml: normalizedValue } })
  },
  { flush: 'sync' }
)
</script>

<style scoped src="./RiskManagement.css"></style>
