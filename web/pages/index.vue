<template>
  <div class="card home-card">
    <h1 class="home-title">CRA Tool Demo Gallery</h1>
    <p class="home-subtitle">Explore each core module through bite-sized demo pages.</p>
    <div class="home-actions">
      <NuxtLink v-for="demo in demoLinks" :key="demo.route" class="home-button" :to="demo.route">
        {{ demo.title }}
      </NuxtLink>
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
          <NuxtLink class="btn link" :to="feature.route">Open demo</NuxtLink>
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

<style scoped>
.home-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 48px 32px;
  gap: 32px;
  min-height: 320px;
}

.home-title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 600;
  max-width: 720px;
}

.home-subtitle {
  margin: 0;
  max-width: 720px;
  color: var(--text-muted);
}

.home-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
}

.home-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  padding: 14px 20px;
  border-radius: 10px;
  border: 1px solid var(--panel-border);
  background: var(--panel);
  color: var(--text);
  min-width: 220px;
  font-weight: 500;
  transition: transform 0.2s, box-shadow 0.2s, background 0.2s ease, color 0.2s ease;
  cursor: pointer;
}

.home-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px var(--shadow-color);
  background: var(--surface-muted);
}

.core-features {
  margin-top: 32px;
}

.core-features-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.feature-card {
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  padding: 16px;
  background: var(--surface);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.feature-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
}

.feature-tag {
  font-size: 0.85rem;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--surface-muted);
  color: var(--text-muted);
}

.btn.link {
  background: none;
  border: none;
  color: var(--primary);
  padding: 0;
  font-weight: 500;
}
</style>
