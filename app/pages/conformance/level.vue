<template>
  <div class="container mx-auto p-6 space-y-6">
    <!-- Title Card -->
    <UCard class="bg-gradient-to-r from-primary-50/80 via-white to-white dark:from-primary-950 dark:via-gray-950 dark:to-gray-900 border-primary-100 dark:border-primary-900">
      <div class="flex flex-wrap justify-between items-start gap-4">
        <div class="space-y-2">
          <p class="text-xs uppercase tracking-wide text-primary-700 dark:text-primary-300">
            Conformance Claim
          </p>
          <div class="space-y-1">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Conformance Level</h1>
            <p class="text-sm text-gray-700 dark:text-gray-200">
              Declare the claimed assurance tier or conformance level and describe any scope limitations or dependencies.
            </p>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <UButton
            to="/conformance/standards"
            color="primary"
            variant="outline"
          >
            Standards Conformance
          </UButton>
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

    <!-- Form Card -->
    <UCard>
      <template #header>
        <div>
          <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Clause Context
          </p>
          <h3 class="text-lg font-semibold">3.3 Conformance Level</h3>
        </div>
      </template>

      <div class="space-y-6">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Select the overall status and provide context for partial or non-conformance claims.
        </p>

        <!-- Status Selection -->
        <div class="space-y-3">
          <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300">Conformance Status</h4>
          <div class="flex flex-wrap gap-3">
            <label
              v-for="option in levelOptions"
              :key="option.value"
              class="flex items-center gap-2 px-4 py-3 border rounded-lg cursor-pointer transition-all min-w-[200px]"
              :class="form.statuses.includes(option.value)
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-950'
                : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'"
            >
              <input
                type="checkbox"
                :checked="form.statuses.includes(option.value)"
                @change="onStatusToggle(option.value, $event)"
                class="w-4 h-4"
              />
              <span class="font-medium">{{ option.label }}</span>
            </label>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Select the status that best represents the overall CRA readiness.
          </p>
        </div>

        <!-- Justification Editor -->
        <div class="space-y-3">
          <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300">Justification for Partial Conformance</h4>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Explain which requirements are not met and why. Cite remediation plans or mitigating controls.
          </p>
          <RichTextEditor
            v-model="form.justificationHtml"
            min-height="220px"
          />
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import type { ConformanceLevelState, ConformanceLevelStatus } from '~/types/conformance'
import { CONFORMANCE_LEVEL_OPTIONS } from '~/constants/conformance'

const workspace = useDocumentWorkspace()

const levelOptions = CONFORMANCE_LEVEL_OPTIONS
const initialState = workspace.loadDocumentWorkspace()
const form = reactive<ConformanceLevelState>({
  statuses: [...initialState.conformanceClaim.conformanceLevel.statuses],
  justificationHtml: initialState.conformanceClaim.conformanceLevel.justificationHtml ?? '',
})

const suppressNextSync = ref(false)
let unsubscribe: (() => void) | null = null

watch(
  form,
  () => {
    if (suppressNextSync.value) {
      suppressNextSync.value = false
      return
    }
    persistState()
  },
  { deep: true }
)

function persistState() {
  workspace.updateConformanceClaimState({
    conformanceLevel: {
      statuses: [...form.statuses],
      justificationHtml: form.justificationHtml,
    },
  })
}

function applyExternalState(state: any) {
  suppressNextSync.value = true
  form.statuses = [...state.conformanceClaim.conformanceLevel.statuses]
  form.justificationHtml = state.conformanceClaim.conformanceLevel.justificationHtml ?? ''
}

function onStatusToggle(status: ConformanceLevelStatus, event: Event) {
  const checked = (event.target as HTMLInputElement).checked
  if (checked) {
    if (!form.statuses.includes(status)) {
      form.statuses = [...form.statuses, status]
    }
  } else {
    form.statuses = form.statuses.filter((value) => value !== status)
  }
}

onMounted(() => {
  unsubscribe = workspace.subscribeDocumentWorkspace(applyExternalState)
})

onUnmounted(() => {
  unsubscribe?.()
})
</script>
