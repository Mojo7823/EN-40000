<template>
  <div class="container mx-auto p-6 space-y-6">
    <!-- Header Card -->
    <UCard
      class="border-primary-200 dark:border-primary-800 bg-gradient-to-r from-primary-50/80 via-white to-white dark:from-primary-950 dark:via-gray-950 dark:to-gray-900"
    >
      <template #header>
        <div class="flex items-start justify-between">
          <div>
            <p class="text-xs uppercase tracking-wide text-primary-700 dark:text-primary-300 font-semibold">Risk Acceptance Criteria and Methodology</p>
            <h1 class="text-3xl font-bold mt-2 text-gray-900 dark:text-white">Risk Acceptance Criteria</h1>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
              [Reference: Clause 6.3.3 - Risk acceptance criteria]
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
          <p class="text-xs uppercase tracking-wide text-primary-700 dark:text-primary-300 font-semibold">Section 5.3.2</p>
          <h2 class="text-xl font-bold mt-2 text-gray-900 dark:text-white">Risk Acceptance Criteria</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">[Reference: Clause 6.3.3]</p>
        </div>
      </template>

      <div class="prose dark:prose-invert max-w-none mb-4">
        <p class="text-blue-600 dark:text-blue-400 italic">
          <strong>Requirement [Clause 6.3.3]:</strong>
        </p>
        <p class="text-blue-600 dark:text-blue-400 italic">
          "The risk acceptance criteria shall be defined and documented considering at least the assumptions and expectations regarding the:
        </p>
        <ul class="text-blue-600 dark:text-blue-400 italic">
          <li>relevant regulatory factors;</li>
          <li>relevant contractual factors;</li>
          <li>nature of known risks;</li>
          <li>nature of the users;</li>
          <li>the nature of the product; and,</li>
          <li>state of the art and current values of society."</li>
        </ul>
      </div>
    </UCard>

    <!-- Risk Acceptance Criteria Card -->
    <UCard>
      <template #header>
        <div class="flex items-start justify-between">
          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">Risk Acceptance Criteria</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Define clear criteria for when residual risks are considered acceptable.
            </p>
          </div>
          <UButton color="neutral" variant="soft" size="sm" @click="insertAcceptanceCriteriaTemplate">
            <UIcon name="i-heroicons-document-text" class="mr-1" />
            Insert Template
          </UButton>
        </div>
      </template>

      <RichTextEditor v-model="form.riskAcceptanceCriteriaHtml" min-height="400px" placeholder="Define risk acceptance criteria..." />
    </UCard>


    <!-- Regulatory Factors Card -->
    <UCard>
      <template #header>
        <div class="flex items-start justify-between">
          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">2. Regulatory Factors</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Describe how regulations influence risk acceptance.
            </p>
          </div>
          <UButton color="neutral" variant="soft" size="sm" @click="insertRegulatoryFactorsTemplate">
            <UIcon name="i-heroicons-document-text" class="mr-1" />
            Insert Template
          </UButton>
        </div>
      </template>

      <RichTextEditor v-model="form.regulatoryFactorsHtml" min-height="300px" placeholder="Describe regulatory factors..." />
    </UCard>

    <!-- Contractual Factors Card -->
    <UCard>
      <template #header>
        <div class="flex items-start justify-between">
          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">3. Contractual Factors</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Describe any contractual agreements affecting risk acceptance.
            </p>
          </div>
          <UButton color="neutral" variant="soft" size="sm" @click="insertContractualFactorsTemplate">
            <UIcon name="i-heroicons-document-text" class="mr-1" />
            Insert Template
          </UButton>
        </div>
      </template>

      <RichTextEditor v-model="form.contractualFactorsHtml" min-height="300px" placeholder="Describe contractual factors..." />
    </UCard>

    <!-- Nature of Known Risks Card -->
    <UCard>
      <template #header>
        <div class="flex items-start justify-between">
          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">4. Nature of Known Risks</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Describe how risk characteristics affect acceptance.
            </p>
          </div>
          <UButton color="neutral" variant="soft" size="sm" @click="insertNatureOfKnownRisksTemplate">
            <UIcon name="i-heroicons-document-text" class="mr-1" />
            Insert Template
          </UButton>
        </div>
      </template>

      <RichTextEditor v-model="form.natureOfKnownRisksHtml" min-height="300px" placeholder="Describe nature of known risks..." />
    </UCard>

    <!-- Nature of the Users Card -->
    <UCard>
      <template #header>
        <div class="flex items-start justify-between">
          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">5. Nature of the Users</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Describe how user characteristics affect acceptance.
            </p>
          </div>
          <UButton color="neutral" variant="soft" size="sm" @click="insertNatureOfUsersTemplate">
            <UIcon name="i-heroicons-document-text" class="mr-1" />
            Insert Template
          </UButton>
        </div>
      </template>

      <RichTextEditor v-model="form.natureOfUsersHtml" min-height="300px" placeholder="Describe nature of users..." />
    </UCard>

    <!-- Nature of the Product Card -->
    <UCard>
      <template #header>
        <div class="flex items-start justify-between">
          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">6. Nature of the Product</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Describe how product characteristics affect acceptance.
            </p>
          </div>
          <UButton color="neutral" variant="soft" size="sm" @click="insertNatureOfProductTemplate">
            <UIcon name="i-heroicons-document-text" class="mr-1" />
            Insert Template
          </UButton>
        </div>
      </template>

      <RichTextEditor v-model="form.natureOfProductHtml" min-height="300px" placeholder="Describe nature of product..." />
    </UCard>

    <!-- State of the Art Card -->
    <UCard>
      <template #header>
        <div class="flex items-start justify-between">
          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">7. State of the Art and Current Values of Society</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Describe how industry standards and societal expectations affect acceptance.
            </p>
          </div>
          <UButton color="neutral" variant="soft" size="sm" @click="insertStateOfTheArtTemplate">
            <UIcon name="i-heroicons-document-text" class="mr-1" />
            Insert Template
          </UButton>
        </div>
      </template>

      <RichTextEditor v-model="form.stateOfTheArtHtml" min-height="300px" placeholder="Describe state of the art..." />
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
          Track evidence references that support the risk acceptance criteria.
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
                  Risk Acceptance Criteria (Clause 6.3.3)
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
              <UInput v-model="entry.title" placeholder="Risk Acceptance Criteria Document" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reference ID</label>
              <UInput v-model="entry.referenceId" placeholder="EVD-RAC-001" class="w-full" />
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
import { RISK_ACCEPTANCE_CRITERIA_SECTION_KEY } from '~/services/documentWorkspace'

const workspace = useDocumentWorkspace()

const workspaceState = ref<DocumentWorkspaceState>(workspace.loadDocumentWorkspace())
const hydrating = ref(false)
const form = reactive({
  riskAcceptanceCriteriaHtml: '',
  regulatoryFactorsHtml: '',
  contractualFactorsHtml: '',
  natureOfKnownRisksHtml: '',
  natureOfUsersHtml: '',
  natureOfProductHtml: '',
  stateOfTheArtHtml: '',
})
const evidenceEntries = ref<RiskEvidenceEntry[]>([])
let unsubscribe: (() => void) | null = null

// Templates
const ACCEPTANCE_CRITERIA_TEMPLATE = `<p>[Define clear criteria for when residual risks are considered acceptable:]</p>
<p>The following criteria are used to determine risk acceptance for <strong>[Product Name]</strong>:</p>
<p><strong>1. General Acceptance Threshold:</strong></p>
<p>Residual risks are generally acceptable when:</p>
<ul>
<li>Risk level is rated as <strong>[Low or Very Low]</strong> after treatment</li>
<li>All reasonably practicable mitigation measures have been applied</li>
<li>The risk is clearly communicated to affected stakeholders when required</li>
<li>No safer alternative functionality is available</li>
</ul>`

const REGULATORY_FACTORS_TEMPLATE = `<p>[Describe how regulations influence acceptance:]</p>
<p>The following regulatory requirements affect risk acceptance:</p>
<ul>
<li><strong>CRA Compliance:</strong> All risks that could prevent conformance with CRA essential requirements (Annex I Part I and Part II) are not acceptable without mitigation</li>
<li><strong>GDPR Compliance:</strong> Risks to personal data confidentiality, integrity, or availability rated <strong>[Medium or higher]</strong> are not acceptable without mitigation</li>
<li><strong>Safety Regulations:</strong> [If applicable, describe safety-related risk acceptance criteria]</li>
<li><strong>Accessibility Requirements:</strong> Risks that prevent accessible use by protected user groups under EAA are not acceptable</li>
</ul>`

const CONTRACTUAL_FACTORS_TEMPLATE = `<p>[Describe any contractual agreements affecting risk acceptance:]</p>
<ul>
<li><strong>Tailor-Made Products:</strong> For products customized for specific business users, deviations from secure-by-default can be accepted when:
<ul>
<li>Explicitly agreed in writing with the customer</li>
<li>Customer acknowledges the residual risk</li>
<li>Alternative mitigation measures are documented</li>
<li>Risks are not safety-related</li>
</ul>
</li>
</ul>
<p>[If applicable:]</p>
<ul>
<li><strong>Service Level Agreements:</strong> [Describe how SLAs affect risk acceptance]</li>
<li><strong>Supplier Agreements:</strong> [Describe risk sharing with suppliers via CSSA]</li>
</ul>`

const NATURE_OF_KNOWN_RISKS_TEMPLATE = `<p>[Describe how risk characteristics affect acceptance:]</p>
<p>Risk acceptance considers:</p>
<ul>
<li><strong>Health and Safety Impact:</strong> Risks with potential for physical harm are generally not acceptable above <strong>[Very Low]</strong> level</li>
<li><strong>Discoverability:</strong> Risks that users cannot detect or respond to require lower acceptance thresholds than risks users can monitor</li>
<li><strong>Speed of Materialization:</strong> Risks that materialize rapidly (e.g., real-time attacks) require more stringent controls than slow-moving risks</li>
<li><strong>Attack Scalability:</strong> Risks enabling attacks against multiple products simultaneously (especially via RDPS) require lower acceptance thresholds</li>
<li><strong>Reversibility:</strong> Risks causing irreversible harm (e.g., data destruction) require more stringent controls than reversible impacts</li>
</ul>`

const NATURE_OF_USERS_TEMPLATE = `<p>[Describe how user characteristics affect acceptance:]</p>
<p>Risk acceptance considers the following user factors:</p>
<ul>
<li><strong>Vulnerable Users:</strong> Products used by children, elderly, or users with disabilities have stricter risk acceptance criteria (no Medium or higher risks acceptable without exceptional mitigation)</li>
<li><strong>Consumer vs. Professional:</strong>
<ul>
<li>Consumer products: Users have limited ability to implement additional controls; stricter acceptance criteria apply</li>
<li>Professional products: Users may implement organizational controls; some risks can be transferred with appropriate communication</li>
</ul>
</li>
<li><strong>User Security Capability:</strong>
<ul>
<li>Non-technical users: Security must not rely on user actions; automation and secure-by-default are required</li>
<li>Technical users: Some configuration-based risk mitigation may be acceptable with clear guidance</li>
</ul>
</li>
<li><strong>Number of Users:</strong> Products serving large user populations have stricter criteria due to aggregate impact</li>
</ul>`

const NATURE_OF_PRODUCT_TEMPLATE = `<p>[Describe how product characteristics affect acceptance:]</p>
<p>Risk acceptance considers:</p>
<ul>
<li><strong>Product Criticality:</strong> [e.g., "This product is classified as <strong>[Important/Critical/Non-Critical]</strong> based on its functions. Important products have stricter acceptance criteria."]</li>
<li><strong>Operational Environment:</strong>
<ul>
<li>Protected Environment: Higher risk levels may be acceptable when product operates in environment with defense-in-depth (e.g., behind firewalls, with monitoring)</li>
<li>Exposed Environment: Stricter criteria apply for products directly exposed to internet</li>
</ul>
</li>
<li><strong>RDPS Dependence:</strong> Risks to RDPS availability and security have stricter criteria when core functions depend on RDPS</li>
<li><strong>Product Quantity:</strong> [e.g., "This product is produced in <strong>[high/medium/low]</strong> volumes. High-volume products have stricter criteria due to attack scalability."]</li>
<li><strong>Support Period:</strong> [e.g., "This product has a support period of <strong>[X years]</strong>. Longer support periods require more conservative risk acceptance to account for evolving threats."]</li>
</ul>`

const STATE_OF_THE_ART_TEMPLATE = `<p>[Describe how industry standards and societal expectations affect acceptance:]</p>
<p>Risk acceptance is informed by:</p>
<ul>
<li><strong>Industry Standards:</strong> Alignment with [list relevant standards - e.g., ETSI EN 303 645, IEC 62443-4-2, NIST Cybersecurity Framework]</li>
<li><strong>State of the Art:</strong> Risks are not acceptable if:
<ul>
<li>Well-established technical solutions exist in the industry</li>
<li>The product does not implement generally acknowledged best practices</li>
<li>Competitors implement stronger controls for similar risks</li>
</ul>
</li>
<li><strong>Current Values:</strong> Considering current societal expectations for:
<ul>
<li>Privacy protection (strong encryption, minimal data collection)</li>
<li>Transparency (clear communication of risks and data usage)</li>
<li>User control (ability to disable features, export data)</li>
<li>Accessibility (security features usable by all)</li>
</ul>
</li>
</ul>`

function insertAcceptanceCriteriaTemplate() {
  form.riskAcceptanceCriteriaHtml = ACCEPTANCE_CRITERIA_TEMPLATE
}

function insertRegulatoryFactorsTemplate() {
  form.regulatoryFactorsHtml = REGULATORY_FACTORS_TEMPLATE
}

function insertContractualFactorsTemplate() {
  form.contractualFactorsHtml = CONTRACTUAL_FACTORS_TEMPLATE
}

function insertNatureOfKnownRisksTemplate() {
  form.natureOfKnownRisksHtml = NATURE_OF_KNOWN_RISKS_TEMPLATE
}

function insertNatureOfUsersTemplate() {
  form.natureOfUsersHtml = NATURE_OF_USERS_TEMPLATE
}

function insertNatureOfProductTemplate() {
  form.natureOfProductHtml = NATURE_OF_PRODUCT_TEMPLATE
}

function insertStateOfTheArtTemplate() {
  form.stateOfTheArtHtml = STATE_OF_THE_ART_TEMPLATE
}

function hydrate(state: DocumentWorkspaceState) {
  hydrating.value = true
  const criteria = state.riskManagement?.riskAcceptanceCriteria
  form.riskAcceptanceCriteriaHtml = criteria?.riskAcceptanceCriteriaHtml || ''
  form.regulatoryFactorsHtml = criteria?.regulatoryFactorsHtml || ''
  form.contractualFactorsHtml = criteria?.contractualFactorsHtml || ''
  form.natureOfKnownRisksHtml = criteria?.natureOfKnownRisksHtml || ''
  form.natureOfUsersHtml = criteria?.natureOfUsersHtml || ''
  form.natureOfProductHtml = criteria?.natureOfProductHtml || ''
  form.stateOfTheArtHtml = criteria?.stateOfTheArtHtml || ''
  evidenceEntries.value = normalizeEvidenceEntries(criteria?.evidenceEntries)
  hydrating.value = false
}

function normalizeEvidenceEntries(entries?: RiskEvidenceEntry[]): RiskEvidenceEntry[] {
  if (entries && entries.length) {
    return entries.map((entry) => ({ ...entry }))
  }
  return [
    {
      id: `${RISK_ACCEPTANCE_CRITERIA_SECTION_KEY}-evidence`,
      sectionKey: RISK_ACCEPTANCE_CRITERIA_SECTION_KEY,
      title: 'Risk Acceptance Criteria Evidence Reference',
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
    riskAcceptanceCriteria: {
      riskAcceptanceCriteriaHtml: form.riskAcceptanceCriteriaHtml,
      regulatoryFactorsHtml: form.regulatoryFactorsHtml,
      contractualFactorsHtml: form.contractualFactorsHtml,
      natureOfKnownRisksHtml: form.natureOfKnownRisksHtml,
      natureOfUsersHtml: form.natureOfUsersHtml,
      natureOfProductHtml: form.natureOfProductHtml,
      stateOfTheArtHtml: form.stateOfTheArtHtml,
      evidenceEntries: normalizeEvidenceEntries(evidenceEntries.value),
    },
  })
}

onMounted(() => {
  if (import.meta.client) {
    hydrate(workspaceState.value)
    unsubscribe = workspace.subscribeDocumentWorkspace((state) => {
      workspaceState.value = state
      const criteria = state.riskManagement?.riskAcceptanceCriteria
      if (criteria?.riskAcceptanceCriteriaHtml !== form.riskAcceptanceCriteriaHtml ||
          criteria?.regulatoryFactorsHtml !== form.regulatoryFactorsHtml ||
          criteria?.contractualFactorsHtml !== form.contractualFactorsHtml ||
          criteria?.natureOfKnownRisksHtml !== form.natureOfKnownRisksHtml ||
          criteria?.natureOfUsersHtml !== form.natureOfUsersHtml ||
          criteria?.natureOfProductHtml !== form.natureOfProductHtml ||
          criteria?.stateOfTheArtHtml !== form.stateOfTheArtHtml) {
        hydrate(state)
      }
    })
  }
})

onUnmounted(() => {
  unsubscribe?.()
})

watch(() => form.riskAcceptanceCriteriaHtml, (newVal) => {
  if (hydrating.value) return
  const current = workspaceState.value.riskManagement?.riskAcceptanceCriteria?.riskAcceptanceCriteriaHtml
  if (newVal !== current) saveState()
})

watch(() => form.regulatoryFactorsHtml, (newVal) => {
  if (hydrating.value) return
  const current = workspaceState.value.riskManagement?.riskAcceptanceCriteria?.regulatoryFactorsHtml
  if (newVal !== current) saveState()
})

watch(() => form.contractualFactorsHtml, (newVal) => {
  if (hydrating.value) return
  const current = workspaceState.value.riskManagement?.riskAcceptanceCriteria?.contractualFactorsHtml
  if (newVal !== current) saveState()
})

watch(() => form.natureOfKnownRisksHtml, (newVal) => {
  if (hydrating.value) return
  const current = workspaceState.value.riskManagement?.riskAcceptanceCriteria?.natureOfKnownRisksHtml
  if (newVal !== current) saveState()
})

watch(() => form.natureOfUsersHtml, (newVal) => {
  if (hydrating.value) return
  const current = workspaceState.value.riskManagement?.riskAcceptanceCriteria?.natureOfUsersHtml
  if (newVal !== current) saveState()
})

watch(() => form.natureOfProductHtml, (newVal) => {
  if (hydrating.value) return
  const current = workspaceState.value.riskManagement?.riskAcceptanceCriteria?.natureOfProductHtml
  if (newVal !== current) saveState()
})

watch(() => form.stateOfTheArtHtml, (newVal) => {
  if (hydrating.value) return
  const current = workspaceState.value.riskManagement?.riskAcceptanceCriteria?.stateOfTheArtHtml
  if (newVal !== current) saveState()
})

watch(
  evidenceEntries,
  (newVal) => {
    if (hydrating.value) return
    const current = workspaceState.value.riskManagement?.riskAcceptanceCriteria?.evidenceEntries
    if (!areEvidenceEntriesEqual(newVal, current || [])) saveState()
  },
  { deep: true }
)
</script>
