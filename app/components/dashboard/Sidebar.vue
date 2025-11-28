<script setup lang="ts">
import type { TreeItem } from '@nuxt/ui'

defineProps<{
  width?: number
}>()

const emit = defineEmits<{
  collapse: []
}>()

const router = useRouter()
const route = useRoute()

// Track selected item based on current route
const selectedItem = ref<TreeItem | undefined>()

// Navigation items converted to TreeItem format
const items = ref<TreeItem[]>([
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'i-heroicons-home',
    to: '/dashboard'
  },
  {
    id: 'cover',
    label: 'Cover',
    icon: 'i-heroicons-photo',
    to: '/document/cover'
  },
  {
    id: 'introduction',
    label: 'Introduction',
    icon: 'i-heroicons-information-circle',
    defaultExpanded: true,
    children: [
      { id: 'doc-info', label: 'Document Information', icon: 'i-heroicons-document', to: '/document/introduction' },
      { id: 'purpose-scope', label: 'Purpose and Scope', icon: 'i-heroicons-document-text', to: '/document/purpose-scope' },
      { id: 'product-id', label: 'Product Identification', icon: 'i-heroicons-identification', to: '/document/product-identification' },
      { id: 'manufacturer', label: 'Manufacturer Information', icon: 'i-heroicons-building-office', to: '/document/manufacturer-information' }
    ]
  },
  {
    id: 'product-overview',
    label: 'Product Overview',
    icon: 'i-heroicons-cube',
    defaultExpanded: true,
    children: [
      { id: 'prod-desc', label: 'Product Description', icon: 'i-heroicons-document-text', to: '/product-overview/description' },
      { id: 'prod-arch', label: 'Product Architecture Overview', icon: 'i-heroicons-squares-2x2', to: '/product-overview/architecture' },
      { id: 'third-party', label: 'Third-Party Components', icon: 'i-heroicons-cube-transparent', to: '/product-overview/third-party-components' }
    ]
  },
  {
    id: 'conformance',
    label: 'Conformance Claim',
    icon: 'i-heroicons-check-badge',
    defaultExpanded: true,
    children: [
      { id: 'standards', label: 'Standards Conformance', icon: 'i-heroicons-clipboard-document-list', to: '/conformance/standards' },
      { id: 'regulatory', label: 'Regulatory Conformance', icon: 'i-heroicons-scale', to: '/conformance/regulatory' },
      { id: 'level', label: 'Conformance Level', icon: 'i-heroicons-shield-check', to: '/conformance/level' }
    ]
  },
  {
    id: 'convention',
    label: 'Document Convention',
    icon: 'i-heroicons-book-open',
    defaultExpanded: true,
    children: [
      { id: 'terminology', label: 'Terminology', icon: 'i-heroicons-language', to: '/convention/terminology' },
      { id: 'notation', label: 'Notation', icon: 'i-heroicons-hashtag', to: '/convention/notation' }
    ]
  },
  {
    id: 'risk-management',
    label: 'Risk Management Elements',
    icon: 'i-heroicons-shield-exclamation',
    defaultExpanded: true,
    children: [
      { id: 'general-approach', label: 'General Approach to Risk Management', icon: 'i-heroicons-shield-check', to: '/risk/general-approach' },
      {
        id: 'product-context',
        label: 'Product Context',
        icon: 'i-heroicons-light-bulb',
        defaultExpanded: true,
        children: [
          { id: 'intended-purpose', label: 'Intended Purpose', icon: 'i-heroicons-document-text', to: '/pcontext/intended-purpose' },
          { id: 'product-function', label: 'Product Functions', icon: 'i-heroicons-cog-6-tooth', to: '/pcontext/product-function' },
          { id: 'operational-env', label: 'Operational Environment', icon: 'i-heroicons-server-stack', to: '/pcontext/operational-environment' },
          { id: 'product-arch', label: 'Product Architecture', icon: 'i-heroicons-cube-transparent', to: '/pcontext/product-architecture' },
          { id: 'user-desc', label: 'Product User Description', icon: 'i-heroicons-user-group', to: '/pcontext/user-description' },
          { id: 'context-assessment', label: 'Product Context Assessment', icon: 'i-heroicons-clipboard-document-check', to: '/pcontext/product-context-assessment' }
        ]
      },
      {
        id: 'risk-criteria',
        label: 'Risk Acceptance Criteria and Methodology',
        icon: 'i-heroicons-calculator',
        defaultExpanded: true,
        children: [
          { id: 'assessment-methodology', label: 'Risk Assessment and Treatment Methodology', icon: 'i-heroicons-chart-bar', to: '/riskcrit/assessment-methodology' },
          { id: 'acceptance-criteria', label: 'Risk Acceptance Criteria', icon: 'i-heroicons-check-circle', to: '/riskcrit/acceptance-criteria' },
          { id: 'assessment-summary', label: 'Assessment Summary', icon: 'i-heroicons-clipboard-document-check', to: '/riskcrit/assessment-summary' }
        ]
      }
    ]
  },
  {
    id: 'doc-management',
    label: 'Document Management',
    icon: 'i-heroicons-folder-open',
    defaultExpanded: true,
    children: [
      { id: 'preview', label: 'Document Preview', icon: 'i-heroicons-eye', to: '/document/preview' },
      { id: 'load-save', label: 'Load & Save', icon: 'i-heroicons-arrow-down-tray', to: '/document/load-save' },
      { id: 'evidence', label: 'Evidence List', icon: 'i-heroicons-clipboard-document-list', to: '/document/evidence' }
    ]
  },
  {
    id: 'demos',
    label: 'Demos',
    icon: 'i-heroicons-beaker',
    defaultExpanded: false,
    children: [
      { id: 'demo-table', label: 'Table', icon: 'i-heroicons-table-cells', to: '/demo/table' },
      { id: 'demo-modal', label: 'Modal', icon: 'i-heroicons-rectangle-stack', to: '/demo/modal' },
      { id: 'demo-crud', label: 'CRUD', icon: 'i-heroicons-pencil-square', to: '/demo/crud' },
      { id: 'demo-wysiwyg', label: 'WYSIWYG', icon: 'i-heroicons-document-text', to: '/demo/wysiwyg' },
      { id: 'demo-docx', label: 'DOCX Generation', icon: 'i-heroicons-document-arrow-down', to: '/demo/docx-generation' },
      { id: 'demo-evidence', label: 'Evidence Tracker', icon: 'i-heroicons-clipboard-document-check', to: '/demo/evidence-tracker' },
      { id: 'demo-threat', label: 'Threat Modeling', icon: 'i-heroicons-shield-exclamation', to: '/demo/threat-modeling' },
      {
        id: 'user-management',
        label: 'User Management',
        icon: 'i-heroicons-users',
        children: [
          { id: 'demo-users', label: 'Users', icon: 'i-heroicons-user', to: '/demo/users' },
          { id: 'demo-groups', label: 'Groups', icon: 'i-heroicons-user-group', to: '/demo/groups' },
          { id: 'demo-permissions', label: 'Permissions', icon: 'i-heroicons-lock-closed', to: '/demo/permissions' }
        ]
      }
    ]
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'i-heroicons-cog-6-tooth',
    to: '/demo/settings'
  }
])

// Extended TreeItem type with 'to' property
interface NavTreeItem extends TreeItem {
  to?: string
  children?: NavTreeItem[]
}

// Find item by route path
function findItemByPath(items: NavTreeItem[], path: string): NavTreeItem | undefined {
  for (const item of items) {
    if (item.to === path) return item
    if (item.children) {
      const found = findItemByPath(item.children, path)
      if (found) return found
    }
  }
  return undefined
}

// Handle item selection - navigate if item has 'to' property
function handleSelect(e: any, item: NavTreeItem) {
  if (item.to) {
    router.push(item.to)
  } else {
    // Prevent selection for parent items without routes
    e.preventDefault()
  }
}

// Update selected item when route changes
watch(() => route.path, (path) => {
  const found = findItemByPath(items.value as NavTreeItem[], path)
  if (found) {
    selectedItem.value = found
  }
}, { immediate: true })
</script>

<template>
  <div class="flex flex-col h-full border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 w-full p-4 select-none">
    <div class="flex items-center gap-2 px-2 mb-8 cursor-pointer" @click="emit('collapse')">
      <div class="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center flex-shrink-0">
        <UIcon name="i-heroicons-cube-transparent" class="text-white w-6 h-6" />
      </div>
      <span class="font-bold text-xl text-gray-900 dark:text-white truncate">CRA Tool</span>
    </div>

    <div class="flex-1 overflow-y-auto overflow-x-hidden">
      <UTree
        v-model="selectedItem"
        :items="items"
        :get-key="(item: TreeItem) => item.id as string"
        color="primary"
        size="sm"
        @select="handleSelect"
        :ui="{
          link: 'rounded-md',
          linkLabel: 'text-sm'
        }"
      />
    </div>
  </div>
</template>
