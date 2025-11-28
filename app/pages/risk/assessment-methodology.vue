<template>
  <div class="container mx-auto p-6 space-y-6">
    <!-- Header Card -->
    <UCard
      class="border-primary-200 dark:border-primary-800 bg-gradient-to-r from-primary-50/80 via-white to-white dark:from-primary-950 dark:via-gray-950 dark:to-gray-900"
    >
      <template #header>
        <div class="flex items-start justify-between">
          <div>
            <p class="text-xs uppercase tracking-wide text-primary-700 dark:text-primary-300 font-semibold">Section 5.3</p>
            <h1 class="text-3xl font-bold mt-2 text-gray-900 dark:text-white">Risk Acceptance Criteria and Risk Management Methodology</h1>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
              [Reference: Clause 6.3 - Risk acceptance criteria and risk management methodology]
            </p>
          </div>
          <UButton to="/document/preview" color="primary" variant="soft" icon="i-heroicons-arrow-right" trailing>
            Document Preview
          </UButton>
        </div>
      </template>
    </UCard>

    <!-- Section Intro Card -->
    <UCard>
      <template #header>
        <div>
          <p class="text-xs uppercase tracking-wide text-primary-700 dark:text-primary-300 font-semibold">Section 5.3.1</p>
          <h2 class="text-xl font-bold mt-2 text-gray-900 dark:text-white">Risk Assessment and Treatment Methodology</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">[Reference: Clause 6.3.1 - General]</p>
        </div>
      </template>

      <div class="prose dark:prose-invert max-w-none mb-4">
        <p class="text-blue-600 dark:text-blue-400 italic">
          <strong>Requirement [Clause 6.3.3]:</strong>
        </p>
        <p class="text-blue-600 dark:text-blue-400 italic">
          "A risk assessment and treatment methodology covering how risks are defined and measured shall be defined.
          This methodology shall be:
        </p>
        <ul class="text-blue-600 dark:text-blue-400 italic">
          <li>Applied consistently on the product throughout its lifecycle;</li>
          <li>Justified for the product;</li>
          <li>Aligned with the state of the art and current values of society for the product;</li>
          <li>Applied to both individual risks and aggregate risks."</li>
        </ul>
      </div>
    </UCard>

    <!-- Risk Methodology Description Card -->
    <UCard>
      <template #header>
        <div class="flex items-start justify-between">
          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">Risk Methodology Description</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Describe the risk methodology used for this product.
            </p>
          </div>
          <UButton color="neutral" variant="soft" size="sm" @click="insertMethodologyTemplate">
            <UIcon name="i-heroicons-document-text" class="mr-1" />
            Insert Template
          </UButton>
        </div>
      </template>

      <RichTextEditor v-model="form.methodologyDescriptionHtml" min-height="400px" placeholder="Describe the risk methodology..." />
    </UCard>

    <!-- Justification Card -->
    <UCard>
      <template #header>
        <div class="flex items-start justify-between">
          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">Justification for Methodology</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Explain why this methodology is appropriate for your product.
            </p>
          </div>
          <UButton color="neutral" variant="soft" size="sm" @click="insertJustificationTemplate">
            <UIcon name="i-heroicons-document-text" class="mr-1" />
            Insert Template
          </UButton>
        </div>
      </template>

      <RichTextEditor v-model="form.justificationHtml" min-height="300px" placeholder="Explain the justification..." />
    </UCard>

    <!-- Consistent Application Card -->
    <UCard>
      <template #header>
        <div class="flex items-start justify-between">
          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">Consistent Application</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Describe how the methodology is applied consistently throughout the product lifecycle.
            </p>
          </div>
          <UButton color="neutral" variant="soft" size="sm" @click="insertConsistentApplicationTemplate">
            <UIcon name="i-heroicons-document-text" class="mr-1" />
            Insert Template
          </UButton>
        </div>
      </template>

      <RichTextEditor v-model="form.consistentApplicationHtml" min-height="280px" placeholder="Describe consistent application..." />
    </UCard>

    <!-- Individual and Aggregate Risk Card -->
    <UCard>
      <template #header>
        <div class="flex items-start justify-between">
          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">Individual and Aggregate Risk</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Describe how the methodology is applied to individual and aggregate risks.
            </p>
          </div>
          <UButton color="neutral" variant="soft" size="sm" @click="insertAggregateRiskTemplate">
            <UIcon name="i-heroicons-document-text" class="mr-1" />
            Insert Template
          </UButton>
        </div>
      </template>

      <RichTextEditor v-model="form.individualAggregateRiskHtml" min-height="280px" placeholder="Describe individual and aggregate risk approach..." />
    </UCard>

    <!-- Evidence Reference Card -->
    <UCard>
      <template #header>
        <div>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">Evidence Reference</h2>
        </div>
      </template>

      <div class="mb-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Track evidence references that support the risk assessment methodology.
        </p>
      </div>

      <div class="space-y-4">
        <UCard v-for="(entry, index) in evidenceEntries" :key="entry.id">
          <template #header>
            <div class="flex justify-between items-start">
              <div>
                <h4 class="font-semibold text-gray-900 dark:text-white">
                  {{ entry.title || `Evidence ${index + 1}` }}
                </h4>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Risk Assessment Methodology (Clause 6.3.1)
                </p>
              </div>
              <UBadge
                :color="entry.status === 'complete' ? 'success' : entry.status === 'in_progress' ? 'info' : 'neutral'"
                variant="subtle"
              >
                {{ entry.status === 'complete' ? 'Complete' : entry.status === 'in_progress' ? 'In Progress' : 'Not Started' }}
              </UBadge>
            </div>
          </template>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Evidence Title</label>
              <UInput v-model="entry.title" placeholder="Risk Assessment Methodology Document" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reference ID</label>
              <UInput v-model="entry.referenceId" placeholder="EVD-RM-002" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <USelectMenu
                v-model="entry.status"
                :items="[
                  { label: 'Not Started', value: 'not_started' },
                  { label: 'In Progress', value: 'in_progress' },
                  { label: 'Complete', value: 'complete' }
                ]"
                value-key="value"
                label-key="label"
                :search-input="false"
                color="neutral"
                variant="outline"
                trailing-icon="i-heroicons-chevron-down-20-solid"
                class="w-full"
              />
            </div>
          </div>

          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes / Link</label>
            <UTextarea
              v-model="entry.descriptionHtml"
              :rows="3"
              placeholder="Link to evidence repository, revision, or summary"
              class="w-full"
              autoresize
            />
          </div>
        </UCard>

        <div v-if="evidenceEntries.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">
          <div class="text-5xl mb-4">📋</div>
          <p>No evidence entries yet</p>
          <p class="text-sm">Add evidence to track compliance documentation</p>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import type { DocumentWorkspaceState, RiskEvidenceEntry, RiskEvidenceStatus } from '~/services/documentWorkspace'
import { RISK_ASSESSMENT_METHODOLOGY_SECTION_KEY } from '~/services/documentWorkspace'

const workspace = useDocumentWorkspace()

const workspaceState = ref<DocumentWorkspaceState>(workspace.loadDocumentWorkspace())
const hydrating = ref(false)
const form = reactive({
  methodologyDescriptionHtml: '',
  justificationHtml: '',
  consistentApplicationHtml: '',
  individualAggregateRiskHtml: '',
})
const evidenceEntries = ref<RiskEvidenceEntry[]>([])
let unsubscribe: (() => void) | null = null

// Templates
const METHODOLOGY_TEMPLATE = `<p>[Provide a detailed description of the risk methodology used. For example:]</p>
<p>The manufacturer has adopted a <strong>[qualitative / quantitative / hybrid]</strong> risk assessment methodology for <strong>[Product Name]</strong>. This methodology is based on <strong>[e.g., ISO 31000, IEC 62443, custom framework]</strong> and has been tailored to the specific context of this product.</p>
<p><strong>Risk Definition:</strong></p>
<p>For this product, risk is defined as:</p>
<p><strong>Likelihood of Occurrence:</strong></p>
<p>Likelihood is assessed using the following scale:</p>
<table>
<thead><tr><th>Level</th><th>Description</th><th>Definition</th></tr></thead>
<tbody>
<tr><td>Very Low</td><td>[1]</td><td>[Attack requires extensive resources and expertise; multiple protections must be bypassed]</td></tr>
<tr><td>Low</td><td>[2]</td><td>[Attack requires significant resources and expertise; some protections must be bypassed]</td></tr>
<tr><td>Medium</td><td>[3]</td><td>[Attack is feasible with moderate resources and skills]</td></tr>
<tr><td>High</td><td>[4]</td><td>[Attack easily performed with publicly available tools]</td></tr>
<tr><td>Very High</td><td>[5]</td><td>[Attack trivial; exploit code publicly available]</td></tr>
</tbody>
</table>
<p><em>[Adjust scale and definitions as appropriate for the methodology]</em></p>
<p><strong>Likelihood Factors Considered:</strong></p>
<p>The following factors are considered when estimating likelihood:</p>
<ul>
<li>Attack surface and exposure</li>
<li>Complexity of exploitation</li>
<li>Required attacker capabilities and resources</li>
<li>Effectiveness of existing controls</li>
<li>Attack vector accessibility</li>
<li>Likelihood of threat actor interest</li>
<li>Historical evidence of similar attacks</li>
</ul>`

const JUSTIFICATION_TEMPLATE = `<p>[Explain why this methodology is appropriate for your product. For example:]</p>
<p>This methodology has been selected because:</p>
<ol>
<li><strong>Product Context Alignment:</strong> [Explain how it fits the product – example "The qualitative approach is appropriate given the consumer nature of the product and need for clear communication to non-technical stakeholders"]</li>
<li><strong>State of the Art:</strong> [Explain how it aligns with industry practices - example "This approach is consistent with ETSI TS 102 165-1 and widely used in the IoT industry"]</li>
<li><strong>Regulatory Requirements:</strong> [Explain how it supports regulatory compliance – example., "This methodology enables clear demonstration of CRA compliance"]</li>
<li><strong>Threat Landscape:</strong> [Explain how it addresses relevant threats – example, "The likelihood factors specifically address networked product threats"]</li>
</ol>`

const CONSISTENT_APPLICATION_TEMPLATE = `<p>[Describe how the methodology is applied consistently:]</p>
<p>This methodology is applied consistently throughout the product lifecycle:</p>
<ul>
<li>During design phase for architectural risk assessment</li>
<li>During implementation for component and code risk assessment</li>
<li>During testing for verification of risk treatment effectiveness</li>
<li>During operation for monitoring of new threats and vulnerabilities</li>
<li>During maintenance for assessment of changes and updates</li>
</ul>
<p>All risk assessments are documented using standardized templates <strong>[EVD-RM-002]</strong> to ensure consistency.</p>`

const AGGREGATE_RISK_TEMPLATE = `<p>[Describe how the risk assessment is applied to individual and combined risks:]</p>
<p>The methodology is applied to:</p>
<ul>
<li><strong>Individual Risks:</strong> Each identified threat-asset combination</li>
<li><strong>Aggregate Risks:</strong> Combined risks considering:
<ul>
<li>Multiple vulnerabilities in the same component</li>
<li>Cascading failures across components</li>
<li>Attack chains combining multiple vulnerabilities</li>
<li>Cumulative impact on users if multiple products are compromised</li>
</ul>
</li>
</ul>`

function insertMethodologyTemplate() {
  form.methodologyDescriptionHtml = METHODOLOGY_TEMPLATE
}

function insertJustificationTemplate() {
  form.justificationHtml = JUSTIFICATION_TEMPLATE
}

function insertConsistentApplicationTemplate() {
  form.consistentApplicationHtml = CONSISTENT_APPLICATION_TEMPLATE
}

function insertAggregateRiskTemplate() {
  form.individualAggregateRiskHtml = AGGREGATE_RISK_TEMPLATE
}

function hydrate(state: DocumentWorkspaceState) {
  hydrating.value = true
  const methodology = state.riskManagement?.riskAssessmentMethodology
  form.methodologyDescriptionHtml = methodology?.methodologyDescriptionHtml || ''
  form.justificationHtml = methodology?.justificationHtml || ''
  form.consistentApplicationHtml = methodology?.consistentApplicationHtml || ''
  form.individualAggregateRiskHtml = methodology?.individualAggregateRiskHtml || ''
  evidenceEntries.value = normalizeEvidenceEntries(methodology?.evidenceEntries)
  hydrating.value = false
}

function normalizeEvidenceEntries(entries?: RiskEvidenceEntry[]): RiskEvidenceEntry[] {
  if (entries && entries.length) {
    return entries.map((entry) => ({ ...entry }))
  }
  return [
    {
      id: `${RISK_ASSESSMENT_METHODOLOGY_SECTION_KEY}-evidence`,
      sectionKey: RISK_ASSESSMENT_METHODOLOGY_SECTION_KEY,
      title: 'Risk Assessment Methodology Evidence Reference',
      referenceId: '',
      descriptionHtml: '',
      status: 'not_started' as RiskEvidenceStatus,
    },
  ]
}

function areEvidenceEntriesEqual(a: RiskEvidenceEntry[], b: RiskEvidenceEntry[]) {
  if (a.length !== b.length) return false
  return a.every((entry, index) => {
    const next = b[index]
    if (!next) return false
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

function saveState() {
  if (hydrating.value) return
  workspace.updateRiskManagementState({
    riskAssessmentMethodology: {
      methodologyDescriptionHtml: form.methodologyDescriptionHtml,
      justificationHtml: form.justificationHtml,
      consistentApplicationHtml: form.consistentApplicationHtml,
      individualAggregateRiskHtml: form.individualAggregateRiskHtml,
      evidenceEntries: normalizeEvidenceEntries(evidenceEntries.value),
    },
  })
}

onMounted(() => {
  if (import.meta.client) {
    hydrate(workspaceState.value)
    unsubscribe = workspace.subscribeDocumentWorkspace((state) => {
      workspaceState.value = state
      // Only hydrate if values actually changed from external source
      const methodology = state.riskManagement?.riskAssessmentMethodology
      if (methodology?.methodologyDescriptionHtml !== form.methodologyDescriptionHtml ||
          methodology?.justificationHtml !== form.justificationHtml ||
          methodology?.consistentApplicationHtml !== form.consistentApplicationHtml ||
          methodology?.individualAggregateRiskHtml !== form.individualAggregateRiskHtml) {
        hydrate(state)
      }
    })
  }
})

onUnmounted(() => {
  unsubscribe?.()
})

watch(
  () => form.methodologyDescriptionHtml,
  (newVal) => {
    if (hydrating.value) return
    const current = workspaceState.value.riskManagement?.riskAssessmentMethodology?.methodologyDescriptionHtml
    if (newVal !== current) saveState()
  }
)

watch(
  () => form.justificationHtml,
  (newVal) => {
    if (hydrating.value) return
    const current = workspaceState.value.riskManagement?.riskAssessmentMethodology?.justificationHtml
    if (newVal !== current) saveState()
  }
)

watch(
  () => form.consistentApplicationHtml,
  (newVal) => {
    if (hydrating.value) return
    const current = workspaceState.value.riskManagement?.riskAssessmentMethodology?.consistentApplicationHtml
    if (newVal !== current) saveState()
  }
)

watch(
  () => form.individualAggregateRiskHtml,
  (newVal) => {
    if (hydrating.value) return
    const current = workspaceState.value.riskManagement?.riskAssessmentMethodology?.individualAggregateRiskHtml
    if (newVal !== current) saveState()
  }
)

watch(
  evidenceEntries,
  (newVal) => {
    if (hydrating.value) return
    const current = workspaceState.value.riskManagement?.riskAssessmentMethodology?.evidenceEntries
    if (!areEvidenceEntriesEqual(newVal, current || [])) saveState()
  },
  { deep: true }
)
</script>
