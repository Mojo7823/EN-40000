<template>
  <div class="container mx-auto p-6 space-y-6">
    <!-- Header Card -->
    <UCard
      class="border-primary-200 dark:border-primary-800 bg-gradient-to-r from-primary-50/80 via-white to-white dark:from-primary-950 dark:via-gray-950 dark:to-gray-900"
    >
      <template #header>
        <div class="flex items-start justify-between">
          <div>
            <p class="text-xs uppercase tracking-wide text-primary-700 dark:text-primary-300 font-semibold">Product Context </p>
            <h1 class="text-3xl font-bold mt-2 text-gray-900 dark:text-white">Product Context Establishment</h1>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Describe how {{ productName }} operates, where it is deployed, and who interacts with it so
              that risk assessments can stay grounded in the real-world context.
            </p>
          </div>
          <UButton to="/document/preview" color="primary" variant="soft" icon="i-heroicons-arrow-right" trailing>
            Document Preview
          </UButton>
        </div>
      </template>
    </UCard>

    <!-- Product Context Card -->
    <UCard>
      <template #header>
        <div>
          <p class="text-xs uppercase tracking-wide text-primary-700 dark:text-primary-300 font-semibold">Clause Reference</p>
          <h2 class="text-xl font-bold mt-2 text-gray-900 dark:text-white">5.2 Product Context</h2>
        </div>
      </template>

      <div class="prose dark:prose-invert max-w-none">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          The product context provides the foundation for all risk management activities. It captures the product's
          intended purpose, market positioning, operational environments, and the user communities who interact with it.
        </p>
      </div>
    </UCard>

    <!-- Intended Purpose Card -->
    <UCard>
      <template #header>
        <div>
          <p class="text-xs uppercase tracking-wide text-primary-700 dark:text-primary-300 font-semibold">Section 5.2.1</p>
          <h2 class="text-xl font-bold mt-2 text-gray-900 dark:text-white">5.2.1 Intended Purpose and Reasonably Foreseeable Use</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">[Reference: Clause 6.2.1.2 - Intended purpose and reasonably foreseeable use]</p>
        </div>
      </template>

      <div class="mb-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Detail what the product is designed and marketed to do, including the environments and users it targets.
        </p>
      </div>

      <RichTextEditor v-model="form.intendedPurposeHtml" min-height="280px" placeholder="Describe the intended purpose of the product..." />
    </UCard>

    <!-- Specific Intended Uses Card -->
    <UCard>
      <template #header>
        <div>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">Specific Intended Uses</h2>
        </div>
      </template>

      <div class="mb-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          List the discrete business or mission use cases that define success for the product.
        </p>
      </div>

      <RichTextEditor v-model="form.specificIntendedUsesHtml" min-height="220px" placeholder="List specific intended uses..." />
    </UCard>

    <!-- Foreseeable Use & Misuse Card -->
    <UCard>
      <template #header>
        <div>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">Reasonably Foreseeable Use & Misuse</h2>
        </div>
      </template>

      <div class="mb-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Identify foreseeable uses (even if unintended) and note any misuse considerations captured in the risk assessment.
        </p>
      </div>

      <RichTextEditor v-model="form.foreseeableUseHtml" min-height="280px" placeholder="Describe foreseeable uses and potential misuse..." />
    </UCard>

    <!-- Evidence Tracker Card -->
    <UCard>
      <template #header>
        <div>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">Evidence Reference</h2>
        </div>
      </template>

      <div class="mb-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Track evidence references that support the product context claims and risk assessments.
        </p>
      </div>

      <div class="space-y-4">
        <UCard 
          v-for="(entry, index) in evidenceEntries" 
          :key="entry.id"
        >
          <template #header>
            <div class="flex justify-between items-start">
              <div>
                <h4 class="font-semibold text-gray-900 dark:text-white">
                  {{ entry.title || `Evidence ${index + 1}` }}
                </h4>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Product Context (Clause 6.2.1.2)
                </p>
              </div>
              <UBadge 
                :color="entry.status === 'complete' ? 'success' : entry.status === 'in_progress' ? 'info' : 'neutral'"
                variant="subtle"
              >
                {{ entry.status === 'complete' ? 'Complete' : entry.status === 'in_progress' ? 'In Progress' : 'Not Started' }}
              </UBadge>
            </div>
          </template>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Evidence Title
              </label>
              <UInput
                v-model="entry.title"
                placeholder="Risk Management Plan"
                class="w-full"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Reference ID
              </label>
              <UInput
                v-model="entry.referenceId"
                placeholder="EVD-RM-001"
                class="w-full"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <USelectMenu
                v-model="entry.status"
                :items="[
                  { label: 'Not Started', value: 'not_started' },
                  { label: 'In Progress', value: 'in_progress' },
                  { label: 'Complete', value: 'complete' }
                ]"
                value-key="value"
                label-key="label"
                :search-input="false"
                color="neutral"
                variant="outline"
                trailing-icon="i-heroicons-chevron-down-20-solid"
                class="w-full"
              />
            </div>
          </div>

          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes / Link
            </label>
            <UTextarea
              v-model="entry.descriptionHtml"
              :rows="3"
              placeholder="Link to evidence repository, revision, or summary"
              class="w-full"
              autoresize
            />
          </div>
        </UCard>

        <div v-if="evidenceEntries.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">
          <div class="text-5xl mb-4">📋</div>
          <p>No evidence entries yet</p>
          <p class="text-sm">Add evidence to track compliance documentation</p>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import type { DocumentWorkspaceState, RiskEvidenceEntry, RiskEvidenceStatus } from '~/services/documentWorkspace'
import { RISK_PRODUCT_CONTEXT_SECTION_KEY } from '~/services/documentWorkspace'

const workspace = useDocumentWorkspace()

const workspaceState = ref<DocumentWorkspaceState>(workspace.loadDocumentWorkspace())
const hydrating = ref(false)
const form = reactive({
  intendedPurposeHtml: '',
  specificIntendedUsesHtml: '',
  foreseeableUseHtml: '',
})
const evidenceEntries = ref<RiskEvidenceEntry[]>([])
let unsubscribe: (() => void) | null = null

const productName = computed(() => {
  return workspaceState.value.introduction?.productName || workspaceState.value.cover?.deviceName || '[Product Name]'
})

function hydrate(state: DocumentWorkspaceState) {
  hydrating.value = true
  const productContext = state.riskManagement?.productContext
  const nextIntendedPurpose = productContext?.intendedPurposeHtml || ''
  const nextSpecificUses = productContext?.specificIntendedUsesHtml || ''
  const nextForeseeableUse = productContext?.foreseeableUseHtml || ''
  const nextEvidence = normalizeEvidenceEntries(productContext?.evidenceEntries)

  if (form.intendedPurposeHtml !== nextIntendedPurpose) {
    form.intendedPurposeHtml = nextIntendedPurpose
  }
  if (form.specificIntendedUsesHtml !== nextSpecificUses) {
    form.specificIntendedUsesHtml = nextSpecificUses
  }
  if (form.foreseeableUseHtml !== nextForeseeableUse) {
    form.foreseeableUseHtml = nextForeseeableUse
  }
  if (!areEvidenceEntriesEqual(evidenceEntries.value, nextEvidence)) {
    evidenceEntries.value = nextEvidence
  }
  hydrating.value = false
}

function normalizeRichTextValue(value?: string) {
  return value ?? ''
}

function normalizeEvidenceEntries(entries?: RiskEvidenceEntry[]): RiskEvidenceEntry[] {
  if (entries && entries.length) {
    return entries.map((entry) => ({ ...entry }))
  }
  return [
    {
      id: `${RISK_PRODUCT_CONTEXT_SECTION_KEY}-evidence`,
      sectionKey: RISK_PRODUCT_CONTEXT_SECTION_KEY,
      title: 'Product Context Evidence Reference',
      referenceId: '',
      descriptionHtml: '',
      status: 'not_started' as RiskEvidenceStatus,
    },
  ]
}

function areEvidenceEntriesEqual(a: RiskEvidenceEntry[], b: RiskEvidenceEntry[]) {
  if (a.length !== b.length) return false
  return a.every((entry, index) => {
    const next = b[index]
    if (!next) return false
    return (
      entry.id === next.id &&
      entry.sectionKey === next.sectionKey &&
      entry.title === next.title &&
      entry.referenceId === next.referenceId &&
      entry.descriptionHtml === next.descriptionHtml &&
      entry.status === next.status
    )
  })
}

function addEvidenceEntry() {
  const id = workspace.generateEvidenceEntryId?.(RISK_PRODUCT_CONTEXT_SECTION_KEY) ??
    `${RISK_PRODUCT_CONTEXT_SECTION_KEY}-${Date.now()}`

  evidenceEntries.value = [
    ...evidenceEntries.value,
    {
      id,
      sectionKey: RISK_PRODUCT_CONTEXT_SECTION_KEY,
      title: '',
      referenceId: '',
      descriptionHtml: '',
      status: 'not_started',
    },
  ]
}

onMounted(() => {
  hydrate(workspaceState.value)
  unsubscribe = workspace.subscribeDocumentWorkspace((state) => {
    workspaceState.value = state
    hydrate(state)
  })
})

onUnmounted(() => {
  unsubscribe?.()
})

watch(
  () => form.intendedPurposeHtml,
  (value) => {
    if (hydrating.value) return
    workspace.updateRiskManagementState({
      productContext: {
        intendedPurposeHtml: normalizeRichTextValue(value),
        specificIntendedUsesHtml: form.specificIntendedUsesHtml,
        foreseeableUseHtml: form.foreseeableUseHtml,
        evidenceEntries: normalizeEvidenceEntries(evidenceEntries.value)
      }
    })
  },
  { flush: 'sync' }
)

watch(
  () => form.specificIntendedUsesHtml,
  (value) => {
    if (hydrating.value) return
    workspace.updateRiskManagementState({
      productContext: {
        intendedPurposeHtml: form.intendedPurposeHtml,
        specificIntendedUsesHtml: normalizeRichTextValue(value),
        foreseeableUseHtml: form.foreseeableUseHtml,
        evidenceEntries: normalizeEvidenceEntries(evidenceEntries.value)
      }
    })
  },
  { flush: 'sync' }
)

watch(
  () => form.foreseeableUseHtml,
  (value) => {
    if (hydrating.value) return
    workspace.updateRiskManagementState({
      productContext: {
        intendedPurposeHtml: form.intendedPurposeHtml,
        specificIntendedUsesHtml: form.specificIntendedUsesHtml,
        foreseeableUseHtml: normalizeRichTextValue(value),
        evidenceEntries: normalizeEvidenceEntries(evidenceEntries.value)
      }
    })
  },
  { flush: 'sync' }
)

watch(
  evidenceEntries,
  (value) => {
    if (hydrating.value) return
    const currentEvidence = workspaceState.value.riskManagement?.productContext?.evidenceEntries || []
    const normalized = normalizeEvidenceEntries(value)
    if (areEvidenceEntriesEqual(normalized, currentEvidence)) return
    workspace.updateRiskManagementState({
      productContext: {
        intendedPurposeHtml: form.intendedPurposeHtml,
        specificIntendedUsesHtml: form.specificIntendedUsesHtml,
        foreseeableUseHtml: form.foreseeableUseHtml,
        evidenceEntries: normalized,
      }
    })
  },
  { deep: true }
)
</script>
