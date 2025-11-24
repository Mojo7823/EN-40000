<template>
  <div class="container mx-auto p-6 space-y-6">
    <!-- Title Card -->
    <UCard class="bg-gradient-to-r from-primary-50/80 via-white to-white dark:from-primary-950 dark:via-gray-950 dark:to-gray-900 border-primary-100 dark:border-primary-900">
      <div class="flex flex-wrap justify-between items-start gap-4">
        <div class="space-y-2">
          <p class="text-xs uppercase tracking-wide text-primary-700 dark:text-primary-300">
            Conformance Claim
          </p>
          <div class="space-y-1">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Standards Conformance</h1>
            <p class="text-sm text-gray-700 dark:text-gray-200">
              Capture the primary and related standards that underpin this conformance claim. These entries render in section 3.1 of the CRA documentation.
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

    <!-- Primary Standard -->
    <UCard>
      <template #header>
        <div>
          <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Standards Conformance
          </p>
          <h3 class="text-lg font-semibold">Primary Standard</h3>
        </div>
      </template>
      
      <div class="space-y-4">
        <div>
          <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Standard Code</span>
          <p class="text-base text-gray-900 dark:text-white mt-1">{{ primaryCodeDisplay }}</p>
        </div>
        <div>
          <span class="text-sm font-semibold text-gray-700 dark:text-gray-300">Description</span>
          <p class="text-base text-gray-900 dark:text-white mt-1">{{ primaryDescriptionDisplay }}</p>
        </div>
      </div>
    </UCard>

    <!-- Related Standards -->
    <UCard>
      <template #header>
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Standards Inventory
            </p>
            <h3 class="text-lg font-semibold">Related Standards Applied</h3>
          </div>
          <UButton icon="i-heroicons-plus" @click="openCreateModal">
            Add Standard
          </UButton>
        </div>
      </template>

      <div class="space-y-3">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Track supporting standards that broaden the claim, such as vocabulary references or security requirement profiles.
        </p>
        <UTable
          :data="form.relatedStandards"
          :columns="columns"
          :empty-state="{ icon: 'i-heroicons-circle-stack-20-solid', label: 'No related standards recorded yet.' }"
          @select="handleRowSelect"
        >
          <template #code-cell="{ row }">
            <span class="font-medium cursor-pointer">{{ row.original.code || '—' }}</span>
          </template>
          
          <template #description-cell="{ row }">
            <span class="cursor-pointer">{{ row.original.description || '—' }}</span>
          </template>
          
          <template #actions-cell="{ row }">
            <UButton
              icon="i-heroicons-trash"
              color="error"
              variant="ghost"
              size="sm"
              @click.stop="removeStandard(row.original.id)"
            />
          </template>
        </UTable>
      </div>
    </UCard>

    <!-- Modal -->
    <UModal
      v-model:open="isModalOpen"
      :title="modalTitle"
      :description="modalSubtitle"
    >
      <template #body>
        <div class="space-y-4">
          <UFormField v-if="modalMode !== 'primary'" label="Predefined Standards" description="Select 'Add Custom Standard' to enter a custom reference.">
            <USelectMenu
              v-model="selectedOption"
              :items="standardOptions"
              value-key="value"
              label-key="label"
            />
          </UFormField>

          <UFormField label="Standard Code" required>
            <UInput v-model="modalForm.code" placeholder="prEN 40000-1-1" />
          </UFormField>

          <UFormField label="Description">
            <UTextarea
              v-model="modalForm.description"
              :rows="3"
              placeholder="Vocabulary, Vulnerability Handling..."
            />
          </UFormField>
        </div>
      </template>

      <template #footer>
        <div class="flex flex-col gap-3">
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ duplicateWarning || 'Standards appear in the order they are added.' }}
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
            <UButton :disabled="!canSaveModal" @click="saveStandard">
              Save
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import type { ConformanceStandardEntry } from '~/types/conformance'
import {
  RELATED_STANDARD_DEFINITIONS,
  PRIMARY_STANDARD_DEFINITION,
  generateStandardEntryId,
} from '~/constants/conformance'

const workspace = useDocumentWorkspace()

const CUSTOM_OPTION_VALUE = '__custom__'

const columns = [
  { accessorKey: 'code', header: 'Standard' },
  { accessorKey: 'description', header: 'Description' },
  { id: 'actions', header: 'Actions' }
]

const initialState = workspace.loadDocumentWorkspace()
const initialStandards = initialState.conformanceClaim.standardsConformance
const form = reactive({
  primaryStandard: { ...initialStandards.primaryStandard },
  relatedStandards: initialStandards.relatedStandards.map((entry) => ({ ...entry })),
  includeOther: initialStandards.includeOther,
  otherNotes: initialStandards.otherNotes,
})

const suppressNextSync = ref(false)
let unsubscribe: (() => void) | null = null

const standardOptions = [
  ...RELATED_STANDARD_DEFINITIONS.map((definition) => ({
    value: definition.code,
    label: `${definition.code}: ${definition.description}`,
    definition,
  })),
  { value: CUSTOM_OPTION_VALUE, label: 'Add Custom Standard', definition: { code: '', description: '' } },
]

const standardDefinitionMap = new Map(RELATED_STANDARD_DEFINITIONS.map((definition) => [definition.code, definition]))

const isModalOpen = ref(false)
const modalMode = ref<'create' | 'edit' | 'primary'>('create')
const modalForm = reactive<ConformanceStandardEntry>({
  id: '',
  code: '',
  description: '',
  source: 'custom',
})
const selectedOption = ref(CUSTOM_OPTION_VALUE)

const primaryCodeDisplay = computed(
  () => form.primaryStandard.code?.trim() || PRIMARY_STANDARD_DEFINITION.code
)
const primaryDescriptionDisplay = computed(
  () => form.primaryStandard.description?.trim() || PRIMARY_STANDARD_DEFINITION.description
)

const modalTitle = computed(() => {
  if (modalMode.value === 'primary') {
    return 'Edit Primary Standard'
  }
  return modalMode.value === 'create' ? 'Add Standard' : 'Edit Standard'
})

const modalSubtitle = computed(() => {
  if (modalMode.value === 'primary') {
    return 'Primary Standard'
  }
  return modalMode.value === 'create' ? 'New Standard' : modalForm.code || 'Selected Standard'
})

const duplicateWarning = computed(() => {
  if (modalMode.value !== 'create' && modalMode.value !== 'edit') {
    return ''
  }
  const normalized = modalForm.code?.trim().toLowerCase() || ''
  if (!normalized) return ''
  const exists = form.relatedStandards.some(
    (entry) => entry.id !== modalForm.id && entry.code?.trim().toLowerCase() === normalized
  )
  return exists ? 'This standard already exists in the table.' : ''
})

const canSaveModal = computed(() => {
  const hasCode = Boolean(modalForm.code?.trim())
  if (modalMode.value === 'primary') {
    return hasCode
  }
  return hasCode && !duplicateWarning.value
})

const selectedOptionLabel = computed(() => {
  const option = standardOptions.find(opt => opt.value === selectedOption.value)
  return option ? option.label : 'Add Custom Standard'
})

watch(
  form,
  (value) => {
    if (suppressNextSync.value) {
      suppressNextSync.value = false
      return
    }
    workspace.updateConformanceClaimState({
      standardsConformance: {
        primaryStandard: { ...value.primaryStandard },
        relatedStandards: value.relatedStandards.map((entry) => ({ ...entry })),
        includeOther: value.includeOther,
        otherNotes: value.otherNotes,
      },
    })
  },
  { deep: true }
)

watch(selectedOption, (value) => {
  if (!isModalOpen.value || modalMode.value === 'primary') {
    return
  }
  const definition = standardDefinitionMap.get(value)
  if (definition) {
    modalForm.code = definition.code
    modalForm.description = definition.description
    modalForm.source = 'default'
    return
  }
  modalForm.source = 'custom'
  if (modalMode.value === 'create') {
    modalForm.code = ''
    modalForm.description = ''
  }
})

function applyExternalState(state: any) {
  suppressNextSync.value = true
  const next = state.conformanceClaim.standardsConformance
  Object.assign(form.primaryStandard, next.primaryStandard)
  form.relatedStandards.splice(0, form.relatedStandards.length, ...next.relatedStandards.map((entry: any) => ({ ...entry })))
  form.includeOther = next.includeOther
  form.otherNotes = next.otherNotes
}

onMounted(() => {
  unsubscribe = workspace.subscribeDocumentWorkspace(applyExternalState)
})

onUnmounted(() => {
  unsubscribe?.()
})

function openCreateModal() {
  modalMode.value = 'create'
  isModalOpen.value = true
  modalForm.id = ''
  modalForm.code = ''
  modalForm.description = ''
  modalForm.source = 'custom'
  selectedOption.value = CUSTOM_OPTION_VALUE
}

function handleRowSelect(e: Event, row: any) {
  openEditModal(row.original)
}

function openEditModal(entry: ConformanceStandardEntry) {
  modalMode.value = 'edit'
  isModalOpen.value = true
  modalForm.id = entry.id
  modalForm.code = entry.code
  modalForm.description = entry.description
  modalForm.source = entry.source ?? 'custom'
  const match = standardDefinitionMap.get(entry.code || '')
  selectedOption.value = match && match.description === entry.description ? match.code : CUSTOM_OPTION_VALUE
}

function closeModal() {
  isModalOpen.value = false
}

function saveStandard() {
  if (!canSaveModal.value) {
    return
  }
  const code = modalForm.code.trim()
  const description = modalForm.description.trim()
  if (modalMode.value === 'primary') {
    form.primaryStandard.code = code
    form.primaryStandard.description = description
    closeModal()
    return
  }
  const source = selectedOption.value !== CUSTOM_OPTION_VALUE ? 'default' : 'custom'
  if (modalMode.value === 'create') {
    form.relatedStandards.push({
      id: generateStandardEntryId(),
      code,
      description,
      source,
    })
  } else {
    const target = form.relatedStandards.find((entry) => entry.id === modalForm.id)
    if (target) {
      target.code = code
      target.description = description
      target.source = source
    }
  }
  closeModal()
}

function removeStandard(entryId: string) {
  const index = form.relatedStandards.findIndex((entry) => entry.id === entryId)
  if (index >= 0) {
    form.relatedStandards.splice(index, 1)
  }
}

function deleteFromModal() {
  if (modalMode.value !== 'edit') {
    return
  }
  removeStandard(modalForm.id)
  closeModal()
}
</script>
