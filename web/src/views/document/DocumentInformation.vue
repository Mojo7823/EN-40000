<template>
  <div class="introduction-page">
    <section class="card title-card">
      <div>
        <p class="eyebrow">Introduction</p>
        <h1>Document Information</h1>
        <p class="muted">
          Capture the product-identification details that populate section 1.1 of the CRA documentation.
        </p>
      </div>
      <div class="title-card-actions">
        <RouterLink class="btn ghost" to="/document/preview">Go to Document Preview</RouterLink>
      </div>
    </section>

    <section class="card form-card">
      <form class="introduction-form" @submit.prevent>
        <label class="field">
          <span>Product Name</span>
          <input v-model="form.productName" type="text" placeholder="Product Name" />
        </label>

        <label class="field">
          <span>Product Version</span>
          <input v-model="form.productVersion" type="text" placeholder="Version" />
        </label>

        <label class="field">
          <span>Product Type / Category</span>
          <input v-model="form.productType" type="text" placeholder="Type or category" />
        </label>

        <label class="field">
          <span>Manufacturer</span>
          <input v-model="form.manufacturerName" type="text" placeholder="Manufacturer" />
        </label>

        <label class="field">
          <span>Manufacturer Address</span>
          <textarea
            v-model="form.manufacturerAddress"
            rows="2"
            placeholder="Street, City, Country"
          ></textarea>
        </label>

        <label class="field">
          <span>Status</span>
          <select v-model="selectedStatus">
            <option v-for="option in statusOptions" :key="option" :value="option">{{ option }}</option>
          </select>
        </label>

        <label class="field">
          <span>Prepared By</span>
          <textarea v-model="form.preparedBy" rows="3" placeholder="Name(s)"></textarea>
        </label>

        <label class="field">
          <span>Reviewed By</span>
          <textarea v-model="form.reviewedBy" rows="3" placeholder="Name(s)"></textarea>
        </label>

        <label class="field">
          <span>Approved By</span>
          <input v-model="form.approvedBy" type="text" placeholder="Name" />
        </label>
      </form>
    </section>

    <div v-if="showStatusModal" class="status-modal-overlay" @click="closeStatusModal(false)">
      <div
        class="status-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="statusModalTitle"
        @click.stop
      >
        <header class="status-modal-header">
          <h2 id="statusModalTitle">Custom Status</h2>
          <button class="modal-close" type="button" aria-label="Close dialog" @click="closeStatusModal(false)">
            ×
          </button>
        </header>
        <div class="status-modal-body">
          <p class="muted">Enter a custom status label for this documentation phase.</p>
          <input v-model="customStatus" type="text" placeholder="e.g., Pilot Review" />
        </div>
        <footer class="status-modal-footer">
          <button class="btn" type="button" @click="closeStatusModal(false)">Cancel</button>
          <button class="btn primary" type="button" @click="closeStatusModal(true)">Save</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import {
  loadDocumentWorkspace,
  subscribeDocumentWorkspace,
  type DocumentWorkspaceState,
  type IntroductionFormState,
  updateIntroductionState,
} from '../../services/documentWorkspace'

const initialState = loadDocumentWorkspace()
const form = reactive<IntroductionFormState>({ ...initialState.introduction })
const suppressNextSync = ref(false)
let unsubscribe: (() => void) | null = null
const statusOptions = ['Draft', 'Final', 'Revision', 'Custom Status'] as const
const showStatusModal = ref(false)
const customStatus = ref('')
const selectedStatus = ref(getInitialStatus())
let suppressStatusReaction = true
if (!form.status) {
  form.status = selectedStatus.value
}
setTimeout(() => {
  suppressStatusReaction = false
}, 0)

function getInitialStatus() {
  const value = form.status?.trim()
  if (!value) {
    return statusOptions[0]
  }
  if (statusOptions.includes(value as typeof statusOptions[number])) {
    return value as typeof statusOptions[number]
  }
  customStatus.value = value
  return 'Custom Status'
}

watch(
  form,
  (value) => {
    if (suppressNextSync.value) {
      suppressNextSync.value = false
      return
    }
    updateIntroductionState({ ...value })
  },
  { deep: true }
)

watch(selectedStatus, (value) => {
  if (suppressStatusReaction) {
    return
  }
  if (value === 'Custom Status') {
    customStatus.value = form.status && !statusOptions.includes(form.status as any) ? form.status : ''
    showStatusModal.value = true
    return
  }
  form.status = value
})

function applyExternalState(state: DocumentWorkspaceState) {
  suppressNextSync.value = true
  Object.assign(form, state.introduction)
  safelySetSelectedStatus(getInitialStatus())
}

onMounted(() => {
  unsubscribe = subscribeDocumentWorkspace(applyExternalState)
})

onUnmounted(() => {
  unsubscribe?.()
})

function closeStatusModal(save: boolean) {
  if (save) {
    const value = customStatus.value.trim()
    if (!value) {
      return
    }
    form.status = value
    safelySetSelectedStatus('Custom Status')
    showStatusModal.value = false
    return
  }

  if (form.status && !statusOptions.includes(form.status as any)) {
    safelySetSelectedStatus('Custom Status')
  } else if (form.status) {
    safelySetSelectedStatus(form.status as typeof statusOptions[number])
  } else {
    form.status = statusOptions[0]
    safelySetSelectedStatus(statusOptions[0])
  }
  showStatusModal.value = false
}

function safelySetSelectedStatus(value: (typeof statusOptions)[number]) {
  suppressStatusReaction = true
  selectedStatus.value = value
  setTimeout(() => {
    suppressStatusReaction = false
  }, 0)
}
</script>

<style scoped src="./DocumentInformation.css"></style>
