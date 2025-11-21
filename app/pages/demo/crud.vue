<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

interface Item {
  id: number
  name: string
  description?: string
  price: number
}

const { data: items, refresh, status } = await useFetch<Item[]>('/api/items')

const isOpen = ref(false)
const isEditing = ref(false)
const state = reactive({
  id: 0,
  name: '',
  description: '',
  price: 0
})

const columns: TableColumn<Item>[] = [{
  accessorKey: 'id',
  header: 'ID'
}, {
  accessorKey: 'name',
  header: 'Name'
}, {
  accessorKey: 'description',
  header: 'Description'
}, {
  accessorKey: 'price',
  header: 'Price'
}, {
  id: 'actions',
  header: 'Actions'
}]

const resetState = () => {
  state.id = 0
  state.name = ''
  state.description = ''
  state.price = 0
  isEditing.value = false
}

const openCreateModal = () => {
  resetState()
  isOpen.value = true
}

const openEditModal = (item: Item) => {
  state.id = item.id
  state.name = item.name
  state.description = item.description || ''
  state.price = item.price
  isEditing.value = true
  isOpen.value = true
}

const saveItem = async () => {
  try {
    if (isEditing.value) {
      await $fetch(`/api/items/${state.id}`, {
        method: 'PUT',
        body: {
          name: state.name,
          description: state.description,
          price: state.price
        }
      })
    } else {
      await $fetch('/api/items', {
        method: 'POST',
        body: {
          name: state.name,
          description: state.description,
          price: state.price
        }
      })
    }
    isOpen.value = false
    refresh()
  } catch (error) {
    console.error('Error saving item:', error)
    alert('Failed to save item')
  }
}

const deleteItem = async (id: number) => {
  if (!confirm('Are you sure you want to delete this item?')) return
  
  try {
    await $fetch(`/api/items/${id}`, {
      method: 'DELETE'
    })
    refresh()
  } catch (error) {
    console.error('Error deleting item:', error)
    alert('Failed to delete item')
  }
}
</script>

<template>
  <div class="p-4">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">CRUD Demo (Backend Connection)</h1>
      <UButton label="Add Item" @click="openCreateModal" />
    </div>

    <div v-if="status === 'pending'" class="text-center p-4">Loading...</div>
    <UTable v-else :data="items || []" :columns="columns">
      <template #actions-cell="{ row }">
        <div class="flex gap-2">
          <UButton icon="i-heroicons-pencil-square" color="primary" variant="ghost" size="xs" @click="openEditModal(row.original)" />
          <UButton icon="i-heroicons-trash" color="error" variant="ghost" size="xs" @click="deleteItem(row.original.id)" />
        </div>
      </template>
    </UTable>

    <UModal v-model:open="isOpen" :title="isEditing ? 'Edit Item' : 'Add Item'" description="Enter item details below">
      <template #body>
        <form @submit.prevent="saveItem" class="space-y-4">
          <UFormField label="Name" required>
            <UInput v-model="state.name" />
          </UFormField>
          
          <UFormField label="Description">
            <UInput v-model="state.description" />
          </UFormField>
          
          <UFormField label="Price" required>
            <UInput v-model="state.price" type="number" step="0.01" />
          </UFormField>

          <div class="flex justify-end gap-2 mt-6">
            <UButton label="Cancel" color="neutral" variant="ghost" @click="isOpen = false" />
            <UButton type="submit" label="Save" color="primary" />
          </div>
        </form>
      </template>
    </UModal>
  </div>
</template>