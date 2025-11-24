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
          <UButton to="/pcontext/intended-purpose" color="neutral" variant="ghost">
            Go to Product Context
          </UButton>
        </div>
      </template>
    </UCard>

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

const columns: any[] = [
  { id: 'section', key: 'section', label: 'Section' },
  { id: 'title', key: 'title', label: 'Evidence Title' },
  { id: 'referenceId', key: 'referenceId', label: 'Reference ID' },
  { id: 'status', key: 'status', label: 'Status' },
  { id: 'notes', key: 'notes', label: 'Notes' },
  { id: 'actions', key: 'actions', label: 'Actions' },
]

const evidenceRows = computed(() => buildEvidenceRows(workspaceState.value))

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
  const productContext = state.riskManagement?.productContext
  if (productContext?.evidenceEntries?.length) {
    productContext.evidenceEntries.forEach((entry) => {
      rows.push({
        ...entry,
        sectionLabel: 'Product Context (Section 5.2)',
        referenceLine: '[Reference: Clause 6.2.1.2]',
        route: '/pcontext/intended-purpose',
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
