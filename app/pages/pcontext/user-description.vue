<template>
  <div class="container mx-auto p-6 space-y-6">
    <!-- Header Card -->
    <UCard
      class="border-primary-200 dark:border-primary-800 bg-gradient-to-r from-primary-50/80 via-white to-white dark:from-primary-950 dark:via-gray-950 dark:to-gray-900"
    >
      <template #header>
        <div class="flex items-start justify-between">
          <div>
            <p class="text-xs uppercase tracking-wide text-primary-700 dark:text-primary-300 font-semibold">Product Context</p>
            <h1 class="text-3xl font-bold mt-2 text-gray-900 dark:text-white">Product User Description</h1>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Describe the intended users of {{ productName }} and their characteristics.
            </p>
          </div>
          <UButton to="/document/preview" color="primary" variant="soft" icon="i-heroicons-arrow-right" trailing>
            Document Preview
          </UButton>
        </div>
      </template>
    </UCard>

    <!-- User Description Card -->
    <UCard>
      <template #header>
        <div class="flex items-start justify-between">
          <div>
            <p class="text-xs uppercase tracking-wide text-primary-700 dark:text-primary-300 font-semibold">Section 5.2.5</p>
            <h2 class="text-xl font-bold mt-2 text-gray-900 dark:text-white">Product User Description</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">[Reference: Clause 6.2.1.6 - Product user description]</p>
          </div>
          <UButton @click="insertUserDescriptionTemplate" color="primary" variant="outline" icon="i-heroicons-document-plus" size="sm">
            Insert Template
          </UButton>
        </div>
      </template>

      <div class="mb-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Describe the intended users of the product and their expected characteristics.
        </p>
      </div>

      <RichTextEditor v-model="form.userDescriptionHtml" min-height="400px" placeholder="Describe the product users..." />
    </UCard>

    <!-- RDPS Considerations Card -->
    <UCard>
      <template #header>
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center justify-between mb-2">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">RDPS Considerations</h2>
              <UCheckbox v-model="form.noRdps" label="This product does not rely on any RDPS" />
            </div>
          </div>
          <UButton v-if="!form.noRdps" @click="insertRdpsTemplate" color="primary" variant="outline" icon="i-heroicons-document-plus" size="sm" class="ml-4">
            Insert Template
          </UButton>
        </div>
      </template>

      <div v-if="!form.noRdps">
        <div class="mb-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            If applicable, describe how RDPS affects users.
          </p>
        </div>

        <RichTextEditor v-model="form.rdpsConsiderationsHtml" min-height="220px" placeholder="Describe RDPS considerations..." />
      </div>
      <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
        <div class="text-4xl mb-2">✓</div>
        <p class="font-medium">No RDPS considerations needed</p>
        <p class="text-sm mt-1">This product does not rely on Remote Digital Product Support services</p>
      </div>
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
          Track evidence references that support the product user description.
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
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Product User Description (Clause 6.2.1.6)</p>
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
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Evidence Title</label>
              <UInput v-model="evidenceEntries[index].title" placeholder="User Description Evidence" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reference ID</label>
              <UInput v-model="evidenceEntries[index].referenceId" placeholder="EVD-UD-001" class="w-full" />
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
                class="w-full"
              />
            </div>
          </div>

          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes / Link</label>
            <UTextarea v-model="evidenceEntries[index].descriptionHtml" :rows="2" placeholder="Link to evidence or notes" class="w-full" autoresize />
          </div>
        </UCard>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import type { DocumentWorkspaceState, RiskEvidenceEntry, RiskEvidenceStatus } from '~/services/documentWorkspace'
import { RISK_PRODUCT_USER_DESCRIPTION_SECTION_KEY } from '~/services/documentWorkspace'

const workspace = useDocumentWorkspace()

const workspaceState = ref<DocumentWorkspaceState>(workspace.loadDocumentWorkspace())
const hydrating = ref(false)
const form = reactive({
  userDescriptionHtml: '',
  noRdps: false,
  rdpsConsiderationsHtml: '',
})
const evidenceEntries = ref<RiskEvidenceEntry[]>([])
let unsubscribe: (() => void) | null = null

const productName = computed(() => {
  return workspaceState.value.introduction?.productName || workspaceState.value.cover?.deviceName || '[Product Name]'
})

const USER_DESCRIPTION_TEMPLATE = `<p><strong>[Describe the intended users of the product and their expected characteristics:]</strong></p>
<p><strong>Primary User Types:</strong></p>
<p><strong>End User Type 1:</strong> [e.g., "Home Consumer"]</p>
<ul>
<li><strong>Technical Expertise:</strong> [e.g., "Minimal - no technical training expected"]</li>
<li><strong>Security Knowledge:</strong> [e.g., "Basic awareness of passwords and updates"]</li>
<li><strong>Typical Usage:</strong> [e.g., "Daily personal use"]</li>
<li><strong>Access Level:</strong> [e.g., "Full access to user functions"]</li>
<li><strong>Responsibilities:</strong> [e.g., "Installing updates, setting passwords"]</li>
<li><strong>Accessibility Considerations:</strong> [Any specific accessibility needs considered - see Annex D]</li>
</ul>
<p><strong>End User Type 2:</strong> [e.g., "System Administrator"]</p>
<ul>
<li><strong>Technical Expertise:</strong> [e.g., "High - trained IT professional"]</li>
<li><strong>Security Knowledge:</strong> [e.g., "Advanced - security training expected"]</li>
<li><strong>Typical Usage:</strong> [e.g., "Configuration and monitoring"]</li>
<li><strong>Access Level:</strong> [e.g., "Administrative access"]</li>
<li><strong>Responsibilities:</strong> [e.g., "Security configuration, user management, monitoring"]</li>
<li><strong>Accessibility Considerations:</strong> [Any specific accessibility needs considered]</li>
</ul>
<p><strong>Vulnerable User Groups:</strong></p>
<p>[Consider if the product is intended for or may reasonably be used by vulnerable users:]</p>
<ul>
<li>☐ Children</li>
<li>☐ Elderly users</li>
<li>☐ Users with disabilities (specify): [e.g., visual, hearing, motor, cognitive]</li>
<li>☐ Users with limited language proficiency</li>
<li>☐ Other vulnerable groups: [describe]</li>
</ul>
<p><strong>Special Considerations for Vulnerable Users:</strong> [Describe any special security or accessibility measures for these groups]</p>
<p><strong>Component Integrator Users (if applicable)</strong></p>
<p>[If the product is intended to be used as a component in other products:]</p>
<ul>
<li><strong>Integrator Type:</strong> [e.g., "OEM manufacturer", "System integrator"]</li>
<li><strong>Expected Expertise:</strong> [Technical capabilities expected]</li>
<li><strong>Integration Expectations:</strong> [What the integrator is expected to provide]</li>
<li><strong>Shared Risk Model:</strong> [What security responsibilities are shared]</li>
</ul>`

const RDPS_TEMPLATE = `<p><strong>[If applicable, describe how RDPS affects users:]</strong></p>
<ul>
<li><strong>User Awareness of RDPS:</strong> [Are users aware that RDPS is used]</li>
<li><strong>User Control over RDPS:</strong> [What control do users have]</li>
<li><strong>Degraded Mode Impact:</strong> [How does RDPS unavailability affect users]</li>
</ul>`

function insertUserDescriptionTemplate() {
  form.userDescriptionHtml = USER_DESCRIPTION_TEMPLATE
}

function insertRdpsTemplate() {
  form.rdpsConsiderationsHtml = RDPS_TEMPLATE
}

function hydrate(state: DocumentWorkspaceState) {
  hydrating.value = true
  const productUserDescription = state.riskManagement?.productUserDescription
  const nextUserDesc = productUserDescription?.userDescriptionHtml || ''
  const nextNoRdps = productUserDescription?.noRdps || false
  const nextRdps = productUserDescription?.rdpsConsiderationsHtml || ''
  const nextEvidence = normalizeEvidenceEntries(productUserDescription?.evidenceEntries)

  if (form.userDescriptionHtml !== nextUserDesc) form.userDescriptionHtml = nextUserDesc
  if (form.noRdps !== nextNoRdps) form.noRdps = nextNoRdps
  if (form.rdpsConsiderationsHtml !== nextRdps) form.rdpsConsiderationsHtml = nextRdps
  if (!areEvidenceEntriesEqual(evidenceEntries.value, nextEvidence)) evidenceEntries.value = nextEvidence
  hydrating.value = false
}

function normalizeEvidenceEntries(entries?: RiskEvidenceEntry[]): RiskEvidenceEntry[] {
  if (entries && entries.length) return entries.map((e) => ({ ...e }))
  return [{
    id: `${RISK_PRODUCT_USER_DESCRIPTION_SECTION_KEY}-evidence`,
    sectionKey: RISK_PRODUCT_USER_DESCRIPTION_SECTION_KEY,
    title: 'Product User Description Evidence Reference',
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

watch(() => form.userDescriptionHtml, (value) => {
  if (hydrating.value) return
  workspace.updateRiskManagementState({
    productUserDescription: {
      userDescriptionHtml: value,
      noRdps: form.noRdps,
      rdpsConsiderationsHtml: form.rdpsConsiderationsHtml,
      evidenceEntries: normalizeEvidenceEntries(evidenceEntries.value),
    }
  })
}, { flush: 'sync' })

watch(() => form.noRdps, (value) => {
  if (hydrating.value) return
  workspace.updateRiskManagementState({
    productUserDescription: {
      userDescriptionHtml: form.userDescriptionHtml,
      noRdps: value,
      rdpsConsiderationsHtml: form.rdpsConsiderationsHtml,
      evidenceEntries: normalizeEvidenceEntries(evidenceEntries.value),
    }
  })
}, { flush: 'sync' })

watch(() => form.rdpsConsiderationsHtml, (value) => {
  if (hydrating.value) return
  workspace.updateRiskManagementState({
    productUserDescription: {
      userDescriptionHtml: form.userDescriptionHtml,
      noRdps: form.noRdps,
      rdpsConsiderationsHtml: value,
      evidenceEntries: normalizeEvidenceEntries(evidenceEntries.value),
    }
  })
}, { flush: 'sync' })

watch(evidenceEntries, (value) => {
  if (hydrating.value) return
  workspace.updateRiskManagementState({
    productUserDescription: {
      userDescriptionHtml: form.userDescriptionHtml,
      noRdps: form.noRdps,
      rdpsConsiderationsHtml: form.rdpsConsiderationsHtml,
      evidenceEntries: normalizeEvidenceEntries(value),
    }
  })
}, { deep: true })
</script>
