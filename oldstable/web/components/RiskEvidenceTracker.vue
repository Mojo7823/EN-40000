<template>
  <section class="risk-evidence-tracker">
    <header class="risk-evidence-header">
      <div>
        <p class="section-heading">{{ title }}</p>
        <p v-if="description" class="reference-line">{{ description }}</p>
      </div>
      <slot name="actions"></slot>
    </header>

    <div class="evidence-entry-list">
      <article v-for="(entry, index) in localEntries" :key="entry.id" class="evidence-entry-card">
        <div class="evidence-entry-header">
          <div>
            <p class="subheading">{{ entry.title || `Evidence ${index + 1}` }}</p>
            <p class="guidance-text">
              {{ sectionLabel(entry.sectionKey) }}
            </p>
          </div>
          <span :class="['status-chip', entry.status]">{{ statusLabel(entry.status) }}</span>
        </div>

        <div class="field-grid">
          <label class="field-block">
            <span>Evidence Title</span>
            <input v-model="localEntries[index].title" type="text" placeholder="Risk Management Plan" />
          </label>
          <label class="field-block">
            <span>Reference ID</span>
            <input v-model="localEntries[index].referenceId" type="text" placeholder="EVD-RM-001" />
          </label>
          <label class="field-block">
            <span>Status</span>
            <select v-model="localEntries[index].status">
              <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </label>
        </div>

        <label class="field-block">
          <span>Notes / Link</span>
          <textarea
            v-model="localEntries[index].descriptionHtml"
            rows="3"
            placeholder="Link to evidence repository, revision, or summary"
          ></textarea>
        </label>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  RISK_EVIDENCE_STATUS_OPTIONS,
  RISK_PRODUCT_CONTEXT_SECTION_KEY,
  type RiskEvidenceEntry,
  type RiskEvidenceStatus,
} from '../services/documentWorkspace'

const props = defineProps<{
  modelValue: RiskEvidenceEntry[]
  title?: string
  description?: string
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: RiskEvidenceEntry[]): void
}>()

const statusOptions = RISK_EVIDENCE_STATUS_OPTIONS
const localEntries = ref(props.modelValue.map(cloneEntry))
const syncing = ref(false)

watch(
  () => props.modelValue,
  (value) => {
    syncing.value = true
    localEntries.value = value.map(cloneEntry)
    syncing.value = false
  },
  { deep: true }
)

watch(
  localEntries,
  (value) => {
    if (syncing.value) return
    emit('update:modelValue', value.map(cloneEntry))
  },
  { deep: true }
)

function cloneEntry(entry: RiskEvidenceEntry): RiskEvidenceEntry {
  return { ...entry }
}

function statusLabel(status: RiskEvidenceStatus) {
  return statusOptions.find((option) => option.value === status)?.label ?? 'Not Started'
}

function sectionLabel(sectionKey?: string) {
  if (!sectionKey || sectionKey === RISK_PRODUCT_CONTEXT_SECTION_KEY) {
    return '5.1.1 Product Context'
  }
  return sectionKey
}

const title = props.title ?? 'Evidence Tracker'
const description = props.description ?? ''
</script>

<style scoped>
.risk-evidence-tracker {
  display: flex;
  flex-direction: column;
  gap: 20px;
  border-top: 1px solid var(--panel-border);
  padding-top: 16px;
}

.risk-evidence-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.evidence-entry-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.evidence-entry-card {
  border: 1px solid var(--panel-border);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: var(--card-bg, var(--surface));
}

.evidence-entry-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.status-chip {
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  background: var(--surface-alt);
  color: var(--text);
  border: 1px solid var(--panel-border);
}

.status-chip.in_progress {
  background: rgba(250, 204, 21, 0.15);
  border-color: rgba(250, 204, 21, 0.4);
  color: #92400e;
}

.status-chip.complete {
  background: rgba(34, 197, 94, 0.15);
  border-color: rgba(34, 197, 94, 0.4);
  color: #166534;
}

.status-chip.not_started {
  background: rgba(107, 114, 128, 0.15);
  border-color: rgba(107, 114, 128, 0.4);
  color: #374151;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.field-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: var(--text);
  font-size: 0.9rem;
}

.field-block span {
  font-weight: 600;
}

.field-block input,
.field-block textarea,
.field-block select {
  border-radius: 10px;
  border: 1px solid var(--panel-border);
  padding: 10px 12px;
  background: var(--surface);
  color: var(--text);
  font-size: 0.95rem;
}

.field-block textarea {
  resize: vertical;
}
</style>
