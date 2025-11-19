<template>
  <div class="convention-page">
    <section class="card title-card">
      <div>
        <p class="eyebrow">Document Convention</p>
        <h1>Terminology</h1>
        <p class="muted">
          Maintain the glossary used throughout the CRA documentation. Entries feed Section 4.1 of the DOCX builder and
          preview.
        </p>
      </div>
      <div class="title-card-actions">
        <RouterLink class="btn ghost" to="/document/preview">Go to Document Preview</RouterLink>
        <button class="btn primary" type="button" @click="openAddModal">Add Term</button>
      </div>
    </section>

    <section class="card content-card">
      <article class="template-body">
        <p class="section-heading">4.1 Terminology</p>
        <p class="reference-line">[Reference: Clause 4.1]</p>
        <p>
          All terms and definitions used in the CRA documentation align with prEN 40000-1-1 (Vocabulary) and Regulation (EU)
          2024/2847. Use this table to capture product-specific terminology and the authoritative reference.
        </p>
      </article>

      <div class="table-section">
        <div class="table-wrapper">
          <table class="terminology-table">
            <thead>
              <tr>
                <th>Term</th>
                <th>Definition</th>
                <th>Reference</th>
                <th class="action-column">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="terminologyEntries.length === 0">
                <td class="empty-state" colspan="4">No terminology captured yet.</td>
              </tr>
              <tr
                v-for="entry in terminologyEntries"
                :key="entry.id"
                class="clickable-row"
                @click="openEditModal(entry)"
              >
                <td>{{ entry.term || '—' }}</td>
                <td>{{ entry.definition || '—' }}</td>
                <td>{{ entry.reference || '—' }}</td>
                <td class="action-column" @click.stop>
                  <button class="link danger" type="button" @click="removeEntry(entry.id)">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <button class="btn primary" type="button" @click="openAddModal">Add Term</button>
      </div>
    </section>

    <div v-if="showModal" class="demo-modal-overlay" @click="closeModal">
      <div class="demo-modal" role="dialog" aria-modal="true" @click.stop>
        <header class="demo-modal-header">
          <h2 id="terminologyModalTitle">{{ editMode ? 'Edit Term' : 'Add Term' }}</h2>
          <button class="modal-close" type="button" aria-label="Close" @click="closeModal">×</button>
        </header>
        <form class="demo-modal-body" @submit.prevent="saveEntry">
          <label class="input-field">
            <span>Term</span>
            <input v-model="form.term" type="text" placeholder="Enter term" required />
          </label>
          <label class="input-field">
            <span>Definition</span>
            <textarea v-model="form.definition" rows="4" placeholder="Enter definition" required></textarea>
          </label>
          <label class="input-field">
            <span>Reference</span>
            <input v-model="form.reference" type="text" placeholder="e.g., prEN 40000-1-1" />
          </label>
          <p v-if="formError" class="form-error">{{ formError }}</p>
        </form>
        <footer class="demo-modal-footer">
          <div class="modal-footer-left">
            <button v-if="editMode" class="btn danger" type="button" @click="deleteEntry">Delete</button>
          </div>
          <div class="modal-footer-right">
            <button class="btn ghost" type="button" @click="closeModal">Cancel</button>
            <button class="btn primary" type="button" @click="saveEntry">{{ editMode ? 'Save Changes' : 'Add Term' }}</button>
          </div>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import {
  generateTerminologyEntryId,
  loadDocumentWorkspace,
  subscribeDocumentWorkspace,
  updateDocumentConventionState,
  type DocumentConventionTerminologyEntry,
  type DocumentWorkspaceState,
} from '../../services/documentWorkspace'

const workspaceState = ref<DocumentWorkspaceState>(loadDocumentWorkspace())
let unsubscribe: (() => void) | null = null

onMounted(() => {
  unsubscribe = subscribeDocumentWorkspace((state) => {
    workspaceState.value = state
  })
})

onUnmounted(() => {
  unsubscribe?.()
})

const terminologyEntries = computed(() => workspaceState.value.documentConvention.terminologyEntries)

const showModal = ref(false)
const editMode = ref(false)
const form = reactive<DocumentConventionTerminologyEntry>({
  id: '',
  term: '',
  definition: '',
  reference: '',
})
const formError = ref('')

function openAddModal() {
  editMode.value = false
  form.id = generateTerminologyEntryId()
  form.term = ''
  form.definition = ''
  form.reference = ''
  formError.value = ''
  showModal.value = true
}

function openEditModal(entry: DocumentConventionTerminologyEntry) {
  editMode.value = true
  form.id = entry.id
  form.term = entry.term
  form.definition = entry.definition
  form.reference = entry.reference
  formError.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function saveEntry() {
  const trimmedTerm = form.term.trim()
  const trimmedDefinition = form.definition.trim()
  if (!trimmedTerm || !trimmedDefinition) {
    formError.value = 'Please provide both a term and definition.'
    return
  }
  const trimmedReference = form.reference.trim()
  const nextEntries = terminologyEntries.value.map((entry) => ({ ...entry }))

  if (editMode.value) {
    const index = nextEntries.findIndex((entry) => entry.id === form.id)
    if (index !== -1) {
      nextEntries[index] = {
        id: form.id,
        term: trimmedTerm,
        definition: trimmedDefinition,
        reference: trimmedReference,
      }
    }
  } else {
    nextEntries.push({
      id: form.id || generateTerminologyEntryId(),
      term: trimmedTerm,
      definition: trimmedDefinition,
      reference: trimmedReference,
    })
  }

  updateDocumentConventionState({ terminologyEntries: nextEntries })
  showModal.value = false
}

function deleteEntry() {
  removeEntry(form.id)
  closeModal()
}

function removeEntry(id: string) {
  const nextEntries = terminologyEntries.value.filter((entry) => entry.id !== id)
  updateDocumentConventionState({ terminologyEntries: nextEntries })
}
</script>

<style scoped src="./Convention.css"></style>
