<template>
  <div class="card demo-card">
    <header class="demo-header">
      <div>
        <h1>Rich Text Editor</h1>
        <p>Powered by TipTap with CCGenTool styling, now refactored as a standalone component.</p>
      </div>
      <span class="meta">Last updated: {{ lastUpdatedLabel }}</span>
    </header>

    <div class="editor-grid">
      <section>
        <h2>Compose</h2>
        <RichTextEditor v-model="editorHtml" min-height="300px" />
      </section>
      <section>
        <h2>Live HTML Preview</h2>
        <div class="preview-pane" v-html="editorHtml"></div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import RichTextEditor from '../../components/RichTextEditor.vue'
import { loadDemoState, updateDemoState } from '../../services/demoStorage'

const editorHtml = ref('<p></p>')
const lastUpdated = ref<string | null>(null)

onMounted(() => {
  const state = loadDemoState()
  editorHtml.value = state.editorHtml
  lastUpdated.value = state.lastUpdated
})

watch(editorHtml, (value) => {
  const nextState = updateDemoState({ editorHtml: value })
  lastUpdated.value = nextState.lastUpdated
})

const lastUpdatedLabel = computed(() => {
  if (!lastUpdated.value) return 'Never'
  const date = new Date(lastUpdated.value)
  return date.toLocaleString()
})
</script>

<style scoped>
.demo-card {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.demo-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 12px;
}

.meta {
  font-size: 0.9rem;
  color: var(--text-muted);
}

.editor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
}

.preview-pane {
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  padding: 16px;
  background: var(--surface);
  min-height: 300px;
  overflow: auto;
}
</style>
