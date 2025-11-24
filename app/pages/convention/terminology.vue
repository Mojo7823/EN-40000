<template>
  <div class="container mx-auto p-6 space-y-6">
    <!-- Header Card -->
    <UCard class="bg-gradient-to-r from-primary-50/80 via-white to-white dark:from-primary-950 dark:via-gray-950 dark:to-gray-900 border-primary-100 dark:border-primary-900">
      <div class="flex flex-wrap justify-between items-start gap-4">
        <div class="space-y-2">
          <p class="text-xs uppercase tracking-wide text-primary-700 dark:text-primary-300">
            Document Convention
          </p>
          <div class="space-y-1">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Terminology</h1>
            <p class="text-sm text-gray-700 dark:text-gray-200">
              Maintain the glossary used throughout the CRA documentation. Entries feed Section 4.1 of the DOCX builder and preview.
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

    <!-- Terminology Card -->
    <UCard>
      <template #header>
        <div>
          <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Clause Context
          </p>
          <h3 class="text-lg font-semibold">4.1 Terminology</h3>
        </div>
      </template>

      <div class="prose dark:prose-invert max-w-none">
        <p class="text-sm font-medium text-gray-700 dark:text-gray-300">[Reference: Clause 4.1 - Terminology]</p>
        <p class="text-sm">
          All terms and definitions used in the CRA documentation align with prEN 40000-1-1 (Vocabulary) and Regulation (EU) 2024/2847. Use this table to capture product-specific terminology and the authoritative reference.
        </p>
      </div>
    </UCard>

    <!-- Terminology Table Card -->
    <UCard>
      <template #header>
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Terminology Inventory
            </p>
            <h3 class="text-lg font-semibold">Terms and Definitions</h3>
          </div>
          <UButton icon="i-heroicons-plus" @click="openAddModal">
            Add Term
          </UButton>
        </div>
      </template>

      <UTable
        :data="terminologyEntries"
        :columns="columns"
        :empty-state="{ icon: 'i-heroicons-book-open', label: 'No terminology captured yet.' }"
        @select="handleRowSelect"
      >
        <template #term-cell="{ row }">
          <span class="font-medium cursor-pointer">{{ row.original.term || '—' }}</span>
        </template>
        
        <template #definition-cell="{ row }">
          <span class="cursor-pointer">{{ row.original.definition || '—' }}</span>
        </template>
        
        <template #reference-cell="{ row }">
          <span class="cursor-pointer">{{ row.original.reference || '—' }}</span>
        </template>
        
        <template #actions-cell="{ row }">
          <UButton
            icon="i-heroicons-trash"
            color="error"
            variant="ghost"
            size="sm"
            @click.stop="removeEntry(row.original.id)"
          />
        </template>
      </UTable>
    </UCard>

    <!-- Modal -->
    <UModal
      v-model:open="showModal"
      :title="editMode ? 'Edit Term' : 'Add Term'"
      :description="editMode ? 'Update the terminology entry.' : 'Add a new term to the glossary.'"
    >
      <template #body>
        <div class="space-y-4">
          <UFormField label="Term" required>
            <UInput v-model="form.term" placeholder="Enter term" class="w-full" />
          </UFormField>

          <UFormField label="Definition" required>
            <UTextarea v-model="form.definition" :rows="4" placeholder="Enter definition" class="w-full" />
          </UFormField>

          <UFormField label="Reference" description="e.g., prEN 40000-1-1">
            <UInput v-model="form.reference" placeholder="Enter reference" class="w-full" />
          </UFormField>
        </div>
      </template>

      <template #footer>
        <div class="flex flex-col gap-3">
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ formError || 'Terms are listed in the order they are added.' }}
          </p>
          <div class="flex justify-end gap-3">
            <UButton
              v-if="editMode"
              color="error"
              variant="ghost"
              @click="deleteEntry"
            >
              Delete
            </UButton>
            <UButton color="neutral" variant="ghost" @click="closeModal">
              Cancel
            </UButton>
            <UButton :disabled="!form.term.trim() || !form.definition.trim()" @click="saveEntry">
              {{ editMode ? 'Save Changes' : 'Add Term' }}
            </UButton>
          </div>
        </div>
      </template>
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
  { accessorKey: 'term', header: 'Term' },
  { accessorKey: 'definition', header: 'Definition' },
  { accessorKey: 'reference', header: 'Reference' },
  { id: 'actions', header: 'Actions' }
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

function handleRowSelect(e: Event, row: any) {
  openEditModal(row.original)
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
