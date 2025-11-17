<template>
  <div class="card home-card">
    <h1 class="home-title">CRA Tool Demo Gallery</h1>
    <p class="home-subtitle">Explore each core module through bite-sized demo pages.</p>
    <div class="home-actions">
      <RouterLink v-for="demo in demoLinks" :key="demo.route" class="home-button" :to="demo.route">
        {{ demo.title }}
      </RouterLink>
    </div>
  </div>

  <div class="card core-features">
    <header class="core-features-header">
      <div>
        <h2>Core Modules</h2>
        <p>Each tile links to the corresponding demo route.</p>
      </div>
    </header>
    <div class="feature-grid">
      <div v-for="feature in coreFeatureModules" :key="feature.title" class="feature-card">
        <h3>{{ feature.title }}</h3>
        <p>{{ feature.description }}</p>
        <div class="feature-meta">
          <span class="feature-tag">{{ feature.category }}</span>
          <RouterLink class="btn link" :to="feature.route">Open demo</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const demoLinks = [
  { title: 'Modal Demo', route: '/demo/modal' },
  { title: 'Requirements Table', route: '/demo/table' },
  { title: 'Rich Text Editor', route: '/demo/editor' },
  { title: 'XML Viewer', route: '/demo/xml-viewer' },
  { title: 'DOCX Preview', route: '/demo/docx-preview' },
  { title: 'Save / Load Workspace', route: '/demo/storage' },
]

const coreFeatureModules = [
  {
    title: 'Modal Framework',
    description: 'Reusable overlay component for multi-step experiences and confirmations.',
    category: 'UI Component',
    route: '/demo/modal',
  },
  {
    title: 'Technical Requirement Data Table',
    description: 'Add or remove Technical Requirement entries using the lightweight CRUD table component.',
    category: 'Data Entry',
    route: '/demo/table',
  },
  {
    title: 'Rich Text Editor',
    description: 'TipTap-based editor with formatting, colors, tables, and media embedding.',
    category: 'UI Component',
    route: '/demo/editor',
  },
  {
    title: 'XML Tree Viewer',
    description: 'Interactive tree rendering for structured data—now backed by sample datasets.',
    category: 'Visualization',
    route: '/demo/xml-viewer',
  },
  {
    title: 'DOCX Preview Engine',
    description: 'Generate fully styled DOCX files server-side and render them in the browser.',
    category: 'Document Service',
    route: '/demo/docx-preview',
  },
  {
    title: 'Workspace Persistence',
    description: 'Download and restore the combined demo state using the new storage helpers.',
    category: 'State Management',
    route: '/demo/storage',
  },
]
</script>

<style scoped src="./Dashboard.css"></style>
