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
          <p class="muted">Check the completion status of each document section.</p>
        </div>
      </header>
      <ul class="status-list">
        <li v-for="item in sectionStatuses" :key="item.key">
          <RouterLink class="status-link" :to="item.to">
            <div>
              <p class="status-title">{{ item.title }}</p>
              <p class="status-hint">{{ item.hint }}</p>
            </div>
            <span :class="['status-pill', item.state]">{{ item.label }}</span>
          </RouterLink>
        </li>
      </ul>
    </section>

    <section class="card preview-card">
      <header class="result-header">
        <div>
          <h2>DOCX Preview</h2>
          <p class="muted">Rendered at true A4 dimensions with zoom and navigation controls.</p>
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
      <div class="docx-preview-shell" ref="previewShell">
        <div v-if="previewLoading" class="modal-status overlay">Rendering…</div>
        <p v-else-if="previewError" class="modal-error">{{ previewError }}</p>
        <div
          ref="docxPreviewContainer"
          class="docx-preview-container"
          :class="{ hidden: previewLoading || !!previewError || !hasGeneratedDocx }"
          :style="{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }"
        ></div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { renderAsync } from 'docx-preview'
import api from '../../services/api'
import { sessionService } from '../../services/sessionService'
import {
  loadDocumentWorkspace,
  subscribeDocumentWorkspace,
  updateCoverState,
  type DocumentWorkspaceState,
} from '../../services/documentWorkspace'
import { dataUrlToFile } from '../../utils/dataUrl'

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

const workspaceState = ref<DocumentWorkspaceState>(loadDocumentWorkspace())
const cover = computed(() => workspaceState.value.cover)
const introduction = computed(() => workspaceState.value.introduction)
const purposeScope = computed(() => workspaceState.value.purposeScope)
const productIdentification = computed(() => workspaceState.value.productIdentification)
const manufacturerInformation = computed(() => workspaceState.value.manufacturerInformation)
const productOverview = computed(() => workspaceState.value.productOverview)
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

const lastUpdatedText = computed(() => formatDate(workspaceState.value.lastUpdated, true))
const sectionStatuses = computed(() => buildSectionStatuses())
const DOCX_PAGE_SELECTOR = '.docx-wrapper > section.docx'

let unsubscribe: (() => void) | null = null

onMounted(() => {
  workspaceState.value = loadDocumentWorkspace()
  unsubscribe = subscribeDocumentWorkspace((state) => {
    workspaceState.value = state
  })
})

onUnmounted(() => {
  unsubscribe?.()
})

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
      'product-overview',
      'Product Description',
      'Narrative covering physical, software, and data-processing characteristics.',
      [stripHtml(productOverview.value.productDescriptionHtml)],
      '/product-overview/description'
    ),


  ]
}

function createStatus(
  key: string,
  title: string,
  hint: string,
  values: Array<string | undefined | null>,
  to: string
) {
  const state = evaluateCompletion(values)
  const label = state === 'completed' ? 'Completed' : state === 'partial' ? 'Partial' : 'Missing'
  return { key, title, hint, state, label, to }
}

function evaluateCompletion(values: Array<string | undefined | null>) {
  const normalized = values.map((value) => (typeof value === 'string' ? value.trim() : ''))
  const total = normalized.length
  const filled = normalized.filter((value) => value.length > 0).length
  if (filled === 0) return 'missing'
  if (filled === total) return 'completed'
  return 'partial'
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
    const normalize = (value?: string | null) => {
      if (!value) return undefined
      const trimmed = value.trim()
      return trimmed.length ? trimmed : undefined
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

    const productOverviewPayload = {
      product_description_html: normalizeHtml(productOverview.value.productDescriptionHtml),
    }

    const manufacturerInformationPayload = {
      legal_entity: normalize(manufacturerInformation.value.legalEntity),
      registration_number: normalize(manufacturerInformation.value.registrationNumber),
      address: normalize(manufacturerInformation.value.address),
      contact_person: normalize(manufacturerInformation.value.contactPerson),
      phone: normalize(manufacturerInformation.value.phone),
    }

    const payload = {
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
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    scrollToPage(currentPage.value)
  }
}

function previousPage() {
  if (currentPage.value > 1) {
    currentPage.value--
    scrollToPage(currentPage.value)
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
</script>

<style scoped src="./DocumentPreview.css"></style>
