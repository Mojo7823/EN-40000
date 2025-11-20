<template>
  <div class="flex h-screen w-full bg-gray-50 dark:bg-gray-950 overflow-hidden">
    <!-- Sidebar -->
    <aside class="hidden lg:block h-full">
      <DashboardSidebar />
    </aside>

    <!-- Main Content -->
    <div class="flex flex-col flex-1 w-full h-full overflow-hidden">
      <DashboardHeader />
      
      <main class="flex-1 overflow-y-auto p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
