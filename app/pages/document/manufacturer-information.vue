<template>
  <div class="container mx-auto p-6 space-y-6">
    <UCard>
      <template #header>
        <div class="flex flex-wrap justify-between items-start gap-4">
          <div>
            <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
              Introduction
            </p>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              Manufacturer Information
            </h1>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Describe the manufacturer information and legal entity details.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <UButton
              variant="ghost"
              color="gray"
              to="/document/preview"
              icon="i-heroicons-eye"
            >
              Preview
            </UButton>
          </div>
        </div>
      </template>
    </UCard>

    <UCard>
      <form class="space-y-5" @submit.prevent>
        <UFormField label="Legal Entity" name="legalEntity" class="w-full">
          <UInput
            v-model="form.legalEntity"
            placeholder="e.g., Example Labs GmbH"
            size="lg"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Registration Number" name="registrationNumber" class="w-full">
          <UInput
            v-model="form.registrationNumber"
            placeholder="National/company registration ID"
            size="lg"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Address" name="address" class="w-full">
          <UTextarea
            v-model="form.address"
            :rows="3"
            placeholder="Street, City, Country"
            size="lg"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Contact Person" name="contactPerson" class="w-full">
          <UInput
            v-model="form.contactPerson"
            placeholder="Primary contact name"
            size="lg"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Phone" name="phone" class="w-full">
          <UInput
            v-model="form.phone"
            type="tel"
            placeholder="+XX XXX XXXX"
            size="lg"
            class="w-full"
          />
        </UFormField>
      </form>
    </UCard>
  </div>
</template>

<script setup lang="ts">
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

