<script setup lang="ts">
const isOpen = ref(false)
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Modal Demo</h1>
    
    <UButton label="Open Modal" @click="isOpen = true" />

    <UModal v-model="isOpen">
      <div class="p-4">
        <div class="text-lg font-bold mb-2">Hello!</div>
        <p class="mb-4">This is a simple modal demo.</p>
        <div class="flex justify-end">
          <UButton label="Close" color="gray" variant="ghost" @click="isOpen = false" />
        </div>
      </div>
    </UModal>
  </div>
</template>