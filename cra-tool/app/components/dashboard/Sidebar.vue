<script setup lang="ts">
const items = [{
  label: 'Dashboard',
  icon: 'i-heroicons-home',
  to: '/'
}, {
  label: 'Users',
  icon: 'i-heroicons-users',
  children: [{
    label: 'List',
    to: '/users',
    icon: 'i-heroicons-list-bullet'
  }, {
    label: 'Groups',
    icon: 'i-heroicons-user-group',
    children: [{
      label: 'Overview',
      to: '/users/groups'
    }, {
      label: 'Permissions',
      to: '/users/groups/permissions'
    }]
  }]
}, {
  label: 'Settings',
  icon: 'i-heroicons-cog-6-tooth',
  to: '/settings'
}]
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

    <div class="mt-auto">
      <UCard class="bg-primary-50 dark:bg-primary-950/50">
        <div class="text-xs font-medium mb-1">Storage Used</div>
        <UProgress :value="75" color="primary" size="xs" />
        <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">7.5 GB / 10 GB</div>
      </UCard>
    </div>
  </div>
</template>
