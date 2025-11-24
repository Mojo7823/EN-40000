<template>
  <div class="container mx-auto p-6 space-y-6">
    <UCard class="bg-gradient-to-r from-primary-50 to-white dark:from-primary-950 dark:to-gray-900">
      <div class="flex flex-wrap justify-between items-start gap-4">
        <div>
          <p class="text-xs uppercase tracking-wide text-primary-600 dark:text-primary-300 font-semibold">
            Document Management
          </p>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            Document Preview
          </h1>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Preview the generated document and download the DOCX file. Make sure to update the Cover and Introduction before rendering.
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Last updated: {{ lastUpdatedLabel }}
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <UButton
            variant="ghost"
            color="gray"
            to="/document/load-save"
            icon="i-heroicons-arrow-down-tray"
          >
            Load/Save
          </UButton>
          <UButton
            :disabled="!generatedFiles.length"
            color="primary"
            variant="soft"
            icon="i-heroicons-arrow-down-tray"
            @click="downloadLatest"
          >
            Download Latest
          </UButton>
          <UButton
            color="primary"
            :loading="loading"
            :disabled="allMissing"
            icon="i-heroicons-document-arrow-down"
            @click="generateFullDocument"
          >
            Generate DOCX
          </UButton>
        </div>
      </div>
      <div class="mt-3 space-y-1">
        <p v-if="error" class="text-sm text-red-600">
          {{ error }}
        </p>
        <p v-else-if="success" class="text-sm text-green-600">
          {{ success }}
        </p>
      </div>
    </UCard>

    <div class="space-y-6">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Status</p>
              <h3 class="text-lg font-semibold">Sections</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Follow the sections in order before previewing.</p>
            </div>
            <UBadge color="gray" variant="subtle">{{ completionPercentage }}% complete</UBadge>
          </div>
        </template>

        <UAccordion
          type="multiple"
          :items="accordionItems"
          :unmount-on-hide="false"
          :ui="{
            item: 'border border-gray-200 dark:border-gray-800 rounded-lg mb-3 overflow-hidden',
            header: 'px-3',
            trigger: 'w-full px-1 py-3 flex items-center',
            body: 'px-1 pb-4',
            content: 'px-2'
          }"
        >
          <template #default="{ item }">
            <div class="flex items-start justify-between w-full gap-3">
              <div class="min-w-0">
                <p class="font-semibold leading-tight">{{ item.title }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ item.description }}</p>
              </div>
              <UBadge
                class="shrink-0 whitespace-nowrap self-start"
                :color="getGroupStatusColor(item.state)"
                variant="subtle"
              >
                {{ item.stateLabel }}
              </UBadge>
            </div>
          </template>

          <template #content="{ item }">
            <div class="space-y-2">
              <div
                v-for="section in item.items"
                :key="section.key"
                class="relative p-3 rounded-lg border transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                :class="getSectionBorderColor(section)"
                role="link"
                tabindex="0"
                @click="navigateTo(section.to)"
                @keydown.enter="navigateTo(section.to)"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0 space-y-1 pr-16">
                    <p class="font-semibold leading-tight">{{ section.title }}</p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      {{ section.description }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      {{ section.summary }}
                    </p>
                  </div>
                  <UBadge
                    class="absolute top-3 right-3 shrink-0 whitespace-nowrap"
                    :color="getStatusColor(section.status)"
                    variant="soft"
                  >
                    {{ getStatusLabel(section.status) }}
                  </UBadge>
                </div>
              </div>
            </div>
          </template>
        </UAccordion>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Preview</p>
              <h3 class="text-lg font-semibold">Document Preview</h3>
            </div>
            <div class="flex gap-2 flex-wrap items-center">
              <!-- Zoom Controls -->
              <div v-if="hasGeneratedDocx" class="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <UButton
                  size="xs"
                  variant="ghost"
                  color="gray"
                  icon="i-heroicons-minus"
                  :disabled="zoomLevel <= 50"
                  @click="zoomOut"
                  title="Zoom Out"
                />
                <span class="text-xs font-medium min-w-[45px] text-center">{{ zoomLevel }}%</span>
                <UButton
                  size="xs"
                  variant="ghost"
                  color="gray"
                  icon="i-heroicons-plus"
                  :disabled="zoomLevel >= 200"
                  @click="zoomIn"
                  title="Zoom In"
                />
                <UButton
                  size="xs"
                  variant="ghost"
                  color="gray"
                  icon="i-heroicons-arrow-path"
                  @click="resetZoom"
                  title="Reset Zoom"
                />
              </div>

              <!-- Page Navigation -->
              <div v-if="hasGeneratedDocx && totalPages > 1" class="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <UButton
                  size="xs"
                  variant="ghost"
                  color="gray"
                  icon="i-heroicons-chevron-left"
                  :disabled="currentPage <= 1"
                  @click="previousPage"
                  title="Previous Page"
                />
                <span class="text-xs font-medium min-w-[60px] text-center">{{ currentPage }} / {{ totalPages }}</span>
                <UButton
                  size="xs"
                  variant="ghost"
                  color="gray"
                  icon="i-heroicons-chevron-right"
                  :disabled="currentPage >= totalPages"
                  @click="nextPage"
                  title="Next Page"
                />
              </div>

              <UButton
                variant="ghost"
                color="gray"
                icon="i-heroicons-arrow-path"
                @click="buildFullPreview"
              >
                Refresh Preview
              </UButton>
              <UButton
                color="primary"
                icon="i-heroicons-eye"
                :disabled="allMissing"
                @click="buildFullPreview"
              >
                Preview All
              </UButton>
            </div>
          </div>
        </template>

        <!-- DOCX Preview -->
        <div class="relative min-h-[520px] max-h-[75vh] border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 p-3 overflow-auto" ref="previewShell">
          <div v-if="docxLoading" class="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-10">
            <div class="text-center">
              <div class="text-sm font-medium text-gray-700 dark:text-gray-300">Rendering DOCX...</div>
            </div>
          </div>
          <div v-else-if="docxError" class="flex items-center justify-center min-h-[400px]">
            <div class="text-center text-red-600">
              <p class="font-medium">Error rendering DOCX</p>
              <p class="text-sm mt-1">{{ docxError }}</p>
            </div>
          </div>
          <div v-else-if="!hasGeneratedDocx" class="flex items-center justify-center min-h-[400px]">
            <div class="text-center text-gray-500">
              <p class="font-medium">No DOCX preview available</p>
              <p class="text-sm mt-1">Generate a document to see the DOCX preview</p>
            </div>
          </div>
          <div
            ref="docxPreviewContainer"
            class="docx-preview-container"
            :class="{ 'hidden': docxLoading || !!docxError || !hasGeneratedDocx }"
            :style="{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }"
          ></div>
        </div>
      </UCard>

      <UCard v-if="generatedFiles.length">
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Generated</p>
              <h3 class="text-lg font-semibold">Documents</h3>
            </div>
            <UBadge color="gray" variant="subtle">{{ generatedFiles.length }} file(s)</UBadge>
          </div>
        </template>

        <div class="space-y-2">
          <div 
            v-for="file in generatedFiles" 
            :key="file.filename"
            class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <div class="flex items-center gap-3">
              <div class="text-3xl">📄</div>
              <div>
                <div class="font-medium text-sm">{{ file.filename }}</div>
                <div class="text-xs text-gray-500">Generated {{ file.timestamp }}</div>
              </div>
            </div>
            <div class="flex gap-2">
              <UButton 
                @click="downloadFile(file)"
                size="sm"
                color="primary"
                icon="i-heroicons-arrow-down-tray"
              >
                Download
              </UButton>
            </div>
          </div>
        </div>
      </UCard>

      <div v-else class="text-center py-10 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
        <div class="text-4xl mb-3">📄</div>
        <p class="text-base font-medium text-gray-800 dark:text-gray-200">No documents generated yet</p>
        <p class="text-sm mt-1 text-gray-500">Fill out the sections and click Generate to create documents</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { renderAsync } from 'docx-preview'
import { sessionService } from '~/services/sessionService'
import { dataUrlToFile } from '~/utils/dataUrl'
import { CONFORMANCE_LEVEL_OPTIONS, REGULATORY_PRIMARY_REFERENCES } from '~/constants/conformance'

const workspaceService = useDocumentWorkspace()
const toast = useToast()

const workspace = ref(workspaceService.loadDocumentWorkspace())
const loading = ref(false)
const error = ref('')
const success = ref('')
const generatedFiles = ref<Array<{ filename: string; path: string; timestamp: string; section?: string }>>([])

// DOCX Preview state
const docxPreviewContainer = ref<HTMLDivElement | null>(null)
const previewShell = ref<HTMLDivElement | null>(null)
const latestDocPath = ref<string | null>(null)
const docxLoading = ref(false)
const docxError = ref('')
const hasGeneratedDocx = ref(false)
const zoomLevel = ref(100)
const currentPage = ref(1)
const totalPages = ref(1)

const DOCX_PAGE_SELECTOR = '.docx-wrapper > section.docx'
type SectionGroup = {
  key: string
  title: string
  description: string
  state: string
  stateLabel: string
  items: Array<ReturnType<typeof createStatus>>
}
const SECTION_GROUP_DEFINITIONS = [
  {
    key: 'cover-intro',
    title: 'Cover & Introduction',
    description: 'Cover metadata, document info, and purpose/scope.',
    children: ['cover', 'document-info', 'purpose-scope', 'product-identification', 'manufacturer-information'],
  },
  {
    key: 'product-overview',
    title: 'Product Overview',
    description: 'Description, architecture, and third-party components.',
    children: ['product-overview-description', 'product-overview-architecture', 'third-party-components'],
  },
  {
    key: 'conformance',
    title: 'Conformance Claim',
    description: 'Standards, regulatory references, and conformance level.',
    children: ['conformance-standards', 'conformance-regulatory', 'conformance-level'],
  },
  {
    key: 'document-convention',
    title: 'Document Convention',
    description: 'Terminology and notation settings.',
    children: ['terminology', 'notation'],
  },
  {
    key: 'evidence-management',
    title: 'Evidence Tracking',
    description: 'Supporting documentation readiness.',
    children: ['evidence-tracker'],
  },
  {
    key: 'risk-management',
    title: 'Risk Management Elements',
    description: 'Clause 6 risk management approach and methodology.',
    children: ['risk-general', 'risk-product-context'],
  },
]
const userId = sessionService.getUserToken()

// Subscribe to workspace changes
let unsubscribe: (() => void) | null = null
const previewScrollHandler = () => updateCurrentPageFromScroll()

onMounted(() => {
  unsubscribe = workspaceService.subscribeDocumentWorkspace((state) => {
    workspace.value = state
  })
})

onUnmounted(() => {
  unsubscribe?.()
  previewShell.value?.removeEventListener('scroll', previewScrollHandler)
})

watch(
  () => previewShell.value,
  (next, previous) => {
    previous?.removeEventListener('scroll', previewScrollHandler)
    next?.addEventListener('scroll', previewScrollHandler, { passive: true })
  }
)

const cover = computed(() => workspace.value.cover)
const introduction = computed(() => workspace.value.introduction)
const purposeScope = computed(() => workspace.value.purposeScope)
const productIdentification = computed(() => workspace.value.productIdentification)
const manufacturerInformation = computed(() => workspace.value.manufacturerInformation)
const productOverview = computed(() => workspace.value.productOverview)
const conformanceClaim = computed(() => workspace.value.conformanceClaim)
const documentConvention = computed(() => workspace.value.documentConvention)
const riskManagement = computed(() => workspace.value.riskManagement)
const productContextState = computed(() => riskManagement.value.productContext)
const evidenceSummary = computed(() => summarizeEvidenceEntries(productContextState.value?.evidenceEntries ?? []))

const sectionList = computed(() => buildSectionStatuses())
const sectionGroups = computed(() => buildSectionGroups(sectionList.value))
const accordionItems = computed(() =>
  sectionGroups.value.map((group) => ({
    ...group,
    label: group.title,
    value: group.key,
  }))
)
const allMissing = computed(() => sectionList.value.every((section) => section.status === 'missing'))

const completionPercentage = computed(() => {
  const totals = sectionList.value.reduce(
    (acc, section) => {
      acc.filled += section.filled ?? 0
      acc.total += section.total ?? 0
      return acc
    },
    { filled: 0, total: 0 }
  )
  return totals.total > 0 ? Math.round((totals.filled / totals.total) * 100) : 0
})

const lastUpdatedLabel = computed(() => {
  const value = workspace.value.lastUpdated
  if (!value) return 'Not set'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
})

function stripHtml(value?: string | null) {
  if (!value) return ''
  if (typeof window === 'undefined') {
    return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  }
  const div = document.createElement('div')
  div.innerHTML = value
  return div.textContent?.trim() ?? ''
}

function normalizeHtml(value?: string | null) {
  if (!value) return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  return stripHtml(trimmed) ? trimmed : undefined
}

function normalizePlainText(value?: string | null) {
  if (!value) return undefined
  const trimmed = value.trim()
  return trimmed.length ? trimmed : undefined
}

function escapeHtml(value?: string | null) {
  if (!value) return ''
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function summarizeRegulatoryEntries(state?: any) {
  if (!state || !Array.isArray(state.additionalRegulations)) return ''
  return state.additionalRegulations
    .map((entry: any) => entry.regulation || entry.description)
    .map((value: string) => value?.trim() ?? '')
    .filter((value: string) => value.length > 0)
    .slice(0, 3)
    .join(', ')
}

function buildRegulatoryHtml(state?: any) {
  const baseList = REGULATORY_PRIMARY_REFERENCES.map((item) => `<li>${escapeHtml(item)}</li>`).join('')
  const otherEntries = (state?.additionalRegulations ?? [])
    .map((entry: any) => {
      const regulation = entry.regulation?.trim() ?? ''
      const description = entry.description?.trim() ?? ''
      if (!regulation && !description) return ''
      const label = regulation ? `<strong>${escapeHtml(regulation)}</strong>` : ''
      const detail = description ? `${regulation ? ' — ' : ''}${escapeHtml(description)}` : ''
      const content = label ? `${label}${detail}` : detail || '—'
      return `<li>${content}</li>`
    })
    .filter(Boolean)
    .join('')
  const otherSection = otherEntries ? `<p>Other Applicable Regulations:</p><ul>${otherEntries}</ul>` : ''

  return `<p>[Reference: Annex C - Relationship with CRA]</p>
<p>This product is intended to conform to the essential cybersecurity requirements of:</p>
<ul>${baseList}</ul>
${otherSection}`
}

function buildConformanceLevelHtml(state?: any) {
  const statuses = state?.statuses ?? []
  const statusLine = CONFORMANCE_LEVEL_OPTIONS.map((option) => {
    const symbol = statuses.includes(option.value) ? '☑' : '☐'
    return `${symbol} ${option.label}`
  }).join(' ')
  const justificationHtml =
    state?.justificationHtml && stripHtml(state.justificationHtml) ? state.justificationHtml : ''
  const justificationBlock =
    justificationHtml || '<p>[Explain which requirements are not met and why]</p>'

  return `<p><strong>Overall Conformance Status:</strong></p>
<p>${statusLine}</p>
<p><strong>Justification for Partial Conformance (if applicable):</strong></p>
${justificationBlock}`
}

function summarizeEvidenceEntries(entries: any[]) {
  if (!entries.length) {
    return { total: 0, completed: 0, state: 'missing' as const }
  }
  const completed = entries.filter((entry) => entry.status === 'complete').length
  const inProgress = entries.filter((entry) => entry.status === 'in_progress').length
  const state =
    completed === entries.length
      ? ('completed' as const)
      : completed > 0 || inProgress > 0
        ? ('partial' as const)
        : ('missing' as const)
  return { total: entries.length, completed, state }
}

function buildRiskManagementPayload(state?: any) {
  if (!state) return undefined
  const generalHtml = normalizeHtml(state.generalApproachHtml)
  const productContext = state.productContext
  const intendedPurposeHtml = normalizeHtml(productContext?.intendedPurposeHtml)
  const specificUsesHtml = normalizeHtml(productContext?.specificIntendedUsesHtml)
  const foreseeableUseHtml = normalizeHtml(productContext?.foreseeableUseHtml)
  const evidenceEntries = normalizeEvidencePayload(productContext?.evidenceEntries)
  const hasProductContext = intendedPurposeHtml || specificUsesHtml || foreseeableUseHtml || evidenceEntries.length

  if (!generalHtml && !hasProductContext) {
    return undefined
  }

  const payload: {
    general_approach_html?: string
    product_context?: Record<string, unknown>
  } = {}

  if (generalHtml) {
    payload.general_approach_html = generalHtml
  }

  if (hasProductContext) {
    payload.product_context = {
      intended_purpose_html: intendedPurposeHtml,
      specific_intended_uses_html: specificUsesHtml,
      foreseeable_use_html: foreseeableUseHtml,
      evidence_entries: evidenceEntries,
    }
  }

  return payload
}

function normalizeEvidencePayload(entries?: any[]) {
  if (!entries) return []
  return entries
    .map((entry) => {
      const reference = normalizePlainText(entry.referenceId)
      const title = normalizePlainText(entry.title)
      const notesHtml = normalizeHtml(entry.descriptionHtml)
      if (!reference && !title && !notesHtml) {
        return null
      }
      return {
        section_key: entry.sectionKey || 'risk-product-context',
        reference_id: reference,
        title,
        status: entry.status,
        notes_html: notesHtml,
      }
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
}

function evaluateCompletion(values: Array<string | undefined | null>) {
  const normalized = values.map((value) => {
    if (typeof value === 'string') {
      return stripHtml(value.trim())
    }
    if (value === null || value === undefined) {
      return ''
    }
    return String(value).trim()
  })
  const total = normalized.length
  const filled = normalized.filter((value) => value.length > 0).length
  if (total === 0 || filled === 0) {
    return { state: 'missing' as const, filled, total }
  }
  if (filled === total) {
    return { state: 'completed' as const, filled, total }
  }
  return { state: 'partial' as const, filled, total }
}

function createStatus(
  key: string,
  title: string,
  description: string,
  values: Array<string | undefined | null>,
  to: string,
  summaryOverride?: string
) {
  const completion = evaluateCompletion(values)
  const status = completion.state === 'completed' ? 'done' : completion.state
  const summary =
    summaryOverride ||
    (completion.total
      ? `${completion.filled} of ${completion.total} fields completed`
      : 'No data yet')
  return {
    key,
    title,
    description,
    status,
    summary,
    to,
    filled: completion.filled,
    total: completion.total,
  }
}

function buildSectionStatuses() {
  const introductionState = introduction.value
  const purposeScopeState = purposeScope.value
  const productIdentificationState = productIdentification.value
  const manufacturerInformationState = manufacturerInformation.value
  const productOverviewState = productOverview.value
  const conformanceClaimState = conformanceClaim.value
  const documentConventionState = documentConvention.value

  return [
    createStatus(
      'cover',
      'Cover',
      'Device metadata, versioning, and lab details.',
      [
        cover.value.deviceName,
        cover.value.deviceDescription,
        cover.value.versionNumber,
        cover.value.labName,
        cover.value.labAddress,
      ],
      '/document/cover'
    ),
    createStatus(
      'document-info',
      'Document Information',
      'Product identification, manufacturer, and responsible parties.',
      [
        introductionState.productName,
        introductionState.productVersion,
        introductionState.productType,
        introductionState.manufacturerName,
        introductionState.manufacturerAddress,
        introductionState.status,
        introductionState.preparedBy,
        introductionState.reviewedBy,
        introductionState.approvedBy,
      ],
      '/document/introduction'
    ),
    createStatus(
      'purpose-scope',
      'Purpose & Scope',
      'Lifecycle phases, assessment period, and methodology.',
      [
        purposeScopeState.scopeSelections.length > 0 ? 'yes' : '',
        purposeScopeState.assessmentStart,
        purposeScopeState.assessmentEnd,
        stripHtml(purposeScopeState.methodologyHtml),
      ],
      '/document/purpose-scope'
    ),
    createStatus(
      'product-identification',
      'Product Identification',
      'Product description, key functions, and target market.',
      [
        introductionState.productName,
        introductionState.productVersion,
        introductionState.productType,
        stripHtml(productIdentificationState.productDescriptionHtml),
        stripHtml(productIdentificationState.keyFunctionsHtml),
        productIdentificationState.targetMarket,
      ],
      '/document/product-identification'
    ),
    createStatus(
      'manufacturer-information',
      'Manufacturer Information',
      'Legal entity details and primary contact information.',
      [
        manufacturerInformationState.legalEntity,
        manufacturerInformationState.registrationNumber,
        manufacturerInformationState.address,
        manufacturerInformationState.contactPerson,
        manufacturerInformationState.phone,
      ],
      '/document/manufacturer-information'
    ),
    createStatus(
      'product-overview-description',
      'Product Description',
      'Narrative covering physical, software, and data-processing characteristics.',
      [stripHtml(productOverviewState.productDescriptionHtml)],
      '/product-overview/description'
    ),
    createStatus(
      'product-overview-architecture',
      'Product Architecture Overview',
      'High-level components, interfaces, and remote services.',
      [stripHtml(productOverviewState.productArchitectureHtml)],
      '/product-overview/architecture'
    ),
    createStatus(
      'third-party-components',
      'Third-Party Components',
      'Component inventory, management approach, and evidence.',
      [
        productOverviewState.thirdPartyComponents.entries.length ? 'entries' : '',
        stripHtml(productOverviewState.thirdPartyComponents.managementApproachHtml),
        stripHtml(productOverviewState.thirdPartyComponents.evidenceReferenceHtml),
      ],
      '/product-overview/third-party-components'
    ),
    createStatus(
      'conformance-standards',
      'Standards Conformance',
      'Primary standard plus related standards applied.',
      [
        [
          conformanceClaimState.standardsConformance.primaryStandard.code,
          conformanceClaimState.standardsConformance.primaryStandard.description,
        ]
          .filter((value) => !!value && value.trim().length)
          .join(' '),
        conformanceClaimState.standardsConformance.relatedStandards.length
          ? 'related'
          : conformanceClaimState.standardsConformance.includeOther &&
              conformanceClaimState.standardsConformance.otherNotes
            ? conformanceClaimState.standardsConformance.otherNotes
            : '',
      ],
      '/conformance/standards'
    ),
    createStatus(
      'conformance-regulatory',
      'Regulatory Conformance',
      'CRA clauses plus other applicable regulations.',
      [summarizeRegulatoryEntries(conformanceClaimState.regulatoryConformance)],
      '/conformance/regulatory'
    ),
    createStatus(
      'conformance-level',
      'Conformance Level',
      'Claimed assurance tier and supporting evidence.',
      [
        conformanceClaimState.conformanceLevel.statuses.length ? 'status' : '',
        stripHtml(conformanceClaimState.conformanceLevel.justificationHtml),
      ],
      '/conformance/level',
      conformanceClaimState.conformanceLevel.statuses.length
        ? `Status: ${conformanceClaimState.conformanceLevel.statuses.join(', ')}`
        : 'No conformance level declared'
    ),
    createStatus(
      'terminology',
      'Terminology',
      'Terms and definitions used throughout the document.',
      [
        documentConventionState.terminologyEntries.length
          ? String(documentConventionState.terminologyEntries.length)
          : '',
      ],
      '/convention/terminology'
    ),
    createStatus(
      'notation',
      'Notation',
      'Evidence, requirement, and assessment verdict guidance.',
      [
        stripHtml(documentConventionState.evidenceNotationHtml),
        stripHtml(documentConventionState.requirementNotationHtml),
        stripHtml(documentConventionState.assessmentVerdictsHtml),
      ],
      '/convention/notation'
    ),
    createStatus(
      'risk-general',
      'General Approach to Risk Management',
      'Lifecycle risk management narrative and references.',
      [stripHtml(riskManagement.value.generalApproachHtml)],
      '/risk/general-approach'
    ),
    createStatus(
      'risk-product-context',
      'Product Context (Section 5.2)',
      'Intended purpose, foreseeable use, and supporting evidence.',
      [
        stripHtml(productContextState.value?.intendedPurposeHtml || ''),
        stripHtml(productContextState.value?.specificIntendedUsesHtml || ''),
        stripHtml(productContextState.value?.foreseeableUseHtml || ''),
        evidenceSummary.value.total
          ? evidenceSummary.value.state === 'completed'
            ? 'complete'
            : evidenceSummary.value.state === 'partial'
              ? 'progress'
              : ''
          : '',
      ],
      '/pcontext/intended-purpose',
      evidenceSummary.value.total
        ? `${evidenceSummary.value.completed}/${evidenceSummary.value.total} evidence items ready`
        : 'No evidence captured yet'
    ),
    createStatus(
      'evidence-tracker',
      'Evidence List',
      'Central record of supporting documentation.',
      [
        evidenceSummary.value.total ? String(evidenceSummary.value.total) : '',
        evidenceSummary.value.state === 'completed'
          ? 'complete'
          : evidenceSummary.value.state === 'partial'
            ? 'progress'
            : '',
      ],
      '/document/evidence',
      evidenceSummary.value.total
        ? `${evidenceSummary.value.total} evidence items (${evidenceSummary.value.state})`
        : 'No evidence items added'
    ),
  ]
}

function buildSectionGroups(statuses: Array<ReturnType<typeof createStatus>>): SectionGroup[] {
  return SECTION_GROUP_DEFINITIONS.map((definition) => {
    const items = definition.children
      .map((childKey) => statuses.find((status) => status.key === childKey))
      .filter((item): item is ReturnType<typeof createStatus> => Boolean(item))
    if (!items.length) {
      return null
    }
    const totals = items.reduce(
      (acc, item) => {
        if (item.status === 'done' || item.status === 'completed') acc.done += 1
        else if (item.status === 'partial') acc.partial += 1
        else acc.missing += 1
        return acc
      },
      { done: 0, partial: 0, missing: 0 }
    )
    const state = totals.done === items.length ? 'done' : totals.done > 0 || totals.partial > 0 ? 'partial' : 'missing'
    const stateLabel = state === 'done' ? 'Completed' : state === 'partial' ? 'Partial' : 'Missing'
    return {
      key: definition.key,
      title: definition.title,
      description: definition.description,
      state,
      stateLabel,
      items,
    }
  }).filter((group): group is SectionGroup => Boolean(group))
}

// Get status color for badges
function getStatusColor(status: string): string {
  switch (status) {
    case 'done':
    case 'completed':
      return 'green'
    case 'partial': return 'orange'
    case 'missing': return 'red'
    default: return 'gray'
  }
}

// Get border color for section cards
function getSectionBorderColor(section: any): string {
  switch (section.status) {
    case 'done':
    case 'completed':
      return 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950'
    case 'partial': return 'border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-950'
    case 'missing': return 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950'
    default: return 'border-gray-300 dark:border-gray-700'
  }
}

function getGroupStatusColor(state: string): string {
  switch (state) {
    case 'done':
    case 'completed':
      return 'green'
    case 'partial': return 'orange'
    case 'missing': return 'red'
    default: return 'gray'
  }
}

function getStatusLabel(status: string): string {
  if (status === 'done' || status === 'completed') return 'Completed'
  if (status === 'partial') return 'Partial'
  return 'Missing'
}

function buildFullPreview() {
  if (!latestDocPath.value) {
    toast.add({
      title: 'No Document Yet',
      description: 'Generate a DOCX first to preview.',
      color: 'orange',
      icon: 'i-heroicons-exclamation-triangle'
    })
    return
  }

  hasGeneratedDocx.value = false
  renderDocxPreview(latestDocPath.value)
}

// DOCX Preview functions
function zoomIn() {
  if (zoomLevel.value < 200) {
    zoomLevel.value = Math.min(200, zoomLevel.value + 25)
  }
}

function zoomOut() {
  if (zoomLevel.value > 50) {
    zoomLevel.value = Math.max(50, zoomLevel.value - 25)
  }
}

function resetZoom() {
  zoomLevel.value = 100
}

function nextPage() {
  if (!hasGeneratedDocx.value) return
  const next = Math.min(totalPages.value, currentPage.value + 1)
  if (next !== currentPage.value) {
    scrollToPage(next)
  }
}

function previousPage() {
  if (!hasGeneratedDocx.value) return
  const previous = Math.max(1, currentPage.value - 1)
  if (previous !== currentPage.value) {
    scrollToPage(previous)
  }
}

function scrollToPage(pageNumber: number) {
  const pages = getRenderedPages()
  if (!pages.length) return
  const target = pages[pageNumber - 1]
  const shell = previewShell.value
  if (target && shell) {
    const sectionTop = target.offsetTop
    shell.scrollTo({
      top: sectionTop - 32,
      behavior: 'smooth'
    })
    currentPage.value = pageNumber
    highlightActivePage(pageNumber)
  }
}

async function renderDocxPreview(path: string) {
  docxLoading.value = true
  docxError.value = ''

  try {
    const buffer = await $fetch(`http://localhost:8000${path}`, {
      responseType: 'arrayBuffer'
    })

    if (docxPreviewContainer.value) {
      docxPreviewContainer.value.innerHTML = ''
      await renderAsync(buffer as ArrayBuffer, docxPreviewContainer.value, undefined, {
        inWrapper: true,
        ignoreWidth: false,
        ignoreHeight: false,
        renderHeaders: true,
        renderFooters: true,
        renderFootnotes: true,
        renderEndnotes: true
      })
      hasGeneratedDocx.value = true
      requestAnimationFrame(() => {
        annotateRenderedPages()
      })
    }
  } catch (e: any) {
    console.error('DOCX rendering error:', e)
    docxError.value = 'Failed to render DOCX preview. Please ensure the backend is running.'
  } finally {
    docxLoading.value = false
  }
}

async function generateFullDocument() {
  loading.value = true
  error.value = ''
  success.value = ''

  try {
    workspace.value = workspaceService.loadDocumentWorkspace()
    const productTitle = introduction.value.productName?.trim() || cover.value.deviceName?.trim() || ''

    if (!productTitle) {
      error.value =
        'Please provide a Product Name on the Introduction page (or a Device Name on the Cover page) before generating the preview.'
      toast.add({
        title: 'Missing Product Name',
        description: error.value,
        color: 'orange',
        icon: 'i-heroicons-exclamation-triangle'
      })
      return
    }

    const imagePath = await uploadCoverImageIfNeeded()
    const payload = buildCoverPreviewPayload(imagePath)

    const response = await $fetch('http://localhost:8000/api/cover/preview', {
      method: 'POST',
      body: payload
    })

    if (response.status === 'ready') {
      const docPath = `/api${response.path}`
      generatedFiles.value.unshift({
        filename: `CRA_Document_${response.filename}`,
        path: docPath,
        timestamp: new Date().toLocaleString(),
        section: 'full'
      })
      
      latestDocPath.value = docPath
      hasGeneratedDocx.value = false
      await renderDocxPreview(docPath)
      
      success.value = 'Full document generated successfully!'
      
      toast.add({
        title: 'Document Generated',
        description: 'Full CRA document has been generated successfully.',
        color: 'green',
        icon: 'i-heroicons-check-circle'
      })
      
      setTimeout(() => success.value = '', 3000)
    } else {
      throw new Error('Preview service returned an unexpected response')
    }
  } catch (e: any) {
    const detail = e?.data?.detail
    error.value = detail ? `Error: ${detail}` : `Error: ${e.message || 'Failed to generate full document'}`
    toast.add({
      title: 'Generation Failed',
      description: error.value,
      color: 'red',
      icon: 'i-heroicons-x-circle'
    })
  } finally {
    loading.value = false
  }
}

function downloadLatest() {
  if (!generatedFiles.value.length) return
  downloadFile(generatedFiles.value[0])
}

async function downloadFile(file: any) {
  try {
    const downloadUrl = `http://localhost:8000${file.path}`
    window.open(downloadUrl, '_blank')
    success.value = 'Download started!'
    
    toast.add({
      title: 'Download Started',
      description: `Downloading ${file.filename}`,
      color: 'green',
      icon: 'i-heroicons-arrow-down-tray'
    })
    
    setTimeout(() => success.value = '', 2000)
  } catch (e: any) {
    error.value = `Download failed: ${e.message}`
    toast.add({
      title: 'Download Failed',
      description: error.value,
      color: 'red',
      icon: 'i-heroicons-x-circle'
    })
  }
}

function getRenderedPages(): HTMLElement[] {
  const nodes = docxPreviewContainer.value?.querySelectorAll<HTMLElement>('.docx-rendered-page')
  return nodes ? Array.from(nodes) : []
}

function annotateRenderedPages() {
  if (!docxPreviewContainer.value) {
    totalPages.value = 1
    currentPage.value = 1
    return
  }
  const rawPages = docxPreviewContainer.value.querySelectorAll<HTMLElement>(DOCX_PAGE_SELECTOR)
  const pages = Array.from(rawPages)
  if (!pages.length) {
    totalPages.value = 1
    currentPage.value = 1
    return
  }
  pages.forEach((page, index) => {
    page.classList.add('docx-rendered-page')
    page.setAttribute('data-page-label', `Page ${index + 1} / ${pages.length}`)
    page.setAttribute('data-page-number', String(index + 1))
  })
  totalPages.value = pages.length
  currentPage.value = 1
  previewShell.value?.scrollTo({ top: 0 })
  highlightActivePage(1)
  previewScrollHandler()
}

function highlightActivePage(pageNumber: number) {
  const pages = getRenderedPages()
  pages.forEach((page, index) => {
    if (index === pageNumber - 1) {
      page.classList.add('is-active')
    } else {
      page.classList.remove('is-active')
    }
  })
}

function updateCurrentPageFromScroll() {
  const shell = previewShell.value
  if (!shell) return
  const pages = getRenderedPages()
  if (!pages.length) return
  const midpoint = shell.scrollTop + shell.clientHeight / 2
  let activePage = 1
  pages.forEach((page, index) => {
    if (midpoint >= page.offsetTop) {
      activePage = index + 1
    }
  })
  if (activePage !== currentPage.value) {
    currentPage.value = activePage
    highlightActivePage(activePage)
  }
}

async function uploadCoverImageIfNeeded(force = false) {
  const currentCover = cover.value
  if (!currentCover.imageData) {
    return sanitizeImagePath(currentCover.imagePath)
  }
  if (!force && currentCover.imagePath) {
    return sanitizeImagePath(currentCover.imagePath)
  }

  const file = dataUrlToFile(currentCover.imageData, 'cover-image')
  if (!file) {
    return sanitizeImagePath(currentCover.imagePath)
  }

  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await $fetch('http://localhost:8000/api/cover/upload', {
      method: 'POST',
      body: formData,
      params: { user_id: userId }
    })
    const newPath: string | null = (response as any)?.path ?? null
    if (newPath) {
      workspace.value = workspaceService.updateCoverState({ imagePath: newPath })
    }
    return sanitizeImagePath(newPath) ?? undefined
  } catch (uploadError) {
    console.error('Cover upload failed', uploadError)
    return sanitizeImagePath(currentCover.imagePath)
  }
}

function buildCoverPreviewPayload(imagePath?: string | null) {
  const productTitle = introduction.value.productName?.trim() || cover.value.deviceName?.trim() || 'CRA Documentation'
  const normalize = normalizePlainText
  const standardsState = conformanceClaim.value.standardsConformance
  const introductionPayload = {
    product_name: normalize(introduction.value.productName),
    product_version: normalize(introduction.value.productVersion),
    product_type: normalize(introduction.value.productType),
    manufacturer: normalize(introduction.value.manufacturerName),
    manufacturer_address: normalize(introduction.value.manufacturerAddress),
    status: normalize(introduction.value.status),
    prepared_by: normalize(introduction.value.preparedBy),
    reviewed_by: normalize(introduction.value.reviewedBy),
    approved_by: normalize(introduction.value.approvedBy),
  }

  const methodologyHtml = purposeScope.value.methodologyHtml?.trim()
  const purposeScopePayload = {
    product_name: productTitle,
    scope_selections: [...purposeScope.value.scopeSelections],
    assessment_start: normalize(purposeScope.value.assessmentStart),
    assessment_end: normalize(purposeScope.value.assessmentEnd),
    methodology_html: methodologyHtml && stripHtml(methodologyHtml) ? methodologyHtml : undefined,
  }

  const productIdentificationPayload = {
    product_description_html: normalizeHtml(productIdentification.value.productDescriptionHtml),
    key_functions_html: normalizeHtml(productIdentification.value.keyFunctionsHtml),
    target_market: normalize(productIdentification.value.targetMarket),
  }

  const thirdPartyState = productOverview.value.thirdPartyComponents
  const thirdPartyComponentsPayload = {
    entries: thirdPartyState.entries
      .map((entry) => ({
        component_name: normalize(entry.componentName),
        component_type: normalize(entry.componentType),
        version: normalize(entry.version),
        supplier: normalize(entry.supplier),
        purpose: normalize(entry.purpose),
        license: normalize(entry.license),
      }))
      .filter((entry) => Object.values(entry).some((value) => !!value)),
    management_approach_html: normalizeHtml(thirdPartyState.managementApproachHtml),
    evidence_reference_html: normalizeHtml(thirdPartyState.evidenceReferenceHtml),
  }

  const productOverviewPayload = {
    product_description_html: normalizeHtml(productOverview.value.productDescriptionHtml),
    product_architecture_html: normalizeHtml(productOverview.value.productArchitectureHtml),
    third_party_components: thirdPartyComponentsPayload,
  }

  const manufacturerInformationPayload = {
    legal_entity: normalize(manufacturerInformation.value.legalEntity),
    registration_number: normalize(manufacturerInformation.value.registrationNumber),
    address: normalize(manufacturerInformation.value.address),
    contact_person: normalize(manufacturerInformation.value.contactPerson),
    phone: normalize(manufacturerInformation.value.phone),
  }

  const normalizeStandardEntry = (
    entry?: { code?: string | null; description?: string | null } | null
  ) => {
    if (!entry) return undefined
    const codeValue = normalize(entry.code)
    const descriptionValue = normalize(entry.description)
    if (!codeValue && !descriptionValue) {
      return undefined
    }
    return {
      ...(codeValue ? { code: codeValue } : {}),
      ...(descriptionValue ? { description: descriptionValue } : {}),
    }
  }

  const normalizedPrimaryStandard = normalizeStandardEntry(standardsState.primaryStandard)
  const normalizedRelatedStandards = standardsState.relatedStandards
    .map((entry) => normalizeStandardEntry(entry))
    .filter((entry): entry is { code?: string; description?: string } => !!entry)
  const normalizedOtherNotes = normalize(standardsState.otherNotes)
  const includeOtherFlag = Boolean(standardsState.includeOther && normalizedOtherNotes)
  const standardsConformancePayload =
    normalizedPrimaryStandard || normalizedRelatedStandards.length || includeOtherFlag
      ? {
          ...(normalizedPrimaryStandard ? { primary_standard: normalizedPrimaryStandard } : {}),
          related_standards: normalizedRelatedStandards,
          include_other: includeOtherFlag,
          other_notes: includeOtherFlag ? normalizedOtherNotes : undefined,
        }
      : undefined

  const regulatoryState = conformanceClaim.value.regulatoryConformance
  const regulatoryHtml = normalizeHtml(buildRegulatoryHtml(regulatoryState))
  const conformanceLevelHtml = normalizeHtml(buildConformanceLevelHtml(conformanceClaim.value.conformanceLevel))
  const conformanceClaimPayload =
    standardsConformancePayload || regulatoryHtml || conformanceLevelHtml
      ? {
          standards_conformance: standardsConformancePayload,
          regulatory_conformance_html: regulatoryHtml,
          conformance_level_html: conformanceLevelHtml,
        }
      : undefined

  const documentConventionPayload = {
    terminology_entries: documentConvention.value.terminologyEntries
      .map((entry) => ({
        term: normalize(entry.term),
        definition: normalize(entry.definition),
        reference: normalize(entry.reference),
      }))
      .filter((entry) => entry.term || entry.definition || entry.reference),
    evidence_notation_html: normalizeHtml(documentConvention.value.evidenceNotationHtml),
    requirement_notation_html: normalizeHtml(documentConvention.value.requirementNotationHtml),
    assessment_verdicts_html: normalizeHtml(documentConvention.value.assessmentVerdictsHtml),
  }

  const riskManagementSection = buildRiskManagementPayload(riskManagement.value)

  const manufacturerBlock = [normalize(cover.value.labName), normalize(cover.value.labAddress)]
    .filter(Boolean)
    .join('\n')
  const safeImagePath = sanitizeImagePath(imagePath ?? cover.value.imagePath)

  const payload: Record<string, unknown> = {
    user_id: userId,
    title: productTitle,
    description: cover.value.deviceDescription,
    version: cover.value.versionNumber,
    revision: cover.value.revisionDate,
    manufacturer: manufacturerBlock || undefined,
    date: cover.value.revisionDate,
    image_path: safeImagePath,
    introduction: introductionPayload,
    purpose_scope: purposeScopePayload,
    product_identification: productIdentificationPayload,
    product_overview: productOverviewPayload,
    manufacturer_information: manufacturerInformationPayload,
    conformance_claim: conformanceClaimPayload,
    document_convention: documentConventionPayload,
  }

  if (riskManagementSection) {
    ;(payload as any).risk_management = riskManagementSection
  }

  return payload
}

function sanitizeImagePath(path?: string | null) {
  if (!path) return undefined
  const expectedPrefix = `/cover/uploads/${userId}/`
  if (!path.startsWith(expectedPrefix)) {
    return undefined
  }
  return path
}
</script>

<style scoped>
.docx-preview-container {
  min-height: 600px;
}

.docx-preview-container :deep(.docx-wrapper) {
  background: linear-gradient(45deg, rgba(0, 0, 0, 0.05) 25%, transparent 25%),
    linear-gradient(-45deg, rgba(0, 0, 0, 0.05) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, rgba(0, 0, 0, 0.05) 75%),
    linear-gradient(-45deg, transparent 75%, rgba(0, 0, 0, 0.05) 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0;
  padding: 40px 40px 72px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  gap: 40px;
}

.docx-preview-container :deep(.docx) {
  position: relative;
  background: #ffffff !important;
  margin: 0 auto;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 12px;
  box-sizing: border-box;
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.18), 0 10px 25px rgba(15, 23, 42, 0.12);
  color: #000000 !important;
}

.docx-preview-container :deep(.docx)::after {
  content: attr(data-page-label);
  position: absolute;
  bottom: -32px;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 12px;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: #4b5563;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 999px;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.18);
  pointer-events: none;
  text-transform: uppercase;
}

.docx-preview-container :deep(.docx-rendered-page.is-active) {
  border-color: #2563eb;
  box-shadow: 0 28px 60px rgba(15, 23, 42, 0.25), 0 16px 32px rgba(59, 130, 246, 0.2);
}
</style>
