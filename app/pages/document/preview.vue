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

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <UCard class="lg:col-span-1">
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Status</p>
              <h3 class="text-lg font-semibold">Sections</h3>
            </div>
            <UBadge color="gray" variant="subtle">{{ completionPercentage }}% complete</UBadge>
          </div>
        </template>

        <div class="space-y-4">
          <div
            v-for="section in sectionList"
            :key="section.key"
            class="p-4 rounded-lg border transition-colors"
            :class="getSectionBorderColor(section)"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1 space-y-1">
                <div class="flex items-center gap-2">
                  <p class="font-semibold">{{ section.title }}</p>
                  <UBadge :color="getStatusColor(section.status)" variant="subtle">
                    {{ section.status }}
                  </UBadge>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ section.description }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ section.summary }}
                </p>
              </div>
              <div class="flex flex-col gap-2">
                <UButton
                  size="xs"
                  variant="soft"
                  color="blue"
                  icon="i-heroicons-eye"
                  :disabled="section.status === 'missing'"
                  @click="previewSection(section.key)"
                >
                  Preview
                </UButton>
                <UButton
                  size="xs"
                  variant="soft"
                  color="primary"
                  icon="i-heroicons-arrow-right-circle"
                  :to="section.to"
                >
                  Edit
                </UButton>
                <UButton
                  size="xs"
                  variant="soft"
                  color="primary"
                  icon="i-heroicons-document-arrow-down"
                  :disabled="section.status === 'missing'"
                  :loading="loadingSection === section.key"
                  @click="generateSection(section.key)"
                >
                  Generate
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </UCard>

      <UCard class="lg:col-span-2">
        <template #header>
          <div class="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Preview</p>
              <h3 class="text-lg font-semibold">Document Preview</h3>
            </div>
            <div class="flex gap-2">
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

        <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 min-h-[280px]">
          <div v-if="previewContent" v-html="previewContent" class="prose prose-sm dark:prose-invert max-w-none"></div>
          <div v-else class="text-sm text-gray-500">
            No preview yet. Click "Preview All" or a section Preview to see content.
          </div>
        </div>
      </UCard>
    </div>

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

    <div v-else class="text-center py-12 text-gray-500">
      <div class="text-5xl mb-4">📄</div>
      <p class="text-lg font-medium">No documents generated yet</p>
      <p class="text-sm mt-2">Fill out the sections and click Generate to create documents</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const workspaceService = useDocumentWorkspace()
const toast = useToast()

const workspace = ref(workspaceService.loadDocumentWorkspace())
const loading = ref(false)
const loadingSection = ref('')
const error = ref('')
const success = ref('')
const generatedFiles = ref<Array<{ filename: string; path: string; timestamp: string; section: string }>>([])
const previewContent = ref('')

const userId = 'demo-user'

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

// Helper function to strip HTML tags
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

// Helper function to check if string has content
function hasContent(value: any): boolean {
  if (!value) return false
  if (typeof value === 'string') {
    const stripped = stripHtml(value)
    return stripped.length > 0
  }
  return false
}

// Status calculation for Cover section
const coverStatus = computed(() => {
  const cover = workspace.value.cover
  const fields = {
    deviceName: cover.deviceName,
    deviceDescription: cover.deviceDescription,
    versionNumber: cover.versionNumber,
    revisionDate: cover.revisionDate,
    labName: cover.labName,
    labAddress: cover.labAddress
  }
  
  const filledCount = Object.values(fields).filter(v => hasContent(v)).length
  const totalCount = Object.keys(fields).length
  
  if (filledCount === 0) return { status: 'missing' as const, filled: 0, total: totalCount }
  if (filledCount === totalCount) return { status: 'done' as const, filled: filledCount, total: totalCount }
  return { status: 'partial' as const, filled: filledCount, total: totalCount }
})

// Status calculation for Introduction section
const introductionStatus = computed(() => {
  const intro = workspace.value.introduction
  const fields = {
    productName: intro.productName,
    productVersion: intro.productVersion,
    productType: intro.productType,
    manufacturerName: intro.manufacturerName,
    manufacturerAddress: intro.manufacturerAddress,
    status: intro.status,
    preparedBy: intro.preparedBy,
    reviewedBy: intro.reviewedBy,
    approvedBy: intro.approvedBy
  }
  
  const filledCount = Object.values(fields).filter(v => hasContent(v)).length
  const totalCount = Object.keys(fields).length
  
  if (filledCount === 0) return { status: 'missing' as const, filled: 0, total: totalCount }
  if (filledCount === totalCount) return { status: 'done' as const, filled: filledCount, total: totalCount }
  return { status: 'partial' as const, filled: filledCount, total: totalCount }
})

// Status calculation for Standards Conformance section
const standardsConformanceStatus = computed(() => {
  const standards = workspace.value.conformanceClaim.standardsConformance
  const hasRelated = standards.relatedStandards.length > 0
  const hasPrimary = hasContent(standards.primaryStandard.code)
  
  const filled = (hasPrimary ? 1 : 0) + (hasRelated ? 1 : 0)
  const total = 2
  
  if (filled === 0) return { status: 'missing' as const, filled: 0, total }
  if (filled === total) return { status: 'done' as const, filled, total }
  return { status: 'partial' as const, filled, total }
})

// Status calculation for Regulatory Conformance section
const regulatoryConformanceStatus = computed(() => {
  const regulatory = workspace.value.conformanceClaim.regulatoryConformance
  const hasRegulations = regulatory.additionalRegulations.length > 0
  
  const filled = hasRegulations ? 1 : 0
  const total = 1
  
  if (filled === 0) return { status: 'missing' as const, filled: 0, total }
  return { status: 'done' as const, filled, total }
})

// Status calculation for Conformance Level section
const conformanceLevelStatus = computed(() => {
  const level = workspace.value.conformanceClaim.conformanceLevel
  const hasStatuses = level.statuses.length > 0
  const hasJustification = hasContent(level.justificationHtml)
  
  const filled = (hasStatuses ? 1 : 0) + (hasJustification ? 1 : 0)
  const total = 2
  
  if (filled === 0) return { status: 'missing' as const, filled: 0, total }
  if (filled === total) return { status: 'done' as const, filled, total }
  return { status: 'partial' as const, filled, total }
})

// Section statuses with summaries
const sectionStatuses = computed(() => ({
  cover: {
    status: coverStatus.value.status,
    summary: `${coverStatus.value.filled} of ${coverStatus.value.total} fields completed`
  },
  introduction: {
    status: introductionStatus.value.status,
    summary: `${introductionStatus.value.filled} of ${introductionStatus.value.total} fields completed`
  },
  standardsConformance: {
    status: standardsConformanceStatus.value.status,
    summary: `${standardsConformanceStatus.value.filled} of ${standardsConformanceStatus.value.total} items completed`
  },
  regulatoryConformance: {
    status: regulatoryConformanceStatus.value.status,
    summary: workspace.value.conformanceClaim.regulatoryConformance.additionalRegulations.length > 0 
      ? `${workspace.value.conformanceClaim.regulatoryConformance.additionalRegulations.length} regulations added`
      : 'No regulations added yet'
  },
  conformanceLevel: {
    status: conformanceLevelStatus.value.status,
    summary: workspace.value.conformanceClaim.conformanceLevel.statuses.length > 0
      ? `Status: ${workspace.value.conformanceClaim.conformanceLevel.statuses.join(', ')}`
      : 'No conformance level declared'
  }
}))

const allMissing = computed(() => {
  return Object.values(sectionStatuses.value).every((s) => s.status === 'missing')
})

// Calculate completion percentage
const completionPercentage = computed(() => {
  const cover = coverStatus.value
  const intro = introductionStatus.value
  const standards = standardsConformanceStatus.value
  const regulatory = regulatoryConformanceStatus.value
  const level = conformanceLevelStatus.value
  
  const totalFilled = cover.filled + intro.filled + standards.filled + regulatory.filled + level.filled
  const totalFields = cover.total + intro.total + standards.total + regulatory.total + level.total
  
  return totalFields > 0 ? Math.round((totalFilled / totalFields) * 100) : 0
})

const sectionList = computed(() => [
  {
    key: 'cover',
    title: 'Cover Page',
    description: 'Device metadata, versioning, and lab details.',
    status: sectionStatuses.value.cover.status,
    summary: sectionStatuses.value.cover.summary,
    to: '/document/cover'
  },
  {
    key: 'introduction',
    title: 'Introduction',
    description: 'Product identification, manufacturer, and responsible parties.',
    status: sectionStatuses.value.introduction.status,
    summary: sectionStatuses.value.introduction.summary,
    to: '/document/introduction'
  },
  {
    key: 'standardsConformance',
    title: '3.1 Standards Conformance',
    description: 'Primary and related standards applied to the product.',
    status: sectionStatuses.value.standardsConformance.status,
    summary: sectionStatuses.value.standardsConformance.summary,
    to: '/conformance/standards'
  },
  {
    key: 'regulatoryConformance',
    title: '3.2 Regulatory Conformance',
    description: 'CRA and other applicable regulations.',
    status: sectionStatuses.value.regulatoryConformance.status,
    summary: sectionStatuses.value.regulatoryConformance.summary,
    to: '/conformance/regulatory'
  },
  {
    key: 'conformanceLevel',
    title: '3.3 Conformance Level',
    description: 'Overall conformance status and justification.',
    status: sectionStatuses.value.conformanceLevel.status,
    summary: sectionStatuses.value.conformanceLevel.summary,
    to: '/conformance/level'
  }
])

const lastUpdatedLabel = computed(() => {
  const value = workspace.value.lastUpdated
  if (!value) return 'Not set'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
})

// Get status color for badges
function getStatusColor(status: string): string {
  switch (status) {
    case 'done': return 'green'
    case 'partial': return 'orange'
    case 'missing': return 'red'
    default: return 'gray'
  }
}

// Get border color for section cards
function getSectionBorderColor(section: any): string {
  switch (section.status) {
    case 'done': return 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950'
    case 'partial': return 'border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-950'
    case 'missing': return 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950'
    default: return 'border-gray-300 dark:border-gray-700'
  }
}

// Preview section content
function previewSection(section: string) {
  let html = ''
  
  if (section === 'cover') {
    html = `
      <div style="text-align: center; margin-bottom: 2rem;">
        <h1 style="font-size: 2rem; font-weight: bold; margin-bottom: 1rem;">CRA Documentation</h1>
        <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">${workspace.value.cover.deviceName || 'Untitled Device'}</h2>
        <p style="margin-bottom: 0.5rem;">${workspace.value.cover.deviceDescription || 'No description provided'}</p>
      </div>
      <div style="margin-top: 2rem;">
        <p><strong>Version:</strong> ${workspace.value.cover.versionNumber || 'N/A'}</p>
        <p><strong>Revision Date:</strong> ${workspace.value.cover.revisionDate || 'N/A'}</p>
        <p><strong>Laboratory:</strong> ${workspace.value.cover.labName || 'N/A'}</p>
        <p><strong>Laboratory Address:</strong> ${workspace.value.cover.labAddress || 'N/A'}</p>
      </div>
    `
  } else if (section === 'introduction') {
    html = `
      <h1 style="font-size: 1.75rem; font-weight: bold; margin-bottom: 1rem;">1. Introduction</h1>
      <h2 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 0.75rem;">1.1 Product Information</h2>
      <p><strong>Product Name:</strong> ${workspace.value.introduction.productName || 'N/A'}</p>
      <p><strong>Version:</strong> ${workspace.value.introduction.productVersion || 'N/A'}</p>
      <p><strong>Type:</strong> ${workspace.value.introduction.productType || 'N/A'}</p>
      <h2 style="font-size: 1.25rem; font-weight: 600; margin: 1rem 0 0.75rem;">1.2 Manufacturer Information</h2>
      <p><strong>Manufacturer:</strong> ${workspace.value.introduction.manufacturerName || 'N/A'}</p>
      <p><strong>Address:</strong> ${workspace.value.introduction.manufacturerAddress || 'N/A'}</p>
      <h2 style="font-size: 1.25rem; font-weight: 600; margin: 1rem 0 0.75rem;">1.3 Document Control</h2>
      <p><strong>Status:</strong> ${workspace.value.introduction.status || 'N/A'}</p>
      <p><strong>Prepared By:</strong> ${workspace.value.introduction.preparedBy || 'N/A'}</p>
      <p><strong>Reviewed By:</strong> ${workspace.value.introduction.reviewedBy || 'N/A'}</p>
      <p><strong>Approved By:</strong> ${workspace.value.introduction.approvedBy || 'N/A'}</p>
    `
  } else if (section === 'standardsConformance') {
    const standards = workspace.value.conformanceClaim.standardsConformance
    const relatedList = standards.relatedStandards.map(s => 
      `<li><strong>${s.code}:</strong> ${s.description}</li>`
    ).join('')
    
    html = `
      <h1 style="font-size: 1.75rem; font-weight: bold; margin-bottom: 1rem;">3. Conformance Claim</h1>
      <h2 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 0.75rem;">3.1 Standards Conformance</h2>
      
      <h3 style="font-size: 1.1rem; font-weight: 600; margin: 1rem 0 0.5rem;">Primary Standard</h3>
      <p><strong>${standards.primaryStandard.code || 'EN 40000-1-2-2025'}</strong></p>
      <p>${standards.primaryStandard.description || 'Cybersecurity requirements for products with digital elements - Part 1-2: Principles for cyber resilience'}</p>
      
      <h3 style="font-size: 1.1rem; font-weight: 600; margin: 1rem 0 0.5rem;">Related Standards Applied</h3>
      ${relatedList ? `<ul style="margin-left: 1.5rem;">${relatedList}</ul>` : '<p style="font-style: italic; color: #666;">No related standards added yet.</p>'}
    `
  } else if (section === 'regulatoryConformance') {
    const regulatory = workspace.value.conformanceClaim.regulatoryConformance
    const regList = regulatory.additionalRegulations.map(r => 
      `<li><strong>${r.regulation}:</strong> ${r.description}</li>`
    ).join('')
    
    html = `
      <h1 style="font-size: 1.75rem; font-weight: bold; margin-bottom: 1rem;">3. Conformance Claim</h1>
      <h2 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 0.75rem;">3.2 Regulatory Conformance</h2>
      
      <p style="margin-bottom: 0.5rem;">This product is intended to conform to the essential cybersecurity requirements of:</p>
      <ul style="margin-left: 1.5rem; margin-bottom: 1rem;">
        <li>Regulation (EU) 2024/2847 - Cyber Resilience Act (CRA)</li>
        <li>Annex I Part I (1) - General design, development, and production requirements</li>
        <li>Annex I Part I (2) - Specific cybersecurity requirements</li>
        <li>Annex I Part II - Vulnerability handling requirements</li>
      </ul>
      
      <h3 style="font-size: 1.1rem; font-weight: 600; margin: 1rem 0 0.5rem;">Other Applicable Regulations</h3>
      ${regList ? `<ul style="margin-left: 1.5rem;">${regList}</ul>` : '<p style="font-style: italic; color: #666;">No additional regulations added yet.</p>'}
    `
  } else if (section === 'conformanceLevel') {
    const level = workspace.value.conformanceClaim.conformanceLevel
    const statusList = level.statuses.map(s => {
      const labels: Record<string, string> = {
        'full': 'Full Conformance',
        'partial': 'Partial Conformance',
        'non': 'Non-Conformance'
      }
      return labels[s] || s
    }).join(', ')
    
    html = `
      <h1 style="font-size: 1.75rem; font-weight: bold; margin-bottom: 1rem;">3. Conformance Claim</h1>
      <h2 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 0.75rem;">3.3 Conformance Level</h2>
      
      <p><strong>Conformance Status:</strong> ${statusList || 'Not declared'}</p>
      
      ${level.justificationHtml ? `
        <h3 style="font-size: 1.1rem; font-weight: 600; margin: 1rem 0 0.5rem;">Justification</h3>
        <div style="border-left: 3px solid #3b82f6; padding-left: 1rem; margin: 1rem 0;">
          ${level.justificationHtml}
        </div>
      ` : '<p style="font-style: italic; color: #666; margin-top: 1rem;">No justification provided yet.</p>'}
    `
  }
  
  previewContent.value = html
  
  toast.add({
    title: 'Preview Loaded',
    description: `Previewing ${section} section`,
    color: 'blue',
    icon: 'i-heroicons-eye'
  })
}

function buildFullPreview() {
  const coverHtml = `
    <div style="text-align: center; margin-bottom: 2rem;">
      <h1 style="font-size: 2rem; font-weight: bold; margin-bottom: 1rem;">CRA Documentation</h1>
      <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">${workspace.value.cover.deviceName || 'Untitled Device'}</h2>
      <p style="margin-bottom: 0.5rem;">${workspace.value.cover.deviceDescription || 'No description provided'}</p>
    </div>
    <p><strong>Version:</strong> ${workspace.value.cover.versionNumber || 'N/A'}</p>
    <p><strong>Revision Date:</strong> ${workspace.value.cover.revisionDate || 'N/A'}</p>
    <p><strong>Laboratory:</strong> ${workspace.value.cover.labName || 'N/A'}</p>
    <p><strong>Laboratory Address:</strong> ${workspace.value.cover.labAddress || 'N/A'}</p>
  `

  const introHtml = `
    <h1 style="font-size: 1.75rem; font-weight: bold; margin-top: 2rem; margin-bottom: 1rem;">1. Introduction</h1>
    <h2 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 0.75rem;">1.1 Product Information</h2>
    <p><strong>Product Name:</strong> ${workspace.value.introduction.productName || 'N/A'}</p>
    <p><strong>Version:</strong> ${workspace.value.introduction.productVersion || 'N/A'}</p>
    <p><strong>Type:</strong> ${workspace.value.introduction.productType || 'N/A'}</p>
    <h2 style="font-size: 1.25rem; font-weight: 600; margin: 1rem 0 0.75rem;">1.2 Manufacturer Information</h2>
    <p><strong>Manufacturer:</strong> ${workspace.value.introduction.manufacturerName || 'N/A'}</p>
    <p><strong>Address:</strong> ${workspace.value.introduction.manufacturerAddress || 'N/A'}</p>
    <h2 style="font-size: 1.25rem; font-weight: 600; margin: 1rem 0 0.75rem;">1.3 Document Control</h2>
    <p><strong>Status:</strong> ${workspace.value.introduction.status || 'N/A'}</p>
    <p><strong>Prepared By:</strong> ${workspace.value.introduction.preparedBy || 'N/A'}</p>
    <p><strong>Reviewed By:</strong> ${workspace.value.introduction.reviewedBy || 'N/A'}</p>
    <p><strong>Approved By:</strong> ${workspace.value.introduction.approvedBy || 'N/A'}</p>
  `

  previewContent.value = coverHtml + '<hr style="margin: 2rem 0;" />' + introHtml

  toast.add({
    title: 'Preview Updated',
    description: 'Combined preview refreshed.',
    color: 'blue',
    icon: 'i-heroicons-eye'
  })
}

async function generateSection(section: string) {
  loadingSection.value = section
  error.value = ''
  success.value = ''

  try {
    let htmlContent = ''
    let sectionName = ''
    
    if (section === 'cover') {
      sectionName = 'Cover Page'
      htmlContent = `
        <div style="text-align: center;">
          <h1>${workspace.value.cover.deviceName || 'Untitled Device'}</h1>
          <p>${workspace.value.cover.deviceDescription || 'No description provided'}</p>
        </div>
        <p><strong>Version:</strong> ${workspace.value.cover.versionNumber || 'N/A'}</p>
        <p><strong>Revision Date:</strong> ${workspace.value.cover.revisionDate || 'N/A'}</p>
        <p><strong>Lab:</strong> ${workspace.value.cover.labName || 'N/A'}</p>
        <p><strong>Address:</strong> ${workspace.value.cover.labAddress || 'N/A'}</p>
      `
    } else if (section === 'introduction') {
      sectionName = 'Introduction'
      htmlContent = `
        <h1>Introduction</h1>
        <h2>Product Information</h2>
        <p><strong>Product Name:</strong> ${workspace.value.introduction.productName || 'N/A'}</p>
        <p><strong>Version:</strong> ${workspace.value.introduction.productVersion || 'N/A'}</p>
        <p><strong>Type:</strong> ${workspace.value.introduction.productType || 'N/A'}</p>
        <h2>Manufacturer Information</h2>
        <p><strong>Manufacturer:</strong> ${workspace.value.introduction.manufacturerName || 'N/A'}</p>
        <p><strong>Address:</strong> ${workspace.value.introduction.manufacturerAddress || 'N/A'}</p>
        <h2>Document Status</h2>
        <p><strong>Status:</strong> ${workspace.value.introduction.status || 'N/A'}</p>
        <p><strong>Prepared By:</strong> ${workspace.value.introduction.preparedBy || 'N/A'}</p>
        <p><strong>Reviewed By:</strong> ${workspace.value.introduction.reviewedBy || 'N/A'}</p>
        <p><strong>Approved By:</strong> ${workspace.value.introduction.approvedBy || 'N/A'}</p>
      `
    }

    const response = await $fetch('http://localhost:8000/api/preview/st-intro/preview', {
      method: 'POST',
      body: {
        user_id: userId,
        htmlContent: htmlContent
      }
    })

    if (response.status === 'ready') {
      generatedFiles.value.unshift({
        filename: `${sectionName.replace(/\s+/g, '_')}_${response.filename}`,
        path: `/api/preview${response.path}`,
        timestamp: new Date().toLocaleString(),
        section: section
      })
      success.value = `${sectionName} generated successfully!`
      
      toast.add({
        title: 'Document Generated',
        description: `${sectionName} has been generated successfully.`,
        color: 'green',
        icon: 'i-heroicons-check-circle'
      })
      
      setTimeout(() => success.value = '', 3000)
    }
  } catch (e: any) {
    error.value = `Error: ${e.message || 'Failed to generate document'}`
    toast.add({
      title: 'Generation Failed',
      description: error.value,
      color: 'red',
      icon: 'i-heroicons-x-circle'
    })
  } finally {
    loadingSection.value = ''
  }
}

async function generateFullDocument() {
  loading.value = true
  error.value = ''
  success.value = ''

  try {
    const coverHtml = `
      <h1 style="text-align: center">CRA Documentation</h1>
      <h2 style="text-align: center">${workspace.value.cover.deviceName || 'Untitled Device'}</h2>
      <p style="text-align: center">${workspace.value.cover.deviceDescription || 'No description provided'}</p>
      <p><strong>Version:</strong> ${workspace.value.cover.versionNumber || 'N/A'}</p>
      <p><strong>Revision Date:</strong> ${workspace.value.cover.revisionDate || 'N/A'}</p>
      <p><strong>Laboratory:</strong> ${workspace.value.cover.labName || 'N/A'}</p>
      <p><strong>Laboratory Address:</strong> ${workspace.value.cover.labAddress || 'N/A'}</p>
    `
    
    const introHtml = `
      <h1>1. Introduction</h1>
      <h2>1.1 Product Information</h2>
      <p><strong>Product Name:</strong> ${workspace.value.introduction.productName || 'N/A'}</p>
      <p><strong>Version:</strong> ${workspace.value.introduction.productVersion || 'N/A'}</p>
      <p><strong>Type:</strong> ${workspace.value.introduction.productType || 'N/A'}</p>
      <h2>1.2 Manufacturer Information</h2>
      <p><strong>Manufacturer:</strong> ${workspace.value.introduction.manufacturerName || 'N/A'}</p>
      <p><strong>Address:</strong> ${workspace.value.introduction.manufacturerAddress || 'N/A'}</p>
      <h2>1.3 Document Control</h2>
      <p><strong>Status:</strong> ${workspace.value.introduction.status || 'N/A'}</p>
      <p><strong>Prepared By:</strong> ${workspace.value.introduction.preparedBy || 'N/A'}</p>
      <p><strong>Reviewed By:</strong> ${workspace.value.introduction.reviewedBy || 'N/A'}</p>
      <p><strong>Approved By:</strong> ${workspace.value.introduction.approvedBy || 'N/A'}</p>
    `
    
    const fullHtml = coverHtml + '<div style="page-break-after: always;"></div>' + introHtml

    const response = await $fetch('http://localhost:8000/api/preview/st-intro/preview', {
      method: 'POST',
      body: {
        user_id: userId,
        htmlContent: fullHtml
      }
    })

    if (response.status === 'ready') {
      generatedFiles.value.unshift({
        filename: `Full_Document_${response.filename}`,
        path: `/api/preview${response.path}`,
        timestamp: new Date().toLocaleString(),
        section: 'full'
      })
      success.value = 'Full document generated successfully!'
      
      toast.add({
        title: 'Document Generated',
        description: 'Full CRA document has been generated successfully.',
        color: 'green',
        icon: 'i-heroicons-check-circle'
      })
      
      setTimeout(() => success.value = '', 3000)
    }
  } catch (e: any) {
    error.value = `Error: ${e.message || 'Failed to generate full document'}`
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
</script>
