<script setup lang="ts">
const sidebarOpen = ref(false)
const sidebarCollapsed = ref(false)
const sidebarWidth = ref(256) // 16rem = 256px (w-64)

const MIN_WIDTH = 200
const MAX_WIDTH = 400
const COLLAPSE_THRESHOLD = 150

provide('sidebarOpen', sidebarOpen)
provide('sidebarCollapsed', sidebarCollapsed)
provide('sidebarWidth', sidebarWidth)

// Persist sidebar width in localStorage
if (import.meta.client) {
  const savedWidth = localStorage.getItem('sidebar-width')
  const savedCollapsed = localStorage.getItem('sidebar-collapsed')
  if (savedWidth) sidebarWidth.value = parseInt(savedWidth)
  if (savedCollapsed) sidebarCollapsed.value = savedCollapsed === 'true'
}

watch(sidebarWidth, (val) => {
  if (import.meta.client) {
    localStorage.setItem('sidebar-width', val.toString())
  }
})

watch(sidebarCollapsed, (val) => {
  if (import.meta.client) {
    localStorage.setItem('sidebar-collapsed', val.toString())
  }
})

const isResizing = ref(false)

function startResize(e: MouseEvent) {
  isResizing.value = true
  document.addEventListener('mousemove', onResize)
  document.addEventListener('mouseup', stopResize)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

function onResize(e: MouseEvent) {
  if (!isResizing.value) return
  
  const newWidth = e.clientX
  
  if (newWidth < COLLAPSE_THRESHOLD) {
    sidebarCollapsed.value = true
    sidebarWidth.value = MIN_WIDTH
  } else {
    sidebarCollapsed.value = false
    sidebarWidth.value = Math.min(Math.max(newWidth, MIN_WIDTH), MAX_WIDTH)
  }
}

function stopResize() {
  isResizing.value = false
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}
</script>

<template>
  <div class="flex h-screen w-full bg-gray-50 dark:bg-gray-950 overflow-hidden">
    <!-- Desktop Sidebar -->
    <aside 
      v-if="!sidebarCollapsed"
      class="hidden lg:flex h-full relative"
      :style="{ width: `${sidebarWidth}px` }"
    >
      <DashboardSidebar :width="sidebarWidth" @collapse="sidebarCollapsed = true" />
      
      <!-- Resize Handle -->
      <div
        class="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary-500/50 transition-colors z-10 group"
        :class="{ 'bg-primary-500': isResizing }"
        @mousedown="startResize"
      >
        <div class="absolute top-1/2 -translate-y-1/2 right-0 w-4 h-8 -mr-1.5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div class="w-1 h-6 rounded-full bg-gray-300 dark:bg-gray-600"></div>
        </div>
      </div>
    </aside>

    <!-- Collapsed Sidebar Toggle Button (Desktop) -->
    <div 
      v-if="sidebarCollapsed" 
      class="hidden lg:flex items-start pt-4 pl-2 h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800"
    >
      <UButton
        icon="i-heroicons-bars-3"
        color="neutral"
        variant="ghost"
        size="lg"
        @click="toggleSidebar"
        aria-label="Open sidebar"
      />
    </div>

    <!-- Mobile Sidebar Slideover -->
    <USlideover v-model:open="sidebarOpen" side="left" :overlay="true" :ui="{ content: 'max-w-64' }">
      <template #content>
        <DashboardSidebar @click="sidebarOpen = false" />
      </template>
    </USlideover>

    <!-- Main Content -->
    <div class="flex flex-col flex-1 w-full h-full overflow-hidden">
      <DashboardHeader :sidebar-collapsed="sidebarCollapsed" @toggle-sidebar="toggleSidebar" />
      
      <main class="flex-1 overflow-y-auto p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
