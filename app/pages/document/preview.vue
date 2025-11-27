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
            color="neutral"
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
      <!-- Section Status Card -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Status</p>
              <h3 class="text-lg font-semibold">Sections</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Follow the sections in order before previewing.</p>
            </div>
            <UBadge color="neutral" variant="subtle">{{ completionPercentage }}% complete</UBadge>
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
                :color="getStatusColor(item.state) as any"
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
                :class="getSectionBorderClasses(section.status)"
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
                    :color="getStatusColor(section.status) as any"
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

      <!-- DOCX Preview Card -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Preview</p>
              <h3 class="text-lg font-semibold">Document Preview</h3>
            </div>
            <div class="flex gap-2 flex-wrap items-center">
              <!-- Zoom Controls -->
              <div v-if="docxPreview.hasGenerated.value" class="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <UButton
                  size="xs"
                  variant="ghost"
                  color="neutral"
                  icon="i-heroicons-minus"
                  :disabled="docxPreview.zoomLevel.value <= 50"
                  @click="docxPreview.zoomOut"
                  title="Zoom Out"
                />
                <span class="text-xs font-medium min-w-[45px] text-center">{{ docxPreview.zoomLevel.value }}%</span>
                <UButton
                  size="xs"
                  variant="ghost"
                  color="neutral"
                  icon="i-heroicons-plus"
                  :disabled="docxPreview.zoomLevel.value >= 200"
                  @click="docxPreview.zoomIn"
                  title="Zoom In"
                />
                <UButton
                  size="xs"
                  variant="ghost"
                  color="neutral"
                  icon="i-heroicons-arrow-path"
                  @click="docxPreview.resetZoom"
                  title="Reset Zoom"
                />
              </div>

              <!-- Page Navigation -->
              <div v-if="docxPreview.hasGenerated.value && docxPreview.totalPages.value > 1" class="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <UButton
                  size="xs"
                  variant="ghost"
                  color="neutral"
                  icon="i-heroicons-chevron-left"
                  :disabled="docxPreview.currentPage.value <= 1"
                  @click="docxPreview.previousPage"
                  title="Previous Page"
                />
                <span class="text-xs font-medium min-w-[60px] text-center">{{ docxPreview.currentPage.value }} / {{ docxPreview.totalPages.value }}</span>
                <UButton
                  size="xs"
                  variant="ghost"
                  color="neutral"
                  icon="i-heroicons-chevron-right"
                  :disabled="docxPreview.currentPage.value >= docxPreview.totalPages.value"
                  @click="docxPreview.nextPage"
                  title="Next Page"
                />
              </div>

              <UButton
                variant="ghost"
                color="neutral"
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
          <div v-if="docxPreview.loading.value" class="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-10">
            <div class="text-center">
              <div class="text-sm font-medium text-gray-700 dark:text-gray-300">Rendering DOCX...</div>
            </div>
          </div>
          <div v-else-if="docxPreview.error.value" class="flex items-center justify-center min-h-[400px]">
            <div class="text-center text-red-600">
              <p class="font-medium">Error rendering DOCX</p>
              <p class="text-sm mt-1">{{ docxPreview.error.value }}</p>
            </div>
          </div>
          <div v-else-if="!docxPreview.hasGenerated.value" class="flex items-center justify-center min-h-[400px]">
            <div class="text-center text-gray-500">
              <p class="font-medium">No DOCX preview available</p>
              <p class="text-sm mt-1">Generate a document to see the DOCX preview</p>
            </div>
          </div>
          <div
            ref="docxPreviewContainer"
            class="docx-preview-container"
            :class="{ 'hidden': docxPreview.loading.value || !!docxPreview.error.value || !docxPreview.hasGenerated.value }"
            :style="{ transform: `scale(${docxPreview.zoomLevel.value / 100})`, transformOrigin: 'top center' }"
          ></div>
        </div>
      </UCard>

      <!-- Generated Files Card -->
      <UCard v-if="generatedFiles.length">
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Generated</p>
              <h3 class="text-lg font-semibold">Documents</h3>
            </div>
            <UBadge color="neutral" variant="subtle">{{ generatedFiles.length }} file(s)</UBadge>
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
import { useDocxPreview } from '~/composables/useDocxPreview'
import { usePreviewSections } from '~/composables/usePreviewSections'
import { buildCoverPreviewPayload, uploadCoverImageIfNeeded } from '~/composables/useCoverPreview'
import { getStatusColor, getSectionBorderClasses, getStatusLabel } from '~/utils/previewStatus'

const workspaceService = useDocumentWorkspace()
const toast = useToast()

// Workspace state
const workspace = ref(workspaceService.loadDocumentWorkspace())
const loading = ref(false)
const error = ref('')
const success = ref('')
const generatedFiles = ref<Array<{ filename: string; path: string; timestamp: string; section?: string }>>([])

// DOM refs for DOCX preview
const docxPreviewContainer = ref<HTMLDivElement | null>(null)
const previewShell = ref<HTMLDivElement | null>(null)

// Composables
const docxPreview = useDocxPreview(docxPreviewContainer, previewShell)
const workspaceComputed = computed(() => workspace.value)
const { sectionList, sectionGroups, allMissing, completionPercentage } = usePreviewSections(workspaceComputed)

// Accordion items for UAccordion
const accordionItems = computed(() =>
  sectionGroups.value.map((group) => ({
    ...group,
    label: group.title,
    value: group.key,
  }))
)

// Last updated label
const lastUpdatedLabel = computed(() => {
  const value = workspace.value.lastUpdated
  if (!value) return 'Not set'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
})

// Subscribe to workspace changes
let unsubscribe: (() => void) | null = null

onMounted(() => {
  unsubscribe = workspaceService.subscribeDocumentWorkspace((state) => {
    workspace.value = state
  })
})

onUnmounted(() => {
  unsubscribe?.()
})

// Preview refresh
function buildFullPreview() {
  if (!docxPreview.latestDocPath.value) {
    toast.add({
      title: 'No Document Yet',
      description: 'Generate a DOCX first to preview.',
      color: 'warning',
      icon: 'i-heroicons-exclamation-triangle'
    })
    return
  }

  docxPreview.hasGenerated.value = false
  docxPreview.render(docxPreview.latestDocPath.value)
}

// Generate full document
async function generateFullDocument() {
  loading.value = true
  error.value = ''
  success.value = ''

  try {
    workspace.value = workspaceService.loadDocumentWorkspace()
    const productTitle = workspace.value.introduction.productName?.trim() || workspace.value.cover.deviceName?.trim() || ''

    if (!productTitle) {
      error.value =
        'Please provide a Product Name on the Introduction page (or a Device Name on the Cover page) before generating the preview.'
      toast.add({
        title: 'Missing Product Name',
        description: error.value,
        color: 'warning',
        icon: 'i-heroicons-exclamation-triangle'
      })
      return
    }

    const imagePath = await uploadCoverImageIfNeeded(
      workspace.value.cover,
      (state) => workspaceService.updateCoverState(state)
    )
    const payload = buildCoverPreviewPayload(workspace.value, imagePath)

    const response = await $fetch<{ status: string; path: string; filename: string }>('http://localhost:8000/api/cover/preview', {
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
      
      docxPreview.hasGenerated.value = false
      await docxPreview.render(docPath)
      
      success.value = 'Full document generated successfully!'
      
      toast.add({
        title: 'Document Generated',
        description: 'Full CRA document has been generated successfully.',
        color: 'success',
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
      color: 'error',
      icon: 'i-heroicons-x-circle'
    })
  } finally {
    loading.value = false
  }
}

// Download functions
function downloadLatest() {
  const latest = generatedFiles.value[0]
  if (!latest) return
  downloadFile(latest)
}

async function downloadFile(file: { filename: string; path: string }) {
  try {
    const downloadUrl = `http://localhost:8000${file.path}`
    window.open(downloadUrl, '_blank')
    success.value = 'Download started!'
    
    toast.add({
      title: 'Download Started',
      description: `Downloading ${file.filename}`,
      color: 'success',
      icon: 'i-heroicons-arrow-down-tray'
    })
    
    setTimeout(() => success.value = '', 2000)
  } catch (e: any) {
    error.value = `Download failed: ${e.message}`
    toast.add({
      title: 'Download Failed',
      description: error.value,
      color: 'error',
      icon: 'i-heroicons-x-circle'
    })
  }
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
