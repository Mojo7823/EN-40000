<template>
  <div class="container mx-auto p-6 space-y-6">
    <UCard class="bg-gradient-to-r from-primary-50/80 via-white to-white dark:from-primary-950 dark:via-gray-950 dark:to-gray-900 border-primary-100 dark:border-primary-900">
      <div class="flex flex-wrap justify-between items-start gap-4">
        <div class="space-y-2">
          <p class="text-xs uppercase tracking-wide text-primary-700 dark:text-primary-300">
            Product Overview
          </p>
          <div class="space-y-1">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Third-Party Components</h1>
            <p class="text-sm text-gray-700 dark:text-gray-200">
              Track third-party components, capture the management approach, and record evidence references for SBOM documentation.
            </p>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <UButton
            to="/product-overview/description"
            color="primary"
            variant="outline"
          >
            Product Description
          </UButton>
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
            Clause Context
          </p>
          <h3 class="text-lg font-semibold">2.3 Third-Party Components</h3>
        </div>
      </template>

      <div class="prose dark:prose-invert max-w-none">
        <p class="text-sm font-medium text-gray-700 dark:text-gray-300">[Reference: Clause 7.11 - Third-party component cybersecurity management]</p>
        <p class="text-sm">
          List the hardware/software components integrated into the product. Capture versioning, suppliers, and license
          obligations so the SBOM stays current.
        </p>
      </div>
    </UCard>

    <UCard>
      <template #header>
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Component Inventory
            </p>
            <h3 class="text-lg font-semibold">Components List</h3>
          </div>
          <UButton icon="i-heroicons-plus" @click="openCreateModal">
            Add Component
          </UButton>
        </div>
      </template>

      <UTable
        :data="form.entries"
        :columns="columns"
        :empty-state="{ icon: 'i-heroicons-cube-transparent', label: 'No components recorded yet.' }"
        @select="handleRowSelect"
      >
          <template #componentName-cell="{ row }">
            <span class="font-medium cursor-pointer">{{ row.original.componentName || '—' }}</span>
          </template>
          
          <template #componentType-cell="{ row }">
            <span class="cursor-pointer">{{ row.original.componentType || '—' }}</span>
          </template>
          
          <template #version-cell="{ row }">
            <span class="cursor-pointer">{{ row.original.version || '—' }}</span>
          </template>
          
          <template #supplier-cell="{ row }">
            <span class="cursor-pointer">{{ row.original.supplier || '—' }}</span>
          </template>

          <template #purpose-cell="{ row }">
            <span class="cursor-pointer">{{ row.original.purpose || '—' }}</span>
          </template>

          <template #license-cell="{ row }">
            <span class="cursor-pointer">{{ row.original.license || '—' }}</span>
          </template>
          
          <template #actions-cell="{ row }">
            <UButton
              icon="i-heroicons-trash"
              color="error"
              variant="ghost"
              size="sm"
              @click.stop="removeComponent(row.original.id)"
            />
          </template>
      </UTable>
    </UCard>

    <UCard>
      <template #header>
        <div>
          <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Management Approach
          </p>
          <h3 class="text-lg font-semibold">Third-Party Component Management</h3>
        </div>
      </template>

      <div class="space-y-3">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Describe how third-party components are selected, evaluated, monitored, and updated across the product lifecycle.
        </p>
        <RichTextEditor
          v-model="form.managementApproachHtml"
          min-height="220px"
        />
      </div>
    </UCard>

    <UCard>
      <template #header>
        <div>
          <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Evidence Reference
          </p>
          <h3 class="text-lg font-semibold">SBOM Documentation</h3>
        </div>
      </template>

      <div class="space-y-3">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Reference the SBOM or other documentation that tracks third-party component reviews, approvals, and contracts.
        </p>
        <RichTextEditor
          v-model="form.evidenceReferenceHtml"
          min-height="200px"
        />
      </div>
    </UCard>
  </div>

  <!-- Add Component Modal -->
  <UModal
    v-model:open="isModalOpen"
    :title="modalTitle"
    :description="modalSubtitle"
  >
    <template #body>
      <div class="space-y-4">
        <UFormField
          label="Component Name"
          required
          description="Enter the name of the third-party component"
        >
          <UInput v-model="modalForm.componentName" placeholder="e.g., React, Express.js, PostgreSQL" />
        </UFormField>

        <UFormField
          label="Type"
          description="Specify the type of component"
        >
          <UInput v-model="modalForm.componentType" placeholder="e.g., Software library, hardware module, API service" />
        </UFormField>

        <UFormField
          label="Version"
          description="Component version number"
        >
          <UInput v-model="modalForm.version" placeholder="e.g., 1.0.0, 2.3.4" />
        </UFormField>

        <UFormField
          label="Supplier"
          description="Name of the component supplier or vendor"
        >
          <UInput v-model="modalForm.supplier" placeholder="e.g., Microsoft, Apache Foundation, GitHub" />
        </UFormField>

        <UFormField
          label="Purpose"
          description="Describe what this component is used for in your product"
        >
          <UInput v-model="modalForm.purpose" placeholder="e.g., Authentication, data encryption, analytics tracking" />
        </UFormField>

        <UFormField
          label="License"
          description="Licensing terms for this component"
        >
          <UInput v-model="modalForm.license" placeholder="e.g., MIT, Apache 2.0, GPL-3.0, Proprietary" />
        </UFormField>
      </div>
    </template>

    <template #footer>
      <div class="flex flex-col gap-3">
        <p class="text-xs text-gray-500 dark:text-gray-400">
          {{ modalMode === 'create' ? 'Fill in the component details to track third-party dependencies in your SBOM.' : 'Update component information to keep your SBOM current.' }}
        </p>
        <div class="flex justify-end gap-3">
          <UButton
            v-if="modalMode === 'edit'"
            color="error"
            variant="ghost"
            @click="deleteFromModal"
          >
            Delete
          </UButton>
          <UButton color="neutral" variant="ghost" @click="closeModal">
            Cancel
          </UButton>
          <UButton :disabled="!canSaveModal" @click="saveComponent">
            Save
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
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
  { accessorKey: 'componentName', header: 'Component' },
  { accessorKey: 'componentType', header: 'Type' },
  { accessorKey: 'version', header: 'Version' },
  { accessorKey: 'supplier', header: 'Supplier' },
  { accessorKey: 'purpose', header: 'Purpose' },
  { accessorKey: 'license', header: 'License' },
  { id: 'actions', header: 'Actions' }
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

function handleRowSelect(e: Event, row: any) {
  openEditModal(row.original)
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
