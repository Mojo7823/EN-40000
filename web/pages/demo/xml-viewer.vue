<template>
  <div class="card demo-card">
    <header class="demo-header">
      <div>
        <h1>XML Tree Viewer</h1>
        <p>
          Legacy XML parsing has been removed, but the interactive viewer still showcases how structured data is
          rendered in CRA Tool.
        </p>
      </div>
      <select v-model="selectedSampleId" class="input select">
        <option v-for="sample in samples" :key="sample.id" :value="sample.id">
          {{ sample.title }}
        </option>
      </select>
    </header>

    <section class="demo-content">
      <p class="muted">
        {{ activeSample.description }}
      </p>
      <div class="tree-wrapper">
        <XMLTreeNode :node="activeSample.tree" :level="0" />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import XMLTreeNode from '../../components/XMLTreeNode.vue'
import { xmlSamples, defaultXmlSampleId } from '../../data/xmlSamples'
import { loadDemoState, updateDemoState } from '../../services/demoStorage'

const samples = xmlSamples
const selectedSampleId = ref(defaultXmlSampleId)

onMounted(() => {
  const state = loadDemoState()
  selectedSampleId.value = state.xmlSampleId || defaultXmlSampleId
})

watch(selectedSampleId, (value) => {
  updateDemoState({ xmlSampleId: value })
})

const activeSample = computed(() => {
  return samples.find(sample => sample.id === selectedSampleId.value) ?? samples[0]
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
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.demo-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tree-wrapper {
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  padding: 16px;
  background: var(--surface);
  max-height: 550px;
  overflow: auto;
}

.muted {
  color: var(--text-muted);
}
</style>
