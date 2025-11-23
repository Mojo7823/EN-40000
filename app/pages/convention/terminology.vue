<template>
  <div class="p-6 space-y-6">
    <!-- Header Card -->
    <UCard>
      <template #header>
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Document Convention</p>
            <h1 class="text-2xl font-bold mt-1">Terminology</h1>
            <p class="text-sm font-medium text-gray-700 dark:text-gray-300">[Reference: Clause 4.1 - Terminology]</p>
            <p class="text-gray-600 dark:text-gray-300 mt-2">
              Maintain the glossary used throughout the CRA documentation. Entries feed Section 4.1 of the DOCX builder and preview.
            </p>
          </div>
          <UButton to="/document/preview" color="gray" variant="ghost" icon="i-heroicons-arrow-right" trailing>
            Document Preview
          </UButton>
        </div>
      </template>

      <div class="prose dark:prose-invert max-w-none mb-6">
        <p class="text-lg font-semibold text-primary-600 dark:text-primary-400">4.1 Terminology</p>
        <p class="text-sm">
          All terms and definitions used in the CRA documentation align with prEN 40000-1-1 (Vocabulary) and Regulation (EU)
          2024/2847. Use this table to capture product-specific terminology and the authoritative reference.
        </p>
      </div>

      <div class="border-t border-gray-200 dark:border-gray-800 pt-6">
        <UTable 
          :rows="terminologyEntries" 
          :columns="columns"
          :empty-state="{ icon: 'i-heroicons-book-open', label: 'No terminology captured yet.' }"
          class="mb-4"
          @select="openEditModal"
        >
          <template #term-data="{ row }">
            <span class="font-medium cursor-pointer">{{ row.term || '—' }}</span>
          </template>
          
          <template #definition-data="{ row }">
            <span class="cursor-pointer">{{ row.definition || '—' }}</span>
          </template>
          
          <template #reference-data="{ row }">
            <span class="cursor-pointer">{{ row.reference || '—' }}</span>
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
        
        <UButton icon="i-heroicons-plus" @click="openAddModal">
          Add Term
        </UButton>
      </div>
    </UCard>

    <!-- Modal -->
    <UModal v-model="showModal">
      <UCard>
        <template #header>
          <div class="flex justify-between items-start gap-4">
            <div>
              <h3 class="text-lg font-semibold">{{ editMode ? 'Edit Term' : 'Add Term' }}</h3>
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
          <UFormGroup label="Term" required>
            <UInput v-model="form.term" placeholder="Enter term" />
          </UFormGroup>

          <UFormGroup label="Definition" required>
            <UTextarea v-model="form.definition" :rows="4" placeholder="Enter definition" />
          </UFormGroup>

          <UFormGroup label="Reference">
            <UInput v-model="form.reference" placeholder="e.g., prEN 40000-1-1" />
          </UFormGroup>

          <p v-if="formError" class="text-sm text-red-600 dark:text-red-400">{{ formError }}</p>
        </div>

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton
              v-if="editMode"
              color="red"
              variant="ghost"
              @click="deleteEntry"
            >
              Delete
            </UButton>
            <UButton color="gray" variant="ghost" @click="closeModal">
              Cancel
            </UButton>
            <UButton @click="saveEntry">
              {{ editMode ? 'Save Changes' : 'Add Term' }}
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import type {
  DocumentConventionTerminologyEntry,
  DocumentWorkspaceState
} from '~/services/documentWorkspace'

const workspace = useDocumentWorkspace()

const columns = [
  { key: 'term', label: 'Term', id: 'term' },
  { key: 'definition', label: 'Definition', id: 'definition' },
  { key: 'reference', label: 'Reference', id: 'reference' },
  { key: 'actions', label: 'Actions', id: 'actions' }
]

const workspaceState = ref<DocumentWorkspaceState>(workspace.loadDocumentWorkspace())
let unsubscribe: (() => void) | null = null

onMounted(() => {
  unsubscribe = workspace.subscribeDocumentWorkspace((state) => {
    workspaceState.value = state
  })
})

onUnmounted(() => {
  unsubscribe?.()
})

const terminologyEntries = computed(() => workspaceState.value.documentConvention.terminologyEntries)

const showModal = ref(false)
const editMode = ref(false)
const form = reactive<DocumentConventionTerminologyEntry>({
  id: '',
  term: '',
  definition: '',
  reference: '',
})
const formError = ref('')

function openAddModal() {
  editMode.value = false
  form.id = workspace.generateTerminologyEntryId()
  form.term = ''
  form.definition = ''
  form.reference = ''
  formError.value = ''
  showModal.value = true
}

function openEditModal(entry: DocumentConventionTerminologyEntry) {
  editMode.value = true
  form.id = entry.id
  form.term = entry.term
  form.definition = entry.definition
  form.reference = entry.reference
  formError.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function saveEntry() {
  const trimmedTerm = form.term.trim()
  const trimmedDefinition = form.definition.trim()
  if (!trimmedTerm || !trimmedDefinition) {
    formError.value = 'Please provide both a term and definition.'
    return
  }
  const trimmedReference = form.reference.trim()
  const nextEntries = terminologyEntries.value.map((entry) => ({ ...entry }))

  if (editMode.value) {
    const index = nextEntries.findIndex((entry) => entry.id === form.id)
    if (index !== -1) {
      nextEntries[index] = {
        id: form.id,
        term: trimmedTerm,
        definition: trimmedDefinition,
        reference: trimmedReference,
      }
    }
  } else {
    nextEntries.push({
      id: form.id || workspace.generateTerminologyEntryId(),
      term: trimmedTerm,
      definition: trimmedDefinition,
      reference: trimmedReference,
    })
  }

  workspace.updateDocumentConventionState({ terminologyEntries: nextEntries })
  showModal.value = false
}

function deleteEntry() {
  removeEntry(form.id)
  closeModal()
}

function removeEntry(id: string) {
  const nextEntries = terminologyEntries.value.filter((entry) => entry.id !== id)
  workspace.updateDocumentConventionState({ terminologyEntries: nextEntries })
}
</script>
