<template>
  <div class="p-6 space-y-6">
    <!-- Header Card -->
    <UCard>
      <template #header>
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Introduction</p>
            <h1 class="text-2xl font-bold mt-1">Manufacturer Information</h1>
            <p class="text-gray-600 dark:text-gray-300 mt-2">
              Describe the manufacturer information and legal entity details.
            </p>
          </div>
          <UButton
            to="/document/preview"
            color="gray"
            variant="ghost"
            icon="i-heroicons-arrow-right"
            trailing
          >
            Document Preview
          </UButton>
        </div>
      </template>

      <div class="space-y-4">
        <UFormGroup label="Legal Entity">
          <UInput
            v-model="form.legalEntity"
            placeholder="e.g., Example Labs GmbH"
            icon="i-heroicons-building-office-2"
          />
        </UFormGroup>

        <UFormGroup label="Registration Number">
          <UInput
            v-model="form.registrationNumber"
            placeholder="National/company registration ID"
            icon="i-heroicons-identification"
          />
        </UFormGroup>

        <UFormGroup label="Address">
          <UTextarea
            v-model="form.address"
            :rows="3"
            placeholder="Street, City, Country"
          />
        </UFormGroup>

        <UFormGroup label="Contact Person">
          <UInput
            v-model="form.contactPerson"
            placeholder="Primary contact name"
            icon="i-heroicons-user"
          />
        </UFormGroup>

        <UFormGroup label="Phone">
          <UInput
            v-model="form.phone"
            type="tel"
            placeholder="+XX XXX XXXX"
            icon="i-heroicons-phone"
          />
        </UFormGroup>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import type {
  DocumentWorkspaceState,
  ManufacturerInformationState
} from '~/services/documentWorkspace'

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
