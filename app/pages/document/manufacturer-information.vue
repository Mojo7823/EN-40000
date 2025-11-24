<template>
  <div class="p-6 space-y-6 max-w-full">
    <UCard class="bg-gradient-to-r from-primary-50/80 via-white to-white dark:from-primary-950 dark:via-gray-950 dark:to-gray-900 border-primary-100 dark:border-primary-900">
      <div class="flex flex-wrap justify-between items-start gap-4">
        <div class="space-y-2">
          <p class="text-xs uppercase tracking-wide text-primary-700 dark:text-primary-300">
            Introduction
          </p>
          <div class="space-y-1">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Manufacturer Information</h1>
            <p class="text-sm text-gray-700 dark:text-gray-200">
              Describe the manufacturer information and legal entity details.
            </p>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <UButton
            to="/document/preview"
            color="primary"
            variant="soft"
            icon="i-heroicons-arrow-right"
            trailing
          >
            Document Preview
          </UButton>
        </div>
      </div>
    </UCard>

    <UCard>
      <template #header>
        <div>
          <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Manufacturer Details
          </p>
          <h3 class="text-lg font-semibold">Company & Contact Information</h3>
        </div>
      </template>

      <div class="flex flex-col space-y-4">
        <UFormGroup label="Legal Entity" class="w-full">
          <UInput
            v-model="form.legalEntity"
            placeholder="e.g., Example Labs GmbH"
            icon="i-heroicons-building-office-2"
            class="w-full"
          />
        </UFormGroup>

        <UFormGroup label="Registration Number" class="w-full">
          <UInput
            v-model="form.registrationNumber"
            placeholder="National/company registration ID"
            icon="i-heroicons-identification"
            class="w-full"
          />
        </UFormGroup>

        <UFormGroup label="Address" class="w-full">
          <UTextarea
            v-model="form.address"
            :rows="3"
            placeholder="Street, City, Country"
            class="w-full"
          />
        </UFormGroup>

        <UFormGroup label="Contact Person" class="w-full">
          <UInput
            v-model="form.contactPerson"
            placeholder="Primary contact name"
            icon="i-heroicons-user"
            class="w-full"
          />
        </UFormGroup>

        <UFormGroup label="Phone" class="w-full">
          <UInput
            v-model="form.phone"
            type="tel"
            placeholder="+XX XXX XXXX"
            icon="i-heroicons-phone"
            class="w-full"
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
