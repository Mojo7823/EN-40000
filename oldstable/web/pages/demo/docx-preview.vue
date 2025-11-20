<template>
  <div class="demo-page">
    <section class="card hero-card">
      <div class="hero-text">
        <p class="eyebrow">Preview Engine</p>
        <h1>DOCX Preview</h1>
        <p class="muted">
          Send arbitrary HTML to the backend and render/download the resulting DOCX straight from the browser.
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

    <section class="card content-card">
      <header>
        <h2>Input</h2>
      </header>
      <RichTextEditor v-model="docxHtml" min-height="280px" />
    </section>

    <section class="card content-card">
      <header class="result-header">
        <div>
          <h2>Result</h2>
          <p class="muted">The rendered DOCX appears below with the familiar print-preview styling.</p>
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
import { onMounted, ref, watch } from 'vue'
import { renderAsync } from 'docx-preview'
import RichTextEditor from '../../components/RichTextEditor.vue'
import { sessionService } from '../../services/sessionService'
import { loadDemoState, updateDemoState } from '../../services/demoStorage'

const api = useApi()
const docxHtml = ref('<p></p>')
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

onMounted(() => {
  docxHtml.value = loadDemoState().docxHtml
})

watch(docxHtml, (value) => {
  updateDemoState({ docxHtml: value })
  hasGeneratedDocx.value = false
  latestDocPath.value = null
  currentPage.value = 1
  totalPages.value = 1
})

async function generatePreview() {
  if (!docxHtml.value?.trim()) {
    previewError.value = 'Please enter some content before generating a preview.'
    return
  }

  previewLoading.value = true
  previewError.value = ''

  try {
    const userId = sessionService.getUserToken()
    const response = await api.post('/security/sfr/preview', {
      user_id: userId,
      html_content: docxHtml.value,
    })
    const path: string = (response as any).path
    const buffer = await api.get(path, { responseType: 'arrayBuffer' })

    if (docxPreviewContainer.value) {
      docxPreviewContainer.value.innerHTML = ''
      await renderAsync(buffer as ArrayBuffer, docxPreviewContainer.value, undefined, {
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
      
      // Count pages
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
        behavior: 'smooth'
      })
    }
  }
}

async function downloadDocx() {
  if (!latestDocPath.value) return
  downloading.value = true
  try {
    const blob = await api.get(latestDocPath.value, {
      responseType: 'blob',
    })
    const url = URL.createObjectURL(blob as Blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'CRA Tool_Demo.docx'
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
.demo-page {
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

.hero-text h1 {
  margin: 0;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.content-card {
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

/* Wrapper with checkerboard background */
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

/* A4 page with proper dimensions and shadow */
.docx-preview-container :deep(.docx) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 8px 24px rgba(0, 0, 0, 0.1);
  background: #ffffff !important;
  /* A4 dimensions: 210mm x 297mm at 96dpi = 794px x 1123px */
  width: 794px !important;
  min-height: 1123px;
  margin: 0 auto;
  page-break-after: always;
}

/* Individual sections (pages) */
.docx-preview-container :deep(.docx > section) {
  background: #ffffff !important;
  min-height: 1123px;
  padding: 96px 120px; /* Standard Word margins (1 inch = 96px) */
  box-sizing: border-box;
  page-break-after: always;
}

/* Page breaks between sections */
.docx-preview-container :deep(.docx > section + section) {
  margin-top: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 8px 24px rgba(0, 0, 0, 0.1);
}

/* Ensure text doesn't overflow page width */
.docx-preview-container :deep(.docx p),
.docx-preview-container :deep(.docx h1),
.docx-preview-container :deep(.docx h2),
.docx-preview-container :deep(.docx h3),
.docx-preview-container :deep(.docx table) {
  max-width: 100%;
  word-wrap: break-word;
}

/* Table styling */
.docx-preview-container :deep(.docx table) {
  width: 100%;
  border-collapse: collapse;
}

/* Fix for dark mode - ensure document stays white */
.docx-preview-container :deep(.docx),
.docx-preview-container :deep(.docx > section) {
  color: #000000 !important;
}

.muted {
  color: var(--text-muted);
}
</style>
