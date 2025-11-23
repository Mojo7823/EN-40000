<template>
  <div class="p-6 space-y-6">
    <!-- Header Card -->
    <UCard>
      <template #header>
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Third-Party Components</p>
            <h1 class="text-2xl font-bold mt-1">Product Overview</h1>
            <p class="text-gray-600 dark:text-gray-300 mt-2">
              Track third-party components, capture the management approach, and record evidence references for SBOM documentation.
            </p>
          </div>
          <div class="flex gap-2">
            <UButton to="/product-overview/description" color="gray" variant="ghost">
              Product Description
            </UButton>
            <UButton to="/document/preview" color="gray" variant="ghost" icon="i-heroicons-arrow-right" trailing>
              Document Preview
            </UButton>
          </div>
        </div>
      </template>

      <div class="prose dark:prose-invert max-w-none mb-6">
        <p class="text-lg font-semibold text-primary-600 dark:text-primary-400">2.3 Third-Party Components</p>
        <p class="text-sm font-medium text-gray-700 dark:text-gray-300">[Reference: Clause 7.11 - Third-party component cybersecurity management]</p>
        <p class="text-sm">
          List the hardware/software components integrated into the product. Capture versioning, suppliers, and license
          obligations so the SBOM stays current.
        </p>
      </div>

      <div class="border-t border-gray-200 dark:border-gray-800 pt-6">
        <UTable 
          :rows="form.entries" 
          :columns="columns"
          :empty-state="{ icon: 'i-heroicons-cube-transparent', label: 'No components recorded yet.' }"
          class="mb-4"
          @select="openEditModal"
        >
          <template #componentName-data="{ row }">
            <span class="font-medium cursor-pointer">{{ row.componentName || '—' }}</span>
          </template>
          
          <template #componentType-data="{ row }">
            <span class="cursor-pointer">{{ row.componentType || '—' }}</span>
          </template>
          
          <template #version-data="{ row }">
            <span class="cursor-pointer">{{ row.version || '—' }}</span>
          </template>
          
          <template #supplier-data="{ row }">
            <span class="cursor-pointer">{{ row.supplier || '—' }}</span>
          </template>

          <template #purpose-data="{ row }">
            <span class="cursor-pointer">{{ row.purpose || '—' }}</span>
          </template>

          <template #license-data="{ row }">
            <span class="cursor-pointer">{{ row.license || '—' }}</span>
          </template>
          
          <template #actions-data="{ row }">
            <UButton 
              icon="i-heroicons-trash" 
              color="red" 
              variant="ghost" 
              size="sm"
              @click.stop="removeComponent(row.id)"
            />
          </template>
        </UTable>
        
        <UButton icon="i-heroicons-plus" @click="openCreateModal">
          Add Component
        </UButton>
      </div>
    </UCard>

    <!-- Management Approach -->
    <UCard>
      <template #header>
        <h2 class="text-xl font-bold">Third-Party Component Management Approach</h2>
      </template>
      <div>
        <p class="text-sm italic text-gray-600 dark:text-gray-400 mb-4">
          Describe how third-party components are selected, evaluated, monitored, and updated across the product lifecycle.
        </p>
        <RichTextEditor
          v-model="form.managementApproachHtml"
          min-height="220px"
          placeholder="Describe the evaluation and monitoring strategy for third-party components."
        />
      </div>
    </UCard>

    <!-- Evidence Reference -->
    <UCard>
      <template #header>
        <h2 class="text-xl font-bold">Evidence Reference</h2>
      </template>
      <div>
        <p class="text-sm italic text-gray-600 dark:text-gray-400 mb-4">
          Reference the SBOM or other documentation that tracks third-party component reviews, approvals, and contracts.
        </p>
        <RichTextEditor
          v-model="form.evidenceReferenceHtml"
          min-height="200px"
          placeholder="Provide document IDs or storage locations where SBOM/component management records are stored."
        />
      </div>
    </UCard>

    <!-- Modal -->
    <UModal v-model="isModalOpen">
      <UCard>
        <template #header>
          <div class="flex justify-between items-start gap-4">
            <div>
              <h3 class="text-lg font-semibold">{{ modalTitle }}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ modalSubtitle }}</p>
            </div>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              @click="closeModal"
            />
          </div>
        </template>

        <div class="space-y-4">
          <UFormGroup label="Component Name" required>
            <UInput v-model="modalForm.componentName" placeholder="Component Name" />
          </UFormGroup>

          <UFormGroup label="Type">
            <UInput v-model="modalForm.componentType" placeholder="Software library, hardware module, API..." />
          </UFormGroup>

          <div class="grid grid-cols-2 gap-4">
            <UFormGroup label="Version">
              <UInput v-model="modalForm.version" placeholder="1.0.0" />
            </UFormGroup>

            <UFormGroup label="Supplier">
              <UInput v-model="modalForm.supplier" placeholder="Supplier name" />
            </UFormGroup>
          </div>

          <UFormGroup label="Purpose">
            <UInput v-model="modalForm.purpose" placeholder="Authentication, cryptography, analytics..." />
          </UFormGroup>

          <UFormGroup label="License">
            <UInput v-model="modalForm.license" placeholder="Apache 2.0, GPLv3, Proprietary..." />
          </UFormGroup>
        </div>

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton
              v-if="modalMode === 'edit'"
              color="red"
              variant="ghost"
              @click="deleteFromModal"
            >
              Delete
            </UButton>
            <UButton color="gray" variant="ghost" @click="closeModal">
              Cancel
            </UButton>
            <UButton :disabled="!canSaveModal" @click="saveComponent">
              Save
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import type {
  DocumentWorkspaceState,
  ThirdPartyComponentEntry,
  ThirdPartyComponentsState
} from '~/services/documentWorkspace'

const workspace = useDocumentWorkspace()

const columns = [
  { key: 'componentName', label: 'Component', id: 'componentName' },
  { key: 'componentType', label: 'Type', id: 'componentType' },
  { key: 'version', label: 'Version', id: 'version' },
  { key: 'supplier', label: 'Supplier', id: 'supplier' },
  { key: 'purpose', label: 'Purpose', id: 'purpose' },
  { key: 'license', label: 'License', id: 'license' },
  { key: 'actions', label: 'Actions', id: 'actions' }
]

const workspaceState = ref(workspace.loadDocumentWorkspace())
const suppressNextSync = ref(false)
let unsubscribe: (() => void) | null = null

const form = reactive<ThirdPartyComponentsState>(
  cloneThirdPartyState(workspaceState.value.productOverview.thirdPartyComponents)
)

const isModalOpen = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const modalForm = reactive<ThirdPartyComponentEntry>(createEmptyEntry())

const modalTitle = computed(() => modalMode.value === 'create' ? 'Add Component' : 'Edit Component')
const modalSubtitle = computed(() => modalMode.value === 'create' ? 'New Third-Party Component' : modalForm.componentName || 'Component')
const canSaveModal = computed(() => Boolean(modalForm.componentName?.trim()))

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

onMounted(() => {
  unsubscribe = workspace.subscribeDocumentWorkspace((state) => {
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
  workspace.updateProductOverviewState({
    thirdPartyComponents: {
      entries: form.entries.map((entry) => ({ ...entry })),
      managementApproachHtml: form.managementApproachHtml,
      evidenceReferenceHtml: form.evidenceReferenceHtml,
    },
  })
}

function applyExternalState(state: ThirdPartyComponentsState) {
  suppressNextSync.value = true
  form.entries.splice(0, form.entries.length, ...state.entries.map((entry) => ({ ...entry })))
  form.managementApproachHtml = state.managementApproachHtml
  form.evidenceReferenceHtml = state.evidenceReferenceHtml
}

function openCreateModal() {
  modalMode.value = 'create'
  Object.assign(modalForm, createEmptyEntry())
  isModalOpen.value = true
}

function openEditModal(entry: ThirdPartyComponentEntry) {
  modalMode.value = 'edit'
  Object.assign(modalForm, { ...entry })
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
}

function saveComponent() {
  if (!canSaveModal.value) return

  const payload = {
    ...modalForm,
    componentName: modalForm.componentName.trim(),
    componentType: modalForm.componentType.trim(),
    version: modalForm.version.trim(),
    supplier: modalForm.supplier.trim(),
    purpose: modalForm.purpose.trim(),
    license: modalForm.license.trim(),
  }

  if (modalMode.value === 'edit') {
    const index = form.entries.findIndex((entry) => entry.id === payload.id)
    if (index >= 0) {
      form.entries.splice(index, 1, payload)
    }
  } else {
    form.entries.push(payload)
  }
  closeModal()
}

function removeComponent(entryId: string) {
  const index = form.entries.findIndex((entry) => entry.id === entryId)
  if (index >= 0) {
    form.entries.splice(index, 1)
  }
}

function deleteFromModal() {
  if (modalMode.value !== 'edit') return
  removeComponent(modalForm.id)
  closeModal()
}
</script>
