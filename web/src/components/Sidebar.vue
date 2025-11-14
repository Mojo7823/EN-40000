<template>
  <ul class="menu">
    <li>
      <RouterLink to="/" active-class="active">Dashboard</RouterLink>
    </li>
    <li>
      <div class="accordion">
        <div class="accordion-header" @click="demoOpen = !demoOpen">
          <span>Demo</span>
          <span>{{ demoOpen ? '▾' : '▸' }}</span>
        </div>
        <div v-if="demoOpen" class="accordion-content">
          <ul class="menu">
            <li v-for="link in demoLinks" :key="link.to">
              <RouterLink :to="link.to" active-class="active">{{ link.label }}</RouterLink>
            </li>
          </ul>
        </div>
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const demoOpen = ref(true)
const demoLinks = [
  { label: 'Modal', to: '/demo/modal' },
  { label: 'SFR Table', to: '/demo/table' },
  { label: 'Rich Text Editor', to: '/demo/editor' },
  { label: 'XML Viewer', to: '/demo/xml-viewer' },
  { label: 'Docx Preview', to: '/demo/docx-preview' },
  { label: 'Save / Load', to: '/demo/storage' },
]
</script>

<style scoped>
.accordion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 8px 0;
  font-weight: 600;
}

.accordion-content {
  padding-left: 8px;
}
</style>
