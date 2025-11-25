<script setup lang="ts">
import { ref } from 'vue'

const items = ref([[{
  label: 'Dashboard',
  to: '/dashboard',
  icon: 'i-heroicons-home'
}, {
  label: 'Cover',
  to: '/document/cover',
  icon: 'i-heroicons-photo'
}, {
  label: 'Introduction',
  icon: 'i-heroicons-information-circle',
  defaultOpen: true,
  children: [{
    label: 'Document Information',
    to: '/document/introduction',
    icon: 'i-heroicons-document',
    description: 'Basic document details'
  }, {
    label: 'Purpose and Scope',
    to: '/document/purpose-scope',
    icon: 'i-heroicons-document-text',
    description: 'Document purpose and scope'
  }, {
    label: 'Product Identification',
    to: '/document/product-identification',
    icon: 'i-heroicons-identification',
    description: 'Product identification details'
  }, {
    label: 'Manufacturer Information',
    to: '/document/manufacturer-information',
    icon: 'i-heroicons-building-office',
    description: 'Manufacturer contact information'
  }]
}, {
  label: 'Product Overview',
  icon: 'i-heroicons-cube',
  defaultOpen: true,
  children: [{
    label: 'Product Description',
    to: '/product-overview/description',
    icon: 'i-heroicons-document-text',
    description: 'Overall product description'
  }, {
    label: 'Product Architecture Overview',
    to: '/product-overview/architecture',
    icon: 'i-heroicons-squares-2x2',
    description: 'System architecture'
  }, {
    label: 'Third-Party Components',
    to: '/product-overview/third-party-components',
    icon: 'i-heroicons-cube-transparent',
    description: 'Third-party component inventory'
  }]
}, {
  label: 'Conformance Claim',
  icon: 'i-heroicons-check-badge',
  defaultOpen: true,
  children: [{
    label: 'Standards Conformance',
    to: '/conformance/standards',
    icon: 'i-heroicons-clipboard-document-list',
    description: 'Primary and related standards'
  }, {
    label: 'Regulatory Conformance',
    to: '/conformance/regulatory',
    icon: 'i-heroicons-scale',
    description: 'CRA and other regulations'
  }, {
    label: 'Conformance Level',
    to: '/conformance/level',
    icon: 'i-heroicons-shield-check',
    description: 'Conformance status and justification'
  }]
}, {
  label: 'Document Convention',
  icon: 'i-heroicons-book-open',
  defaultOpen: true,
  children: [{
    label: 'Terminology',
    to: '/convention/terminology',
    icon: 'i-heroicons-language',
    description: 'Terminology glossary'
  }, {
    label: 'Notation',
    to: '/convention/notation',
    icon: 'i-heroicons-hashtag',
    description: 'Notation conventions'
  }]
}, {
  label: 'Risk Management Elements',
  icon: 'i-heroicons-shield-exclamation',
  defaultOpen: true,
  children: [{
    label: 'General Approach to Risk Management',
    to: '/risk/general-approach',
    icon: 'i-heroicons-shield-check',
    description: 'Risk management methodology',
    children: [{
      label: 'Product Context',
      to: '/pcontext/intended-purpose',
      icon: 'i-heroicons-light-bulb',
      description: 'Product intended purpose'
    }]
  }]
}, {
  label: 'Document Management',
  icon: 'i-heroicons-folder-open',
  defaultOpen: true,
  children: [{
    label: 'Document Preview',
    to: '/document/preview',
    icon: 'i-heroicons-eye',
    description: 'Preview and download document'
  }, {
    label: 'Load & Save',
    to: '/document/load-save',
    icon: 'i-heroicons-arrow-down-tray',
    description: 'Import/export workspace'
  }, {
    label: 'Evidence List',
    to: '/document/evidence',
    icon: 'i-heroicons-clipboard-document-list',
    description: 'Evidence tracking'
  }]
}, {
  label: 'Demos',
  icon: 'i-heroicons-beaker',
  defaultOpen: false,
  children: [{
    label: 'Table',
    to: '/demo/table',
    icon: 'i-heroicons-table-cells'
  }, {
    label: 'Modal',
    to: '/demo/modal',
    icon: 'i-heroicons-rectangle-stack'
  }, {
    label: 'CRUD',
    to: '/demo/crud',
    icon: 'i-heroicons-pencil-square'
  }, {
    label: 'WYSIWYG',
    to: '/demo/wysiwyg',
    icon: 'i-heroicons-document-text'
  }, {
    label: 'DOCX Generation',
    to: '/demo/docx-generation',
    icon: 'i-heroicons-document-arrow-down'
  }, {
    label: 'Evidence Tracker',
    to: '/demo/evidence-tracker',
    icon: 'i-heroicons-clipboard-document-check'
  }, {
    label: 'Threat Modeling',
    to: '/demo/threat-modeling',
    icon: 'i-heroicons-shield-exclamation'
  }, {
    label: 'User Management',
    icon: 'i-heroicons-users',
    children: [{
      label: 'Users',
      to: '/demo/users',
      icon: 'i-heroicons-user'
    }, {
      label: 'Groups',
      to: '/demo/groups',
      icon: 'i-heroicons-user-group'
    }, {
      label: 'Permissions',
      to: '/demo/permissions',
      icon: 'i-heroicons-lock-closed'
    }]
  }]
}], [{
  label: 'Settings',
  icon: 'i-heroicons-cog-6-tooth',
  to: '/demo/settings'
}]])
</script>

<template>
  <div class="flex flex-col h-full border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 w-64 p-4">
    <div class="flex items-center gap-2 px-2 mb-8">
      <div class="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
        <UIcon name="i-heroicons-cube-transparent" class="text-white w-6 h-6" />
      </div>
      <span class="font-bold text-xl text-gray-900 dark:text-white">CRA Tool</span>
    </div>

    <UNavigationMenu orientation="vertical" :items="items" />
  </div>
</template>
