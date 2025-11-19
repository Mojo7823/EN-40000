<template>
  <div class="evidence-list-page">
    <section class="card hero-card">
      <div>
        <p class="eyebrow">Document Management</p>
        <h1>Evidence List</h1>
        <p class="muted">
          Track every evidence reference captured throughout the risk management sections. Use this list to confirm the
          document is fully supported before exporting.
        </p>
      </div>
      <div class="title-card-actions">
        <RouterLink class="btn ghost" to="/risk/product-context">Go to Product Context</RouterLink>
      </div>
    </section>

    <section class="card content-card">
      <article class="template-body">
        <p class="section-heading">Evidence Tracker Overview</p>
        <p class="reference-line">[Reference: Clause 6.1 - Risk Management Elements]</p>
        <p>
          Evidence entries listed here are shared with Document Preview and DOCX export. Each entry should include a
          reference identifier, status, and short description.
        </p>
      </article>

      <div class="table-section">
        <div class="table-wrapper">
          <table class="evidence-table">
            <thead>
              <tr>
                <th>Section</th>
                <th>Evidence Title</th>
                <th>Reference ID</th>
                <th>Status</th>
                <th>Notes</th>
                <th class="action-column">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!evidenceRows.length">
                <td class="empty-state" colspan="6">No evidence entries yet. Start with the Product Context page.</td>
              </tr>
              <tr v-for="entry in evidenceRows" :key="entry.id">
                <td>
                  <p class="section-title">{{ entry.sectionLabel }}</p>
                  <p class="section-reference">{{ entry.referenceLine }}</p>
                </td>
                <td>{{ entry.title || '—' }}</td>
                <td>{{ entry.referenceId || '—' }}</td>
                <td>
                  <span :class="['status-chip', entry.status]">{{ formatStatus(entry.status) }}</span>
                </td>
                <td>{{ entry.descriptionHtml ? stripHtml(entry.descriptionHtml) : '—' }}</td>
                <td class="action-column">
                  <RouterLink class="link" :to="entry.route">Update Section</RouterLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import {
  RISK_EVIDENCE_STATUS_OPTIONS,
  loadDocumentWorkspace,
  subscribeDocumentWorkspace,
  type DocumentWorkspaceState,
  type RiskEvidenceEntry,
} from '../../services/documentWorkspace'

const workspaceState = ref<DocumentWorkspaceState>(loadDocumentWorkspace())
const evidenceRows = computed(() => buildEvidenceRows(workspaceState.value))
const statusOptions = RISK_EVIDENCE_STATUS_OPTIONS
let unsubscribe: (() => void) | null = null

onMounted(() => {
  unsubscribe = subscribeDocumentWorkspace((state) => {
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
        sectionLabel: 'Product Context Establishment',
        referenceLine: '[Reference: Clause 6.1.1]',
        route: '/risk/product-context',
      })
    })
  }
  return rows
}

function formatStatus(status: string) {
  return statusOptions.find((option) => option.value === status)?.label ?? 'Not Started'
}

function stripHtml(value?: string | null) {
  if (!value) return ''
  const div = document.createElement('div')
  div.innerHTML = value
  return div.textContent?.trim() ?? ''
}
</script>

<style scoped>
.evidence-list-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.hero-card {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  align-items: flex-start;
}

.table-wrapper {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid var(--panel-border);
}

.evidence-table {
  width: 100%;
  min-width: 800px;
  border-collapse: separate;
  border-spacing: 0;
}

.evidence-table th,
.evidence-table td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--panel-border);
  text-align: left;
}

.evidence-table thead {
  background: var(--surface-alt);
}

.evidence-table tbody tr:last-child td {
  border-bottom: none;
}

.section-title {
  font-weight: 600;
  margin: 0;
}

.section-reference {
  margin: 0;
  font-size: 0.85rem;
  color: var(--muted);
}

.status-chip {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  border: 1px solid var(--panel-border);
  background: var(--surface-alt);
}

.status-chip.in_progress {
  background: rgba(250, 204, 21, 0.15);
  border-color: rgba(250, 204, 21, 0.4);
  color: #92400e;
}

.status-chip.complete {
  background: rgba(34, 197, 94, 0.15);
  border-color: rgba(34, 197, 94, 0.4);
  color: #166534;
}

.status-chip.not_started {
  background: rgba(107, 114, 128, 0.15);
  border-color: rgba(107, 114, 128, 0.4);
  color: #374151;
}

.action-column {
  text-align: center;
  min-width: 140px;
}

.link {
  text-decoration: none;
  color: var(--primary, #5a54ff);
  font-weight: 600;
}

.empty-state {
  text-align: center;
  color: var(--muted);
  padding: 36px 16px !important;
}
</style>
