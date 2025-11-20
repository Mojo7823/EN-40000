<template>
  <div class="conformance-page standards-conformance-page">
    <section class="card title-card">
      <div>
        <p class="eyebrow">Conformance Claim</p>
        <h1>Standards Conformance</h1>
        <p class="muted">
          Capture the primary and related standards that underpin this conformance claim. These entries render in
          section 3.1 of the CRA documentation.
        </p>
      </div>
      <div class="title-card-actions">
        <RouterLink class="btn ghost" to="/document/preview">Go to Document Preview</RouterLink>
      </div>
    </section>
    
    <section class="card content-card">
      <article class="template-body">
        <p class="section-heading">Primary Standard</p>
      </article>
      
      <div class="primary-standard-content">
        <div class="detail-row">
          <span class="detail-label">Standard Code</span>
          <span class="detail-value">{{ primaryCodeDisplay }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Description</span>
          <span class="detail-value">{{ primaryDescriptionDisplay }}</span>
        </div>
      </div>
    </section>

    <section class="card content-card">
      <article class="template-body">
        <p class="section-heading">Related Standards Applied</p>
        <p class="reference-line">3.1 Standards Conformance</p>
        <p>
          Track supporting standards that broaden the claim, such as vocabulary references or security requirement
          profiles.
        </p>
      </article>

      <div class="table-section">
        <div class="table-wrapper">
          <table class="standards-table">
            <thead>
              <tr>
                <th>Standard</th>
                <th>Description</th>
                <th class="action-column">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="form.relatedStandards.length === 0">
                <td class="empty-state" colspan="3">No related standards recorded yet.</td>
              </tr>
              <tr
                v-for="entry in paginatedStandards"
                :key="entry.id"
                class="clickable-row"
                @click="openEditModal(entry)"
              >
                <td>{{ entry.code || '—' }}</td>
                <td>{{ entry.description || '—' }}</td>
                <td class="action-column" @click.stop>
                  <button class="link danger" type="button" aria-label="Delete standard" title="Delete" @click="removeStandard(entry.id)">
                    🗑️
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <button class="btn primary" type="button" @click="openCreateModal">Add Standard</button>
      </div>
    </section>

    <div v-if="isModalOpen" class="tp-modal-overlay" @click="closeModal">
      <div class="tp-modal" role="dialog" aria-modal="true" aria-labelledby="standardModalTitle" @click.stop>
        <header class="tp-modal-header">
          <div>
            <p class="modal-title">{{ modalTitle }}</p>
            <p class="modal-subtitle" id="standardModalTitle">{{ modalSubtitle }}</p>
          </div>
          <button class="modal-close" type="button" aria-label="Close" @click="closeModal">×</button>
        </header>
        <div class="tp-modal-body">
          <label class="field" v-if="modalMode !== 'primary'">
            <span>Predefined Standards</span>
            <select v-model="selectedOption">
              <option v-for="option in standardOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
            <p class="small-note">Select [Other Standard] to enter a custom reference.</p>
          </label>
          <label class="field">
            <span>Standard Code *</span>
            <input v-model="modalForm.code" type="text" placeholder="prEN 40000-1-1" />
          </label>
          <label class="field">
            <span>Description</span>
            <textarea
              v-model="modalForm.description"
              rows="3"
              placeholder="Vocabulary, Vulnerability Handling..."
            ></textarea>
          </label>
        </div>
        <footer class="tp-modal-footer">
          <p class="small-note">{{ duplicateWarning || 'Standards appear in the order they are added.' }}</p>
          <div class="button-group">
            <button
              v-if="modalMode === 'edit'"
              class="btn danger ghost"
              type="button"
              @click="deleteFromModal"
            >
              Delete
            </button>
            <button class="btn" type="button" @click="closeModal">Cancel</button>
            <button class="btn primary" type="button" :disabled="!canSaveModal" @click="saveStandard">
              Save
            </button>
          </div>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import type {
  DocumentWorkspaceState,
  StandardsConformanceState
} from '../../services/documentWorkspace'

const workspace = useDocumentWorkspace()
import type { ConformanceStandardEntry } from '../../types/conformance'
import {
  RELATED_STANDARD_DEFINITIONS,
  PRIMARY_STANDARD_DEFINITION,
  generateStandardEntryId,
} from '../../constants/conformance'

const CUSTOM_OPTION_VALUE = '__custom__'
const PAGE_SIZE = 10

const initialState = workspace.loadDocumentWorkspace()
const initialStandards = initialState.conformanceClaim.standardsConformance
const form = reactive<StandardsConformanceState>({
  primaryStandard: { ...initialStandards.primaryStandard },
  relatedStandards: initialStandards.relatedStandards.map((entry) => ({ ...entry })),
  includeOther: initialStandards.includeOther,
  otherNotes: initialStandards.otherNotes,
})

const suppressNextSync = ref(false)
let unsubscribe: (() => void) | null = null

const standardOptions = [
  ...RELATED_STANDARD_DEFINITIONS.map((definition) => ({
    value: definition.code,
    label: `${definition.code}: ${definition.description}`,
    definition,
  })),
  { value: CUSTOM_OPTION_VALUE, label: '[Other Standard]', definition: { code: '', description: '' } },
]

const standardDefinitionMap = new Map(RELATED_STANDARD_DEFINITIONS.map((definition) => [definition.code, definition]))

const isModalOpen = ref(false)
const modalMode = ref<'create' | 'edit' | 'primary'>('create')
const modalForm = reactive<ConformanceStandardEntry>({
  id: '',
  code: '',
  description: '',
  source: 'custom',
})
const selectedOption = ref(CUSTOM_OPTION_VALUE)

const currentPage = ref(1)
const totalPages = computed(() => Math.max(1, Math.ceil(form.relatedStandards.length / PAGE_SIZE)))
const paginatedStandards = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return form.relatedStandards.slice(start, start + PAGE_SIZE)
})

const primaryCodeDisplay = computed(
  () => form.primaryStandard.code?.trim() || PRIMARY_STANDARD_DEFINITION.code
)
const primaryDescriptionDisplay = computed(
  () => form.primaryStandard.description?.trim() || PRIMARY_STANDARD_DEFINITION.description
)

const modalTitle = computed(() => {
  if (modalMode.value === 'primary') {
    return 'Edit Primary Standard'
  }
  return modalMode.value === 'create' ? 'Add Standard' : 'Edit Standard'
})

const modalSubtitle = computed(() => {
  if (modalMode.value === 'primary') {
    return 'Primary Standard'
  }
  return modalMode.value === 'create' ? 'New Standard' : modalForm.code || 'Selected Standard'
})

const duplicateWarning = computed(() => {
  if (modalMode.value !== 'create' && modalMode.value !== 'edit') {
    return ''
  }
  const normalized = modalForm.code?.trim().toLowerCase() || ''
  if (!normalized) return ''
  const exists = form.relatedStandards.some(
    (entry) => entry.id !== modalForm.id && entry.code?.trim().toLowerCase() === normalized
  )
  return exists ? 'This standard already exists in the table.' : ''
})

const canSaveModal = computed(() => {
  const hasCode = Boolean(modalForm.code?.trim())
  if (modalMode.value === 'primary') {
    return hasCode
  }
  return hasCode && !duplicateWarning.value
})

watch(
  form,
  (value) => {
    if (suppressNextSync.value) {
      suppressNextSync.value = false
      return
    }
    workspace.updateConformanceClaimState({
      standardsConformance: {
        primaryStandard: { ...value.primaryStandard },
        relatedStandards: value.relatedStandards.map((entry) => ({ ...entry })),
        includeOther: value.includeOther,
        otherNotes: value.otherNotes,
      },
    })
  },
  { deep: true }
)

watch(selectedOption, (value) => {
  if (!isModalOpen.value || modalMode.value === 'primary') {
    return
  }
  const definition = standardDefinitionMap.get(value)
  if (definition) {
    modalForm.code = definition.code
    modalForm.description = definition.description
    modalForm.source = 'default'
    return
  }
  modalForm.source = 'custom'
  if (modalMode.value === 'create') {
    modalForm.code = ''
    modalForm.description = ''
  }
})

watch(
  () => form.relatedStandards.length,
  () => {
    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value
    }
    if (currentPage.value < 1) {
      currentPage.value = 1
    }
  }
)

function applyExternalState(state: DocumentWorkspaceState) {
  suppressNextSync.value = true
  const next = state.conformanceClaim.standardsConformance
  Object.assign(form.primaryStandard, next.primaryStandard)
  form.relatedStandards.splice(0, form.relatedStandards.length, ...next.relatedStandards.map((entry) => ({ ...entry })))
  form.includeOther = next.includeOther
  form.otherNotes = next.otherNotes
  currentPage.value = 1
}

onMounted(() => {
  unsubscribe = workspace.subscribeDocumentWorkspace(applyExternalState)
})

onUnmounted(() => {
  unsubscribe?.()
})

function openCreateModal() {
  modalMode.value = 'create'
  isModalOpen.value = true
  modalForm.id = ''
  modalForm.code = ''
  modalForm.description = ''
  modalForm.source = 'custom'
  selectedOption.value = CUSTOM_OPTION_VALUE
}

function openPrimaryModal() {
  modalMode.value = 'primary'
  isModalOpen.value = true
  modalForm.id = form.primaryStandard.id || ''
  modalForm.code = form.primaryStandard.code || ''
  modalForm.description = form.primaryStandard.description || ''
  modalForm.source = 'default'
  selectedOption.value = CUSTOM_OPTION_VALUE
}

function openEditModal(entry: ConformanceStandardEntry) {
  modalMode.value = 'edit'
  isModalOpen.value = true
  modalForm.id = entry.id
  modalForm.code = entry.code
  modalForm.description = entry.description
  modalForm.source = entry.source ?? 'custom'
  const match = standardDefinitionMap.get(entry.code || '')
  selectedOption.value = match && match.description === entry.description ? match.code : CUSTOM_OPTION_VALUE
}

function closeModal() {
  isModalOpen.value = false
}

function saveStandard() {
  if (!canSaveModal.value) {
    return
  }
  const code = modalForm.code.trim()
  const description = modalForm.description.trim()
  if (modalMode.value === 'primary') {
    form.primaryStandard.code = code
    form.primaryStandard.description = description
    closeModal()
    return
  }
  const source = selectedOption.value !== CUSTOM_OPTION_VALUE ? 'default' : 'custom'
  if (modalMode.value === 'create') {
    form.relatedStandards.push({
      id: generateStandardEntryId(),
      code,
      description,
      source,
    })
  } else {
    const target = form.relatedStandards.find((entry) => entry.id === modalForm.id)
    if (target) {
      target.code = code
      target.description = description
      target.source = source
    }
  }
  closeModal()
}

function removeStandard(entryId: string) {
  const index = form.relatedStandards.findIndex((entry) => entry.id === entryId)
  if (index >= 0) {
    form.relatedStandards.splice(index, 1)
  }
}

function deleteFromModal() {
  if (modalMode.value !== 'edit') {
    return
  }
  removeStandard(modalForm.id)
  closeModal()
}

function goToPreviousPage() {
  currentPage.value = Math.max(1, currentPage.value - 1)
}

function goToNextPage() {
  currentPage.value = Math.min(totalPages.value, currentPage.value + 1)
}
</script>

<style scoped>
.conformance-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.75rem;
  color: var(--muted);
  margin: 0 0 6px 0;
}

.muted {
  color: var(--muted);
  line-height: 1.6;
  margin: 0;
}

.title-card {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}

.title-card-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
  margin-left: auto;
  justify-content: flex-end;
}

.title-card-actions :deep(a) {
  text-decoration: none;
}

.form-card {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.content-card {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
}

.template-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  line-height: 1.6;
}

.template-body ul {
  margin: 8px 0;
  padding-left: 24px;
}

.section-heading {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text);
  margin: 0;
}

.reference-line {
  font-weight: 600;
  margin: 0;
}

.description-header .section-heading {
  font-size: 1.3rem;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.description-header .reference-line {
  font-weight: 600;
  font-size: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.field input,
.field textarea,
.field select {
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  padding: 10px 12px;
  background: var(--surface);
  font: inherit;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  width: 100%;
  margin-bottom: 16px;
}

.table-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.table-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.table-section {
  overflow-x: auto;
  width: 100%;
}

/* Table section wrapper */
.table-section {
  border-top: 1px solid var(--panel-border);
  padding-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Table wrapper with border and rounded corners */
.table-wrapper {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid var(--panel-border);
}

/* Unified table styling - clean design like Terminology */
.standards-table,
.regulations-table {
  width: 100%;
  min-width: 700px;
  border-collapse: separate;
  border-spacing: 0;
}

.standards-table thead,
.regulations-table thead {
  background: var(--surface-alt);
}

.standards-table th,
.regulations-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 700;
  color: var(--text);
  white-space: nowrap;
}

.standards-table td,
.regulations-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--panel-border);
}

.standards-table tbody tr.clickable-row,
.regulations-table tbody tr.clickable-row {
  cursor: pointer;
  transition: all 0.2s ease;
}

.standards-table tbody tr.clickable-row:hover,
.regulations-table tbody tr.clickable-row:hover {
  background: var(--surface-alt);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.standards-table tbody tr:last-child td,
.regulations-table tbody tr:last-child td {
  border-bottom: none;
}

.action-column {
  width: 100px;
  text-align: center !important;
}

.standards-table .link.danger,
.regulations-table .link.danger {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  font-size: 1.2rem;
  transition: transform 0.2s, background-color 0.2s;
  border-radius: 6px;
}

.standards-table .link.danger:hover,
.regulations-table .link.danger:hover {
  transform: scale(1.1);
  background-color: rgba(255, 59, 48, 0.1);
}

.empty-state {
  text-align: center !important;
  color: var(--text-muted);
  font-style: italic;
  padding: 32px 16px !important;
}

/* Regulation/Standard name column */
.standards-table th:first-child,
.standards-table td:first-child,
.regulations-table th:first-child,
.regulations-table td:first-child {
  width: 25%;
  min-width: 150px;
}

/* Description column - gets most space */
.standards-table th:nth-child(2),
.standards-table td:nth-child(2),
.regulations-table th:nth-child(2),
.regulations-table td:nth-child(2) {
  width: auto;
  min-width: 200px;
}

/* Actions column */
.standards-table th:last-child,
.standards-table td:last-child,
.regulations-table th:last-child,
.regulations-table td:last-child {
  width: 80px;
  min-width: 80px;
  max-width: 80px;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
}

.standards-table td:last-child,
.regulations-table td:last-child {
  padding: 8px;
}

.link.danger {
  color: var(--danger);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s ease, transform 0.1s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.link.danger:hover {
  background: rgba(220, 38, 38, 0.1);
  transform: scale(1.1);
}

.empty-state {
  text-align: center;
  padding: 16px;
  color: var(--text-muted);
}

.small-note {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.tp-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 60;
  padding: 24px;
  backdrop-filter: blur(2px);
}

.tp-modal {
  width: min(640px, 100%);
  background: var(--panel);
  border-radius: 16px;
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.35);
  display: flex;
  flex-direction: column;
}

.tp-modal-header {
  padding: 24px;
  border-bottom: 1px solid var(--panel-border);
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
}

.modal-title {
  font-size: 1.4rem;
  font-weight: 700;
}

.modal-subtitle {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-muted);
}

.tp-modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tp-modal-footer {
  padding: 20px 24px;
  border-top: 1px solid var(--panel-border);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.table-pagination {
  display: flex;
  align-items: center;
  gap: 8px;
}

.table-pagination .page-label {
  font-size: 0.9rem;
  font-weight: 600;
}

.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--panel-border);
  border-radius: 6px;
  background: var(--surface);
  cursor: pointer;
}

.btn-icon:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.primary-standard-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 16px;
  background: var(--table-header-bg, rgba(148, 163, 184, 0.15));
  border-radius: 12px;
}

/* Primary standard content */
.primary-standard-content {
  border-top: 1px solid var(--panel-border);
  padding-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-label {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text);
}

.detail-value {
  font-size: 1rem;
  color: var(--text);
  line-height: 1.5;
}

/* Legacy support */
.primary-standard-details .detail {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.primary-standard-details .detail-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted);
}

.primary-standard-details .detail-value {
  font-size: 1rem;
  font-weight: 600;
}

.primary-standard-actions {
  display: flex;
  justify-content: flex-end;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.6rem;
  cursor: pointer;
  color: var(--text);
}

.button-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.regulatory-reference-card {
  gap: 12px;
}

.regulatory-reference-card .regulatory-copy {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.regulatory-reference-card ul {
  padding-left: 20px;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.conformance-level-status-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 8px;
}

.conformance-level-status-grid .status-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  background: var(--surface-muted);
  cursor: pointer;
  min-width: 200px;
}

.conformance-level-status-grid .status-option input {
  width: 16px;
  height: 16px;
}

.justification-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-subtitle {
  font-weight: 600;
  margin: 0;
}
</style>
