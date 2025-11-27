<script setup lang="ts">
const colorMode = useColorMode()
const sidebarOpen = inject<Ref<boolean>>('sidebarOpen')

const isDark = computed({
  get () {
    return colorMode.value === 'dark'
  },
  set () {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  }
})
interface HealthResponse {
  status: string
}

const { data: healthData, error: healthError, status, refresh } = useFetch<HealthResponse>('/api/health', {
  server: false,
  lazy: true,
  watch: false
})

const onFocus = () => {
  refresh()
}

// Refresh health check when window gains focus
onMounted(() => {
  window.addEventListener('focus', onFocus)
})

onUnmounted(() => {
  window.removeEventListener('focus', onFocus)
})

const backendStatus = computed(() => {
  if (status.value === 'error' || healthError.value) return 'offline'
  if (status.value === 'success' && healthData.value?.status === 'ok') return 'online'
  return 'connecting'
})

const statusColor = computed(() => {
  switch (backendStatus.value) {
    case 'online': return 'success'
    case 'offline': return 'error'
    default: return 'warning'
  }
})
</script>

<template>
  <header class="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between px-6">
    <div class="flex items-center gap-4">
      <UButton icon="i-heroicons-bars-3" color="neutral" variant="ghost" class="lg:hidden" @click="sidebarOpen = true" />
    </div>

    <div class="flex items-center gap-2">
      <UBadge :color="statusColor" variant="subtle" size="sm" class="flex items-center gap-1.5 mr-2">
        <span class="relative flex h-2 w-2">
          <span v-if="backendStatus === 'online'" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2" :class="{
            'bg-green-500': backendStatus === 'online',
            'bg-red-500': backendStatus === 'offline',
            'bg-orange-500': backendStatus === 'connecting'
          }"></span>
        </span>
        <span class="hidden sm:inline capitalize">{{ backendStatus }}</span>
      </UBadge>

      <UButton
        :icon="isDark ? 'i-heroicons-moon' : 'i-heroicons-sun'"
        color="neutral"
        variant="ghost"
        aria-label="Theme"
        @click="isDark = !isDark"
      />
    </div>
  </header>
</template>
