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
              Document Information
            </h1>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Capture the product-identification details that populate section 1.1 of the CRA documentation.
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
      <form @submit.prevent class="space-y-5">
        <UFormField label="Product Name" name="productName" class="w-full">
          <UInput
            v-model="form.productName"
            placeholder="Product Name"
            size="lg"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Product Version" name="productVersion" class="w-full">
          <UInput
            v-model="form.productVersion"
            placeholder="Version"
            size="lg"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Product Type / Category" name="productType" class="w-full">
          <UInput
            v-model="form.productType"
            placeholder="Type or category"
            size="lg"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Manufacturer" name="manufacturerName" class="w-full">
          <UInput
            v-model="form.manufacturerName"
            placeholder="Manufacturer"
            size="lg"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Manufacturer Address" name="manufacturerAddress" class="w-full">
          <UTextarea
            v-model="form.manufacturerAddress"
            :rows="2"
            placeholder="Street, City, Country"
            size="lg"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Status" name="status" class="w-full">
          <USelectMenu
            v-model="selectedStatus"
            :items="statusOptions"
            value-key="value"
            label-key="label"
            size="lg"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Prepared By" name="preparedBy" class="w-full">
          <UTextarea
            v-model="form.preparedBy"
            :rows="3"
            placeholder="Name(s)"
            size="lg"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Reviewed By" name="reviewedBy" class="w-full">
          <UTextarea
            v-model="form.reviewedBy"
            :rows="3"
            placeholder="Name(s)"
            size="lg"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Approved By" name="approvedBy" class="w-full">
          <UInput
            v-model="form.approvedBy"
            placeholder="Name"
            size="lg"
            class="w-full"
          />
        </UFormField>
      </form>
    </UCard>

    <!-- Custom Status Modal -->
    <UModal v-model:open="showStatusModal" title="Custom Status" description="Enter a custom status label for this documentation phase.">
      <template #body>
        <div class="space-y-3">
          <UInput
            v-model="customStatus"
            placeholder="e.g., Pilot Review"
            size="lg"
            autofocus
          />
        </div>
      </template>
      
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" color="gray" @click="closeStatusModal(false)">
            Cancel
          </UButton>
          <UButton color="primary" @click="closeStatusModal(true)">
            Save
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { DocumentWorkspaceState, IntroductionFormState } from '~/services/documentWorkspace'

const workspace = useDocumentWorkspace()
const toast = useToast()

const initialState = workspace.loadDocumentWorkspace()
const form = reactive<IntroductionFormState>({ ...initialState.introduction })
const suppressNextSync = ref(false)

let unsubscribe: (() => void) | null = null

const statusOptions = [
  { value: 'Draft', label: 'Draft' },
  { value: 'Final', label: 'Final' },
  { value: 'Revision', label: 'Revision' },
  { value: 'Custom Status', label: 'Custom Status' }
]
const showStatusModal = ref(false)
const customStatus = ref('')
const selectedStatus = ref(getInitialStatus())

let suppressStatusReaction = true

// Initialize form status if empty
if (!form.status) {
  form.status = 'Draft'
}

// Allow status reactions after initial setup
setTimeout(() => {
  suppressStatusReaction = false
}, 0)

function getInitialStatus() {
  const value = form.status?.trim()
  if (!value) {
    return 'Draft'
  }
  const validValues = ['Draft', 'Final', 'Revision', 'Custom Status']
  if (validValues.includes(value)) {
    return value
  }
  customStatus.value = value
  return 'Custom Status'
}

watch(
  form,
  (value) => {
    if (suppressNextSync.value) {
      suppressNextSync.value = false
      return
    }
    workspace.updateIntroductionState({ ...value })
  },
  { deep: true }
)

watch(selectedStatus, (value) => {
  if (suppressStatusReaction) {
    return
  }
  if (value === 'Custom Status') {
    customStatus.value = form.status && !statusOptions.includes(form.status as any) ? form.status : ''
    showStatusModal.value = true
    return
  }
  form.status = value
})

function applyExternalState(state: DocumentWorkspaceState) {
  suppressNextSync.value = true
  Object.assign(form, state.introduction)
  safelySetSelectedStatus(getInitialStatus())
}

onMounted(() => {
  unsubscribe = workspace.subscribeDocumentWorkspace(applyExternalState)
})

onUnmounted(() => {
  unsubscribe?.()
})

function closeStatusModal(save: boolean) {
  if (save) {
    const value = customStatus.value.trim()
    if (!value) {
      toast.add({
        title: 'Empty Status',
        description: 'Please enter a custom status value.',
        color: 'orange',
        icon: 'i-heroicons-exclamation-triangle'
      })
      return
    }
    form.status = value
    safelySetSelectedStatus('Custom Status')
    showStatusModal.value = false
    
    toast.add({
      title: 'Custom Status Set',
      description: `Status updated to "${value}".`,
      color: 'green',
      icon: 'i-heroicons-check-circle'
    })
    return
  }

  // Cancel - restore previous state
  const validValues = ['Draft', 'Final', 'Revision', 'Custom Status']
  if (form.status && !validValues.includes(form.status)) {
    safelySetSelectedStatus('Custom Status')
  } else if (form.status) {
    safelySetSelectedStatus(form.status)
  } else {
    form.status = 'Draft'
    safelySetSelectedStatus('Draft')
  }
  showStatusModal.value = false
}

function safelySetSelectedStatus(value: string) {
  suppressStatusReaction = true
  selectedStatus.value = value
  setTimeout(() => {
    suppressStatusReaction = false
  }, 0)
}
</script>
