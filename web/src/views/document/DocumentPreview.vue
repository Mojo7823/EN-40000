<template>
  <div class="document-preview-page">
    <section class="card hero-card">
      <div class="hero-text">
        <p class="eyebrow">Document Management</p>
        <h1>Document Preview</h1>
        <p class="muted">
          Preview the generated document cover and download the DOCX file. Make sure to update the Cover page
          information before rendering.
        </p>
      </div>
      <div class="hero-actions">
        <button class="btn" type="button" :disabled="!latestDocPath || downloading" @click="downloadDocx">
          {{ downloading ? 'Preparing…' : 'Download DOCX' }}
        </button>
        <button class="btn primary" type="button" :disabled="previewLoading" @click="generatePreview">
          {{ previewLoading ? 'Generating…' : 'Generate Preview' }}
        </button>
      </div>
    </section>

    <section class="card status-card">
      <header>
        <div>
          <h2>Section Status</h2>
          <p class="muted">Expand a section to jump into the related document pages.</p>
        </div>
      </header>
      <ul class="status-accordion">
        <li
          v-for="group in statusGroups"
          :key="group.key"
          class="status-accordion-item"
          :class="{ expanded: expandedGroupKey === group.key }"
        >
          <button class="status-trigger" type="button" @click="toggleGroup(group.key)">
            <div class="status-trigger-main">
              <p class="status-title">{{ group.title }}</p>
              <p class="status-hint">{{ group.description }}</p>
            </div>
            <span :class="['status-pill', group.state]">{{ group.label }}</span>
            <span class="status-chevron" :class="{ rotated: expandedGroupKey === group.key }">⌄</span>
          </button>
          <div v-if="expandedGroupKey === group.key" class="status-panel">
            <ul class="status-page-list">
              <li v-for="item in group.items" :key="item.key">
                <RouterLink class="status-page-link" :to="item.to">
                  <div>
                    <p class="status-subtitle">{{ item.title }}</p>
                    <p class="status-subhint">{{ item.hint }}</p>
                  </div>
                  <span :class="['status-pill', item.state]">{{ item.label }}</span>
                </RouterLink>
              </li>
            </ul>
          </div>
        </li>
      </ul>
    </section>

    <section class="card preview-card">
      <header class="result-header">
        <div>
          <h2>DOCX Preview</h2>
        </div>
        <div v-if="hasGeneratedDocx && !previewLoading" class="preview-controls">
          <div class="zoom-controls">
            <button class="btn-icon" @click="zoomOut" :disabled="zoomLevel <= 50" title="Zoom Out">
              <span>−</span>
            </button>
            <span class="zoom-level">{{ zoomLevel }}%</span>
            <button class="btn-icon" @click="zoomIn" :disabled="zoomLevel >= 200" title="Zoom In">
              <span>+</span>
            </button>
            <button class="btn-icon" @click="resetZoom" title="Reset Zoom">
              <span>⟲</span>
            </button>
          </div>
          <div v-if="totalPages > 1" class="page-navigation">
            <button class="btn-icon" @click="previousPage" :disabled="currentPage <= 1" title="Previous Page">
              <span>‹</span>
            </button>
            <span class="page-info">Page {{ currentPage }} / {{ totalPages }}</span>
            <button class="btn-icon" @click="nextPage" :disabled="currentPage >= totalPages" title="Next Page">
              <span>›</span>
            </button>
          </div>
        </div>
      </header>
      <div class="docx-preview-shell">
        <div v-if="previewLoading" class="modal-status overlay">Rendering…</div>
        <p v-else-if="previewError" class="modal-error">{{ previewError }}</p>
        <div class="docx-preview-viewport" ref="previewShell">
          <div
            ref="docxPreviewContainer"
            class="docx-preview-container"
            :class="{ hidden: previewLoading || !!previewError || !hasGeneratedDocx }"
            :style="{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }"
          ></div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { renderAsync } from 'docx-preview'
import api from '../../services/api'
import { sessionService } from '../../services/sessionService'
import {
  loadDocumentWorkspace,
  subscribeDocumentWorkspace,
  updateCoverState,
  type DocumentWorkspaceState,
  type RegulatoryConformanceState,
  type RiskEvidenceEntry,
  type RiskManagementState,
} from '../../services/documentWorkspace'
import { dataUrlToFile } from '../../utils/dataUrl'
import { CONFORMANCE_LEVEL_OPTIONS, REGULATORY_PRIMARY_REFERENCES } from '../../constants/conformance'
import type { ConformanceLevelState } from '../../types/conformance'

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

const STATUS_GROUP_DEFINITIONS = [
  {
    key: 'cover-intro',
    title: 'Cover & Introduction',
    description: 'Cover metadata, document information, and purpose/scope.',
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

const workspaceState = ref<DocumentWorkspaceState>(loadDocumentWorkspace())
const cover = computed(() => workspaceState.value.cover)
const introduction = computed(() => workspaceState.value.introduction)
const purposeScope = computed(() => workspaceState.value.purposeScope)
const productIdentification = computed(() => workspaceState.value.productIdentification)
const manufacturerInformation = computed(() => workspaceState.value.manufacturerInformation)
const productOverview = computed(() => workspaceState.value.productOverview)
const conformanceClaim = computed(() => workspaceState.value.conformanceClaim)
const riskManagement = computed(() => workspaceState.value.riskManagement)
const riskManagementPayload = computed(() => buildRiskManagementPayload(riskManagement.value))
const riskManagementNarrative = computed(() => riskManagementPayload.value?.general_approach_html)
const productContextState = computed(() => riskManagement.value.productContext)
const productContextEvidence = computed(() => productContextState.value?.evidenceEntries ?? [])
const evidenceSummary = computed(() => summarizeEvidenceEntries(productContextEvidence.value))
const previewLoading = ref(false)
const previewError = ref('')
const hasGeneratedDocx = ref(false)
const docxPreviewContainer = ref<HTMLDivElement | null>(null)
const previewShell = ref<HTMLDivElement | null>(null)
const latestDocPath = ref<string | null>(null)
const downloading = ref(false)
const zoomLevel = ref(100)
const currentPage = ref(1)
const totalPages = ref(1)
const expandedGroupKey = ref<string | null>(null)

const lastUpdatedText = computed(() => formatDate(workspaceState.value.lastUpdated, true))
const sectionStatuses = computed(() => buildSectionStatuses())
const statusGroups = computed(() => buildStatusGroups(sectionStatuses.value))
const DOCX_PAGE_SELECTOR = '.docx-wrapper > section.docx'

let unsubscribe: (() => void) | null = null
const previewScrollHandler = () => {
  updateCurrentPageFromScroll()
}

onMounted(() => {
  workspaceState.value = loadDocumentWorkspace()
  unsubscribe = subscribeDocumentWorkspace((state) => {
    workspaceState.value = state
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

function toggleGroup(key: string) {
  expandedGroupKey.value = expandedGroupKey.value === key ? null : key
}

function formatDate(value: string | null | undefined, fallbackDash = false) {
  if (!value) {
    return fallbackDash ? '—' : 'Not set'
  }
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }
  if (parsed.getTime() === 0 && fallbackDash) {
    return '—'
  }
  return parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

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

function formatAssessmentPeriod(start?: string | null, end?: string | null) {
  const startLabel = formatPeriodDate(start)
  const endLabel = formatPeriodDate(end)
  if (!startLabel && !endLabel) return '—'
  if (!startLabel) return `Through ${endLabel}`
  if (!endLabel) return `${startLabel} onward`
  return `${startLabel} to ${endLabel}`
}

function formatPeriodDate(value?: string | null) {
  if (!value) return ''
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }
  return parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
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

function formatMultiline(value?: string | null, placeholder = '—') {
  if (!value) return placeholder
  const trimmed = value.trim()
  if (!trimmed) return placeholder
  return escapeHtml(trimmed).replace(/\n/g, '<br />')
}

function summarizeRegulatoryEntries(state?: RegulatoryConformanceState) {
  if (!state || !Array.isArray(state.additionalRegulations)) return ''
  return state.additionalRegulations
    .map((entry) => entry.regulation || entry.description)
    .map((value) => value?.trim() ?? '')
    .filter((value) => value.length > 0)
    .slice(0, 3)
    .join(', ')
}

function buildRegulatoryHtml(state?: RegulatoryConformanceState) {
  const baseList = REGULATORY_PRIMARY_REFERENCES.map((item) => `<li>${escapeHtml(item)}</li>`).join('')
  const otherEntries = (state?.additionalRegulations ?? [])
    .map((entry) => {
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

function buildConformanceLevelHtml(state?: ConformanceLevelState) {
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

function buildRiskManagementPayload(state?: RiskManagementState) {
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

function normalizeEvidencePayload(entries?: RiskEvidenceEntry[]) {
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
    .filter((entry): entry is {
      section_key: string
      reference_id?: string
      title?: string
      status: string
      notes_html?: string
    } => Boolean(entry))
}

function summarizeEvidenceEntries(entries: RiskEvidenceEntry[]) {
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

function buildSectionStatuses() {
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
        introduction.value.productName,
        introduction.value.productVersion,
        introduction.value.productType,
        introduction.value.manufacturerName,
        introduction.value.manufacturerAddress,
        introduction.value.status,
        introduction.value.preparedBy,
        introduction.value.reviewedBy,
        introduction.value.approvedBy,
      ],
      '/document/introduction'
    ),
    createStatus(
      'purpose-scope',
      'Purpose & Scope',
      'Lifecycle phases, assessment period, and methodology.',
      [
        purposeScope.value.scopeSelections.length > 0 ? 'yes' : '',
        purposeScope.value.assessmentStart,
        purposeScope.value.assessmentEnd,
        stripHtml(purposeScope.value.methodologyHtml),
      ],
      '/document/purpose-scope'
    ),
    createStatus(
      'product-identification',
      'Product Identification',
      'Product description, key functions, and target market.',
      [
        introduction.value.productName,
        introduction.value.productVersion,
        introduction.value.productType,
        stripHtml(productIdentification.value.productDescriptionHtml),
        stripHtml(productIdentification.value.keyFunctionsHtml),
        productIdentification.value.targetMarket,
      ],
      '/document/product-identification'
    ),
    
    createStatus(
      'manufacturer-information',
      'Manufacturer Information',
      'Legal entity details and primary contact information.',
      [
        manufacturerInformation.value.legalEntity,
        manufacturerInformation.value.registrationNumber,
        manufacturerInformation.value.address,
        manufacturerInformation.value.contactPerson,
        manufacturerInformation.value.phone,
      ],
      '/document/manufacturer-information'
    ),
    createStatus(
      'product-overview-description',
      'Product Description',
      'Narrative covering physical, software, and data-processing characteristics.',
      [stripHtml(productOverview.value.productDescriptionHtml)],
      '/product-overview/description'
    ),
    createStatus(
      'product-overview-architecture',
      'Product Architecture Overview',
      'High-level components, interfaces, and remote services.',
      [stripHtml(productOverview.value.productArchitectureHtml)],
      '/product-overview/architecture'
    ),
    createStatus(
      'third-party-components',
      'Third-Party Components',
      'Component inventory, management approach, and evidence.',
      [
        productOverview.value.thirdPartyComponents.entries.length ? 'entries' : '',
        stripHtml(productOverview.value.thirdPartyComponents.managementApproachHtml),
        stripHtml(productOverview.value.thirdPartyComponents.evidenceReferenceHtml),
      ],
      '/product-overview/third-party-components'
    ),
    createStatus(
      'conformance-standards',
      'Standards Conformance',
      'Primary standard plus related standards applied.',
      [
        [
          conformanceClaim.value.standardsConformance.primaryStandard.code,
          conformanceClaim.value.standardsConformance.primaryStandard.description,
        ]
          .filter((value) => !!value && value.trim().length)
          .join(' '),
        conformanceClaim.value.standardsConformance.relatedStandards.length
          ? 'related'
          : conformanceClaim.value.standardsConformance.includeOther &&
              conformanceClaim.value.standardsConformance.otherNotes
            ? conformanceClaim.value.standardsConformance.otherNotes
            : '',
      ],
      '/conformance/standards'
    ),
    createStatus(
      'conformance-regulatory',
      'Regulatory Conformance',
      'CRA clauses plus other applicable regulations.',
      [summarizeRegulatoryEntries(conformanceClaim.value.regulatoryConformance)],
      '/conformance/regulatory'
    ),
    createStatus(
      'conformance-level',
      'Conformance Level',
      'Claimed assurance tier and supporting evidence.',
      [
        conformanceClaim.value.conformanceLevel.statuses.length ? 'status' : '',
        stripHtml(conformanceClaim.value.conformanceLevel.justificationHtml),
      ],
      '/conformance/level'
    ),
    createStatus(
      'terminology',
      'Terminology',
      'Terms and definitions used throughout the document.',
      [
        workspaceState.value.documentConvention.terminologyEntries.length ? 'entries' : '',
      ],
      '/convention/terminology'
    ),
    createStatus(
      'notation',
      'Notation',
      'Evidence, requirement, and assessment verdict guidance.',
      [
        stripHtml(workspaceState.value.documentConvention.evidenceNotationHtml),
        stripHtml(workspaceState.value.documentConvention.requirementNotationHtml),
        stripHtml(workspaceState.value.documentConvention.assessmentVerdictsHtml),
      ],
      '/convention/notation'
    ),
    createStatus(
      'risk-general',
      'General Approach to Risk Management',
      'Lifecycle risk management narrative and references.',
      [stripHtml(riskManagementNarrative.value)],
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
      '/pcontext/intended-purpose'
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
      '/document/evidence'
    ),
  ]
}

function buildStatusGroups(statuses: Array<ReturnType<typeof createStatus>>) {
  return STATUS_GROUP_DEFINITIONS.map((definition) => {
    const items = definition.children
      .map((childKey) => statuses.find((status) => status.key === childKey))
      .filter((item): item is ReturnType<typeof createStatus> => Boolean(item))
    if (!items.length) {
      return null
    }
    const total = items.length
    const completed = items.filter((item) => item.state === 'completed').length
    const state = completed === total ? 'completed' : completed === 0 ? 'missing' : 'partial'
    const label = state === 'completed' ? 'Completed' : state === 'partial' ? 'Partial' : 'Missing'
    return {
      key: definition.key,
      title: definition.title,
      description: definition.description,
      state,
      label,
      items,
    }
  }).filter((group): group is {
    key: string
    title: string
    description: string
    state: string
    label: string
    items: Array<ReturnType<typeof createStatus>>
  } => Boolean(group))
}

function createStatus(
  key: string,
  title: string,
  hint: string,
  values: Array<string | undefined | null>,
  to: string
) {
  const completion = evaluateCompletion(values)
  const label =
    completion.state === 'completed' ? 'Completed' : completion.state === 'partial' ? 'Partial' : 'Missing'
  return {
    key,
    title,
    hint,
    state: completion.state,
    label,
    to,
    completed: completion.filled,
    total: completion.total,
    sampleValues: completion.sampleValues,
  }
}

function evaluateCompletion(values: Array<string | undefined | null>) {
  const normalized = values.map((value) => {
    if (typeof value === 'string') {
      return value.trim()
    }
    if (value === null || value === undefined) {
      return ''
    }
    return String(value).trim()
  })
  const total = normalized.length
  const filled = normalized.filter((value) => value.length > 0).length
  const sampleValues = normalized.filter((value) => value.length > 0).slice(0, 3)
  if (total === 0 || filled === 0) {
    return { state: 'missing', filled, total, sampleValues }
  }
  if (filled === total) {
    return { state: 'completed', filled, total, sampleValues }
  }
  return { state: 'partial', filled, total, sampleValues }
}

async function uploadCoverImageIfNeeded(force = false) {
  const currentCover = cover.value
  if (!currentCover.imageData) {
    return currentCover.imagePath
  }
  if (!force && currentCover.imagePath) {
    return currentCover.imagePath
  }

  const file = dataUrlToFile(currentCover.imageData, 'cover-image')
  if (!file) {
    return currentCover.imagePath
  }

  const formData = new FormData()
  formData.append('file', file)

  const userId = sessionService.getUserToken()
  const response = await api.post('/cover/upload', formData, {
    params: { user_id: userId },
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  const newPath: string | null = response.data?.path ?? null
  workspaceState.value = updateCoverState({ imagePath: newPath })
  return newPath
}

async function generatePreview() {
  previewError.value = ''
  workspaceState.value = loadDocumentWorkspace()

  const productTitle = introduction.value.productName?.trim() || cover.value.deviceName?.trim() || ''

  if (!productTitle) {
    previewError.value =
      'Please provide a Product Name on the Introduction page (or a Device Name on the Cover page) before generating the preview.'
    return
  }

  previewLoading.value = true

  try {
    const userId = sessionService.getUserToken()
    const imagePath = await uploadCoverImageIfNeeded()
    const normalize = normalizePlainText
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

    const standardsState = conformanceClaim.value.standardsConformance
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
    const conformanceLevelHtml = normalizeHtml(
      buildConformanceLevelHtml(conformanceClaim.value.conformanceLevel)
    )
    const conformanceClaimPayload =
      standardsConformancePayload || regulatoryHtml || conformanceLevelHtml
        ? {
            standards_conformance: standardsConformancePayload,
            regulatory_conformance_html: regulatoryHtml,
            conformance_level_html: conformanceLevelHtml,
          }
        : undefined

    const documentConvention = workspaceState.value.documentConvention
    const documentConventionPayload = {
      terminology_entries: documentConvention.terminologyEntries
        .map((entry) => ({
          term: normalize(entry.term),
          definition: normalize(entry.definition),
          reference: normalize(entry.reference),
        }))
        .filter((entry) => entry.term || entry.definition || entry.reference),
      evidence_notation_html: normalizeHtml(documentConvention.evidenceNotationHtml),
      requirement_notation_html: normalizeHtml(documentConvention.requirementNotationHtml),
      assessment_verdicts_html: normalizeHtml(documentConvention.assessmentVerdictsHtml),
    }

    const riskManagementSection = buildRiskManagementPayload(riskManagement.value)

    const payload: Record<string, unknown> = {
      user_id: userId,
      title: productTitle,
      description: cover.value.deviceDescription,
      version: cover.value.versionNumber,
      revision: cover.value.revisionDate,
      manufacturer: [cover.value.labName, cover.value.labAddress].filter(Boolean).join('\n'),
      date: cover.value.revisionDate,
      image_path: imagePath ?? undefined,
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

    const response = await api.post('/cover/preview', payload)
    const path: string = response.data.path
    const buffer = await api.get(path, { responseType: 'arraybuffer' })

    if (docxPreviewContainer.value) {
      docxPreviewContainer.value.innerHTML = ''
      await renderAsync(buffer.data, docxPreviewContainer.value, undefined, {
        inWrapper: true,
        ignoreWidth: false,
        ignoreHeight: false,
        renderHeaders: true,
        renderFooters: true,
        renderFootnotes: true,
        renderEndnotes: true,
      })
      hasGeneratedDocx.value = true
      latestDocPath.value = path
      requestAnimationFrame(() => {
        annotateRenderedPages()
      })
    }
  } catch (error) {
    console.error(error)
    previewError.value = 'Failed to generate preview. Please ensure the backend is running.'
  } finally {
    previewLoading.value = false
  }
}

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
      behavior: 'smooth',
    })
    currentPage.value = pageNumber
    highlightActivePage(pageNumber)
  }
}

async function downloadDocx() {
  if (!latestDocPath.value) return
  downloading.value = true
  try {
    const response = await api.get(latestDocPath.value, {
      responseType: 'blob',
    })
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'CRA_Tool_Document_Cover.docx'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error(error)
    previewError.value = 'Unable to download the DOCX file.'
  } finally {
    downloading.value = false
  }
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

function getRenderedPages(): HTMLElement[] {
  const nodes = docxPreviewContainer.value?.querySelectorAll<HTMLElement>('.docx-rendered-page')
  return nodes ? Array.from(nodes) : []
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
</script>

<style scoped src="./DocumentPreview.css"></style>
