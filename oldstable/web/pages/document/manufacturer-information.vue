<template>
  <div class="manufacturer-page">
    <section class="card title-card">
      <div>
        <p class="eyebrow">Introduction</p>
        <h1>Manufacturer Information</h1>
        <p class="muted">
          Describe the manufacturer information and legal entity details.
        </p>
      </div>
      <div class="title-card-actions">
        <RouterLink class="btn ghost" to="/document/preview">Go to Document Preview</RouterLink>
      </div>
    </section>

    <section class="card form-card">
      <form class="manufacturer-form" @submit.prevent>
        <label class="field">
          <span>Legal Entity</span>
          <input v-model="form.legalEntity" type="text" placeholder="e.g., Example Labs GmbH" />
        </label>

        <label class="field">
          <span>Registration Number</span>
          <input v-model="form.registrationNumber" type="text" placeholder="National/company registration ID" />
        </label>

        <label class="field">
          <span>Address</span>
          <textarea v-model="form.address" rows="3" placeholder="Street, City, Country"></textarea>
        </label>

        <label class="field">
          <span>Contact Person</span>
          <input v-model="form.contactPerson" type="text" placeholder="Primary contact name" />
        </label>

        <label class="field">
          <span>Phone</span>
          <input v-model="form.phone" type="tel" placeholder="+XX XXX XXXX" />
        </label>
      </form>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import type {
  DocumentWorkspaceState,
  ManufacturerInformationState
} from '../../services/documentWorkspace'

const workspace = useDocumentWorkspace()

const workspaceState = ref(workspace.loadDocumentWorkspace())
const form = reactive<ManufacturerInformationState>({ ...workspaceState.value.manufacturerInformation })
const suppressNextSync = ref(false)
let unsubscribe: (() => void) | null = null

watch(
  form,
  (value) => {
    if (suppressNextSync.value) {
      suppressNextSync.value = false
      return
    }
    workspace.updateManufacturerInformationState({ ...value })
  },
  { deep: true }
)

function applyExternalState(state: DocumentWorkspaceState) {
  workspaceState.value = state
  suppressNextSync.value = true
  Object.assign(form, state.manufacturerInformation)
}

onMounted(() => {
  unsubscribe = workspace.subscribeDocumentWorkspace(applyExternalState)
})

onUnmounted(() => {
  unsubscribe?.()
})
</script>

<style scoped>
.manufacturer-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.title-card {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
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
  padding: 32px;
}

.manufacturer-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field span {
  font-weight: 600;
}

.field input,
.field textarea {
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid var(--panel-border);
  background: var(--surface);
  font: inherit;
}

.field textarea {
  min-height: 120px;
  resize: vertical;
}
</style>
