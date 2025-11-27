<script setup lang="ts">
const sidebarOpen = ref(false)
provide('sidebarOpen', sidebarOpen)
</script>

<template>
  <div class="flex h-screen w-full bg-gray-50 dark:bg-gray-950 overflow-hidden">
    <!-- Desktop Sidebar -->
    <aside class="hidden lg:block h-full">
      <DashboardSidebar />
    </aside>

    <!-- Mobile Sidebar Slideover -->
    <USlideover v-model:open="sidebarOpen" side="left" :overlay="true" :ui="{ content: 'max-w-64' }">
      <template #content>
        <DashboardSidebar @click="sidebarOpen = false" />
      </template>
    </USlideover>

    <!-- Main Content -->
    <div class="flex flex-col flex-1 w-full h-full overflow-hidden">
      <DashboardHeader />
      
      <main class="flex-1 overflow-y-auto p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
