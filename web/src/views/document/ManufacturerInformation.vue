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
import {
  loadDocumentWorkspace,
  subscribeDocumentWorkspace,
  type DocumentWorkspaceState,
  type ManufacturerInformationState,
  updateManufacturerInformationState,
} from '../../services/documentWorkspace'

const workspaceState = ref(loadDocumentWorkspace())
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
    updateManufacturerInformationState({ ...value })
  },
  { deep: true }
)

function applyExternalState(state: DocumentWorkspaceState) {
  workspaceState.value = state
  suppressNextSync.value = true
  Object.assign(form, state.manufacturerInformation)
}

onMounted(() => {
  unsubscribe = subscribeDocumentWorkspace(applyExternalState)
})

onUnmounted(() => {
  unsubscribe?.()
})
</script>

<style scoped src="./ManufacturerInformation.css"></style>
