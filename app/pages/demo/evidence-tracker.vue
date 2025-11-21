<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Evidence Tracker Demo
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mb-8">
        Track compliance evidence and documentation
      </p>

      <div class="mb-6 flex gap-2">
        <UButton 
          @click="addEvidence" 
          icon="i-heroicons-plus"
          color="primary"
        >
          Add Evidence
        </UButton>
        <UButton 
          @click="loadSample" 
          variant="soft"
          color="gray"
        >
          Load Sample
        </UButton>
        <UButton 
          @click="clearAll" 
          variant="ghost"
          color="red"
        >
          Clear All
        </UButton>
      </div>

      <EvidenceTracker
        v-model="evidenceEntries"
        title="Compliance Evidence"
        description="Track all evidence documents for CRA compliance"
      >
        <template #actions>
          <div class="flex gap-2">
            <UButton 
              @click="saveToWorkspace" 
              variant="soft"
              icon="i-heroicons-arrow-down-tray"
              size="sm"
            >
              Save
            </UButton>
          </div>
        </template>
      </EvidenceTracker>

      <!-- Stats -->
      <div class="mt-8 grid grid-cols-3 gap-4">
        <UCard>
          <div class="text-center">
            <div class="text-3xl font-bold text-primary">{{ evidenceEntries.length }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Total Evidence</div>
          </div>
        </UCard>
        <UCard>
          <div class="text-center">
            <div class="text-3xl font-bold text-green-600">{{ completedCount }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Completed</div>
          </div>
        </UCard>
        <UCard>
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-600">{{ inProgressCount }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
          </div>
        </UCard>
      </div>

      <!-- JSON Output -->
      <UCard class="mt-8">
        <template #header>
          <h3 class="font-semibold">JSON Output (Debug)</h3>
        </template>
        <pre class="text-xs overflow-x-auto text-gray-800 dark:text-gray-200">{{ JSON.stringify(evidenceEntries, null, 2) }}</pre>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { generateEvidenceEntryId } from '~/services/documentWorkspace'
import type { RiskEvidenceEntry } from '~/services/documentWorkspace'

const evidenceEntries = ref<RiskEvidenceEntry[]>([])

const completedCount = computed(() => 
  evidenceEntries.value.filter(e => e.status === 'complete').length
)

const inProgressCount = computed(() => 
  evidenceEntries.value.filter(e => e.status === 'in_progress').length
)

function addEvidence() {
  evidenceEntries.value.push({
    id: generateEvidenceEntryId(),
    title: '',
    referenceId: '',
    status: 'not_started',
    descriptionHtml: '',
    sectionKey: '5.1.1'
  })
}

function loadSample() {
  evidenceEntries.value = [
    {
      id: generateEvidenceEntryId(),
      title: 'Risk Management Plan',
      referenceId: 'EVD-RM-001',
      status: 'complete',
      descriptionHtml: 'Comprehensive risk management documentation covering all identified risks',
      sectionKey: '5.1.1'
    },
    {
      id: generateEvidenceEntryId(),
      title: 'Security Assessment Report',
      referenceId: 'EVD-SEC-002',
      status: 'in_progress',
      descriptionHtml: 'Third-party security assessment in progress, expected completion next week',
      sectionKey: '5.1.1'
    },
    {
      id: generateEvidenceEntryId(),
      title: 'Vulnerability Disclosure Policy',
      referenceId: 'EVD-VUL-003',
      status: 'complete',
      descriptionHtml: 'Published at https://example.com/security/disclosure',
      sectionKey: '5.1.1'
    },
    {
      id: generateEvidenceEntryId(),
      title: 'Incident Response Procedure',
      referenceId: 'EVD-IRP-004',
      status: 'not_started',
      descriptionHtml: '',
      sectionKey: '5.1.1'
    }
  ]
}

function clearAll() {
  if (confirm('Clear all evidence entries?')) {
    evidenceEntries.value = []
  }
}

function saveToWorkspace() {
  // In a real app, this would save to documentWorkspace
  alert(`Saved ${evidenceEntries.value.length} evidence entries!`)
}
</script>
