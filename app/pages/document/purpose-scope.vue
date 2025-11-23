<template>
  <div class="p-6 space-y-6">
    <!-- Header Card -->
    <UCard>
      <template #header>
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Introduction</p>
            <h1 class="text-2xl font-bold mt-1">Purpose and Scope</h1>
            <p class="text-gray-600 dark:text-gray-300 mt-2">
              Document how the {{ productNameDisplay }} assessment aligns with EN 40000-1-2-2025 Clause 1 and capture the
              lifecycle coverage, timeline, and methodology.
            </p>
          </div>
          <UButton
            to="/document/preview"
            color="gray"
            variant="ghost"
            icon="i-heroicons-arrow-right"
            trailing
          >
            Document Preview
          </UButton>
        </div>
      </template>

      <div class="space-y-6">
        <!-- Template Body -->
        <div class="prose dark:prose-invert max-w-none">
          <p class="text-lg font-semibold text-primary-600 dark:text-primary-400">1.2 Purpose and Scope</p>
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

        <UDivider />

        <!-- Scope of Assessment -->
        <div>
          <h3 class="text-base font-semibold mb-3">Scope of Assessment</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            This assessment covers the following lifecycle phases of <strong>{{ productNameDisplay }}</strong>. Select the
            phases that apply:
          </p>
          <div class="space-y-2">
            <div
              v-for="phase in lifecyclePhases"
              :key="phase"
              class="flex items-center"
            >
              <UCheckbox
                :model-value="isPhaseSelected(phase)"
                :label="phase"
                @update:model-value="togglePhase(phase)"
              />
            </div>
          </div>
        </div>

        <UDivider />

        <!-- Assessment Period -->
        <div>
          <h3 class="text-base font-semibold mb-3">Assessment Period</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>

        <UDivider />

        <!-- Assessment Methodology -->
        <div>
          <h3 class="text-base font-semibold mb-3">Assessment Methodology</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
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
