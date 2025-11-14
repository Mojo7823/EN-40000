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
      </header>
      <div class="docx-preview-shell">
        <div v-if="previewLoading" class="modal-status overlay">Rendering…</div>
        <p v-else-if="previewError" class="modal-error">{{ previewError }}</p>
        <div
          ref="docxPreviewContainer"
          class="docx-preview-container"
          :class="{ hidden: previewLoading || !!previewError || !hasGeneratedDocx }"
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
const latestDocPath = ref<string | null>(null)
const downloading = ref(false)

onMounted(() => {
  docxHtml.value = loadDemoState().docxHtml
})

watch(docxHtml, (value) => {
  updateDemoState({ docxHtml: value })
  hasGeneratedDocx.value = false
  latestDocPath.value = null
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
        ignoreWidth: true,
        ignoreHeight: true,
      })
      hasGeneratedDocx.value = true
      latestDocPath.value = path
    }
  } catch (error) {
    console.error(error)
    previewError.value = 'Failed to generate preview. Please ensure the backend is running.'
  } finally {
    previewLoading.value = false
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
    link.download = 'CCGenTool_Demo.docx'
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
  gap: 12px;
}

.docx-preview-shell {
  position: relative;
  min-height: 320px;
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  background: var(--surface);
  padding: 12px;
}

.docx-preview-container {
  width: 100%;
  height: 100%;
  overflow: auto;
  background: transparent;
}

.docx-preview-container.hidden {
  display: none;
}

.docx-preview-container .docx-wrapper {
  background: linear-gradient(45deg, rgba(0, 0, 0, 0.05) 25%, transparent 25%),
    linear-gradient(-45deg, rgba(0, 0, 0, 0.05) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, rgba(0, 0, 0, 0.05) 75%),
    linear-gradient(-45deg, transparent 75%, rgba(0, 0, 0, 0.05) 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0;
  padding: 32px;
  display: flex;
  justify-content: center;
}

.docx-preview-container .docx-wrapper .docx {
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.2);
  background: #fff;
}

.muted {
  color: var(--text-muted);
}
</style>
