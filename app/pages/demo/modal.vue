<script setup lang="ts">
const open = ref(false)
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Modal Demo</h1>
    
    <UButton label="Open Modal" @click="open = true" />

    <UModal v-model:open="open" title="Modal with footer" description="This is a simple modal demo description.">
      <UButton label="Open" color="neutral" variant="subtle" />

      <template #body>
        <div class="p-4">
          <div class="text-lg font-bold mb-2">Hello!</div>
          <p class="mb-4">This is a simple modal demo.</p>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end">
          <UButton label="Close" color="neutral" variant="ghost" @click="open = false" />
        </div>
      </template>
    </UModal>
  </div>
</template>