<template>
  <div class="evidence-tracker">
    <div class="flex justify-between items-start mb-6">
      <div>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
          {{ title }}
        </h3>
        <p v-if="description" class="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {{ description }}
        </p>
      </div>
      <slot name="actions"></slot>
    </div>

    <div class="space-y-4">
      <UCard 
        v-for="(entry, index) in localEntries" 
        :key="entry.id"
      >
        <template #header>
          <div class="flex justify-between items-start">
            <div>
              <h4 class="font-semibold text-gray-900 dark:text-white">
                {{ entry.title || `Evidence ${index + 1}` }}
              </h4>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {{ sectionLabel(entry.sectionKey) }}
              </p>
            </div>
            <UBadge 
              :color="statusColor(entry.status)"
              variant="subtle"
            >
              {{ statusLabel(entry.status) }}
            </UBadge>
          </div>
        </template>

        <div v-if="localEntries[index]" class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Evidence Title
            </label>
            <UInput
              v-model="localEntries[index]!.title"
              placeholder="Risk Management Plan"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reference ID
            </label>
            <UInput
              v-model="localEntries[index]!.referenceId"
              placeholder="EVD-RM-001"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <USelectMenu
              v-model="localEntries[index]!.status"
              :items="statusOptions"
              value-key="value"
              label-key="label"
              :search-input="false"
              color="neutral"
              variant="outline"
              trailing-icon="i-heroicons-chevron-down-20-solid"
              class="w-full"
            >
            </USelectMenu>
          </div>
        </div>

        <div v-if="localEntries[index]" class="mt-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notes / Link
          </label>
          <UTextarea
            v-model="localEntries[index]!.descriptionHtml"
            :rows="3"
            placeholder="Link to evidence repository, revision, or summary"
          />
        </div>
      </UCard>

      <div v-if="localEntries.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">
        <div class="text-5xl mb-4">📋</div>
        <p>No evidence entries yet</p>
        <p class="text-sm">Add evidence to track compliance documentation</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import {
  RISK_EVIDENCE_STATUS_OPTIONS,
  RISK_PRODUCT_CONTEXT_SECTION_KEY,
  type RiskEvidenceEntry,
  type RiskEvidenceStatus,
} from '~/services/documentWorkspace'

const props = defineProps<{
  modelValue?: RiskEvidenceEntry[]
  title?: string
  description?: string
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: RiskEvidenceEntry[]): void
}>()

const statusOptions = RISK_EVIDENCE_STATUS_OPTIONS
const localEntries = ref<RiskEvidenceEntry[]>(cloneEntries(props.modelValue))
const isUpdatingFromProps = ref(false)

// Watch for external changes to props
watch(
  () => props.modelValue,
  (newValue) => {
    isUpdatingFromProps.value = true
    localEntries.value = cloneEntries(newValue)
    nextTick(() => {
      isUpdatingFromProps.value = false
    })
  }
)

// Emit changes when localEntries change (but not when updating from props)
watch(
  localEntries,
  (newValue) => {
    if (!isUpdatingFromProps.value) {
      emit('update:modelValue', cloneEntries(newValue))
    }
  },
  { deep: true }
)

function cloneEntries(entries?: RiskEvidenceEntry[]) {
  if (!Array.isArray(entries)) return []
  return entries.map((entry) => ({ ...entry }))
}

function statusLabel(status: RiskEvidenceStatus) {
  return statusOptions.find((option) => option.value === status)?.label ?? 'Not Started'
}

function statusColor(status: RiskEvidenceStatus) {
  switch (status) {
    case 'complete':
      return 'success'
    case 'in_progress':
      return 'info'
    case 'not_started':
    default:
      return 'neutral'
  }
}

function sectionLabel(sectionKey?: string) {
  if (!sectionKey || sectionKey === RISK_PRODUCT_CONTEXT_SECTION_KEY) {
    return 'Product Context (Clause 6.2.1.2)'
  }
  return sectionKey
}

const title = props.title ?? 'Evidence Tracker'
const description = props.description ?? ''
</script>

<style scoped>
.evidence-tracker {
  @apply w-full;
}
</style>
