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
            <h1 class="text-3xl font-bold mt-2 text-gray-900 dark:text-white">Product Operational Environment</h1>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Describe the environment(s) in which {{ productName }} is intended to operate and could reasonably be foreseen to operate.
            </p>
          </div>
          <UButton to="/document/preview" color="primary" variant="soft" icon="i-heroicons-arrow-right" trailing>
            Document Preview
          </UButton>
        </div>
      </template>
    </UCard>

    <!-- Section Header Card -->
    <UCard>
      <template #header>
        <div>
          <p class="text-xs uppercase tracking-wide text-primary-700 dark:text-primary-300 font-semibold">Section 5.2.3</p>
          <h2 class="text-xl font-bold mt-2 text-gray-900 dark:text-white">Product Operational Environment</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">[Reference: Clause 6.2.1.4 - Product operational environment]</p>
        </div>
      </template>

      <div class="prose dark:prose-invert max-w-none">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          The operational environment describes the physical, network, and system contexts where the product will be deployed and used.
        </p>
      </div>
    </UCard>

    <!-- Physical Environment Card -->
    <UCard>
      <template #header>
        <div>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">Physical Environment</h2>
        </div>
      </template>

      <div class="mb-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Describe the physical deployment locations and conditions (e.g., data centers, industrial facilities, consumer homes, outdoor installations).
        </p>
      </div>

      <RichTextEditor v-model="form.physicalEnvironmentHtml" min-height="180px" placeholder="Describe the physical environment where the product operates..." />
    </UCard>

    <!-- Network Environment Card -->
    <UCard>
      <template #header>
        <div>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">Network Environment</h2>
        </div>
      </template>

      <div class="mb-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Describe the network topology, connectivity requirements, and communication protocols (e.g., LAN, WAN, cloud, air-gapped networks).
        </p>
      </div>

      <RichTextEditor v-model="form.networkEnvironmentHtml" min-height="180px" placeholder="Describe the network environment..." />
    </UCard>

    <!-- System Environment Card -->
    <UCard>
      <template #header>
        <div>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">System Environment</h2>
        </div>
      </template>

      <div class="mb-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Describe the operating systems, platforms, and software dependencies required for the product to function.
        </p>
      </div>

      <RichTextEditor v-model="form.systemEnvironmentHtml" min-height="180px" placeholder="Describe the system environment..." />
    </UCard>

    <!-- Operational Constraints Card -->
    <UCard>
      <template #header>
        <div>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">Operational Constraints</h2>
        </div>
      </template>

      <div class="mb-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Describe any operational limitations, restrictions, or assumptions about the deployment environment.
        </p>
      </div>

      <RichTextEditor v-model="form.operationalConstraintsHtml" min-height="180px" placeholder="Describe operational constraints..." />
    </UCard>

    <!-- RDPS Environment Card -->
    <UCard>
      <template #header>
        <div>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">RDPS Environment (if applicable)</h2>
        </div>
      </template>

      <div class="mb-4 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p class="text-sm text-blue-700 dark:text-blue-300">
          <strong>Requirement [Clause 6.2.3]:</strong> "If applicable, RDPS dependencies (e.g. a concise dependency map identifying operator, data exchanged, trust/authentication, and defined degraded modes) shall be recorded."
        </p>
      </div>

      <div class="mb-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Document any Remote Digital Product Support (RDPS) dependencies, including operators, data exchanges, trust relationships, and degraded operation modes.
        </p>
      </div>

      <RichTextEditor v-model="form.rdpsEnvironmentHtml" min-height="180px" placeholder="Describe RDPS environment dependencies..." />
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
          Track evidence references that support the operational environment claims.
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
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Operational Environment (Clause 6.2.1.4)</p>
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
              <UInput v-model="evidenceEntries[index].title" placeholder="Operational Environment Evidence" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reference ID</label>
              <UInput v-model="evidenceEntries[index].referenceId" placeholder="EVD-OE-001" class="w-full" />
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
import type { DocumentWorkspaceState, RiskEvidenceEntry, RiskEvidenceStatus, ProductOperationalEnvironmentState } from '~/services/documentWorkspace'
import { RISK_OPERATIONAL_ENVIRONMENT_SECTION_KEY } from '~/services/documentWorkspace'

const workspace = useDocumentWorkspace()

const workspaceState = ref<DocumentWorkspaceState>(workspace.loadDocumentWorkspace())
const hydrating = ref(false)
const form = reactive({
  physicalEnvironmentHtml: '',
  networkEnvironmentHtml: '',
  systemEnvironmentHtml: '',
  operationalConstraintsHtml: '',
  rdpsEnvironmentHtml: '',
})
const evidenceEntries = ref<RiskEvidenceEntry[]>([])
let unsubscribe: (() => void) | null = null

const productName = computed(() => {
  return workspaceState.value.introduction?.productName || workspaceState.value.cover?.deviceName || '[Product Name]'
})

function hydrate(state: DocumentWorkspaceState) {
  hydrating.value = true
  const opEnv = state.riskManagement?.operationalEnvironment
  const nextPhysical = opEnv?.physicalEnvironmentHtml || ''
  const nextNetwork = opEnv?.networkEnvironmentHtml || ''
  const nextSystem = opEnv?.systemEnvironmentHtml || ''
  const nextConstraints = opEnv?.operationalConstraintsHtml || ''
  const nextRdps = opEnv?.rdpsEnvironmentHtml || ''
  const nextEvidence = normalizeEvidenceEntries(opEnv?.evidenceEntries)

  if (form.physicalEnvironmentHtml !== nextPhysical) form.physicalEnvironmentHtml = nextPhysical
  if (form.networkEnvironmentHtml !== nextNetwork) form.networkEnvironmentHtml = nextNetwork
  if (form.systemEnvironmentHtml !== nextSystem) form.systemEnvironmentHtml = nextSystem
  if (form.operationalConstraintsHtml !== nextConstraints) form.operationalConstraintsHtml = nextConstraints
  if (form.rdpsEnvironmentHtml !== nextRdps) form.rdpsEnvironmentHtml = nextRdps
  if (!areEvidenceEntriesEqual(evidenceEntries.value, nextEvidence)) evidenceEntries.value = nextEvidence
  hydrating.value = false
}

function normalizeEvidenceEntries(entries?: RiskEvidenceEntry[]): RiskEvidenceEntry[] {
  if (entries && entries.length) return entries.map((e) => ({ ...e }))
  return [{
    id: `${RISK_OPERATIONAL_ENVIRONMENT_SECTION_KEY}-evidence`,
    sectionKey: RISK_OPERATIONAL_ENVIRONMENT_SECTION_KEY,
    title: 'Operational Environment Evidence Reference',
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

function saveState() {
  if (hydrating.value) return
  workspace.updateRiskManagementState({
    operationalEnvironment: {
      physicalEnvironmentHtml: form.physicalEnvironmentHtml,
      networkEnvironmentHtml: form.networkEnvironmentHtml,
      systemEnvironmentHtml: form.systemEnvironmentHtml,
      operationalConstraintsHtml: form.operationalConstraintsHtml,
      rdpsEnvironmentHtml: form.rdpsEnvironmentHtml,
      evidenceEntries: normalizeEvidenceEntries(evidenceEntries.value),
    }
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

watch(() => form.physicalEnvironmentHtml, saveState, { flush: 'sync' })
watch(() => form.networkEnvironmentHtml, saveState, { flush: 'sync' })
watch(() => form.systemEnvironmentHtml, saveState, { flush: 'sync' })
watch(() => form.operationalConstraintsHtml, saveState, { flush: 'sync' })
watch(() => form.rdpsEnvironmentHtml, saveState, { flush: 'sync' })
watch(evidenceEntries, saveState, { deep: true })
</script>
