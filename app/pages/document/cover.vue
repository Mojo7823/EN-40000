<template>
  <div class="container mx-auto p-6 space-y-6">
    <UCard>
      <template #header>
        <div class="flex flex-wrap justify-between items-start gap-4">
          <div>
            <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
              Document Cover
            </p>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
              Product Cover Details
            </h1>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Provide the information that appears on the downloadable cover page. Your entries are saved automatically.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <UButton
              variant="ghost"
              color="gray"
              to="/document/preview"
              icon="i-heroicons-eye"
            >
              Preview
            </UButton>
            <UButton
              color="red"
              variant="soft"
              icon="i-heroicons-trash"
              @click="confirmReset"
            >
              Clear Fields
            </UButton>
          </div>
        </div>
      </template>
    </UCard>

    <UCard>
      <form @submit.prevent class="space-y-6">
        <UFormField label="Device Name" name="deviceName">
          <UInput
            v-model="form.deviceName"
            placeholder="Product Name"
            size="lg"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Device Description" name="deviceDescription">
          <UTextarea
            v-model="form.deviceDescription"
            :rows="4"
            placeholder="Provide a short marketing-friendly description of the device."
            size="lg"
            class="w-full"
          />
        </UFormField>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div class="md:col-span-2">
            <UFormField label="Cover Image" name="coverImage" :error="imageError">
              <div
                class="relative border-2 border-dashed rounded-lg transition-colors cursor-pointer"
                :class="[
                  dropActive 
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-950' 
                    : 'border-gray-300 dark:border-gray-700',
                  form.imageData ? 'p-0' : 'p-8'
                ]"
                @click="triggerFileSelect"
                @dragover.prevent="dropActive = true"
                @dragleave.prevent="dropActive = false"
                @drop.prevent="handleDrop"
              >
                <div v-if="!form.imageData" class="flex flex-col items-center justify-center min-h-[200px]">
                  <div class="text-5xl mb-3">🖼️</div>
                  <p class="text-base font-semibold text-gray-700 dark:text-gray-300">
                    Drag and drop cover image here
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    or click to choose a file
                  </p>
                </div>
                <div v-else class="flex flex-col">
                  <img
                    :src="form.imageData"
                    alt="Cover image preview"
                    class="w-full max-h-80 object-contain rounded-t-lg bg-gray-50 dark:bg-gray-900"
                  />
                  <div class="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700">
                    <p class="font-medium text-gray-700 dark:text-gray-300 truncate">
                      {{ form.imageName }}
                    </p>
                    <UButton
                      variant="ghost"
                      color="red"
                      size="sm"
                      icon="i-heroicons-trash"
                      @click.stop="clearImage"
                    >
                      Remove
                    </UButton>
                  </div>
                </div>
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleFileChange"
                />
              </div>
            </UFormField>
          </div>

          <UFormField label="Version Number" name="versionNumber">
            <UInput
              v-model="form.versionNumber"
              placeholder="e.g., 1.0.0"
              size="lg"
            />
          </UFormField>

          <UFormField label="Revision Date" name="revisionDate">
            <UInput
              v-model="form.revisionDate"
              type="date"
              size="lg"
            />
          </UFormField>

          <UFormField label="Lab Name" name="labName">
            <UInput
              v-model="form.labName"
              placeholder="Laboratory Name"
              size="lg"
            />
          </UFormField>

          <UFormField label="Lab Address" name="labAddress">
            <UInput
              v-model="form.labAddress"
              placeholder="Street, City, Country"
              size="lg"
            />
          </UFormField>
        </div>
      </form>
    </UCard>

    <!-- Confirm Reset Modal -->
    <UModal v-model:open="showResetModal" title="Clear All Fields?" description="Are you sure you want to clear all cover page fields? This will reset all information including the uploaded image.">
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" color="gray" @click="showResetModal = false">
            Cancel
          </UButton>
          <UButton color="red" @click="resetForm">
            Clear All Fields
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { DocumentWorkspaceState, CoverFormState } from '~/services/documentWorkspace'

const workspace = useDocumentWorkspace()
const toast = useToast()

const fileInput = ref<HTMLInputElement | null>(null)
const dropActive = ref(false)
const imageError = ref('')
const showResetModal = ref(false)
const suppressNextSync = ref(false)

const initialState = workspace.loadDocumentWorkspace()
const form = reactive<CoverFormState>({ ...initialState.cover })

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
    imageError.value = 'Please choose an image file (PNG, JPG, SVG, etc.).'
    toast.add({
      title: 'Invalid File',
      description: 'Please choose an image file (PNG, JPG, SVG, etc.).',
      color: 'red',
      icon: 'i-heroicons-x-circle'
    })
    return
  }
  
  imageError.value = ''
  const reader = new FileReader()
  reader.onload = () => {
    form.imageData = reader.result as string
    form.imageName = file.name
    form.imagePath = null
    
    toast.add({
      title: 'Image Uploaded',
      description: `${file.name} has been added to the cover page.`,
      color: 'green',
      icon: 'i-heroicons-check-circle'
    })
  }
  reader.readAsDataURL(file)
}

function clearImage() {
  form.imageData = null
  form.imageName = null
  form.imagePath = null
  
  toast.add({
    title: 'Image Removed',
    description: 'Cover image has been removed.',
    color: 'orange',
    icon: 'i-heroicons-trash'
  })
}

function confirmReset() {
  showResetModal.value = true
}

function resetForm() {
  const next = workspace.clearDocumentWorkspace()
  Object.assign(form, next.cover)
  showResetModal.value = false
  
  toast.add({
    title: 'Fields Cleared',
    description: 'All cover page fields have been reset.',
    color: 'orange',
    icon: 'i-heroicons-trash'
  })
}
</script>
