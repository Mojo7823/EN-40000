<template>
  <div class="container mx-auto p-6 max-w-7xl">
    <!-- Title Card -->
    <UCard class="mb-6">
      <template #header>
        <div class="flex justify-between items-start gap-4 flex-wrap">
          <div>
            <p class="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Conformance Claim</p>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Regulatory Conformance</h1>
            <p class="text-gray-600 dark:text-gray-400 mt-2">
              Document the directives, regulations, or sector-specific rules that this product adheres to as part of the CRA
              submission.
            </p>
          </div>
          <div class="flex gap-3 flex-wrap items-center ml-auto">
            <UButton to="/conformance/standards" variant="ghost" color="gray">
              Standards Conformance
            </UButton>
            <UButton to="/conformance/level" variant="ghost" color="gray">
              Conformance Level
            </UButton>
            <UButton to="/document/preview" variant="ghost" color="gray">
              Document Preview
            </UButton>
          </div>
        </div>
      </template>
    </UCard>

    <!-- Reference Card -->
    <UCard class="mb-6">
      <template #header>
        <div class="space-y-2">
          <h2 class="text-xl font-bold">3.2 Regulatory Conformance</h2>
          <p class="text-sm font-semibold text-gray-700 dark:text-gray-300">[Reference: Annex C - Relationship with CRA]</p>
          <p class="text-gray-600 dark:text-gray-400 italic">
            This product is intended to conform to the essential cybersecurity requirements of the Cyber Resilience Act.
          </p>
        </div>
      </template>
      
      <div class="space-y-2">
        <p class="text-gray-900 dark:text-white">This product is intended to conform to the essential cybersecurity requirements of:</p>
        <ul class="list-disc list-inside space-y-1 text-gray-900 dark:text-white">
          <li v-for="item in primaryReferences" :key="item">{{ item }}</li>
        </ul>
      </div>
    </UCard>

    <!-- Additional Regulations -->
    <UCard>
      <template #header>
        <div class="space-y-2">
          <h2 class="text-xl font-bold">Other Applicable Regulations</h2>
          <p class="text-gray-600 dark:text-gray-400">
            List complementary regulations or directives (e.g., privacy, accessibility, safety) that reinforce the CRA
            conformance claim.
          </p>
        </div>
      </template>

      <div class="border-t border-gray-200 dark:border-gray-800 pt-6">
        <UTable 
          :rows="form.additionalRegulations" 
          :columns="columns"
          :empty-state="{ icon: 'i-heroicons-circle-stack-20-solid', label: 'No regulations captured yet.' }"
          class="mb-4"
          @select="openEditModal"
        >
          <template #regulation-data="{ row }">
            <span class="font-medium cursor-pointer">{{ row.regulation || '—' }}</span>
          </template>
          
          <template #description-data="{ row }">
            <span class="cursor-pointer">{{ row.description || '—' }}</span>
          </template>
          
          <template #actions-data="{ row }">
            <UButton 
              icon="i-heroicons-trash" 
              color="red" 
              variant="ghost" 
              size="sm"
              @click.stop="removeEntry(row.id)"
            />
          </template>
        </UTable>
        
        <UButton icon="i-heroicons-plus" @click="openCreateModal">
          Add Regulation
        </UButton>
      </div>
    </UCard>

    <!-- Modal -->
    <UModal v-model:open="isModalOpen" :title="modalTitle" :description="modalSubtitle">
      <template #body>
        <div class="space-y-4">
          <UFormGroup label="Suggested Regulations">
            <USelectMenu
              v-model="selectedOption"
              :options="regulationOptions"
              value-attribute="value"
              option-attribute="label"
            />
            <template #help>
              <span class="text-xs">Select [Other Regulation] to enter a custom reference.</span>
            </template>
          </UFormGroup>

          <UFormGroup label="Regulation" required>
            <UInput v-model="modalForm.regulation" placeholder="GDPR" />
          </UFormGroup>

          <UFormGroup label="Description">
            <UTextarea 
              v-model="modalForm.description" 
              :rows="3"
              placeholder="General Data Protection Regulation"
            />
          </UFormGroup>
        </div>
      </template>

      <template #footer>
        <div class="flex flex-col gap-3">
          <p v-if="duplicateWarning" class="text-xs text-red-500">{{ duplicateWarning }}</p>
          <p v-else class="text-xs text-gray-500 dark:text-gray-400">{{ modalStatus }}</p>
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
            <UButton :disabled="!canSaveModal" @click="saveEntry">
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
import type { RegulatoryReferenceEntry } from '~/types/conformance'
import {
  REGULATORY_PRIMARY_REFERENCES,
  REGULATORY_REFERENCE_DEFINITIONS,
  generateRegulationEntryId,
} from '~/constants/conformance'

const workspace = useDocumentWorkspace()

const primaryReferences = REGULATORY_PRIMARY_REFERENCES
const CUSTOM_OPTION_VALUE = '__custom__'

const columns = [
  { key: 'regulation', label: 'Regulation', id: 'regulation' },
  { key: 'description', label: 'Description', id: 'description' },
  { key: 'actions', label: 'Actions', id: 'actions' }
]

const initialState = workspace.loadDocumentWorkspace()
const form = reactive({
  additionalRegulations: initialState.conformanceClaim.regulatoryConformance.additionalRegulations.map((entry) => ({
    ...entry,
  })),
})

const regulationOptions = [
  ...REGULATORY_REFERENCE_DEFINITIONS.map((definition) => ({
    value: definition.regulation,
    label: `${definition.regulation} — ${definition.description}`,
    definition,
  })),
  {
    value: CUSTOM_OPTION_VALUE,
    label: '[Other Regulation]',
    definition: { regulation: '', description: '' },
  },
]

const definitionMap = new Map(regulationOptions.map((option) => [option.value, option.definition]))

const suppressNextSync = ref(false)
let unsubscribe: (() => void) | null = null

const isModalOpen = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const modalTitle = computed(() => (modalMode.value === 'edit' ? 'Edit Regulation' : 'Add Regulation'))
const modalSubtitle = computed(() =>
  modalMode.value === 'edit' ? 'Update the selected regulation entry.' : 'Capture another supporting regulation.'
)
const modalForm = reactive<RegulatoryReferenceEntry>({
  id: '',
  regulation: '',
  description: '',
  source: 'custom',
})
const modalStatus = ref('Regulation name is required.')
const selectedOption = ref(CUSTOM_OPTION_VALUE)

const duplicateWarning = computed(() => {
  const normalized = modalForm.regulation?.trim().toLowerCase() ?? ''
  if (!normalized) return ''
  const exists = form.additionalRegulations.some(
    (entry) => entry.id !== modalForm.id && entry.regulation?.trim().toLowerCase() === normalized
  )
  return exists ? 'This regulation already exists.' : ''
})

const canSaveModal = computed(() => modalForm.regulation.trim().length > 0 && !duplicateWarning.value)

watch(
  () => form.additionalRegulations,
  () => {
    if (suppressNextSync.value) {
      suppressNextSync.value = false
      return
    }
    persistState()
  },
  { deep: true }
)

watch(selectedOption, (value) => {
  if (!isModalOpen.value) return
  const definition = definitionMap.get(value)
  if (definition) {
    modalForm.regulation = definition.regulation
    modalForm.description = definition.description
    modalForm.source = 'default'
    return
  }
  if (value === CUSTOM_OPTION_VALUE && modalMode.value === 'create') {
    modalForm.regulation = ''
    modalForm.description = ''
  }
  modalForm.source = value === CUSTOM_OPTION_VALUE ? 'custom' : modalForm.source
})

onMounted(() => {
  unsubscribe = workspace.subscribeDocumentWorkspace((state) => {
    applyExternalState(state)
  })
})

onUnmounted(() => {
  unsubscribe?.()
})

function persistState() {
  workspace.updateConformanceClaimState({
    regulatoryConformance: {
      additionalRegulations: form.additionalRegulations.map((entry) => ({ ...entry })),
    },
  })
}

function applyExternalState(state: any) {
  suppressNextSync.value = true
  setEntries(state.conformanceClaim.regulatoryConformance.additionalRegulations.map((entry: any) => ({ ...entry })))
}

function setEntries(entries: RegulatoryReferenceEntry[]) {
  form.additionalRegulations.splice(0, form.additionalRegulations.length, ...entries)
}

function openCreateModal() {
  modalMode.value = 'create'
  modalForm.id = ''
  modalForm.regulation = ''
  modalForm.description = ''
  modalForm.source = 'custom'
  selectedOption.value = CUSTOM_OPTION_VALUE
  modalStatus.value = 'Regulation name is required.'
  isModalOpen.value = true
}

function openEditModal(entry: RegulatoryReferenceEntry) {
  modalMode.value = 'edit'
  modalForm.id = entry.id
  modalForm.regulation = entry.regulation
  modalForm.description = entry.description
  modalForm.source = entry.source ?? 'custom'
  const match = regulationOptions.find(
    (option) =>
      option.value !== CUSTOM_OPTION_VALUE &&
      option.definition.regulation === entry.regulation &&
      option.definition.description === entry.description
  )
  selectedOption.value = match?.value ?? CUSTOM_OPTION_VALUE
  modalStatus.value = 'Update the regulation or description.'
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
}

function saveEntry() {
  if (!canSaveModal.value) {
    modalStatus.value = 'Please provide a regulation name.'
    return
  }

  if (modalMode.value === 'edit') {
    const target = form.additionalRegulations.find((entry) => entry.id === modalForm.id)
    if (target) {
      target.regulation = modalForm.regulation.trim()
      target.description = modalForm.description.trim()
      target.source = modalForm.source
    }
  } else {
    form.additionalRegulations.push({
      id: generateRegulationEntryId(),
      regulation: modalForm.regulation.trim(),
      description: modalForm.description.trim(),
      source: modalForm.source,
    })
  }
  closeModal()
}

function removeEntry(id: string) {
  const index = form.additionalRegulations.findIndex((entry) => entry.id === id)
  if (index >= 0) {
    form.additionalRegulations.splice(index, 1)
  }
}

function deleteFromModal() {
  if (modalMode.value !== 'edit') return
  removeEntry(modalForm.id)
  closeModal()
}
</script>
