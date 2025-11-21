<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div class="text-center">
      <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        Welcome to CRA-Tool
      </h1>
      <p class="text-lg text-gray-600 dark:text-gray-400 mb-8">
        All pages have been moved to the demo section
      </p>
      <UButton 
        to="/demo/dashboard" 
        icon="i-heroicons-arrow-right" 
        size="lg"
        color="primary"
      >
        Go to Demo Dashboard
      </UButton>
    </div>
  </div>
</template>
