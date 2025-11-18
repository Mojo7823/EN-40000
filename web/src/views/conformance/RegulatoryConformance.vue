<template>
  <div class="conformance-page regulatory-conformance-page">
    <section class="card title-card">
      <div>
        <p class="eyebrow">Conformance Claim</p>
        <h1>Regulatory Conformance</h1>
        <p class="muted">
          Document the directives, regulations, or sector-specific rules that this product adheres to as part of the CRA
          submission.
        </p>
      </div>
      <div class="title-card-actions">
        <RouterLink class="btn ghost" to="/conformance/standards">Standards Conformance</RouterLink>
        <RouterLink class="btn ghost" to="/conformance/level">Conformance Level</RouterLink>
        <RouterLink class="btn ghost" to="/document/preview">Document Preview</RouterLink>
      </div>
    </section>

    <section class="card form-card regulatory-reference-card">
      <header class="description-header">
        <p class="section-heading">3.2 Regulatory Conformance</p>
        <p class="reference-line">[Reference: Annex C - Relationship with CRA]</p>
        <p class="muted italic">
          This product is intended to conform to the essential cybersecurity requirements of the Cyber Resilience Act.
        </p>
      </header>
      <div class="regulatory-copy">
        <p>This product is intended to conform to the essential cybersecurity requirements of:</p>
        <ul>
          <li v-for="item in primaryReferences" :key="item">{{ item }}</li>
        </ul>
      </div>
    </section>

    <section class="card form-card standards-table-card">
      <header class="description-header">
        <p class="section-heading">Other Applicable Regulations</p>
        <p class="muted italic">
          List complementary regulations or directives (e.g., privacy, accessibility, safety) that reinforce the CRA
          conformance claim.
        </p>
      </header>

      <div class="table-toolbar">
        <div class="table-actions">
          <button class="btn primary" type="button" @click="openCreateModal">Add Regulation</button>
        </div>
        <div class="table-controls">
          <div class="table-pagination" v-if="totalPages > 1">
            <button
              class="btn-icon"
              type="button"
              :disabled="currentPage <= 1"
              @click="goToPreviousPage"
              aria-label="Previous page"
            >
              ‹
            </button>
            <span class="page-label">Page {{ currentPage }} / {{ totalPages }}</span>
            <button
              class="btn-icon"
              type="button"
              :disabled="currentPage >= totalPages"
              @click="goToNextPage"
              aria-label="Next page"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      <section class="table-section">
        <div class="table-shell">
          <table class="regulations-table">
            <thead>
              <tr>
                <th>Regulation</th>
                <th>Description</th>
                <th class="actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="entry in paginatedEntries"
                :key="entry.id"
                role="button"
                class="table-row"
                tabindex="0"
                @click="openEditModal(entry)"
                @keydown.enter.prevent="openEditModal(entry)"
                @keydown.space.prevent="openEditModal(entry)"
              >
                <td>{{ entry.regulation || '—' }}</td>
                <td>{{ entry.description || '—' }}</td>
                <td class="actions" @click.stop>
                  <button
                    class="link danger"
                    type="button"
                    aria-label="Delete regulation"
                    title="Delete"
                    @click="removeEntry(entry.id)"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
              <tr v-if="form.additionalRegulations.length === 0">
                <td class="empty-state" colspan="3">No regulations captured yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </section>

    <div v-if="isModalOpen" class="tp-modal-overlay" @click="closeModal">
      <div class="tp-modal" role="dialog" aria-modal="true" aria-labelledby="regulationModalTitle" @click.stop>
        <header class="tp-modal-header">
          <div>
            <p class="modal-title">{{ modalTitle }}</p>
            <p class="modal-subtitle" id="regulationModalTitle">{{ modalSubtitle }}</p>
          </div>
          <button class="modal-close" type="button" aria-label="Close" @click="closeModal">×</button>
        </header>
        <div class="tp-modal-body">
          <label class="field">
            <span>Suggested Regulations</span>
            <select v-model="selectedOption">
              <option v-for="option in regulationOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
            <p class="small-note">Select [Other Regulation] to enter a custom reference.</p>
          </label>
          <label class="field">
            <span>Regulation *</span>
            <input v-model="modalForm.regulation" type="text" placeholder="GDPR" />
          </label>
          <label class="field">
            <span>Description</span>
            <textarea
              v-model="modalForm.description"
              rows="3"
              placeholder="General Data Protection Regulation"
            ></textarea>
          </label>
          <p class="small-note" v-if="duplicateWarning">{{ duplicateWarning }}</p>
          <p class="small-note" v-else>{{ modalStatus }}</p>
        </div>
        <footer class="tp-modal-footer">
          <div class="button-group">
            <button v-if="modalMode === 'edit'" class="btn danger ghost" type="button" @click="deleteFromModal">
              Delete
            </button>
            <button class="btn" type="button" @click="closeModal">Cancel</button>
            <button class="btn primary" type="button" :disabled="!canSaveModal" @click="saveEntry">
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
  REGULATORY_PRIMARY_REFERENCES,
  REGULATORY_REFERENCE_DEFINITIONS,
  generateRegulationEntryId,
} from '../../constants/conformance'
import {
  loadDocumentWorkspace,
  subscribeDocumentWorkspace,
  updateConformanceClaimState,
  type DocumentWorkspaceState,
  type RegulatoryConformanceState,
} from '../../services/documentWorkspace'
import type { RegulatoryReferenceEntry } from '../../types/conformance'

const primaryReferences = REGULATORY_PRIMARY_REFERENCES
const CUSTOM_OPTION_VALUE = '__custom__'
const PAGE_SIZE = 10

const initialState = loadDocumentWorkspace()
const form = reactive<RegulatoryConformanceState>({
  additionalRegulations: initialState.conformanceClaim.regulatoryConformance.additionalRegulations.map((entry) => ({
    ...entry,
  })),
})

const regulationOptions = [
  ...REGULATORY_REFERENCE_DEFINITIONS.map((definition) => ({
    value: definition.regulation,
    label: `${definition.regulation} — ${definition.description}`,
    definition,
  })),
  {
    value: CUSTOM_OPTION_VALUE,
    label: '[Other Regulation]',
    definition: { regulation: '', description: '' },
  },
]

const definitionMap = new Map(regulationOptions.map((option) => [option.value, option.definition]))

const suppressNextSync = ref(false)
let unsubscribe: (() => void) | null = null

const isModalOpen = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const modalForm = reactive<RegulatoryReferenceEntry>({
  id: '',
  regulation: '',
  description: '',
  source: 'custom',
})
const modalStatus = ref('Regulation name is required.')
const selectedOption = ref(CUSTOM_OPTION_VALUE)

const currentPage = ref(1)
const totalPages = computed(() => Math.max(1, Math.ceil(form.additionalRegulations.length / PAGE_SIZE)))
const paginatedEntries = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return form.additionalRegulations.slice(start, start + PAGE_SIZE)
})

const duplicateWarning = computed(() => {
  const normalized = modalForm.regulation?.trim().toLowerCase() ?? ''
  if (!normalized) return ''
  const exists = form.additionalRegulations.some(
    (entry) => entry.id !== modalForm.id && entry.regulation?.trim().toLowerCase() === normalized
  )
  return exists ? 'This regulation already exists.' : ''
})

const canSaveModal = computed(() => modalForm.regulation.trim().length > 0 && !duplicateWarning.value)

watch(
  () => form.additionalRegulations,
  () => {
    if (suppressNextSync.value) {
      suppressNextSync.value = false
      return
    }
    persistState()
  },
  { deep: true }
)

watch(
  () => form.additionalRegulations.length,
  () => {
    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value
    }
    if (currentPage.value < 1) {
      currentPage.value = 1
    }
  }
)

watch(selectedOption, (value) => {
  if (!isModalOpen.value) return
  const definition = definitionMap.get(value)
  if (definition) {
    modalForm.regulation = definition.regulation
    modalForm.description = definition.description
    modalForm.source = 'default'
    return
  }
  if (value === CUSTOM_OPTION_VALUE && modalMode.value === 'create') {
    modalForm.regulation = ''
    modalForm.description = ''
  }
  modalForm.source = value === CUSTOM_OPTION_VALUE ? 'custom' : modalForm.source
})

onMounted(() => {
  unsubscribe = subscribeDocumentWorkspace((state) => {
    applyExternalState(state)
  })
})

onUnmounted(() => {
  unsubscribe?.()
})

function persistState() {
  updateConformanceClaimState({
    regulatoryConformance: {
      additionalRegulations: form.additionalRegulations.map((entry) => ({ ...entry })),
    },
  })
}

function applyExternalState(state: DocumentWorkspaceState) {
  suppressNextSync.value = true
  setEntries(state.conformanceClaim.regulatoryConformance.additionalRegulations.map((entry) => ({ ...entry })))
  currentPage.value = 1
}

function setEntries(entries: RegulatoryReferenceEntry[]) {
  form.additionalRegulations.splice(0, form.additionalRegulations.length, ...entries)
}

function openCreateModal() {
  modalMode.value = 'create'
  modalForm.id = ''
  modalForm.regulation = ''
  modalForm.description = ''
  modalForm.source = 'custom'
  selectedOption.value = CUSTOM_OPTION_VALUE
  modalStatus.value = 'Regulation name is required.'
  isModalOpen.value = true
}

function openEditModal(entry: RegulatoryReferenceEntry) {
  modalMode.value = 'edit'
  modalForm.id = entry.id
  modalForm.regulation = entry.regulation
  modalForm.description = entry.description
  modalForm.source = entry.source ?? 'custom'
  const match = regulationOptions.find(
    (option) =>
      option.value !== CUSTOM_OPTION_VALUE &&
      option.definition.regulation === entry.regulation &&
      option.definition.description === entry.description
  )
  selectedOption.value = match?.value ?? CUSTOM_OPTION_VALUE
  modalStatus.value = 'Update the regulation or description.'
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
}

function saveEntry() {
  if (!canSaveModal.value) {
    modalStatus.value = 'Please provide a regulation name.'
    return
  }

  if (modalMode.value === 'edit') {
    const target = form.additionalRegulations.find((entry) => entry.id === modalForm.id)
    if (target) {
      target.regulation = modalForm.regulation.trim()
      target.description = modalForm.description.trim()
      target.source = modalForm.source
    }
  } else {
    form.additionalRegulations.push({
      id: generateRegulationEntryId(),
      regulation: modalForm.regulation.trim(),
      description: modalForm.description.trim(),
      source: modalForm.source,
    })
  }
  closeModal()
}

function removeEntry(id: string) {
  const index = form.additionalRegulations.findIndex((entry) => entry.id === id)
  if (index >= 0) {
    form.additionalRegulations.splice(index, 1)
  }
}

function deleteFromModal() {
  if (modalMode.value !== 'edit') return
  removeEntry(modalForm.id)
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
