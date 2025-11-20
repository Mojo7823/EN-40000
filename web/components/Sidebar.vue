<template>
  <div class="sidebar-tree">
    <UTree :items="items" :ui="{ item: 'cursor-pointer' }">
      <template #item-label="{ item }">
        <NuxtLink
          v-if="item.to && !item.disabled"
          :to="item.to"
          class="truncate w-full block"
          active-class="text-primary font-medium"
        >
          {{ item.label }}
        </NuxtLink>
        <span v-else :class="['truncate', { 'opacity-50': item.disabled }]">
          {{ item.label }}
        </span>
      </template>
    </UTree>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface SidebarItem {
  label: string
  icon?: string
  to?: string
  disabled?: boolean
  defaultExpanded?: boolean
  children?: SidebarItem[]
}

const items: SidebarItem[] = [
  {
    label: 'Dashboard',
    icon: 'i-vscode-icons-file-type-home',
    to: '/'
  },
  {
    label: 'Cover',
    icon: 'i-vscode-icons-file-type-pdf2',
    to: '/document/cover'
  },
  {
    label: 'Introduction',
    icon: 'i-vscode-icons-default-folder-opened',
    defaultExpanded: true,
    children: [
      { label: 'Document Information', icon: 'i-vscode-icons-file-type-text', to: '/document/introduction' },
      { label: 'Purpose and Scope', icon: 'i-vscode-icons-file-type-text', to: '/document/purpose-scope' },
      { label: 'Product Identification', icon: 'i-vscode-icons-file-type-text', to: '/document/product-identification' },
      { label: 'Manufacturer Information', icon: 'i-vscode-icons-file-type-text', to: '/document/manufacturer-information' }
    ]
  },
  {
    label: 'Product Overview',
    icon: 'i-vscode-icons-default-folder-opened',
    defaultExpanded: true,
    children: [
      { label: 'Product Description', icon: 'i-vscode-icons-file-type-text', to: '/product-overview/description' },
      { label: 'Product Architecture Overview', icon: 'i-vscode-icons-file-type-text', to: '/product-overview/architecture' },
      { label: 'Third-Party Components', icon: 'i-vscode-icons-file-type-text', to: '/product-overview/third-party-components' }
    ]
  },
  {
    label: 'Conformance Claim',
    icon: 'i-vscode-icons-default-folder-opened',
    defaultExpanded: true,
    children: [
      { label: 'Standards Conformance', icon: 'i-vscode-icons-file-type-text', to: '/conformance/standards' },
      { label: 'Regulatory Conformance', icon: 'i-vscode-icons-file-type-text', to: '/conformance/regulatory' },
      { label: 'Conformance Level', icon: 'i-vscode-icons-file-type-text', to: '/conformance/level' }
    ]
  },
  {
    label: 'Document Convention',
    icon: 'i-vscode-icons-default-folder-opened',
    defaultExpanded: true,
    children: [
      { label: 'Terminology', icon: 'i-vscode-icons-file-type-text', to: '/convention/terminology' },
      { label: 'Notation', icon: 'i-vscode-icons-file-type-text', to: '/convention/notation' }
    ]
  },
  {
    label: 'Risk Management Elements',
    icon: 'i-vscode-icons-default-folder-opened',
    defaultExpanded: true,
    children: [
      {
        label: 'General Approach to Risk Management',
        icon: 'i-vscode-icons-file-type-text',
        to: '/risk/general-approach',
        children: [
          { label: 'Product Context', icon: 'i-vscode-icons-file-type-text', to: '/pcontext/intended-purpose' }
        ]
      },
      { label: 'Risk Acceptance Criteria and Risk Management', icon: 'i-vscode-icons-file-type-text', disabled: true },
      { label: 'Risk Assessment', icon: 'i-vscode-icons-file-type-text', disabled: true },
      { label: 'Risk Treatment', icon: 'i-vscode-icons-file-type-text', disabled: true },
      { label: 'Risk Communication', icon: 'i-vscode-icons-file-type-text', disabled: true },
      { label: 'Risk Monitoring and Review', icon: 'i-vscode-icons-file-type-text', disabled: true }
    ]
  },
  {
    label: 'Document Management',
    icon: 'i-vscode-icons-default-folder-opened',
    defaultExpanded: true,
    children: [
      { label: 'Document Preview', icon: 'i-vscode-icons-file-type-pdf2', to: '/document/preview' },
      { label: 'Load & Save', icon: 'i-vscode-icons-file-type-json', to: '/document/load-save' },
      { label: 'Evidence List', icon: 'i-vscode-icons-file-type-text', to: '/document/evidence' }
    ]
  },
  {
    label: 'Demo',
    icon: 'i-vscode-icons-default-folder',
    defaultExpanded: false,
    children: [
      { label: 'Modal', icon: 'i-vscode-icons-file-type-vue', to: '/demo/modal' },
      { label: 'Requirements Table', icon: 'i-vscode-icons-file-type-vue', to: '/demo/table' },
      { label: 'Rich Text Editor', icon: 'i-vscode-icons-file-type-vue', to: '/demo/editor' },
      { label: 'XML Viewer', icon: 'i-vscode-icons-file-type-vue', to: '/demo/xml-viewer' },
      { label: 'Docx Preview', icon: 'i-vscode-icons-file-type-vue', to: '/demo/docx-preview' },
      { label: 'Save / Load', icon: 'i-vscode-icons-file-type-vue', to: '/demo/storage' }
    ]
  }
]
</script>

<style scoped>
.sidebar-tree {
  padding: 8px;
}
</style>
