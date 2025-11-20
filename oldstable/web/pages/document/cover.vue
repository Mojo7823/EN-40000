<template>
  <div class="cover-page">
    <section class="card title-card">
      <div>
        <p class="eyebrow">Document Cover</p>
        <h1>Product Cover Details</h1>
        <p class="muted">
          Provide the information that appears on the downloadable cover page. Your entries are saved automatically.
        </p>
      </div>
      <div class="title-card-actions">
        <RouterLink class="btn ghost" to="/document/preview">Go to Document Preview</RouterLink>
        <button class="btn danger" type="button" @click="resetForm">Clear Fields</button>
      </div>
    </section>

    <section class="card form-card">
      <form class="cover-form" @submit.prevent>
        <div class="form-grid">
          <label class="field">
            <span>Device Name</span>
            <input v-model="form.deviceName" type="text" placeholder="Product Name" />
          </label>

          <label class="field wide">
            <span>Device Description</span>
            <textarea
              v-model="form.deviceDescription"
              rows="4"
              placeholder="Provide a short marketing-friendly description of the device."
            ></textarea>
          </label>

          <div class="field wide">
            <span>Cover Image</span>
            <div
              class="drop-zone"
              :class="{ active: dropActive, hasImage: !!form.imageData }"
              @click="triggerFileSelect"
              @dragover.prevent="dropActive = true"
              @dragleave.prevent="dropActive = false"
              @drop.prevent="handleDrop"
            >
              <div v-if="!form.imageData" class="drop-zone-content">
                <div class="drop-icon">🖼️</div>
                <p class="drop-title">Drag and drop cover image here</p>
                <p class="drop-subtitle">or click to choose a file</p>
              </div>
              <div v-else class="drop-preview">
                <img :src="form.imageData" alt="Cover image preview" />
                <div class="drop-preview-meta">
                  <p class="file-name">{{ form.imageName }}</p>
                  <button class="btn ghost" type="button" @click.stop="clearImage">Remove</button>
                </div>
              </div>
              <input ref="fileInput" type="file" accept="image/*" @change="handleFileChange" />
            </div>
            <p v-if="imageError" class="field-error">{{ imageError }}</p>
          </div>

          <label class="field">
            <span>Version Number</span>
            <input v-model="form.versionNumber" type="text" placeholder="Version Number" />
          </label>

          <label class="field">
            <span>Revision Date</span>
            <input v-model="form.revisionDate" type="date" />
          </label>

          <label class="field">
            <span>Lab Name</span>
            <input v-model="form.labName" type="text" placeholder="Lab Name" />
          </label>

          <label class="field">
            <span>Lab Address</span>
            <input v-model="form.labAddress" type="text" placeholder="Street, City, Country" />
          </label>
        </div>
      </form>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import type {
  DocumentWorkspaceState,
  CoverFormState,
} from '../../services/documentWorkspace'

const fileInput = ref<HTMLInputElement | null>(null)
const dropActive = ref(false)
const imageError = ref('')
const workspace = useDocumentWorkspace()
const initialState = workspace.loadDocumentWorkspace()
const form = reactive<CoverFormState>({ ...initialState.cover })
const suppressNextSync = ref(false)
let unsubscribe: (() => void) | null = null

watch(
  form,
  (value) => {
    if (suppressNextSync.value) {
      suppressNextSync.value = false
      return
    }
    workspace.updateCoverState({ ...value })
  },
  { deep: true }
)

function applyExternalState(state: DocumentWorkspaceState) {
  suppressNextSync.value = true
  Object.assign(form, state.cover)
}

onMounted(() => {
  unsubscribe = workspace.subscribeDocumentWorkspace(applyExternalState)
})

onUnmounted(() => {
  unsubscribe?.()
})

function triggerFileSelect() {
  fileInput.value?.click()
}

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  readImage(file)
  input.value = ''
}

function handleDrop(event: DragEvent) {
  dropActive.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) {
    readImage(file)
  }
}

function readImage(file: File) {
  if (!file.type.startsWith('image/')) {
    imageError.value = 'Please choose an image file (PNG, JPG, SVG, …).'
    return
  }
  imageError.value = ''
  const reader = new FileReader()
  reader.onload = () => {
    form.imageData = reader.result as string
    form.imageName = file.name
    form.imagePath = null
  }
  reader.readAsDataURL(file)
}

function clearImage() {
  form.imageData = null
  form.imageName = null
  form.imagePath = null
}

function resetForm() {
  const next = workspace.clearDocumentWorkspace()
  Object.assign(form, next.cover)
}
</script>

<style scoped>
.cover-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.title-card {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}

.title-card-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
  margin-left: auto;
  justify-content: flex-end;
}

.title-card-actions :deep(a) {
  text-decoration: none;
}

.cover-form {
  display: flex;
  flex-direction: column;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field.wide {
  grid-column: 1 / -1;
}

input,
textarea {
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid var(--panel-border);
  background: var(--surface);
  font: inherit;
  resize: vertical;
}

textarea {
  min-height: 120px;
}

.drop-zone {
  position: relative;
  border: 2px dashed var(--panel-border);
  border-radius: 14px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drop-zone.active {
  border-color: var(--primary);
  background: rgba(80, 102, 255, 0.06);
}

.drop-zone.hasImage {
  padding: 0;
}

.drop-zone input[type='file'] {
  position: absolute;
  inset: 0;
  opacity: 0;
  pointer-events: none;
}

.drop-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.drop-icon {
  font-size: 32px;
}

.drop-title {
  font-weight: 600;
}

.drop-subtitle {
  font-size: 0.9rem;
  color: var(--text-muted);
}

.drop-preview {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.drop-preview img {
  width: 100%;
  max-height: 320px;
  object-fit: contain;
  border-radius: 14px 14px 0 0;
  background: var(--surface);
}

.drop-preview-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid var(--panel-border);
}

.file-name {
  margin: 0;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
}

.field-error {
  color: var(--danger);
  margin-top: 6px;
  font-size: 0.85rem;
}
</style>
