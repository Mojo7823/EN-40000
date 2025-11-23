<template>
  <div class="container mx-auto p-6 space-y-6">
    <UCard class="bg-gradient-to-r from-primary-50/80 via-white to-white dark:from-primary-950 dark:via-gray-950 dark:to-gray-900 border-primary-100 dark:border-primary-900">
      <div class="flex flex-wrap justify-between items-start gap-4">
        <div class="space-y-2">
          <p class="text-xs uppercase tracking-wide text-primary-700 dark:text-primary-300">
            Introduction
          </p>
          <div class="space-y-1">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Purpose and Scope</h1>
            <p class="text-sm text-gray-700 dark:text-gray-200">
              Document how the {{ productNameDisplay }} assessment aligns with EN 40000-1-2-2025 Clause 1 and capture the
              lifecycle coverage, timeline, and methodology.
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ selectedPhaseCount }} of {{ lifecyclePhases.length }} lifecycle phases selected
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

    <UCard>
      <template #header>
        <div>
          <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Clause Context
          </p>
          <h3 class="text-lg font-semibold">1.2 Purpose and Scope</h3>
        </div>
      </template>

      <div class="prose dark:prose-invert max-w-none">
        <p class="text-sm font-medium text-gray-700 dark:text-gray-300">[Reference: Clause 1 - Scope]</p>
        <p>
          This conformance report documents the assessment of <strong>{{ productNameDisplay }}</strong> against the
          requirements specified in EN 40000-1-2-2025: "Cybersecurity requirements for products with digital elements -
          Part 1-2: Principles for cyber resilience."
        </p>
        <p>
          The standard specifies general cybersecurity principles and risk management activities applicable to all
          products with digital elements throughout their lifecycle. This report demonstrates how
          <strong>{{ productNameDisplay }}</strong> ensures and maintains an appropriate level of cybersecurity based on
          identified risks.
        </p>
      </div>
    </UCard>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <UCard class="lg:col-span-2">
        <template #header>
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Scope of Assessment
              </p>
              <h3 class="text-lg font-semibold">Lifecycle Coverage</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Select the lifecycle phases that apply to {{ productNameDisplay }}.
              </p>
            </div>
            <UBadge color="primary" variant="soft">{{ selectedPhaseCount }} selected</UBadge>
          </div>
        </template>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            v-for="phase in lifecyclePhases"
            :key="phase"
            type="button"
            class="flex items-start gap-3 rounded-lg border p-4 text-left transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
            :class="isPhaseSelected(phase)
              ? 'border-primary-500 bg-primary-50/60 dark:bg-primary-950/40 shadow-sm'
              : 'border-gray-200 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700'"
            :aria-pressed="isPhaseSelected(phase)"
            @click="togglePhase(phase)"
          >
            <span class="mt-0.5">
              <UIcon
                :name="isPhaseSelected(phase) ? 'i-heroicons-check-circle' : 'i-heroicons-circle'"
                class="w-5 h-5"
                :class="isPhaseSelected(phase) ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'"
                aria-hidden="true"
              />
            </span>
            <div>
              <p class="font-semibold text-gray-900 dark:text-white">{{ phase }}</p>
              <p v-if="phaseDescriptions[phase]" class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {{ phaseDescriptions[phase] }}
              </p>
            </div>
          </button>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <div>
            <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Assessment Period
            </p>
            <h3 class="text-lg font-semibold">Timeline</h3>
          </div>
        </template>

        <div class="space-y-4">
          <UFormGroup label="Start Date">
            <UInput
              v-model="form.assessmentStart"
              type="date"
              icon="i-heroicons-calendar"
            />
          </UFormGroup>
          <UFormGroup label="End Date">
            <UInput
              v-model="form.assessmentEnd"
              type="date"
              icon="i-heroicons-calendar"
            />
          </UFormGroup>
        </div>
      </UCard>
    </div>

    <UCard>
      <template #header>
        <div>
          <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Assessment Methodology
          </p>
          <h3 class="text-lg font-semibold">Approach</h3>
        </div>
      </template>

      <div class="space-y-3">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Describe the methodology used (e.g., document review, interviews, technical testing, code review, penetration testing).
        </p>
        <RichTextEditor v-model="form.methodologyHtml" min-height="220px" />
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import type {
  DocumentWorkspaceState,
  PurposeScopeState
} from '~/services/documentWorkspace'

const workspace = useDocumentWorkspace()

const lifecyclePhases = [
  'Concept and planning',
  'Design and development',
  'Implementation',
  'Verification and validation',
  'Production and distribution',
  'Deployment and operation',
  'Maintenance and support',
  'Decommissioning',
]
const phaseDescriptions: Record<string, string> = {
  'Concept and planning': 'Vision, feasibility, early threat framing.',
  'Design and development': 'Architecture, secure design reviews, secure coding.',
  'Implementation': 'Build, integration, and internal verification.',
  'Verification and validation': 'Quality assurance and independent security testing.',
  'Production and distribution': 'Release hardening and supply chain handling.',
  'Deployment and operation': 'Rollout, monitoring, and incident readiness.',
  'Maintenance and support': 'Patching cadence and vulnerability handling.',
  'Decommissioning': 'End-of-life handling and data sanitization.',
}

const workspaceState = ref<DocumentWorkspaceState>(workspace.loadDocumentWorkspace())
const form = reactive<PurposeScopeState>({
  scopeSelections: [...workspaceState.value.purposeScope.scopeSelections],
  assessmentStart: workspaceState.value.purposeScope.assessmentStart,
  assessmentEnd: workspaceState.value.purposeScope.assessmentEnd,
  methodologyHtml: workspaceState.value.purposeScope.methodologyHtml,
})
const suppressNextSync = ref(false)
let unsubscribe: (() => void) | null = null

const introduction = computed(() => workspaceState.value.introduction)
const cover = computed(() => workspaceState.value.cover)
const productNameDisplay = computed(
  () => introduction.value.productName?.trim() || cover.value.deviceName?.trim() || 'Product Name'
)
const selectedPhaseCount = computed(() => form.scopeSelections.length)

watch(
  form,
  (value) => {
    if (suppressNextSync.value) {
      suppressNextSync.value = false
      return
    }
    workspace.updatePurposeScopeState({
      scopeSelections: [...value.scopeSelections],
      assessmentStart: value.assessmentStart,
      assessmentEnd: value.assessmentEnd,
      methodologyHtml: value.methodologyHtml,
    })
  },
  { deep: true }
)

function isPhaseSelected(phase: string) {
  return form.scopeSelections.includes(phase)
}

function togglePhase(phase: string) {
  const index = form.scopeSelections.indexOf(phase)
  if (index === -1) {
    form.scopeSelections.push(phase)
  } else {
    form.scopeSelections.splice(index, 1)
  }
}

function applyExternalState(state: DocumentWorkspaceState) {
  workspaceState.value = state
  suppressNextSync.value = true
  form.scopeSelections.splice(0, form.scopeSelections.length, ...state.purposeScope.scopeSelections)
  form.assessmentStart = state.purposeScope.assessmentStart
  form.assessmentEnd = state.purposeScope.assessmentEnd
  form.methodologyHtml = state.purposeScope.methodologyHtml
}

onMounted(() => {
  unsubscribe = workspace.subscribeDocumentWorkspace((state) => {
    applyExternalState(state)
  })
})

onUnmounted(() => {
  unsubscribe?.()
})
</script>
