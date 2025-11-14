<template>
  <div class="card demo-card">
    <header class="demo-header">
      <div>
        <h1>Requirements Table Demo</h1>
        <p>Showcases the CRUD-style table previously used for Security Functional Requirements.</p>
      </div>
      <button class="btn primary" type="button" @click="openModal">
        Add Technical Requirement
      </button>
    </header>

    <section class="table-section">
      <table>
        <thead>
          <tr>
            <th>Technical Requirement Class</th>
            <th>Component</th>
            <th>Description</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entry in sfrEntries" :key="entry.id">
            <td>{{ entry.classCode }}</td>
            <td>{{ entry.componentId }}</td>
            <td>{{ entry.summary }}</td>
            <td class="actions">
              <button class="link danger" type="button" @click="removeEntry(entry.id)">Remove</button>
            </td>
          </tr>
          <tr v-if="sfrEntries.length === 0">
            <td colspan="4" class="empty-state">No entries yet. Click “Add Technical Requirement” to create one.</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>

  <div v-if="isModalOpen" class="demo-modal-overlay" @click="closeModal">
    <div class="demo-modal" role="dialog" aria-modal="true" aria-labelledby="sfrModalTitle" @click.stop>
      <header class="demo-modal-header">
        <h2 id="sfrModalTitle">Add Technical Requirement Entry</h2>
        <button class="modal-close" type="button" @click="closeModal" aria-label="Close">&times;</button>
      </header>
      <div class="demo-modal-body">
        <label class="form-label" for="classCode">Class</label>
        <input
          id="classCode"
          v-model="form.classCode"
          class="input"
          placeholder="e.g. FAU"
        />

        <label class="form-label" for="componentId">Component</label>
        <input
          id="componentId"
          v-model="form.componentId"
          class="input"
          placeholder="e.g. FAU_GEN.1"
        />

        <label class="form-label" for="summary">Summary</label>
        <textarea
          id="summary"
          v-model="form.summary"
          class="input"
          rows="4"
          placeholder="Brief description of the Technical Requirement adjustments..."
        ></textarea>
      </div>
      <footer class="demo-modal-footer">
        <span class="muted">{{ formStatus }}</span>
        <div class="button-row">
          <button class="btn" type="button" @click="closeModal">Cancel</button>
          <button class="btn primary" type="button" :disabled="!canSave" @click="saveEntry">Save</button>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { loadDemoState, updateDemoState, type DemoSfrEntry } from '../../services/demoStorage'

const sfrEntries = ref<DemoSfrEntry[]>([])
const isModalOpen = ref(false)
const form = reactive({ classCode: '', componentId: '', summary: '' })
const formStatus = ref('All fields are required.')

const createId = () => (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
  ? crypto.randomUUID()
  : Math.random().toString(36).slice(2, 10))

onMounted(() => {
  sfrEntries.value = [...loadDemoState().sfrTable]
})

const canSave = computed(() => form.classCode.trim() && form.componentId.trim() && form.summary.trim())

function openModal() {
  resetForm()
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
}

function resetForm() {
  form.classCode = ''
  form.componentId = ''
  form.summary = ''
  formStatus.value = 'All fields are required.'
}

function saveEntry() {
  if (!canSave.value) {
    formStatus.value = 'Please complete all fields.'
    return
  }

  sfrEntries.value = [
    ...sfrEntries.value,
    {
      id: createId(),
      classCode: form.classCode.trim(),
      componentId: form.componentId.trim(),
      summary: form.summary.trim(),
    },
  ]
  persistEntries()
  closeModal()
}

function removeEntry(id: string) {
  sfrEntries.value = sfrEntries.value.filter(entry => entry.id !== id)
  persistEntries()
}

function persistEntries() {
  updateDemoState({ sfrTable: sfrEntries.value })
}
</script>

<style scoped>
.card.demo-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.demo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.table-section {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  overflow: hidden;
}

th,
td {
  padding: 12px;
  border-bottom: 1px solid var(--panel-border);
  text-align: left;
}

th {
  background: var(--surface-muted);
  font-weight: 600;
}

tr:last-child td {
  border-bottom: none;
}

.empty-state {
  text-align: center;
  color: var(--text-muted);
}

.actions {
  width: 120px;
}

.link.danger {
  color: var(--danger);
  background: none;
  border: none;
  cursor: pointer;
}

.demo-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 50;
}

.demo-modal {
  width: min(520px, 100%);
  background: var(--panel);
  border-radius: 16px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
}

.demo-modal-header,
.demo-modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--panel-border);
}

.demo-modal-footer {
  border-top: 1px solid var(--panel-border);
  border-bottom: none;
}

.demo-modal-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-label {
  font-weight: 600;
}

.modal-close {
  border: none;
  background: transparent;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  color: var(--text);
}

.muted {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.button-row {
  display: flex;
  gap: 12px;
}
</style>
