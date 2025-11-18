<template>
  <div class="product-overview-page third-party-page">
    <section class="card title-card">
      <div>
        <p class="eyebrow">Third-Party Components</p>
        <h1>Product Overview</h1>
        <p class="muted">
          Track third-party components, capture the management approach, and record evidence references for SBOM
          documentation.
        </p>
      </div>
      <div class="title-card-actions">
        <RouterLink class="btn ghost" to="/product-overview/description">Back to Product Description</RouterLink>
        <RouterLink class="btn ghost" to="/document/preview">Go to Document Preview</RouterLink>
      </div>
    </section>

    <section class="card form-card">
      <header class="description-header">
        <p class="section-heading">2.3 Third-Party Components</p>
        <p class="reference-line">[Reference: Clause 7.11 - Third-party component cybersecurity management]</p>
        <p class="muted italic">
          List the hardware/software components integrated into the product. Capture versioning, suppliers, and license
          obligations so the SBOM stays current.
        </p>
      </header>

      <div class="table-toolbar">
        <div class="table-actions">
          <button class="btn primary" type="button" @click="openCreateModal">Add Component</button>
          <button class="btn danger" type="button" :disabled="!selectedIds.length" @click="requestBulkDelete">
            Delete Selected
          </button>
        </div>
        <div class="table-controls">
          <label class="select-all">
            <input
              type="checkbox"
              :checked="allRowsSelected"
              :indeterminate.prop="someRowsSelected"
              @change="toggleSelectAll"
              aria-label="Select all components on page"
            />
            <span>Select Page</span>
          </label>
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
          <table class="components-table">
            <thead>
              <tr>
                <th aria-label="Select row"></th>
                <th>Component Name</th>
                <th>Type</th>
                <th>Version</th>
                <th>Supplier</th>
                <th>Purpose</th>
                <th>License</th>
                <th aria-label="Row actions"></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="entry in paginatedEntries"
                :key="entry.id"
                class="table-row"
                role="button"
                @click="openEditModal(entry)"
                @keydown.enter.prevent="openEditModal(entry)"
                @keydown.space.prevent="openEditModal(entry)"
                tabindex="0"
              >
                <td @click.stop>
                  <input type="checkbox" :checked="isSelected(entry.id)" @change="toggleRowSelection(entry.id)" />
                </td>
                <td>{{ entry.componentName || '—' }}</td>
                <td>{{ entry.componentType || '—' }}</td>
                <td>{{ entry.version || '—' }}</td>
                <td>{{ entry.supplier || '—' }}</td>
                <td>{{ entry.purpose || '—' }}</td>
                <td>{{ entry.license || '—' }}</td>
                <td class="actions" @click.stop>
                  <button
                    class="link danger"
                    type="button"
                    title="Delete entry"
                    aria-label="Delete entry"
                    @click="requestSingleDelete(entry.id)"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
              <tr v-if="form.entries.length === 0">
                <td class="empty-state" colspan="8">No components recorded yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </section>

    <section class="card form-card">
      <header class="description-header">
        <p class="section-heading">Third-Party Component Management Approach</p>
        <p class="muted italic">
          Describe how third-party components are selected, evaluated, monitored, and updated across the product
          lifecycle.
        </p>
      </header>
      <RichTextEditor
        v-model="form.managementApproachHtml"
        min-height="220px"
        placeholder="Describe the evaluation and monitoring strategy for third-party components."
      />
    </section>

    <section class="card form-card">
      <header class="description-header">
        <p class="section-heading">Evidence Reference</p>
        <p class="muted italic">
          Reference the SBOM or other documentation that tracks third-party component reviews, approvals, and contracts.
        </p>
      </header>
      <RichTextEditor
        v-model="form.evidenceReferenceHtml"
        min-height="200px"
        placeholder="Provide document IDs or storage locations where SBOM/component management records are stored."
      />
    </section>

    <div v-if="isEditorOpen" class="tp-modal-overlay" @click="closeEditor">
      <div class="tp-modal" role="dialog" aria-modal="true" aria-labelledby="componentModalTitle" @click.stop>
        <header class="tp-modal-header">
          <div>
            <p class="eyebrow">{{ editorMode === 'create' ? 'Add Component' : 'Edit Component' }}</p>
            <h2 id="componentModalTitle">
              {{ editorMode === 'create' ? 'New Third-Party Component' : editorForm.componentName || 'Component' }}
            </h2>
          </div>
          <button class="modal-close" type="button" aria-label="Close" @click="closeEditor">&times;</button>
        </header>
        <div class="tp-modal-body">
          <div class="field">
            <label for="componentName">Component Name *</label>
            <input id="componentName" v-model="editorForm.componentName" type="text" class="input" />
          </div>
          <div class="field">
            <label for="componentType">Type</label>
            <input id="componentType" v-model="editorForm.componentType" type="text" class="input" placeholder="Software library, hardware module, API..." />
          </div>
          <div class="field-group">
            <div class="field">
              <label for="componentVersion">Version</label>
              <input id="componentVersion" v-model="editorForm.version" type="text" class="input" />
            </div>
            <div class="field">
              <label for="componentSupplier">Supplier</label>
              <input id="componentSupplier" v-model="editorForm.supplier" type="text" class="input" />
            </div>
          </div>
          <div class="field">
            <label for="componentPurpose">Purpose</label>
            <input id="componentPurpose" v-model="editorForm.purpose" type="text" class="input" placeholder="Authentication, cryptography, analytics..." />
          </div>
          <div class="field">
            <label for="componentLicense">License</label>
            <input id="componentLicense" v-model="editorForm.license" type="text" class="input" placeholder="Apache 2.0, GPLv3, Proprietary..." />
          </div>
        </div>
        <footer class="tp-modal-footer">
          <p class="muted">{{ editorStatus }}</p>
          <div class="modal-actions">
            <button
              v-if="editorMode === 'edit'"
              class="btn danger ghost"
              type="button"
              @click="requestSingleDelete(editorForm.id)"
            >
              Delete Entry
            </button>
            <div class="button-group">
              <button class="btn" type="button" @click="closeEditor">Cancel</button>
              <button class="btn primary" type="button" :disabled="!canSaveEntry" @click="saveEntry">Save</button>
            </div>
          </div>
        </footer>
      </div>
    </div>

    <div v-if="isConfirmOpen" class="tp-modal-overlay" @click="closeConfirm">
      <div class="tp-modal confirm-card" role="dialog" aria-modal="true" aria-labelledby="confirmTitle" @click.stop>
        <header class="tp-modal-header">
          <h2 id="confirmTitle">Delete Components?</h2>
        </header>
        <p class="tp-modal-message">
          This action cannot be reversed. {{ pendingDeleteIds.length === 1 ? 'The selected component will' : 'All selected components will' }}
          be removed from the document.
        </p>
        <footer class="tp-modal-footer">
          <div class="button-group">
            <button class="btn" type="button" @click="closeConfirm">Cancel</button>
            <button class="btn danger" type="button" @click="confirmDeletion">Delete</button>
          </div>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref, watch, computed } from 'vue'
import RichTextEditor from '../../components/RichTextEditor.vue'
import {
  loadDocumentWorkspace,
  subscribeDocumentWorkspace,
  updateProductOverviewState,
  type DocumentWorkspaceState,
  type ThirdPartyComponentEntry,
  type ThirdPartyComponentsState,
} from '../../services/documentWorkspace'

const workspaceState = ref(loadDocumentWorkspace())
const suppressNextSync = ref(false)
let unsubscribe: (() => void) | null = null

const form = reactive<ThirdPartyComponentsState>(
  cloneThirdPartyState(workspaceState.value.productOverview.thirdPartyComponents)
)
const selectedIds = ref<string[]>([])
const currentPage = ref(1)
const PAGE_SIZE = 10

const isEditorOpen = ref(false)
const editorMode = ref<'create' | 'edit'>('create')
const editorForm = reactive<ThirdPartyComponentEntry>(createEmptyEntry())
const editorStatus = ref('Component name is required.')

const isConfirmOpen = ref(false)
const pendingDeleteIds = ref<string[]>([])

const canSaveEntry = computed(() => editorForm.componentName.trim().length > 0)
const totalPages = computed(() => Math.max(1, Math.ceil(form.entries.length / PAGE_SIZE)))
const paginatedEntries = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return form.entries.slice(start, start + PAGE_SIZE)
})
const currentPageIds = computed(() => paginatedEntries.value.map((entry) => entry.id))
const allRowsSelected = computed(
  () => currentPageIds.value.length > 0 && currentPageIds.value.every((id) => selectedIds.value.includes(id))
)
const someRowsSelected = computed(
  () => currentPageIds.value.some((id) => selectedIds.value.includes(id)) && !allRowsSelected.value
)

watch(
  form,
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
  () => form.entries.map((entry) => entry.id),
  (ids) => {
    selectedIds.value = selectedIds.value.filter((id) => ids.includes(id))
  }
)

watch(
  () => form.entries.length,
  () => {
    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value
    }
    if (currentPage.value < 1) {
      currentPage.value = 1
    }
  }
)

onMounted(() => {
  unsubscribe = subscribeDocumentWorkspace((state) => {
    workspaceState.value = state
    applyExternalState(state.productOverview.thirdPartyComponents)
  })
})

onUnmounted(() => {
  unsubscribe?.()
})

function cloneThirdPartyState(source: ThirdPartyComponentsState): ThirdPartyComponentsState {
  return {
    entries: source.entries.map((entry) => ({ ...entry })),
    managementApproachHtml: source.managementApproachHtml,
    evidenceReferenceHtml: source.evidenceReferenceHtml,
  }
}

function createEmptyEntry(): ThirdPartyComponentEntry {
  return {
    id: generateId(),
    componentName: '',
    componentType: '',
    version: '',
    supplier: '',
    purpose: '',
    license: '',
  }
}

function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2, 11)
}

function persistState() {
  updateProductOverviewState({
    thirdPartyComponents: {
      entries: form.entries.map((entry) => ({ ...entry })),
      managementApproachHtml: form.managementApproachHtml,
      evidenceReferenceHtml: form.evidenceReferenceHtml,
    },
  })
}

function applyExternalState(state: ThirdPartyComponentsState) {
  suppressNextSync.value = true
  setEntries(state.entries.map((entry) => ({ ...entry })))
  form.managementApproachHtml = state.managementApproachHtml
  form.evidenceReferenceHtml = state.evidenceReferenceHtml
  selectedIds.value = []
  currentPage.value = 1
}

function setEntries(entries: ThirdPartyComponentEntry[]) {
  form.entries.splice(0, form.entries.length, ...entries)
}

function openCreateModal() {
  editorMode.value = 'create'
  Object.assign(editorForm, createEmptyEntry())
  editorStatus.value = 'Component name is required.'
  isEditorOpen.value = true
}

function openEditModal(entry: ThirdPartyComponentEntry) {
  editorMode.value = 'edit'
  Object.assign(editorForm, { ...entry })
  editorStatus.value = 'Component name is required.'
  isEditorOpen.value = true
}

function closeEditor() {
  isEditorOpen.value = false
}

function saveEntry() {
  if (!canSaveEntry.value) {
    editorStatus.value = 'Please provide a component name.'
    return
  }
  const payload = {
    ...editorForm,
    componentName: editorForm.componentName.trim(),
    componentType: editorForm.componentType.trim(),
    version: editorForm.version.trim(),
    supplier: editorForm.supplier.trim(),
    purpose: editorForm.purpose.trim(),
    license: editorForm.license.trim(),
  }

  if (editorMode.value === 'edit') {
    const index = form.entries.findIndex((entry) => entry.id === payload.id)
    if (index >= 0) {
      form.entries.splice(index, 1, payload)
    }
  } else {
    form.entries.push(payload)
  }
  closeEditor()
}

function requestSingleDelete(id: string) {
  pendingDeleteIds.value = [id]
  isConfirmOpen.value = true
}

function requestBulkDelete() {
  if (!selectedIds.value.length) return
  pendingDeleteIds.value = [...selectedIds.value]
  isConfirmOpen.value = true
}

function confirmDeletion() {
  if (!pendingDeleteIds.value.length) {
    closeConfirm()
    return
  }
  const idsToDelete = new Set(pendingDeleteIds.value)
  setEntries(form.entries.filter((entry) => !idsToDelete.has(entry.id)))
  selectedIds.value = selectedIds.value.filter((id) => !idsToDelete.has(id))
  if (isEditorOpen.value && idsToDelete.has(editorForm.id)) {
    closeEditor()
  }
  closeConfirm()
}

function closeConfirm() {
  isConfirmOpen.value = false
  pendingDeleteIds.value = []
}

function toggleRowSelection(id: string) {
  if (isSelected(id)) {
    selectedIds.value = selectedIds.value.filter((value) => value !== id)
  } else {
    selectedIds.value = [...selectedIds.value, id]
  }
}

function isSelected(id: string) {
  return selectedIds.value.includes(id)
}

function toggleSelectAll(event: Event) {
  const checked = (event.target as HTMLInputElement).checked
  const idsOnPage = currentPageIds.value
  if (checked) {
    const merged = new Set([...selectedIds.value, ...idsOnPage])
    selectedIds.value = Array.from(merged)
  } else {
    selectedIds.value = selectedIds.value.filter((id) => !idsOnPage.includes(id))
  }
}

function goToPreviousPage() {
  currentPage.value = Math.max(1, currentPage.value - 1)
}

function goToNextPage() {
  currentPage.value = Math.min(totalPages.value, currentPage.value + 1)
}
</script>

<style scoped src="./ThirdPartyComponents.css"></style>
