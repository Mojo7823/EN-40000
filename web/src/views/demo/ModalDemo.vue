<template>
  <div class="card demo-card">
    <header class="demo-header">
      <div>
        <h1>Modal Interaction</h1>
        <p>Demonstrates the accessible modal shell used throughout CRA Tool.</p>
      </div>
      <button class="btn primary" type="button" @click="openModal">
        Launch Demo Modal
      </button>
    </header>

    <section class="demo-content">
      <p>
        Add a note below, open the modal, and observe that the value persists thanks to the demo storage
        service. This mirrors how the previous product stored wizard progress.
      </p>
      <label class="form-label" for="modal-note">Modal note</label>
      <textarea
        id="modal-note"
        v-model="modalNote"
        rows="4"
        class="input"
        placeholder="Type the content you'd like to highlight inside the modal..."
      ></textarea>
    </section>

    <div v-if="isModalOpen" class="demo-modal-overlay" @click="closeModal">
      <div class="demo-modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle" @click.stop>
        <header class="demo-modal-header">
          <h2 id="modalTitle">Reusable Modal</h2>
          <button class="modal-close" type="button" @click="closeModal" aria-label="Close modal">×</button>
        </header>
        <div class="demo-modal-body">
          <p>This dialog inherits the notes you captured:</p>
          <blockquote v-if="modalNote">{{ modalNote }}</blockquote>
          <p v-else class="muted">No note captured yet. Close this dialog and jot something down first.</p>
        </div>
        <footer class="demo-modal-footer">
          <button class="btn" type="button" @click="closeModal">Dismiss</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { loadDemoState, updateDemoState } from '../../services/demoStorage'

const isModalOpen = ref(false)
const modalNote = ref('')

onMounted(() => {
  const state = loadDemoState()
  modalNote.value = state.modalNote
})

watch(modalNote, (value) => {
  updateDemoState({ modalNote: value })
})

function openModal() {
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
}
</script>

<style scoped src="./ModalDemo.css"></style>
