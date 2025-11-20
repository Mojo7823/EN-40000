<template>
  <div class="card">
    <h2>XML Parser</h2>
    <p>Upload and parse CRA (Cyber Resilience Act) XML files</p>
    
    <!-- File Upload Section -->
    <div class="upload-section">
      <h3>Upload XML File</h3>
      <div class="file-input-wrapper">
        <input
          type="file"
          ref="fileInput"
          @change="handleFileSelect"
          accept=".xml"
          class="file-input"
        />
        <button @click="triggerFileInput" class="btn btn-primary">
          Choose XML File
        </button>
        <span v-if="selectedFile" class="selected-file">
          {{ selectedFile.name }}
        </span>
      </div>
      
      <div class="action-buttons">
        <button
          @click="parseXml"
          :disabled="!selectedFile || isLoading"
          class="btn btn-success"
        >
          {{ isLoading ? 'Parsing...' : 'Parse XML' }}
        </button>
        <button
          @click="importToDatabase"
          :disabled="!selectedFile || isLoading"
          class="btn btn-info"
        >
          {{ isLoading ? 'Importing...' : 'Parse & Import to Database' }}
        </button>
      </div>
    </div>

    <!-- Status Messages -->
    <div v-if="statusMessage" :class="['status-message', statusType]">
      {{ statusMessage }}
    </div>

    <!-- Modal for notifications -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ modalTitle }}</h3>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="modalType === 'success'" class="modal-icon success">✓</div>
          <div v-else-if="modalType === 'error'" class="modal-icon error">✗</div>
          <div v-else class="modal-icon info">ℹ</div>
          <p>{{ modalMessage }}</p>
          <div v-if="modalDetails" class="modal-details">
            <details>
              <summary>Details</summary>
              <pre>{{ modalDetails }}</pre>
            </details>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeModal" class="modal-btn">OK</button>
        </div>
      </div>
    </div>

    <!-- Parsed XML Tree View -->
    <div v-if="parsedData" class="parsed-data-section">
      <h3>Parsed XML Structure</h3>
      <div class="tree-container">
        <XMLTreeNode :node="parsedData" :level="0" />
      </div>
    </div>

    <!-- Components Preview -->
    <div v-if="extractedComponents && extractedComponents.length > 0" class="components-section">
      <h3>Extracted Components ({{ extractedComponents.length }})</h3>
      
      <div class="data-table-wrapper">
        <DataTable
          :value="extractedComponents"
          :rows="componentsRowsPerPage"
          :paginator="extractedComponents.length > componentsRowsPerPage"
          :rowsPerPageOptions="rowsPerPageOptions"
          paginatorTemplate="RowsPerPageDropdown PrevPageLink PageLinks NextPageLink"
          scrollable
          scrollHeight="400px"
          responsiveLayout="scroll"
          class="prime-table"
          stripedRows
        >
          <Column header="#" :style="{ width: '70px' }">
            <template #body="{ index }">
              <span class="row-index">{{ index + 1 }}</span>
            </template>
          </Column>
          <Column field="id" header="ID" :style="{ width: '100px' }" sortable />
          <Column field="class" header="Class" :style="{ width: '120px' }" sortable />
          <Column field="family" header="Family" :style="{ width: '120px' }" sortable />
          <Column field="component" header="Component" :style="{ width: '150px' }" sortable />
          <Column field="component_name" header="Component Name" :style="{ width: '260px' }" sortable>
            <template #body="{ data }">
              <span class="component-name-cell">{{ data.component_name }}</span>
            </template>
          </Column>
          <Column field="element" header="Element" :style="{ width: '150px' }" sortable />
          <Column field="element_item" header="Element Item" :style="{ width: '320px' }">
            <template #body="{ data }">
              <span class="element-item-cell">{{ data.element_item }}</span>
            </template>
          </Column>

          <template #empty>
            <p>No components were extracted from the selected XML file.</p>
          </template>
        </DataTable>
      </div>
      
      <!-- Import Summary -->
      <div v-if="importSummary" class="import-summary">
        <h4>Import Summary</h4>
        <div class="summary-grid">
          <div class="summary-item">
            <span class="label">Components Imported:</span>
            <span class="value">{{ importSummary.components_imported }}</span>
          </div>
          <div class="summary-item">
            <span class="label">Components Failed:</span>
            <span class="value">{{ importSummary.components_failed }}</span>
          </div>
          <div v-if="importSummary.tables_used" class="summary-item">
            <span class="label">Tables Used:</span>
            <span class="value">{{ importSummary.tables_used.join(', ') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import api from '../../services/api'
import XMLTreeNode from '../XMLTreeNode.vue'
// @ts-ignore
import DataTable from 'primevue/datatable'
// @ts-ignore
import Column from 'primevue/column'

// Reactive data
const fileInput = ref<HTMLInputElement>()
const selectedFile = ref<File | null>(null)
const isLoading = ref(false)
const statusMessage = ref('')
const statusType = ref<'success' | 'error' | 'info'>('info')
const parsedData = ref<any>(null)
const extractedComponents = ref<any[]>([])
const importSummary = ref<any>(null)
const componentsRowsPerPage = 15
const rowsPerPageOptions = [10, 25, 50, 100]

// Modal data
const showModal = ref(false)
const modalTitle = ref('')
const modalMessage = ref('')
const modalDetails = ref('')
const modalType = ref<'success' | 'error' | 'info'>('info')

// Methods
function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    selectedFile.value = files[0]
    // Reset previous results
    parsedData.value = null
    extractedComponents.value = []
    statusMessage.value = ''
  }
}

function showModalNotification(title: string, message: string, type: 'success' | 'error' | 'info', details: string = '') {
  modalTitle.value = title
  modalMessage.value = message
  modalType.value = type
  modalDetails.value = details
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function parseXml() {
  if (!selectedFile.value) return

  isLoading.value = true
  statusMessage.value = ''

  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)

    const response = await api.post('/xml/parse', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    if (response.data.success) {
      parsedData.value = response.data.data
      extractedComponents.value = response.data.components || []
      statusMessage.value = `Successfully parsed XML file. Found ${extractedComponents.value.length} components.`
      statusType.value = 'success'
      
      // Show success modal
      showModalNotification(
        'Parsing Complete',
        `Successfully parsed XML file. Found ${extractedComponents.value.length} components.`,
        'success'
      )
    } else {
      statusMessage.value = response.data.message || 'Failed to parse XML file'
      statusType.value = 'error'
      
      // Show error modal
      showModalNotification(
        'Parsing Failed',
        response.data.message || 'Failed to parse XML file',
        'error'
      )
    }
  } catch (error: any) {
    console.error('Error parsing XML:', error)
    const errorMessage = error.response?.data?.detail || 'Error parsing XML file'
    statusMessage.value = errorMessage
    statusType.value = 'error'
    
    // Show error modal
    showModalNotification(
      'Parsing Error',
      'An error occurred while parsing the XML file.',
      'error',
      JSON.stringify(error.response?.data || error.message, null, 2)
    )
  } finally {
    isLoading.value = false
  }
}

async function importToDatabase() {
  if (!selectedFile.value) return

  isLoading.value = true
  statusMessage.value = ''
  importSummary.value = null

  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)

    const response = await api.post('/xml/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    if (response.data.success) {
      importSummary.value = response.data
      statusMessage.value = `${response.data.message}. Imported: ${response.data.components_imported}, Failed: ${response.data.components_failed}`
      statusType.value = 'success'
      
      // Show success modal
      showModalNotification(
        'Import Complete',
        `Successfully imported XML data to database.`,
        'success',
        `Components imported: ${response.data.components_imported}\nComponents failed: ${response.data.components_failed}`
      )
      
      // Also parse to show the structure
      await parseXml()
    } else {
      statusMessage.value = response.data.message || 'Failed to import XML file'
      statusType.value = 'error'
      
      // Show error modal
      showModalNotification(
        'Import Failed',
        response.data.message || 'Failed to import XML file',
        'error'
      )
    }
  } catch (error: any) {
    console.error('Error importing XML:', error)
    const errorMessage = error.response?.data?.detail || 'Error importing XML file'
    statusMessage.value = errorMessage
    statusType.value = 'error'
    
    // Show error modal
    showModalNotification(
      'Import Error',
      'An error occurred while importing the XML file to database.',
      'error',
      JSON.stringify(error.response?.data || error.message, null, 2)
    )
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped src="./XmlParserPanel.css"></style>
