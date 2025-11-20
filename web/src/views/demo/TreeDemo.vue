<script setup lang="ts">
import { ref } from 'vue'
import type { TreeItem } from '@nuxt/ui'

// Sample tree data matching the Nuxt UI documentation
const items = ref<TreeItem[]>([
  {
    label: 'app/',
    defaultExpanded: true,
    children: [
      {
        label: 'composables/',
        defaultExpanded: true,
        children: [
          {
            label: 'useAuth.ts',
            icon: 'i-vscode-icons-file-type-typescript'
          },
          {
            label: 'useUser.ts',
            icon: 'i-vscode-icons-file-type-typescript'
          }
        ]
      },
      {
        label: 'components/',
        defaultExpanded: true,
        children: [
          {
            label: 'Card.vue',
            icon: 'i-vscode-icons-file-type-vue'
          },
          {
            label: 'Button.vue',
            icon: 'i-vscode-icons-file-type-vue'
          }
        ]
      },
      {
        label: 'app.vue',
        icon: 'i-vscode-icons-file-type-vue'
      }
    ]
  },
  {
    label: 'nuxt.config.ts',
    icon: 'i-vscode-icons-file-type-typescript'
  }
])
</script>

<template>
  <div class="tree-demo-container">
    <!-- Page Header -->
    <header class="page-header">
      <h1 class="page-title"># Usage</h1>
      <p class="page-description">
        Use the Tree component to display a hierarchical structure of items.
      </p>
    </header>

    <!-- Basic Tree Example -->
    <section class="demo-section">
      <div class="tree-card">
        <UTree :items="items" />
      </div>

      <div class="code-block">
        <pre><code>&lt;script setup lang="ts"&gt;
const items = ref([
  {
    label: 'app/',
    defaultExpanded: true,
    children: [
      {
        label: 'composables/',
        children: [
          {
            label: 'useAuth.ts',
            icon: 'i-vscode-icons-file-type-typescript'
          },
          {
            label: 'useUser.ts',
            icon: 'i-vscode-icons-file-type-typescript'
          }
        ]
      },
      {
        label: 'components/',
        children: [
          {
            label: 'Card.vue',
            icon: 'i-vscode-icons-file-type-vue'
          },
          {
            label: 'Button.vue',
            icon: 'i-vscode-icons-file-type-vue'
          }
        ]
      },
      {
        label: 'app.vue',
        icon: 'i-vscode-icons-file-type-vue'
      }
    ]
  },
  {
    label: 'nuxt.config.ts',
    icon: 'i-vscode-icons-file-type-typescript'
  }
])
&lt;/script&gt;

&lt;template&gt;
  &lt;UTree :items="items" /&gt;
&lt;/template&gt;</code></pre>
      </div>
    </section>
  </div>
</template>

<style scoped>
.tree-demo-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 24px;
}

/* Page Header */
.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 12px 0;
}

.page-description {
  font-size: 1rem;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.6;
}

/* Demo Section */
.demo-section {
  margin-bottom: 32px;
}

/* Tree Card */
.tree-card {
  background: var(--panel);
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}

/* Code Block */
.code-block {
  background: var(--surface);
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  overflow: hidden;
}

.code-block pre {
  margin: 0;
  padding: 24px;
  overflow-x: auto;
}

.code-block code {
  font-family: 'Courier New', Consolas, Monaco, monospace;
  font-size: 0.875rem;
  line-height: 1.7;
  color: var(--text);
  display: block;
  white-space: pre;
}

/* Responsive */
@media (max-width: 768px) {
  .tree-demo-container {
    padding: 24px 16px;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .tree-card {
    padding: 16px;
  }

  .code-block pre {
    padding: 16px;
  }

  .code-block code {
    font-size: 0.8125rem;
  }
}
</style>
