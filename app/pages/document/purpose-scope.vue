<template>
  <div class="container mx-auto p-6 space-y-6">
    <UCard>
      <template #header>
        <div class="flex flex-wrap justify-between items-start gap-4">
          <div>
            <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
              Introduction
            </p>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              Purpose and Scope
            </h1>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Document how the {{ productNameDisplay }} assessment aligns with EN 40000-1-2-2025 Clause 1 and capture the
              lifecycle coverage, timeline, and methodology.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <UButton
              variant="ghost"
              color="gray"
              to="/document/preview"
              icon="i-heroicons-eye"
            >
              Preview
            </UButton>
          </div>
        </div>
      </template>
    </UCard>

    <UCard>
      <div class="space-y-6">
        <div class="space-y-3">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">1.2 Purpose and Scope</h2>
          <p class="text-sm font-semibold text-gray-600 dark:text-gray-400">[Reference: Clause 1 - Scope]</p>
          <div class="text-gray-700 dark:text-gray-300 leading-relaxed space-y-3">
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
        </div>

        <div class="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Scope of Assessment</h3>
          <p class="text-gray-700 dark:text-gray-300">
            This assessment covers the following lifecycle phases of <strong>{{ productNameDisplay }}</strong>. Select the
            phases that apply:
          </p>
          <div class="space-y-2">
            <button
              v-for="phase in lifecyclePhases"
              :key="phase"
              type="button"
              class="w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all text-left"
              :class="isPhaseSelected(phase)
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 text-gray-900 dark:text-white'
                : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300'"
              @click="togglePhase(phase)"
            >
              <span class="text-lg">{{ isPhaseSelected(phase) ? '☑' : '☐' }}</span>
              <span class="font-medium">{{ phase }}</span>
            </button>
          </div>
        </div>

        <div class="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Assessment Period</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField label="Start Date" name="assessmentStart">
              <UInput
                v-model="form.assessmentStart"
                type="date"
                size="lg"
              />
            </UFormField>
            <UFormField label="End Date" name="assessmentEnd">
              <UInput
                v-model="form.assessmentEnd"
                type="date"
                size="lg"
              />
            </UFormField>
          </div>
        </div>

        <div class="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Assessment Methodology</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Describe the methodology used (e.g., document review, interviews, technical testing, code review, penetration
            testing).
          </p>
          <RichTextEditor v-model="form.methodologyHtml" min-height="220px" />
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
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

