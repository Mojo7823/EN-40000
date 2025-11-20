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
    icon: 'i-heroicons-home',
    to: '/'
  },
  {
    label: 'Cover',
    icon: 'i-heroicons-document-text',
    to: '/document/cover'
  },
  {
    label: 'Introduction',
    icon: 'i-heroicons-information-circle',
    defaultExpanded: true,
    children: [
      { label: 'Document Information', to: '/document/introduction' },
      { label: 'Purpose and Scope', to: '/document/purpose-scope' },
      { label: 'Product Identification', to: '/document/product-identification' },
      { label: 'Manufacturer Information', to: '/document/manufacturer-information' }
    ]
  },
  {
    label: 'Product Overview',
    icon: 'i-heroicons-cube',
    defaultExpanded: true,
    children: [
      { label: 'Product Description', to: '/product-overview/description' },
      { label: 'Product Architecture Overview', to: '/product-overview/architecture' },
      { label: 'Third-Party Components', to: '/product-overview/third-party-components' }
    ]
  },
  {
    label: 'Conformance Claim',
    icon: 'i-heroicons-check-badge',
    defaultExpanded: true,
    children: [
      { label: 'Standards Conformance', to: '/conformance/standards' },
      { label: 'Regulatory Conformance', to: '/conformance/regulatory' },
      { label: 'Conformance Level', to: '/conformance/level' }
    ]
  },
  {
    label: 'Document Convention',
    icon: 'i-heroicons-book-open',
    defaultExpanded: true,
    children: [
      { label: 'Terminology', to: '/convention/terminology' },
      { label: 'Notation', to: '/convention/notation' }
    ]
  },
  {
    label: 'Risk Management Elements',
    icon: 'i-heroicons-shield-exclamation',
    defaultExpanded: true,
    children: [
      {
        label: 'General Approach to Risk Management',
        to: '/risk/general-approach',
        children: [
          { label: 'Product Context', to: '/pcontext/intended-purpose' }
        ]
      },
      { label: 'Risk Acceptance Criteria and Risk Management', disabled: true },
      { label: 'Risk Assessment', disabled: true },
      { label: 'Risk Treatment', disabled: true },
      { label: 'Risk Communication', disabled: true },
      { label: 'Risk Monitoring and Review', disabled: true }
    ]
  },
  {
    label: 'Document Management',
    icon: 'i-heroicons-folder',
    defaultExpanded: true,
    children: [
      { label: 'Document Preview', to: '/document/preview' },
      { label: 'Load & Save', to: '/document/load-save' },
      { label: 'Evidence List', to: '/document/evidence' }
    ]
  },
  {
    label: 'Demo',
    icon: 'i-heroicons-beaker',
    defaultExpanded: false,
    children: [
      { label: 'Modal', to: '/demo/modal' },
      { label: 'Requirements Table', to: '/demo/table' },
      { label: 'Rich Text Editor', to: '/demo/editor' },
      { label: 'XML Viewer', to: '/demo/xml-viewer' },
      { label: 'Docx Preview', to: '/demo/docx-preview' },
      { label: 'Save / Load', to: '/demo/storage' }
    ]
  }
]
</script>

<style scoped>
.sidebar-tree {
  padding: 8px;
}
</style>
