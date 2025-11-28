<template>
  <div class="p-6 space-y-6">
    <!-- Header Card -->
    <UCard>
      <template #header>
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Document Management</p>
            <h1 class="text-2xl font-bold mt-1">Evidence List</h1>
            <p class="text-gray-600 dark:text-gray-300 mt-2">
              Track every evidence reference captured throughout the risk management sections. Use this list to confirm the document is fully supported before exporting.
            </p>
          </div>
          <UButton to="/document/preview" color="primary" variant="soft" icon="i-heroicons-arrow-right" trailing>
            Document Preview
          </UButton>
        </div>
      </template>
    </UCard>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <UCard>
        <div class="text-center">
          <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ summaryStats.total }}</p>
          <p class="text-sm text-gray-500 dark:text-gray-400">Total Evidence</p>
        </div>
      </UCard>
      <UCard>
        <div class="text-center">
          <p class="text-3xl font-bold text-green-600 dark:text-green-400">{{ summaryStats.complete }}</p>
          <p class="text-sm text-gray-500 dark:text-gray-400">Complete</p>
        </div>
      </UCard>
      <UCard>
        <div class="text-center">
          <p class="text-3xl font-bold text-blue-600 dark:text-blue-400">{{ summaryStats.inProgress }}</p>
          <p class="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
        </div>
      </UCard>
      <UCard>
        <div class="text-center">
          <p class="text-3xl font-bold text-gray-600 dark:text-gray-400">{{ summaryStats.notStarted }}</p>
          <p class="text-sm text-gray-500 dark:text-gray-400">Not Started</p>
        </div>
      </UCard>
    </div>

    <!-- Evidence Overview -->
    <UCard>
      <template #header>
        <div>
          <p class="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold">Evidence Tracker Overview</p>
          <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">[Reference: Clause 6.2 - Product context]</p>
          <p class="text-sm text-gray-700 dark:text-gray-300 mt-3">
            Evidence entries listed here are shared with Document Preview and DOCX export. Each entry should include a reference identifier, status, and short description.
          </p>
        </div>
      </template>

      <UTable
        :data="evidenceRows"
        :columns="columns"
        :empty-state="{
          icon: 'i-heroicons-document-magnifying-glass',
          label: 'No evidence entries yet',
          description: 'Start with the Product Context page.'
        }"
      >
        <template #section-cell="{ row }">
          <div class="space-y-1">
            <p class="font-semibold text-gray-900 dark:text-white">{{ row.original.sectionLabel }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ row.original.referenceLine }}</p>
          </div>
        </template>

        <template #title-cell="{ row }">
          <span>{{ row.original.title || '—' }}</span>
        </template>

        <template #referenceId-cell="{ row }">
          <span class="font-mono text-sm">{{ row.original.referenceId || '—' }}</span>
        </template>

        <template #status-cell="{ row }">
          <UBadge :color="statusColor(row.original.status)" variant="soft">
            {{ statusLabel(row.original.status) }}
          </UBadge>
        </template>

        <template #notes-cell="{ row }">
          <span class="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
            {{ stripHtml(row.original.descriptionHtml) || '—' }}
          </span>
        </template>

        <template #actions-cell="{ row }">
          <UButton :to="row.original.route" variant="link" size="sm">
            Update Section
          </UButton>
        </template>
      </UTable>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import {
  RISK_EVIDENCE_STATUS_OPTIONS,
  type DocumentWorkspaceState,
  type RiskEvidenceEntry,
  type RiskEvidenceStatus,
} from '~/services/documentWorkspace'

const workspace = useDocumentWorkspace()

const workspaceState = ref<DocumentWorkspaceState>(workspace.loadDocumentWorkspace())
let unsubscribe: (() => void) | null = null

const columns = [
  { id: 'section', key: 'section', header: 'Section' },
  { id: 'title', key: 'title', header: 'Evidence Title' },
  { id: 'referenceId', key: 'referenceId', header: 'Reference ID' },
  { id: 'status', key: 'status', header: 'Status' },
  { id: 'notes', key: 'notes', header: 'Notes' },
  { id: 'actions', key: 'actions', header: 'Actions' },
]

const evidenceRows = computed(() => buildEvidenceRows(workspaceState.value))

const summaryStats = computed(() => {
  const rows = evidenceRows.value
  return {
    total: rows.length,
    complete: rows.filter((r) => r.status === 'complete').length,
    inProgress: rows.filter((r) => r.status === 'in_progress').length,
    notStarted: rows.filter((r) => r.status === 'not_started').length,
  }
})

onMounted(() => {
  unsubscribe = workspace.subscribeDocumentWorkspace((state) => {
    workspaceState.value = state
  })
})

onUnmounted(() => {
  unsubscribe?.()
})

function buildEvidenceRows(state: DocumentWorkspaceState) {
  const rows: Array<
    RiskEvidenceEntry & { sectionLabel: string; referenceLine: string; route: string }
  > = []

  // Product Context evidence
  const productContext = state.riskManagement?.productContext
  if (productContext?.evidenceEntries?.length) {
    productContext.evidenceEntries.forEach((entry) => {
      rows.push({
        ...entry,
        sectionLabel: 'Product Context (Section 5.2.1)',
        referenceLine: '[Reference: Clause 6.2.1.2]',
        route: '/pcontext/intended-purpose',
      })
    })
  }

  // Product Functions evidence
  const productFunction = state.riskManagement?.productFunction
  if (productFunction?.evidenceEntries?.length) {
    productFunction.evidenceEntries.forEach((entry) => {
      rows.push({
        ...entry,
        sectionLabel: 'Product Functions (Section 5.2.2)',
        referenceLine: '[Reference: Clause 6.2.1.3]',
        route: '/pcontext/product-function',
      })
    })
  }

  // Operational Environment evidence
  const operationalEnvironment = state.riskManagement?.operationalEnvironment
  if (operationalEnvironment?.evidenceEntries?.length) {
    operationalEnvironment.evidenceEntries.forEach((entry) => {
      rows.push({
        ...entry,
        sectionLabel: 'Operational Environment (Section 5.2.3)',
        referenceLine: '[Reference: Clause 6.2.1.4]',
        route: '/pcontext/operational-environment',
      })
    })
  }

  // Product Architecture evidence
  const productArchitecture = state.riskManagement?.productArchitecture
  if (productArchitecture?.evidenceEntries?.length) {
    productArchitecture.evidenceEntries.forEach((entry) => {
      rows.push({
        ...entry,
        sectionLabel: 'Product Architecture (Section 5.2.4)',
        referenceLine: '[Reference: Clause 6.2.3]',
        route: '/pcontext/product-architecture',
      })
    })
  }

  // Product User Description evidence
  const productUserDescription = state.riskManagement?.productUserDescription
  if (productUserDescription?.evidenceEntries?.length) {
    productUserDescription.evidenceEntries.forEach((entry) => {
      rows.push({
        ...entry,
        sectionLabel: 'Product User Description (Section 5.2.5)',
        referenceLine: '[Reference: Clause 6.2.1.6]',
        route: '/pcontext/user-description',
      })
    })
  }

  // Risk Assessment Methodology evidence
  const riskAssessmentMethodology = state.riskManagement?.riskAssessmentMethodology
  if (riskAssessmentMethodology?.evidenceEntries?.length) {
    riskAssessmentMethodology.evidenceEntries.forEach((entry) => {
      rows.push({
        ...entry,
        sectionLabel: 'Risk Assessment Methodology (Section 5.3.1)',
        referenceLine: '[Reference: Clause 6.3.1]',
        route: '/riskcrit/assessment-methodology',
      })
    })
  }

  // Risk Acceptance Criteria evidence
  const riskAcceptanceCriteria = state.riskManagement?.riskAcceptanceCriteria
  if (riskAcceptanceCriteria?.evidenceEntries?.length) {
    riskAcceptanceCriteria.evidenceEntries.forEach((entry) => {
      rows.push({
        ...entry,
        sectionLabel: 'Risk Acceptance Criteria (Section 5.3.2)',
        referenceLine: '[Reference: Clause 6.3.3]',
        route: '/riskcrit/acceptance-criteria',
      })
    })
  }

  return rows
}

function stripHtml(value?: string | null) {
  if (!value) return ''
  return value.replace(/<[^>]+>/g, '').trim()
}

function statusLabel(status: RiskEvidenceStatus) {
  return RISK_EVIDENCE_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? 'Not Started'
}

function statusColor(status: RiskEvidenceStatus) {
  switch (status) {
    case 'complete':
      return 'success'
    case 'in_progress':
      return 'info'
    default:
      return 'neutral'
  }
}
</script>
