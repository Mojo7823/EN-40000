<template>
  <div class="container mx-auto p-6 space-y-6">
    <!-- Header Card -->
    <UCard
      class="border-primary-200 dark:border-primary-800 bg-gradient-to-r from-primary-50/80 via-white to-white dark:from-primary-950 dark:via-gray-950 dark:to-gray-900"
    >
      <template #header>
        <div class="flex items-start justify-between">
          <div>
            <p class="text-xs uppercase tracking-wide text-primary-700 dark:text-primary-300 font-semibold">Risk Management Elements</p>
            <h1 class="text-3xl font-bold mt-2 text-gray-900 dark:text-white">Product Functions</h1>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Describe the primary and security functions of {{ productName }}.
            </p>
          </div>
          <UButton to="/document/preview" color="primary" variant="soft" icon="i-heroicons-arrow-right" trailing>
            Document Preview
          </UButton>
        </div>
      </template>
    </UCard>

    <!-- Primary Functions Card -->
    <UCard>
      <template #header>
        <div>
          <p class="text-xs uppercase tracking-wide text-primary-700 dark:text-primary-300 font-semibold">Section 5.2.2</p>
          <h2 class="text-xl font-bold mt-2 text-gray-900 dark:text-white">Product Functions</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">[Reference: Clause 6.2.1.3 - Product functions]</p>
        </div>
      </template>

      <div class="mb-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Describe the primary functions and capabilities of the product.
        </p>
      </div>

      <RichTextEditor v-model="form.primaryFunctionsHtml" min-height="220px" placeholder="Describe the primary functions of the product..." />
    </UCard>

    <!-- Security Functions Card -->
    <UCard>
      <template #header>
        <div>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">Security Functions</h2>
        </div>
      </template>

      <div class="mb-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Describe the security-related functions implemented by the product.
        </p>
      </div>

      <RichTextEditor v-model="form.securityFunctionsHtml" min-height="220px" placeholder="Describe the security functions of the product..." />
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
          Track evidence references that support the product function claims.
        </p>
      </div>

      <div class="space-y-4">
        <UCard v-for="(entry, index) in evidenceEntries" :key="entry.id">
          <template #header>
            <div class="flex justify-between items-start">
              <div>
                <h4 class="font-semibold text-gray-900 dark:text-white">
                  {{ entry.title || `Evidence ${index + 1}` }}
                </h4>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Product Functions (Clause 6.2.1.3)</p>
              </div>
              <UBadge
                :color="entry.status === 'complete' ? 'success' : entry.status === 'in_progress' ? 'info' : 'neutral'"
                variant="subtle"
              >
                {{ entry.status === 'complete' ? 'Complete' : entry.status === 'in_progress' ? 'In Progress' : 'Not Started' }}
              </UBadge>
            </div>
          </template>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Evidence Title</label>
              <UInput v-model="evidenceEntries[index].title" placeholder="Product Functions Evidence" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reference ID</label>
              <UInput v-model="evidenceEntries[index].referenceId" placeholder="EVD-PF-001" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <USelectMenu
                v-model="evidenceEntries[index].status"
                :items="[
                  { label: 'Not Started', value: 'not_started' },
                  { label: 'In Progress', value: 'in_progress' },
                  { label: 'Complete', value: 'complete' }
                ]"
                value-key="value"
                label-key="label"
                color="neutral"
                variant="outline"
              />
            </div>
          </div>

          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes / Link</label>
            <UTextarea v-model="evidenceEntries[index].descriptionHtml" :rows="2" placeholder="Link to evidence or notes" />
          </div>
        </UCard>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import type { DocumentWorkspaceState, RiskEvidenceEntry, RiskEvidenceStatus } from '~/services/documentWorkspace'
import { RISK_PRODUCT_FUNCTION_SECTION_KEY } from '~/services/documentWorkspace'

const workspace = useDocumentWorkspace()

const workspaceState = ref<DocumentWorkspaceState>(workspace.loadDocumentWorkspace())
const hydrating = ref(false)
const form = reactive({
  primaryFunctionsHtml: '',
  securityFunctionsHtml: '',
})
const evidenceEntries = ref<RiskEvidenceEntry[]>([])
let unsubscribe: (() => void) | null = null

const productName = computed(() => {
  return workspaceState.value.introduction?.productName || workspaceState.value.cover?.deviceName || '[Product Name]'
})

function hydrate(state: DocumentWorkspaceState) {
  hydrating.value = true
  const productFunction = state.riskManagement?.productFunction
  const nextPrimary = productFunction?.primaryFunctionsHtml || ''
  const nextSecurity = productFunction?.securityFunctionsHtml || ''
  const nextEvidence = normalizeEvidenceEntries(productFunction?.evidenceEntries)

  if (form.primaryFunctionsHtml !== nextPrimary) form.primaryFunctionsHtml = nextPrimary
  if (form.securityFunctionsHtml !== nextSecurity) form.securityFunctionsHtml = nextSecurity
  if (!areEvidenceEntriesEqual(evidenceEntries.value, nextEvidence)) evidenceEntries.value = nextEvidence
  hydrating.value = false
}

function normalizeEvidenceEntries(entries?: RiskEvidenceEntry[]): RiskEvidenceEntry[] {
  if (entries && entries.length) return entries.map((e) => ({ ...e }))
  return [{
    id: `${RISK_PRODUCT_FUNCTION_SECTION_KEY}-evidence`,
    sectionKey: RISK_PRODUCT_FUNCTION_SECTION_KEY,
    title: 'Product Functions Evidence Reference',
    referenceId: '',
    descriptionHtml: '',
    status: 'not_started' as RiskEvidenceStatus,
  }]
}

function areEvidenceEntriesEqual(a: RiskEvidenceEntry[], b: RiskEvidenceEntry[]) {
  if (a.length !== b.length) return false
  return a.every((entry, i) => {
    const next = b[i]
    return next && entry.id === next.id && entry.title === next.title && entry.referenceId === next.referenceId && entry.descriptionHtml === next.descriptionHtml && entry.status === next.status
  })
}

onMounted(() => {
  hydrate(workspaceState.value)
  unsubscribe = workspace.subscribeDocumentWorkspace((state) => {
    workspaceState.value = state
    hydrate(state)
  })
})

onUnmounted(() => unsubscribe?.())

watch(() => form.primaryFunctionsHtml, (value) => {
  if (hydrating.value) return
  workspace.updateRiskManagementState({
    productFunction: {
      primaryFunctionsHtml: value,
      securityFunctionsHtml: form.securityFunctionsHtml,
      evidenceEntries: normalizeEvidenceEntries(evidenceEntries.value),
    }
  })
}, { flush: 'sync' })

watch(() => form.securityFunctionsHtml, (value) => {
  if (hydrating.value) return
  workspace.updateRiskManagementState({
    productFunction: {
      primaryFunctionsHtml: form.primaryFunctionsHtml,
      securityFunctionsHtml: value,
      evidenceEntries: normalizeEvidenceEntries(evidenceEntries.value),
    }
  })
}, { flush: 'sync' })

watch(evidenceEntries, (value) => {
  if (hydrating.value) return
  workspace.updateRiskManagementState({
    productFunction: {
      primaryFunctionsHtml: form.primaryFunctionsHtml,
      securityFunctionsHtml: form.securityFunctionsHtml,
      evidenceEntries: normalizeEvidenceEntries(value),
    }
  })
}, { deep: true })
</script>
