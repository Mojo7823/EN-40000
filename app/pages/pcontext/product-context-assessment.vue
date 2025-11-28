<template>
  <div class="container mx-auto p-6 space-y-6">
    <!-- Header Card -->
    <UCard
      class="border-primary-200 dark:border-primary-800 bg-gradient-to-r from-primary-50/80 via-white to-white dark:from-primary-950 dark:via-gray-950 dark:to-gray-900"
    >
      <template #header>
        <div class="flex items-start justify-between">
          <div>
            <p class="text-xs uppercase tracking-wide text-primary-700 dark:text-primary-300 font-semibold">Risk Management</p>
            <h1 class="text-3xl font-bold mt-2 text-gray-900 dark:text-white">Product Context - Assessment Summary</h1>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
              [Reference: Clause 6.2]
            </p>
          </div>
          <UButton to="/document/preview" color="primary" variant="soft" icon="i-heroicons-arrow-right" trailing>
            Document Preview
          </UButton>
        </div>
      </template>
    </UCard>

    <!-- Comments Modal -->
    <UModal v-model:open="commentsModalOpen" :ui="{ content: 'sm:max-w-2xl' }">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Edit Comment</h3>
              <UButton
                icon="i-heroicons-x-mark"
                color="neutral"
                variant="ghost"
                size="sm"
                @click="cancelCommentsModal"
              />
            </div>
          </template>

          <div class="min-h-[300px]">
            <RichTextEditor
              v-model="commentsEditorContent"
              placeholder="Enter your comment..."
              min-height="250px"
            />
          </div>

          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton color="neutral" variant="outline" @click="cancelCommentsModal">
                Cancel
              </UButton>
              <UButton color="primary" @click="saveCommentsModal">
                Save
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>

    <!-- Evidence Selection Modal -->
    <UModal v-model:open="evidenceModalOpen">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Select Evidence</h3>
              <UButton
                icon="i-heroicons-x-mark"
                color="neutral"
                variant="ghost"
                size="sm"
                @click="closeEvidenceModal"
              />
            </div>
          </template>

          <!-- Empty State -->
          <div v-if="evidenceEntries.length === 0" class="py-8 text-center">
            <UIcon name="i-heroicons-document-magnifying-glass" class="w-12 h-12 mx-auto text-gray-400" />
            <p class="mt-4 text-gray-600 dark:text-gray-400">No evidence entries found.</p>
            <p class="mt-2 text-sm text-gray-500 dark:text-gray-500">
              Add evidence in the Product Context sections first.
            </p>
            <UButton
              to="/pcontext/intended-purpose"
              color="primary"
              variant="soft"
              class="mt-4"
            >
              Go to Product Context
            </UButton>
          </div>

          <!-- Evidence List -->
          <div v-else class="space-y-2 max-h-96 overflow-y-auto">
            <div
              v-for="entry in evidenceEntries"
              :key="entry.id"
              class="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              :class="{
                'border-primary-500 bg-primary-50 dark:bg-primary-900/20': selectedEvidenceId === entry.id,
                'border-gray-200 dark:border-gray-700': selectedEvidenceId !== entry.id
              }"
              @click="selectEvidence(entry)"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-gray-900 dark:text-white truncate">
                    {{ entry.title || 'Untitled Evidence' }}
                  </p>
                  <p class="text-sm font-mono text-primary-600 dark:text-primary-400 mt-1">
                    {{ entry.referenceId || '—' }}
                  </p>
                </div>
                <UBadge :color="getStatusColor(entry.status)" variant="soft" class="ml-2 shrink-0">
                  {{ getStatusLabel(entry.status) }}
                </UBadge>
              </div>
            </div>
          </div>

          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton color="neutral" variant="outline" @click="closeEvidenceModal">
                Cancel
              </UButton>
              <UButton
                color="primary"
                :disabled="!selectedEvidenceId"
                @click="confirmEvidenceSelection"
              >
                Select
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>

    <!-- Overall Verdict Card -->
    <UCard>
      <template #header>
        <div>
          <p class="text-xs uppercase tracking-wide text-primary-700 dark:text-primary-300 font-semibold">Assessment Result</p>
          <h2 class="text-xl font-bold mt-2 text-gray-900 dark:text-white">Overall Verdict</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Select the overall assessment verdict for Clause 6.2.</p>
        </div>
      </template>

      <div class="flex flex-wrap gap-4">
        <div
          v-for="option in verdictOptions"
          :key="option.value"
          class="flex-1 min-w-[140px] p-4 border-2 rounded-lg cursor-pointer transition-all"
          :class="getVerdictOptionClasses(option.value)"
          @click="setOverallVerdict(option.value)"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
              :class="overallVerdict === option.value ? option.radioActiveClass : 'border-gray-300 dark:border-gray-600'"
            >
              <div
                v-if="overallVerdict === option.value"
                class="w-2.5 h-2.5 rounded-full"
                :class="option.radioDotClass"
              />
            </div>
            <div>
              <p class="font-semibold" :class="overallVerdict === option.value ? option.textClass : 'text-gray-700 dark:text-gray-300'">
                {{ option.label }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ option.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </UCard>

    <!-- Summary of Findings Card -->
    <UCard>
      <template #header>
        <div class="flex items-start justify-between">
          <div>
            <p class="text-xs uppercase tracking-wide text-primary-700 dark:text-primary-300 font-semibold">Assessment Documentation</p>
            <h2 class="text-xl font-bold mt-2 text-gray-900 dark:text-white">Summary of Findings</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Document the assessment conclusions and key findings.</p>
          </div>
          <UButton
            color="neutral"
            variant="soft"
            icon="i-heroicons-document-plus"
            @click="insertSummaryTemplate"
          >
            Insert Template
          </UButton>
        </div>
      </template>

      <div class="min-h-[300px]">
        <RichTextEditor
          v-model="summaryOfFindingsHtml"
          placeholder="Enter your summary of findings..."
          min-height="280px"
        />
      </div>
    </UCard>

    <!-- Assessment Checklist Card -->
    <UCard>
      <template #header>
        <div>
          <p class="text-xs uppercase tracking-wide text-primary-700 dark:text-primary-300 font-semibold">Assessment Checklist</p>
          <h2 class="text-xl font-bold mt-2 text-gray-900 dark:text-white">Clause 6.2 Requirements</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Evaluate each requirement and record evidence, status, and comments.</p>
        </div>
      </template>

      <UTable
        :data="tableData"
        :columns="columns"
        :empty-state="{ icon: 'i-heroicons-clipboard-document-list', label: 'No requirements loaded.' }"
      >
        <!-- ID Column -->
        <template #id-cell="{ row }">
          <span v-if="row.original.isHeader" class="font-bold text-primary-700 dark:text-primary-300">
            {{ row.original.subsectionLabel }}
          </span>
          <span v-else class="font-mono text-sm">{{ row.original.id }}</span>
        </template>

        <!-- Requirement Column -->
        <template #requirement-cell="{ row }">
          <span v-if="row.original.isHeader" class="font-semibold text-gray-700 dark:text-gray-300">
            {{ row.original.description }}
          </span>
          <span v-else class="text-sm">{{ row.original.description }}</span>
        </template>

        <!-- Evidence Column -->
        <template #evidence-cell="{ row }">
          <template v-if="!row.original.isHeader">
            <UButton
              variant="ghost"
              size="sm"
              class="text-left w-full justify-start"
              @click="openEvidenceModal(row.original.id)"
            >
              <span v-if="getAssessment(row.original.id)?.evidenceRefId" class="text-primary-600 dark:text-primary-400">
                {{ getAssessment(row.original.id)?.evidenceRefId }}
              </span>
              <span v-else class="text-gray-400 italic">Select evidence...</span>
            </UButton>
          </template>
        </template>

        <!-- Status Column -->
        <template #status-cell="{ row }">
          <template v-if="!row.original.isHeader">
            <div class="flex items-center gap-3">
              <label class="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  :checked="getAssessment(row.original.id)?.status === 'pass'"
                  class="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  @change="setStatus(row.original.id, 'pass')"
                />
                <span class="text-xs text-green-600">Pass</span>
              </label>
              <label class="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  :checked="getAssessment(row.original.id)?.status === 'fail'"
                  class="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  @change="setStatus(row.original.id, 'fail')"
                />
                <span class="text-xs text-red-600">Fail</span>
              </label>
              <label v-if="row.original.hasNa" class="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  :checked="getAssessment(row.original.id)?.status === 'na'"
                  class="rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                  @change="setStatus(row.original.id, 'na')"
                />
                <span class="text-xs text-gray-600">N/A</span>
              </label>
            </div>
          </template>
        </template>

        <!-- Comments Column -->
        <template #comments-cell="{ row }">
          <template v-if="!row.original.isHeader">
            <UButton
              variant="ghost"
              size="sm"
              class="text-left w-full justify-start"
              @click="openCommentsModal(row.original.id)"
            >
              <span v-if="getAssessment(row.original.id)?.commentsHtml" class="truncate max-w-[200px]">
                {{ stripHtml(getAssessment(row.original.id)?.commentsHtml || '') }}
              </span>
              <span v-else class="text-gray-400 italic">Add comment...</span>
            </UButton>
          </template>
        </template>
      </UTable>
    </UCard>

    <!-- Non-Conformities Card -->
    <UCard>
      <template #header>
        <div class="flex items-start justify-between">
          <div>
            <p class="text-xs uppercase tracking-wide text-primary-700 dark:text-primary-300 font-semibold">Issue Tracking</p>
            <h2 class="text-xl font-bold mt-2 text-gray-900 dark:text-white">Non-Conformities</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Document deviations from requirements and corrective actions.</p>
          </div>
          <UButton
            color="primary"
            icon="i-heroicons-plus"
            @click="openNCModal()"
          >
            Add Non-Conformity
          </UButton>
        </div>
      </template>

      <UTable
        :data="nonConformities"
        :columns="ncColumns"
        :empty-state="{ icon: 'i-heroicons-clipboard-document-list', label: 'No non-conformities recorded.' }"
        @select="(_, row) => openNCModal(row.original)"
      >
        <!-- NC ID Column -->
        <template #id-cell="{ row }">
          <span class="font-mono text-sm text-primary-600 dark:text-primary-400">{{ row.original.id }}</span>
        </template>

        <!-- Requirement Column -->
        <template #requirementId-cell="{ row }">
          <span class="font-mono text-sm">{{ row.original.requirementId }}</span>
        </template>

        <!-- Description Column -->
        <template #description-cell="{ row }">
          <span class="text-sm truncate max-w-[250px] block">{{ row.original.description }}</span>
        </template>

        <!-- Severity Column -->
        <template #severity-cell="{ row }">
          <UBadge :color="getSeverityColor(row.original.severity)" variant="soft">
            {{ getSeverityLabel(row.original.severity) }}
          </UBadge>
        </template>

        <!-- Corrective Action Column -->
        <template #correctiveAction-cell="{ row }">
          <span class="text-sm truncate max-w-[200px] block">{{ row.original.correctiveAction }}</span>
        </template>

        <!-- Actions Column -->
        <template #actions-cell="{ row }">
          <UButton
            icon="i-heroicons-trash"
            color="error"
            variant="ghost"
            size="sm"
            @click.stop="confirmDeleteNC(row.original)"
          />
        </template>
      </UTable>
    </UCard>

    <!-- Non-Conformity Modal -->
    <UModal v-model:open="ncModalOpen">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ ncEditMode ? 'Edit Non-Conformity' : 'Add Non-Conformity' }}
              </h3>
              <UButton
                icon="i-heroicons-x-mark"
                color="neutral"
                variant="ghost"
                size="sm"
                @click="closeNCModal"
              />
            </div>
          </template>

          <div class="space-y-4">
            <!-- NC ID -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">NC ID</label>
              <UInput
                v-model="ncForm.id"
                placeholder="e.g., NC-6.2-01"
                :disabled="ncEditMode"
                class="w-full"
              />
            </div>

            <!-- Requirement Reference -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Requirement Reference</label>
              <USelectMenu
                v-model="ncForm.requirementId"
                :items="requirementOptions"
                value-key="value"
                placeholder="Select requirement..."
                class="w-full"
              />
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <UTextarea
                v-model="ncForm.description"
                placeholder="Describe the non-conformity..."
                :rows="3"
                class="w-full"
              />
            </div>

            <!-- Severity -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Severity</label>
              <USelectMenu
                v-model="ncForm.severity"
                :items="severityOptions"
                value-key="value"
                class="w-full"
              />
            </div>

            <!-- Corrective Action -->
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Corrective Action</label>
              <UTextarea
                v-model="ncForm.correctiveAction"
                placeholder="Describe the corrective action..."
                :rows="3"
                class="w-full"
              />
            </div>
          </div>

          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton color="neutral" variant="outline" @click="closeNCModal">
                Cancel
              </UButton>
              <UButton color="primary" @click="saveNC">
                {{ ncEditMode ? 'Update' : 'Add' }}
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>

    <!-- Delete Confirmation Modal -->
    <UModal v-model:open="deleteConfirmOpen">
      <template #content>
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Confirm Delete</h3>
              <UButton
                icon="i-heroicons-x-mark"
                color="neutral"
                variant="ghost"
                size="sm"
                @click="deleteConfirmOpen = false"
              />
            </div>
          </template>

          <p class="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete non-conformity <span class="font-mono font-semibold">{{ ncToDelete?.id }}</span>?
            This action cannot be undone.
          </p>

          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton color="neutral" variant="outline" @click="deleteConfirmOpen = false">
                Cancel
              </UButton>
              <UButton color="error" @click="deleteNC">
                Delete
              </UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import type { DocumentWorkspaceState, RequirementAssessmentEntry, AssessmentStatus, RiskEvidenceEntry, RiskEvidenceStatus, OverallVerdict, NonConformityEntry, NCSeverity } from '~/services/documentWorkspace'
import { PRODUCT_CONTEXT_REQUIREMENTS, RISK_EVIDENCE_STATUS_OPTIONS } from '~/services/documentWorkspace'

const workspace = useDocumentWorkspace()

const workspaceState = ref<DocumentWorkspaceState>(workspace.loadDocumentWorkspace())
const hydrating = ref(false)
let unsubscribe: (() => void) | null = null

// Local state for assessments
const assessments = ref<RequirementAssessmentEntry[]>([])

// Overall verdict state
const overallVerdict = ref<OverallVerdict>('not_assessed')

// Summary of findings state
const summaryOfFindingsHtml = ref('')

// Verdict options configuration
const verdictOptions = [
  {
    value: 'pass' as OverallVerdict,
    label: 'PASS',
    description: 'All requirements met',
    radioActiveClass: 'border-green-500',
    radioDotClass: 'bg-green-500',
    textClass: 'text-green-700 dark:text-green-400',
    borderClass: 'border-green-500 bg-green-50 dark:bg-green-900/20',
  },
  {
    value: 'partial' as OverallVerdict,
    label: 'PARTIAL',
    description: 'Some requirements met',
    radioActiveClass: 'border-amber-500',
    radioDotClass: 'bg-amber-500',
    textClass: 'text-amber-700 dark:text-amber-400',
    borderClass: 'border-amber-500 bg-amber-50 dark:bg-amber-900/20',
  },
  {
    value: 'fail' as OverallVerdict,
    label: 'FAIL',
    description: 'Requirements not met',
    radioActiveClass: 'border-red-500',
    radioDotClass: 'bg-red-500',
    textClass: 'text-red-700 dark:text-red-400',
    borderClass: 'border-red-500 bg-red-50 dark:bg-red-900/20',
  },
  {
    value: 'na' as OverallVerdict,
    label: 'N/A',
    description: 'Not applicable',
    radioActiveClass: 'border-gray-500',
    radioDotClass: 'bg-gray-500',
    textClass: 'text-gray-700 dark:text-gray-400',
    borderClass: 'border-gray-500 bg-gray-50 dark:bg-gray-800/50',
  },
]

// Get classes for verdict option based on selection state
function getVerdictOptionClasses(value: OverallVerdict): string {
  const option = verdictOptions.find(o => o.value === value)
  if (overallVerdict.value === value && option) {
    return option.borderClass
  }
  return 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
}

// Evidence modal state
const evidenceModalOpen = ref(false)
const currentEvidenceRequirementId = ref<string | null>(null)
const selectedEvidenceId = ref<string | null>(null)

// Comments modal state
const commentsModalOpen = ref(false)
const currentCommentsRequirementId = ref<string | null>(null)
const commentsEditorContent = ref('')
const originalCommentsContent = ref('')

// Non-conformities state
const nonConformities = ref<NonConformityEntry[]>([])
const ncModalOpen = ref(false)
const ncEditMode = ref(false)
const ncForm = ref<NonConformityEntry>({
  id: '',
  requirementId: '',
  description: '',
  severity: 'minor',
  correctiveAction: '',
})
const deleteConfirmOpen = ref(false)
const ncToDelete = ref<NonConformityEntry | null>(null)

// NC severity options
const severityOptions = [
  { value: 'minor', label: 'Minor' },
  { value: 'major', label: 'Major' },
  { value: 'critical', label: 'Critical' },
]

// Requirement options for NC modal dropdown
const requirementOptions = computed(() => {
  return PRODUCT_CONTEXT_REQUIREMENTS.map(req => ({
    value: req.id,
    label: `${req.id} - ${req.description.substring(0, 50)}${req.description.length > 50 ? '...' : ''}`,
  }))
})

// NC table columns
const ncColumns = [
  { accessorKey: 'id', header: 'NC ID', size: 100 },
  { accessorKey: 'requirementId', header: 'Requirement', size: 100 },
  { accessorKey: 'description', header: 'Description', size: 250 },
  { accessorKey: 'severity', header: 'Severity', size: 100 },
  { accessorKey: 'correctiveAction', header: 'Corrective Action', size: 200 },
  { id: 'actions', header: '', size: 60 },
]

// Table columns
const columns = [
  { accessorKey: 'id', header: 'ID', size: 100 },
  { accessorKey: 'requirement', header: 'Requirement', size: 400 },
  { accessorKey: 'evidence', header: 'Evidence', size: 150 },
  { accessorKey: 'status', header: 'Status', size: 180 },
  { accessorKey: 'comments', header: 'Comments', size: 200 },
]

// Build table data with subsection headers
interface TableRow {
  id: string
  description: string
  subsection: string
  subsectionLabel?: string
  hasNa: boolean
  isHeader: boolean
}

const tableData = computed<TableRow[]>(() => {
  const rows: TableRow[] = []
  let currentSubsection = ''

  for (const req of PRODUCT_CONTEXT_REQUIREMENTS) {
    // Add subsection header if new subsection
    if (req.subsection !== currentSubsection) {
      currentSubsection = req.subsection
      const subsectionLabels: Record<string, string> = {
        '6.2.2': '6.2.2 Input Documentation',
        '6.2.3': '6.2.3 Product Context Requirements',
        '6.2.4': '6.2.4 Output',
        '6.2.5': '6.2.5 Assessment Criteria',
      }
      rows.push({
        id: `header-${req.subsection}`,
        description: '',
        subsection: req.subsection,
        subsectionLabel: subsectionLabels[req.subsection] || req.subsection,
        hasNa: false,
        isHeader: true,
      })
    }

    // Add requirement row
    rows.push({
      id: req.id,
      description: req.description,
      subsection: req.subsection,
      hasNa: req.hasNa,
      isHeader: false,
    })
  }

  return rows
})

// Get assessment for a requirement
function getAssessment(requirementId: string): RequirementAssessmentEntry | undefined {
  return assessments.value.find(a => a.id === requirementId)
}

// Ensure assessment entry exists
function ensureAssessment(requirementId: string): RequirementAssessmentEntry {
  let assessment = assessments.value.find(a => a.id === requirementId)
  if (!assessment) {
    assessment = {
      id: requirementId,
      evidenceId: '',
      evidenceRefId: '',
      status: 'not_assessed',
      commentsHtml: '',
    }
    assessments.value.push(assessment)
  }
  return assessment
}

// Set status with mutual exclusivity
function setStatus(requirementId: string, newStatus: AssessmentStatus) {
  const assessment = ensureAssessment(requirementId)
  
  // If clicking the same status, toggle to not_assessed
  if (assessment.status === newStatus) {
    assessment.status = 'not_assessed'
  } else {
    assessment.status = newStatus
  }
  
  saveAssessments()
}

// Strip HTML for preview
function stripHtml(html: string): string {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText || ''
}

// Computed property to get all evidence entries from workspace
const evidenceEntries = computed<RiskEvidenceEntry[]>(() => {
  const state = workspaceState.value
  const entries: RiskEvidenceEntry[] = []

  // Product Context evidence
  if (state.riskManagement?.productContext?.evidenceEntries?.length) {
    entries.push(...state.riskManagement.productContext.evidenceEntries)
  }

  // Product Functions evidence
  if (state.riskManagement?.productFunction?.evidenceEntries?.length) {
    entries.push(...state.riskManagement.productFunction.evidenceEntries)
  }

  // Operational Environment evidence
  if (state.riskManagement?.operationalEnvironment?.evidenceEntries?.length) {
    entries.push(...state.riskManagement.operationalEnvironment.evidenceEntries)
  }

  // Product Architecture evidence
  if (state.riskManagement?.productArchitecture?.evidenceEntries?.length) {
    entries.push(...state.riskManagement.productArchitecture.evidenceEntries)
  }

  // Product User Description evidence
  if (state.riskManagement?.productUserDescription?.evidenceEntries?.length) {
    entries.push(...state.riskManagement.productUserDescription.evidenceEntries)
  }

  return entries
})

// Evidence modal functions
function openEvidenceModal(requirementId: string) {
  currentEvidenceRequirementId.value = requirementId
  // Pre-select current evidence if exists
  const assessment = getAssessment(requirementId)
  selectedEvidenceId.value = assessment?.evidenceId || null
  evidenceModalOpen.value = true
}

function closeEvidenceModal() {
  evidenceModalOpen.value = false
  currentEvidenceRequirementId.value = null
  selectedEvidenceId.value = null
}

function selectEvidence(entry: RiskEvidenceEntry) {
  selectedEvidenceId.value = entry.id
}

function confirmEvidenceSelection() {
  if (!currentEvidenceRequirementId.value || !selectedEvidenceId.value) return

  const selectedEntry = evidenceEntries.value.find(e => e.id === selectedEvidenceId.value)
  if (!selectedEntry) return

  const assessment = ensureAssessment(currentEvidenceRequirementId.value)
  assessment.evidenceId = selectedEntry.id
  assessment.evidenceRefId = selectedEntry.referenceId || selectedEntry.title || selectedEntry.id

  saveAssessments()
  closeEvidenceModal()
}

// Status helpers for evidence entries
function getStatusColor(status: RiskEvidenceStatus): 'success' | 'info' | 'neutral' {
  switch (status) {
    case 'complete':
      return 'success'
    case 'in_progress':
      return 'info'
    default:
      return 'neutral'
  }
}

function getStatusLabel(status: RiskEvidenceStatus): string {
  return RISK_EVIDENCE_STATUS_OPTIONS.find(opt => opt.value === status)?.label ?? 'Not Started'
}

// Comments modal functions
function openCommentsModal(requirementId: string) {
  currentCommentsRequirementId.value = requirementId
  const assessment = getAssessment(requirementId)
  const existingContent = assessment?.commentsHtml || ''
  commentsEditorContent.value = existingContent
  originalCommentsContent.value = existingContent
  commentsModalOpen.value = true
}

function saveCommentsModal() {
  if (!currentCommentsRequirementId.value) return

  const assessment = ensureAssessment(currentCommentsRequirementId.value)
  assessment.commentsHtml = commentsEditorContent.value

  saveAssessments()
  closeCommentsModal()
}

function cancelCommentsModal() {
  // Discard changes - restore original content
  commentsEditorContent.value = originalCommentsContent.value
  closeCommentsModal()
}

function closeCommentsModal() {
  commentsModalOpen.value = false
  currentCommentsRequirementId.value = null
  commentsEditorContent.value = ''
  originalCommentsContent.value = ''
}

// NC helper functions
function getSeverityColor(severity: NCSeverity): 'warning' | 'error' | 'neutral' {
  switch (severity) {
    case 'critical':
      return 'error'
    case 'major':
      return 'warning'
    default:
      return 'neutral'
  }
}

function getSeverityLabel(severity: NCSeverity): string {
  return severityOptions.find(opt => opt.value === severity)?.label ?? 'Minor'
}

// NC modal functions
function openNCModal(entry?: NonConformityEntry) {
  if (entry) {
    // Edit mode
    ncEditMode.value = true
    ncForm.value = { ...entry }
  } else {
    // Create mode
    ncEditMode.value = false
    ncForm.value = {
      id: generateNCId(),
      requirementId: '',
      description: '',
      severity: 'minor',
      correctiveAction: '',
    }
  }
  ncModalOpen.value = true
}

function closeNCModal() {
  ncModalOpen.value = false
  ncEditMode.value = false
  ncForm.value = {
    id: '',
    requirementId: '',
    description: '',
    severity: 'minor',
    correctiveAction: '',
  }
}

function generateNCId(): string {
  const existingIds = nonConformities.value.map(nc => nc.id)
  let counter = 1
  let newId = `NC-6.2-${String(counter).padStart(2, '0')}`
  while (existingIds.includes(newId)) {
    counter++
    newId = `NC-6.2-${String(counter).padStart(2, '0')}`
  }
  return newId
}

function saveNC() {
  if (!ncForm.value.id) return

  if (ncEditMode.value) {
    // Update existing entry
    const index = nonConformities.value.findIndex(nc => nc.id === ncForm.value.id)
    if (index !== -1) {
      nonConformities.value[index] = { ...ncForm.value }
    }
  } else {
    // Add new entry
    nonConformities.value.push({ ...ncForm.value })
  }

  saveNonConformities()
  closeNCModal()
}

function confirmDeleteNC(entry: NonConformityEntry) {
  ncToDelete.value = entry
  deleteConfirmOpen.value = true
}

function deleteNC() {
  if (!ncToDelete.value) return

  const index = nonConformities.value.findIndex(nc => nc.id === ncToDelete.value!.id)
  if (index !== -1) {
    nonConformities.value.splice(index, 1)
  }

  saveNonConformities()
  deleteConfirmOpen.value = false
  ncToDelete.value = null
}

function saveNonConformities() {
  if (hydrating.value) return
  saveState()
}

// Set overall verdict and persist immediately
function setOverallVerdict(verdict: OverallVerdict) {
  overallVerdict.value = verdict
  saveState()
}

// Summary of findings template
const SUMMARY_TEMPLATE = `<h3>Assessment Summary</h3>
<p>This section summarizes the findings from the Product Context assessment for Clause 6.2 of EN 40000.</p>

<h4>Key Findings</h4>
<ul>
  <li><strong>Input Documentation:</strong> [Describe the status of input documentation review]</li>
  <li><strong>Product Context Requirements:</strong> [Summarize conformance with product context requirements]</li>
  <li><strong>Output Documentation:</strong> [Describe the status of output documentation]</li>
  <li><strong>Assessment Criteria:</strong> [Summarize how assessment criteria were met]</li>
</ul>

<h4>Recommendations</h4>
<p>[List any recommendations for improvement or corrective actions]</p>

<h4>Conclusion</h4>
<p>[Provide overall conclusion based on the assessment results]</p>`

// Insert template into summary editor
function insertSummaryTemplate() {
  // Preserve existing content and append template
  if (summaryOfFindingsHtml.value.trim()) {
    summaryOfFindingsHtml.value = summaryOfFindingsHtml.value + '<br/><br/>' + SUMMARY_TEMPLATE
  } else {
    summaryOfFindingsHtml.value = SUMMARY_TEMPLATE
  }
  saveSummary()
}

// Save summary to workspace
function saveSummary() {
  if (hydrating.value) return
  saveState()
}

// Save all state to workspace
function saveState() {
  if (hydrating.value) return
  
  workspace.updateRiskManagementState({
    productContextAssessment: {
      assessments: assessments.value.map(a => ({ ...a })),
      overallVerdict: overallVerdict.value,
      summaryOfFindingsHtml: summaryOfFindingsHtml.value,
      nonConformities: nonConformities.value.map(nc => ({ ...nc })),
    },
  })
}

// Save assessments to workspace (legacy function name for compatibility)
function saveAssessments() {
  saveState()
}

// Hydrate state from workspace
function hydrate(state: DocumentWorkspaceState) {
  hydrating.value = true
  const assessment = state.riskManagement?.productContextAssessment
  if (assessment?.assessments) {
    assessments.value = assessment.assessments.map(a => ({ ...a }))
  } else {
    assessments.value = []
  }
  // Hydrate overall verdict
  overallVerdict.value = assessment?.overallVerdict || 'not_assessed'
  // Hydrate summary of findings
  summaryOfFindingsHtml.value = assessment?.summaryOfFindingsHtml || ''
  // Hydrate non-conformities
  if (assessment?.nonConformities) {
    nonConformities.value = assessment.nonConformities.map(nc => ({ ...nc }))
  } else {
    nonConformities.value = []
  }
  hydrating.value = false
}

// Watch for summary content changes and persist
watch(summaryOfFindingsHtml, () => {
  if (!hydrating.value) {
    saveSummary()
  }
})

onMounted(() => {
  hydrate(workspaceState.value)
  unsubscribe = workspace.subscribeDocumentWorkspace((state) => {
    workspaceState.value = state
    hydrate(state)
  })
})

onUnmounted(() => {
  unsubscribe?.()
})
</script>
