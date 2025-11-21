<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        DOCX Generation Demo
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mb-8">
        Test the DOCX generation system with HTML content
      </p>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Input Section -->
        <UCard>
          <template #header>
            <h2 class="text-xl font-semibold">HTML Content</h2>
          </template>

          <ClientOnly>
            <RichTextEditor
              v-model="htmlContent"
              placeholder="Enter your content here..."
              min-height="400px"
            />
          </ClientOnly>

          <template #footer>
            <div class="flex gap-2">
              <UButton 
                @click="generateDocx" 
                :loading="loading"
                color="primary"
                icon="i-heroicons-document-arrow-down"
              >
                Generate DOCX
              </UButton>
              <UButton 
                @click="loadSample" 
                variant="soft"
                color="gray"
              >
                Load Sample
              </UButton>
              <UButton 
                @click="clearContent" 
                variant="ghost"
                color="red"
              >
                Clear
              </UButton>
            </div>
          </template>
        </UCard>

        <!-- Output Section -->
        <UCard>
          <template #header>
            <h2 class="text-xl font-semibold">Generated Documents</h2>
          </template>

          <div v-if="generatedFiles.length === 0" class="text-center py-12 text-gray-500">
            <div class="text-5xl mb-4">📄</div>
            <p>No documents generated yet</p>
            <p class="text-sm">Generate a DOCX to see it here</p>
          </div>

          <div v-else class="space-y-3">
            <div 
              v-for="file in generatedFiles" 
              :key="file.filename"
              class="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
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

          <template #footer>
            <div v-if="error" class="text-red-600 text-sm">
              {{ error }}
            </div>
            <div v-if="success" class="text-green-600 text-sm">
              {{ success }}
            </div>
          </template>
        </UCard>
      </div>

      <!-- Stats -->
      <div class="mt-8 grid grid-cols-3 gap-4">
        <UCard>
          <div class="text-center">
            <div class="text-3xl font-bold text-primary">{{ generatedFiles.length }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Generated</div>
          </div>
        </UCard>
        <UCard>
          <div class="text-center">
            <div class="text-3xl font-bold text-primary">{{ htmlContent.length }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Characters</div>
          </div>
        </UCard>
        <UCard>
          <div class="text-center">
            <div class="text-3xl font-bold text-primary">
              {{ loading ? 'Generating...' : 'Ready' }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Status</div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const htmlContent = ref(`<h1>Sample Document</h1>
<p>This is a <strong>sample document</strong> with rich content.</p>
<h2>Features</h2>
<ul>
  <li>Bold and italic text</li>
  <li>Lists and headings</li>
  <li>Tables and more</li>
</ul>`)

const loading = ref(false)
const error = ref('')
const success = ref('')
const generatedFiles = ref<Array<{ filename: string; path: string; timestamp: string }>>([])

const userId = 'demo-user'

function loadSample() {
  htmlContent.value = `<h1>CRA Documentation Sample</h1>
<p>This is a comprehensive <strong>sample document</strong> for <em>Cyber Resilience Act</em> compliance.</p>

<h2>Product Overview</h2>
<p>Our product is designed with security and resilience in mind.</p>

<h3>Key Features</h3>
<ul>
  <li>Security by design</li>
  <li>Regular security updates</li>
  <li>Vulnerability disclosure process</li>
  <li>Incident response procedures</li>
</ul>

<h3>Technical Requirements</h3>
<ol>
  <li>Authentication mechanisms</li>
  <li>Encryption standards</li>
  <li>Access control policies</li>
</ol>

<h2>Risk Management</h2>
<p>We follow industry best practices for <span style="color: #ef4444">risk assessment</span> and <span style="color: #3b82f6">mitigation</span>.</p>

<p style="text-align: center"><strong>End of Sample Document</strong></p>`
}

function clearContent() {
  htmlContent.value = ''
  error.value = ''
  success.value = ''
}

async function generateDocx() {
  loading.value = true
  error.value = ''
  success.value = ''

  try {
    const response = await $fetch('http://localhost:8000/api/preview/st-intro/preview', {
      method: 'POST',
      body: {
        user_id: userId,
        htmlContent: htmlContent.value
      }
    })

    if (response.status === 'ready') {
      generatedFiles.value.unshift({
        filename: response.filename,
        path: `/api/preview${response.path}`,
        timestamp: new Date().toLocaleTimeString()
      })
      success.value = 'DOCX generated successfully!'
      setTimeout(() => success.value = '', 3000)
    }
  } catch (e: any) {
    error.value = `Error: ${e.message || 'Failed to generate DOCX'}`
  } finally {
    loading.value = false
  }
}

async function downloadFile(file: any) {
  try {
    const downloadUrl = `http://localhost:8000${file.path}`
    window.open(downloadUrl, '_blank')
    success.value = 'Download started!'
    setTimeout(() => success.value = '', 2000)
  } catch (e: any) {
    error.value = `Download failed: ${e.message}`
  }
}
</script>
