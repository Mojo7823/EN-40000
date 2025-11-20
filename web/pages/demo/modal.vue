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

<style scoped>
.demo-card {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.demo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.demo-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-label {
  font-weight: 600;
}

.demo-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 50;
  backdrop-filter: blur(2px);
}

.demo-modal {
  width: min(480px, 100%);
  background: var(--panel);
  border-radius: 16px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
}

.demo-modal-header,
.demo-modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--panel-border);
}

.demo-modal-footer {
  border-top: 1px solid var(--panel-border);
  border-bottom: none;
}

.demo-modal-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

blockquote {
  margin: 0;
  padding: 12px 16px;
  border-left: 3px solid var(--accent-purple);
  background: var(--surface-muted);
  border-radius: 4px;
}

.muted {
  color: var(--text-muted);
}

.modal-close {
  border: none;
  background: transparent;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  color: var(--text);
}
</style>
