<script setup lang="ts">
const colorMode = useColorMode()

const isDark = computed({
  get () {
    return colorMode.value === 'dark'
  },
  set () {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  }
})
const { data: healthData, error: healthError, status, refresh } = useFetch('/api/health', {
  server: false,
  lazy: true,
  watch: false
})

// Refresh health check when window gains focus
onMounted(() => {
  window.addEventListener('focus', () => refresh())
})

onUnmounted(() => {
  window.removeEventListener('focus', () => refresh())
})

const backendStatus = computed(() => {
  console.log('Health Status:', status.value, healthData.value, healthError.value)
  if (status.value === 'error' || healthError.value) return 'offline'
  if (status.value === 'success' && healthData.value?.status === 'ok') return 'online'
  return 'connecting'
})

const statusColor = computed(() => {
  switch (backendStatus.value) {
    case 'online': return 'green'
    case 'offline': return 'red'
    default: return 'orange'
  }
})
</script>

<template>
  <header class="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between px-6">
    <div class="flex items-center gap-4">
      <UButton icon="i-heroicons-bars-3" color="gray" variant="ghost" class="lg:hidden" />
      <h1 class="font-semibold text-gray-900 dark:text-white">Dashboard</h1>
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
        color="gray"
        variant="ghost"
        aria-label="Theme"
        @click="isDark = !isDark"
      />
      <UAvatar
        src="https://avatars.githubusercontent.com/u/739984?v=4"
        alt="Avatar"
      />
    </div>
  </header>
</template>
