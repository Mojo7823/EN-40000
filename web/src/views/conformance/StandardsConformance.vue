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
    
    <section class="card form-card primary-standard-card">
      <header class="description-header">
        <p class="section-heading">Primary Standard</p>
      </header>
      <div class="primary-standard-details">
        <div class="detail">
          <span class="detail-label">Standard Code</span>
          <span class="detail-value">{{ primaryCodeDisplay }}</span>
        </div>
        <div class="detail">
          <span class="detail-label">Description</span>
          <span class="detail-value">{{ primaryDescriptionDisplay }}</span>
        </div>
      </div>
    </section>

    <section class="card form-card standards-table-card">
      <header class="description-header">
        <p class="section-heading">Related Standards Applied</p>
        <p class="reference-line">3.1 Standards Conformance</p>
        <p class="muted italic">
          Track supporting standards that broaden the claim, such as vocabulary references or security requirement
          profiles.
        </p>
      </header>

      <div class="table-toolbar">
        <div class="table-actions">
          <button class="btn primary" type="button" @click="openCreateModal">Add Standard</button>
        </div>
        <div class="table-controls">
          <div class="table-pagination" v-if="totalPages > 1">
            <button class="btn-icon" type="button" :disabled="currentPage <= 1" @click="goToPreviousPage" aria-label="Previous page">
              ‹
            </button>
            <span class="page-label">Page {{ currentPage }} / {{ totalPages }}</span>
            <button class="btn-icon" type="button" :disabled="currentPage >= totalPages" @click="goToNextPage" aria-label="Next page">
              ›
            </button>
          </div>
        </div>
      </div>

      <section class="table-section">
        <div class="table-shell">
          <table class="standards-table">
            <thead>
              <tr>
                <th>Standard</th>
                <th>Description</th>
                <th class="actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="entry in paginatedStandards"
                :key="entry.id"
                role="button"
                class="table-row"
                @click="openEditModal(entry)"
                @keydown.enter.prevent="openEditModal(entry)"
                @keydown.space.prevent="openEditModal(entry)"
                tabindex="0"
              >
                <td>{{ entry.code || '—' }}</td>
                <td>{{ entry.description || '—' }}</td>
                <td class="actions" @click.stop>
                  <button class="link danger" type="button" aria-label="Delete standard" title="Delete" @click="removeStandard(entry.id)">
                    🗑️
                  </button>
                </td>
              </tr>
              <tr v-if="form.relatedStandards.length === 0">
                <td class="empty-state" colspan="3">No related standards recorded yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
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
import {
  loadDocumentWorkspace,
  subscribeDocumentWorkspace,
  updateConformanceClaimState,
  type DocumentWorkspaceState,
  type StandardsConformanceState,
} from '../../services/documentWorkspace'
import type { ConformanceStandardEntry } from '../../types/conformance'
import {
  RELATED_STANDARD_DEFINITIONS,
  PRIMARY_STANDARD_DEFINITION,
  generateStandardEntryId,
} from '../../constants/conformance'

const CUSTOM_OPTION_VALUE = '__custom__'
const PAGE_SIZE = 10

const initialState = loadDocumentWorkspace()
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
    updateConformanceClaimState({
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
  unsubscribe = subscribeDocumentWorkspace(applyExternalState)
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

<style scoped src="./ConformancePages.css"></style>
