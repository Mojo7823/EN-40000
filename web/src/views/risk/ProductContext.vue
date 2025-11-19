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
        <p class="section-heading">5.2 Product Context</p>
        <p class="reference-line">[Reference: Clause 6.2 - Product context]</p>
        <p>
          The product context provides the foundation for all risk management activities. It captures the product's
          intended purpose, market positioning, operational environments, and the user communities who interact with it.
        </p>
      </article>

      <article class="template-body">
        <p class="section-heading">5.2.1 Intended Purpose and Reasonably Foreseeable Use</p>
        <p class="reference-line">[Reference: Clause 6.2.1.2 - Product intended purpose and reasonable foreseeable use]</p>
        <p>
          Describe the formal purpose of {{ productName || '[Product Name]' }}, catalogue its specific intended uses, and
          document reasonably foreseeable uses or misuses that must be considered in the risk assessment.
        </p>
      </article>

      <div class="requirement-callout">
        <p class="callout-heading">Requirement [Clause 6.2.3]</p>
        <p>The product context shall be identified and recorded based on:</p>
        <ul>
          <li>the product's <strong>PRFU</strong> (Product Rules and Functional Use),</li>
          <li>the product's <strong>functions</strong>,</li>
          <li>the product's <strong>operational environment of use</strong>,</li>
          <li>the product's <strong>architecture overview</strong>,</li>
          <li>the product's <strong>user descriptions</strong>.</li>
        </ul>
      </div>

      <div class="risk-editor-card">
        <div class="risk-editor-header">
          <div>
            <p class="subheading">Intended Purpose Narrative</p>
            <p class="guidance-text">
              Detail what the product is designed and marketed to do, including the environments and users it targets.
            </p>
          </div>
          <button class="btn primary" type="button" @click="insertIntendedPurposeTemplate">
            <span style="margin-right: 8px">📝</span>
            Insert Template
          </button>
        </div>
        <RichTextEditor v-model="form.intendedPurposeHtml" min-height="280px" />
      </div>

      <div class="risk-editor-card">
        <div class="risk-editor-header">
          <div>
            <p class="subheading">Specific Intended Uses</p>
            <p class="guidance-text">
              List the discrete business or mission use cases that define success for the product.
            </p>
          </div>
          <button class="btn primary" type="button" @click="insertSpecificUsesTemplate">
            <span style="margin-right: 8px">📝</span>
            Insert Template
          </button>
        </div>
        <RichTextEditor v-model="form.specificIntendedUsesHtml" min-height="220px" />
      </div>

      <div class="risk-editor-card">
        <div class="risk-editor-header">
          <div>
            <p class="subheading">Reasonably Foreseeable Use &amp; Misuse</p>
            <p class="guidance-text">
              Identify foreseeable uses (even if unintended) and note any misuse considerations captured in the risk
              assessment.
            </p>
          </div>
          <button class="btn primary" type="button" @click="insertForeseeableUseTemplate">
            <span style="margin-right: 8px">📝</span>
            Insert Template
          </button>
        </div>
        <RichTextEditor v-model="form.foreseeableUseHtml" min-height="280px" />
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
  intendedPurposeHtml: '',
  specificIntendedUsesHtml: '',
  foreseeableUseHtml: '',
})
const evidenceEntries = ref<RiskEvidenceEntry[]>([])
let unsubscribe: (() => void) | null = null

const productName = computed(() => {
  return workspaceState.value.introduction?.productName || workspaceState.value.cover?.deviceName || ''
})

function hydrate(state: DocumentWorkspaceState) {
  hydrating.value = true
  const productContext = state.riskManagement?.productContext
  const nextIntendedPurpose = productContext?.intendedPurposeHtml || ''
  const nextSpecificUses = productContext?.specificIntendedUsesHtml || ''
  const nextForeseeableUse = productContext?.foreseeableUseHtml || ''
  const nextEvidence = normalizeEvidenceEntries(productContext?.evidenceEntries)

  if (form.intendedPurposeHtml !== nextIntendedPurpose) {
    form.intendedPurposeHtml = nextIntendedPurpose
  }
  if (form.specificIntendedUsesHtml !== nextSpecificUses) {
    form.specificIntendedUsesHtml = nextSpecificUses
  }
  if (form.foreseeableUseHtml !== nextForeseeableUse) {
    form.foreseeableUseHtml = nextForeseeableUse
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
  field: 'intendedPurposeHtml' | 'specificIntendedUsesHtml' | 'foreseeableUseHtml'
) {
  const productContext = workspaceState.value.riskManagement?.productContext
  return productContext?.[field] ?? ''
}

function normalizeRichTextValue(value?: string) {
  return value ?? ''
}

function insertIntendedPurposeTemplate() {
  const productLabel = productName.value || '[Product Name]'
  const template = `
<p><strong>Intended Purpose:</strong></p>
<p>${productLabel} is intended to <em>[describe primary purpose]</em>. The product is designed for use in <em>[describe intended environments]</em> by <em>[describe intended users]</em>.</p>
<p><strong>Marketing Positioning:</strong></p>
<p>It addresses the following problem statements and value propositions:</p>
<ul>
  <li>[Value proposition 1]</li>
  <li>[Value proposition 2]</li>
  <li>[Value proposition 3]</li>
</ul>
`.trim()
  form.intendedPurposeHtml = template
  updateRiskManagementState({ productContext: { intendedPurposeHtml: template } })
}

function insertSpecificUsesTemplate() {
  const template = `
<p><strong>Specific Intended Uses</strong></p>
<ol>
  <li>[Intended use 1]</li>
  <li>[Intended use 2]</li>
  <li>[Intended use 3]</li>
</ol>
`.trim()
  form.specificIntendedUsesHtml = template
  updateRiskManagementState({ productContext: { specificIntendedUsesHtml: template } })
}

function insertForeseeableUseTemplate() {
  const template = `
<p><strong>Reasonably Foreseeable Use:</strong></p>
<p>Based on analysis of similar products and market conditions, the following uses are reasonably foreseeable:</p>
<ol>
  <li>[Foreseeable use 1 - e.g., "Users may share access credentials with family members."]</li>
  <li>[Foreseeable use 2 - e.g., "The product may be used in environments with different security requirements than intended."]</li>
  <li>[Foreseeable use 3 - e.g., "Users may integrate the product with third-party systems not contemplated by the manufacturer."]</li>
</ol>
<p><strong>Misuse Considerations:</strong></p>
<p>[Describe any misuse patterns that have been considered in the risk assessment.]</p>
`.trim()
  form.foreseeableUseHtml = template
  updateRiskManagementState({ productContext: { foreseeableUseHtml: template } })
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
  () => form.intendedPurposeHtml,
  (value) => {
    if (hydrating.value) return
    const normalizedValue = normalizeRichTextValue(value)
    if (normalizedValue === getCurrentFieldValue('intendedPurposeHtml')) {
      return
    }
    updateRiskManagementState({ productContext: { intendedPurposeHtml: normalizedValue } })
  },
  { flush: 'sync' }
)

watch(
  () => form.specificIntendedUsesHtml,
  (value) => {
    if (hydrating.value) return
    const normalizedValue = normalizeRichTextValue(value)
    if (normalizedValue === getCurrentFieldValue('specificIntendedUsesHtml')) {
      return
    }
    updateRiskManagementState({ productContext: { specificIntendedUsesHtml: normalizedValue } })
  },
  { flush: 'sync' }
)

watch(
  () => form.foreseeableUseHtml,
  (value) => {
    if (hydrating.value) return
    const normalizedValue = normalizeRichTextValue(value)
    if (normalizedValue === getCurrentFieldValue('foreseeableUseHtml')) {
      return
    }
    updateRiskManagementState({ productContext: { foreseeableUseHtml: normalizedValue } })
  },
  { flush: 'sync' }
)
</script>

<style scoped src="./RiskManagement.css"></style>
