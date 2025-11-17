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
import api from '../../services/api'
import { sessionService } from '../../services/sessionService'
import { loadDemoState, updateDemoState } from '../../services/demoStorage'

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
    const response = await api.get(latestDocPath.value, {
      responseType: 'blob',
    })
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })
    const url = URL.createObjectURL(blob)
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

<style scoped src="./DocxPreviewDemo.css"></style>
