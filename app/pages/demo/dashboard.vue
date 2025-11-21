<script setup lang="ts">
const stats = [{
  label: 'Total Users',
  value: '2,543',
  icon: 'i-heroicons-users',
  color: 'text-blue-500',
  change: '+12.5%',
  changeColor: 'text-green-500'
}, {
  label: 'Revenue',
  value: '$45,231',
  icon: 'i-heroicons-currency-dollar',
  color: 'text-green-500',
  change: '+4.3%',
  changeColor: 'text-green-500'
}, {
  label: 'Active Sessions',
  value: '128',
  icon: 'i-heroicons-signal',
  color: 'text-amber-500',
  change: '-2.1%',
  changeColor: 'text-red-500'
}, {
  label: 'Bounce Rate',
  value: '24.5%',
  icon: 'i-heroicons-arrow-trending-down',
  color: 'text-red-500',
  change: '+1.2%',
  changeColor: 'text-red-500'
}]

const recentActivity = [{
  id: 1,
  user: 'Courtney Henry',
  action: 'Created a new project',
  date: '2 minutes ago',
  status: 'completed'
}, {
  id: 2,
  user: 'Tom Cook',
  action: 'Deleted a file',
  date: '5 minutes ago',
  status: 'failed'
}, {
  id: 3,
  user: 'Whitney Francis',
  action: 'Updated profile',
  date: '12 minutes ago',
  status: 'completed'
}, {
  id: 4,
  user: 'Leonard Krasner',
  action: 'Changed password',
  date: '24 minutes ago',
  status: 'completed'
}]

const columns = [{
  accessorKey: 'user',
  header: 'User'
}, {
  accessorKey: 'action',
  header: 'Action'
}, {
  accessorKey: 'date',
  header: 'Date'
}, {
  accessorKey: 'status',
  header: 'Status'
}]
</script>

<template>
  <div class="space-y-6">
    <!-- Welcome Section -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Welcome back, Lily!</h2>
        <p class="text-gray-500 dark:text-gray-400">Here's what's happening with your project today.</p>
      </div>
      <UButton icon="i-heroicons-plus" color="primary">New Project</UButton>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <UCard v-for="stat in stats" :key="stat.label">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ stat.label }}</p>
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mt-1">{{ stat.value }}</h3>
          </div>
          <div :class="`p-2 rounded-lg bg-gray-50 dark:bg-gray-800 ${stat.color}`">
            <UIcon :name="stat.icon" class="w-6 h-6" />
          </div>
        </div>
        <div class="mt-4 flex items-center text-sm">
          <span :class="stat.changeColor" class="font-medium">{{ stat.change }}</span>
          <span class="text-gray-500 dark:text-gray-400 ml-2">from last month</span>
        </div>
      </UCard>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Chart Area (Placeholder) -->
      <div class="lg:col-span-2">
        <UCard class="h-full">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-gray-900 dark:text-white">Revenue Overview</h3>
              <USelectMenu :options="['Last 7 days', 'Last 30 days', 'Last Year']" model-value="Last 7 days" />
            </div>
          </template>
          <div class="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div class="text-center">
              <UIcon name="i-heroicons-chart-bar" class="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <span class="text-gray-500">Chart Visualization Placeholder</span>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Recent Activity -->
      <div>
        <UCard>
          <template #header>
            <h3 class="font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
          </template>
          <div class="space-y-4">
            <div v-for="activity in recentActivity" :key="activity.id" class="flex items-start gap-3">
              <UAvatar :alt="activity.user" size="sm" />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ activity.user }}</p>
                <p class="text-sm text-gray-500 truncate">{{ activity.action }}</p>
              </div>
              <span class="text-xs text-gray-400 whitespace-nowrap">{{ activity.date }}</span>
            </div>
          </div>
          <template #footer>
             <UButton block variant="ghost" color="gray">View all activity</UButton>
          </template>
        </UCard>
      </div>
    </div>

    <!-- Data Table -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="font-semibold text-gray-900 dark:text-white">Project Status</h3>
          <div class="flex gap-2">
             <UInput icon="i-heroicons-magnifying-glass" placeholder="Search..." />
             <UButton icon="i-heroicons-funnel" variant="ghost" color="gray" />
          </div>
        </div>
      </template>
      
      <UTable :data="recentActivity" :columns="columns">
        <template #status-cell="{ row }">
          <UBadge :color="row.original.status === 'completed' ? 'success' : 'error'" variant="subtle">{{ row.original.status }}</UBadge>
        </template>
      </UTable>
    </UCard>
  </div>
</template>
