<template>
  <div class="card demo-card">
    <header class="demo-header">
      <div>
        <h1>Rich Text Editor</h1>
        <p>Powered by TipTap with CRA Tool styling, now refactored as a standalone component.</p>
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

<style scoped src="./EditorDemo.css"></style>
