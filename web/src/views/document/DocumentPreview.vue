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
        <RouterLink class="btn ghost" to="/document/cover">Edit Cover</RouterLink>
        <button class="btn" type="button" :disabled="!latestDocPath || downloading" @click="downloadDocx">
          {{ downloading ? 'Preparing…' : 'Download DOCX' }}
        </button>
        <button class="btn primary" type="button" :disabled="previewLoading" @click="generatePreview">
          {{ previewLoading ? 'Generating…' : 'Generate Preview' }}
        </button>
      </div>
    </section>

    <section class="card cover-summary-card">
      <header>
        <div>
          <h2>Cover Snapshot</h2>
          <p class="muted">This summary is generated from the Cover page. Update it there before rendering.</p>
        </div>
        <div class="summary-meta">
          <span :class="['badge', coverStatusClass]">{{ coverStatusText }}</span>
          <small>Last updated: {{ lastUpdatedText }}</small>
        </div>
      </header>
      <div class="cover-summary">
        <div class="cover-details">
          <p class="cover-eyebrow">Document Cover</p>
          <h3>{{ cover.deviceName || 'Untitled Device' }}</h3>
          <p class="cover-description">
            {{ cover.deviceDescription || 'Add a product description on the Cover page to display it here.' }}
          </p>
          <dl>
            <div>
              <dt>Version Number</dt>
              <dd>{{ cover.versionNumber || '—' }}</dd>
            </div>
            <div>
              <dt>Revision Date</dt>
              <dd>{{ formattedRevisionDate }}</dd>
            </div>
            <div>
              <dt>Lab Name</dt>
              <dd>{{ cover.labName || '—' }}</dd>
            </div>
            <div>
              <dt>Lab Address</dt>
              <dd>{{ cover.labAddress || '—' }}</dd>
            </div>
          </dl>
        </div>
        <div class="cover-image-pane" :class="{ empty: !cover.imageData }">
          <img v-if="cover.imageData" :src="cover.imageData" alt="Cover artwork preview" />
          <div v-else class="placeholder">
            <span>Drag and drop an image on the Cover page to show it here.</span>
          </div>
        </div>
      </div>
    </section>

    <section class="card preview-card">
      <header class="result-header">
        <div>
          <h2>Preview Result</h2>
          <p class="muted">The cover is rendered at true A4 dimensions with zoom and navigation controls.</p>
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

const workspaceState = ref<DocumentWorkspaceState>(loadDocumentWorkspace())
const cover = computed(() => workspaceState.value.cover)
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

const hasCoverContent = computed(
  () =>
    !!(
      cover.value.deviceName ||
      cover.value.deviceDescription ||
      cover.value.versionNumber ||
      cover.value.labName
    )
)
const formattedRevisionDate = computed(() => formatDate(cover.value.revisionDate))
const coverStatusClass = computed(() => (hasCoverContent.value ? 'ok' : 'degraded'))
const coverStatusText = computed(() => (hasCoverContent.value ? 'Ready' : 'Missing details'))
const lastUpdatedText = computed(() => formatDate(workspaceState.value.lastUpdated, true))

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

  if (!cover.value.deviceName?.trim()) {
    previewError.value = 'Please provide a Device Name on the Cover page before generating the preview.'
    return
  }

  previewLoading.value = true

  try {
    const userId = sessionService.getUserToken()
    const imagePath = await uploadCoverImageIfNeeded()
    const payload = {
      user_id: userId,
      title: cover.value.deviceName,
      description: cover.value.deviceDescription,
      version: cover.value.versionNumber,
      revision: cover.value.revisionDate,
      manufacturer: [cover.value.labName, cover.value.labAddress].filter(Boolean).join('\n'),
      date: cover.value.revisionDate,
      image_path: imagePath ?? undefined,
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
      setTimeout(() => {
        const sections = docxPreviewContainer.value?.querySelectorAll('.docx > section')
        totalPages.value = sections?.length || 1
        currentPage.value = 1
      }, 100)
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
  const sections = docxPreviewContainer.value?.querySelectorAll('.docx > section')
  if (sections && sections[pageNumber - 1]) {
    const section = sections[pageNumber - 1] as HTMLElement
    const shell = previewShell.value
    if (shell) {
      const sectionTop = section.offsetTop
      shell.scrollTo({
        top: sectionTop - 32,
        behavior: 'smooth',
      })
    }
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
</script>

<style scoped>
.document-preview-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.hero-card {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}

.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.cover-summary-card header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  flex-wrap: wrap;
}

.summary-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.cover-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 16px;
}

.cover-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cover-eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin: 0;
}

.cover-description {
  margin: 0;
  color: var(--text-muted);
}

dl {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin: 0;
}

dt {
  font-size: 0.85rem;
  color: var(--text-muted);
}

dd {
  margin: 0;
  font-weight: 600;
}

.cover-image-pane {
  border: 1px dashed var(--panel-border);
  border-radius: 16px;
  min-height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--surface);
}

.cover-image-pane img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.cover-image-pane.empty .placeholder {
  padding: 24px;
  text-align: center;
  color: var(--text-muted);
}

.preview-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.preview-controls {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: center;
}

.zoom-controls,
.page-navigation {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 8px;
}

.btn-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface);
  border: 1px solid var(--panel-border);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 18px;
  color: var(--text);
}

.btn-icon:hover:not(:disabled) {
  background: var(--panel-bg);
  border-color: var(--primary);
  color: var(--primary);
}

.btn-icon:active:not(:disabled) {
  transform: scale(0.95);
}

.btn-icon:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.zoom-level,
.page-info {
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
  min-width: 50px;
  text-align: center;
}

.docx-preview-shell {
  position: relative;
  min-height: 600px;
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  background: var(--surface);
  padding: 12px;
  overflow: auto;
}

.docx-preview-container {
  width: 100%;
  min-height: 600px;
  overflow: visible;
  background: transparent;
  transition: transform 0.2s ease;
}

.docx-preview-container.hidden {
  display: none;
}

.docx-preview-container :deep(.docx-wrapper) {
  background: linear-gradient(45deg, rgba(0, 0, 0, 0.05) 25%, transparent 25%),
    linear-gradient(-45deg, rgba(0, 0, 0, 0.05) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, rgba(0, 0, 0, 0.05) 75%),
    linear-gradient(-45deg, transparent 75%, rgba(0, 0, 0, 0.05) 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0;
  padding: 32px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.docx-preview-container :deep(.docx) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 8px 24px rgba(0, 0, 0, 0.1);
  background: #ffffff !important;
  width: 794px !important;
  min-height: 1123px;
  margin: 0 auto;
  page-break-after: always;
}

.docx-preview-container :deep(.docx > section) {
  background: #ffffff !important;
  min-height: 1123px;
  padding: 96px 120px;
  box-sizing: border-box;
  page-break-after: always;
}

.docx-preview-container :deep(.docx > section + section) {
  margin-top: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 8px 24px rgba(0, 0, 0, 0.1);
}

.docx-preview-container :deep(.docx),
.docx-preview-container :deep(.docx > section) {
  color: #000000 !important;
}
</style>
