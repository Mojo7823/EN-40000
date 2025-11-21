<script setup lang="ts">
import { ref } from 'vue'

const items = ref([{
  label: 'Dashboard',
  icon: 'i-heroicons-home',
  to: '/demo/dashboard'
}, {
  label: 'Demos',
  icon: 'i-heroicons-beaker',
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
}, {
  label: 'Settings',
  icon: 'i-heroicons-cog-6-tooth',
  to: '/demo/settings'
}])
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
