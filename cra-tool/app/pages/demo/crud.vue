<script setup lang="ts">
interface Item {
  id: number
  name: string
  description?: string
  price: number
}

const { data: items, refresh, status } = await useFetch<Item[]>('/api/items', { lazy: true })

const isOpen = ref(false)
const isEditing = ref(false)
const state = reactive({
  id: 0,
  name: '',
  description: '',
  price: 0
})

const columns = [{
  key: 'id',
  label: 'ID'
}, {
  key: 'name',
  label: 'Name'
}, {
  key: 'description',
  label: 'Description'
}, {
  key: 'price',
  label: 'Price'
}, {
  key: 'actions',
  label: 'Actions'
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
    <UTable v-else :rows="items || []" :columns="columns">
      <template #actions-data="{ row }">
        <div class="flex gap-2">
          <UButton icon="i-heroicons-pencil-square" color="blue" variant="ghost" size="xs" @click="openEditModal(row)" />
          <UButton icon="i-heroicons-trash" color="red" variant="ghost" size="xs" @click="deleteItem(row.id)" />
        </div>
      </template>
    </UTable>

    <UModal v-model="isOpen">
      <div class="p-4">
        <h2 class="text-lg font-bold mb-4">{{ isEditing ? 'Edit Item' : 'Add Item' }}</h2>
        
        <form @submit.prevent="saveItem" class="space-y-4">
          <UFormGroup label="Name" required>
            <UInput v-model="state.name" />
          </UFormGroup>
          
          <UFormGroup label="Description">
            <UInput v-model="state.description" />
          </UFormGroup>
          
          <UFormGroup label="Price" required>
            <UInput v-model="state.price" type="number" step="0.01" />
          </UFormGroup>

          <div class="flex justify-end gap-2 mt-6">
            <UButton label="Cancel" color="gray" variant="ghost" @click="isOpen = false" />
            <UButton type="submit" label="Save" color="primary" />
          </div>
        </form>
      </div>
    </UModal>
  </div>
</template>