<template>
  <div class="card">
    <h2>Query Database Tables</h2>
    
    <!-- Table Selection -->
    <div class="table-selection" style="margin-bottom: 20px;">
      <h3>Available Tables</h3>
      <div class="table-categories">
        <!-- Functional Requirements Tables -->
        <div class="category" v-if="familyTables.functional?.length">
          <h4>Functional Requirements</h4>
          <div class="table-grid">
            <button 
              v-for="table in familyTables.functional" 
              :key="table.name"
              class="table-btn"
              :class="{ active: selectedTable === table.name }"
              @click="selectTable(table.name)"
            >
              <div class="table-name">{{ table.name }}</div>
              <div class="table-description">{{ table.description }}</div>
              <div class="table-count" v-if="tableCounts[table.name] !== undefined">
                {{ tableCounts[table.name] }} items
              </div>
            </button>
          </div>
        </div>

        <!-- Assurance Requirements Tables -->
        <div class="category" v-if="familyTables.assurance?.length">
          <h4>Assurance Requirements</h4>
          <div class="table-grid">
            <button 
              v-for="table in familyTables.assurance" 
              :key="table.name"
              class="table-btn"
              :class="{ active: selectedTable === table.name }"
              @click="selectTable(table.name)"
            >
              <div class="table-name">{{ table.name }}</div>
              <div class="table-description">{{ table.description }}</div>
              <div class="table-count" v-if="tableCounts[table.name] !== undefined">
                {{ tableCounts[table.name] }} items
              </div>
            </button>
          </div>
        </div>

        <!-- Special Tables -->
        <div class="category" v-if="familyTables.special?.length">
          <h4>Special Tables</h4>
          <div class="table-grid">
            <button 
              v-for="table in familyTables.special" 
              :key="table.name"
              class="table-btn"
              :class="{ active: selectedTable === table.name }"
              @click="selectTable(table.name)"
            >
              <div class="table-name">{{ table.name }}</div>
              <div class="table-description">{{ table.description }}</div>
              <div class="table-count" v-if="tableCounts[table.name] !== undefined">
                {{ tableCounts[table.name] }} items
              </div>
            </button>
          </div>
        </div>

        <!-- General Components Table -->
        <div class="category">
          <h4>General</h4>
          <div class="table-grid">
            <button 
              class="table-btn"
              :class="{ active: selectedTable === 'components' }"
              @click="selectTable('components')"
            >
              <div class="table-name">components</div>
              <div class="table-description">General components table</div>
              <div class="table-count" v-if="tableCounts.components !== undefined">
                {{ tableCounts.components }} items
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Data Display -->
    <div v-if="selectedTable" class="data-section">
      <div class="actions" style="margin-bottom: 12px;">
        <h3>{{ selectedTable }} Table Data</h3>
        <div style="display: flex; gap: 10px; align-items: center;">
          <input class="input" v-model="q" placeholder="Search..." @input="debouncedFetch" />
          <button class="btn" @click="fetchItems">Refresh</button>
        </div>
      </div>
      
      <div v-if="loading" class="loading">Loading...</div>
      
      <div v-else class="data-table-wrapper">
        <DataTable
          :key="selectedTable"
          :value="items"
          :loading="loading"
          :rows="rowsPerPage"
          :paginator="shouldShowPaginator"
          :rowsPerPageOptions="rowsPerPageOptions"
          paginatorTemplate="RowsPerPageDropdown PrevPageLink PageLinks NextPageLink"
          responsiveLayout="scroll"
          scrollable
          scrollHeight="520px"
          dataKey="id"
          stripedRows
          showGridlines
          class="prime-table"
        >
          <Column header="#" :style="{ width: '70px' }" headerStyle="text-align:center">
            <template #body="{ index }">
              <span class="row-index">{{ index + 1 }}</span>
            </template>
          </Column>

          <Column field="id" header="ID" sortable :style="{ width: '100px' }" />
          <Column field="class_display" header="Class" sortable :style="{ width: '140px' }" />
          <Column field="family" header="Family" sortable :style="{ width: '140px' }" />
          <Column field="component" header="Component" sortable :style="{ width: '160px' }" />
          <Column field="component_name" header="Component Name" sortable :style="{ width: '260px' }">
            <template #body="{ data }">
              <span class="component-name-cell">{{ data.component_name }}</span>
            </template>
          </Column>
          <Column field="element" header="Element" sortable :style="{ width: '180px' }" />
          <Column field="element_item" header="Element Item" :style="{ width: '320px' }">
            <template #body="{ data }">
              <span class="element-item-cell">{{ data.element_item }}</span>
            </template>
          </Column>

          <template #empty>
            <p>
              No data found in {{ selectedTable }} table.
              <span v-if="selectedTable !== 'components'">Try importing XML data first.</span>
            </p>
          </template>
        </DataTable>
      </div>
    </div>

    <div v-else class="no-selection">
      <p>Select a table above to view its data.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import api from '../../services/api'
// @ts-ignore
import DataTable from 'primevue/datatable'
// @ts-ignore
import Column from 'primevue/column'

type Item = { 
  id: number, 
  class?: string, 
  class_field?: string,  // For family tables
  family?: string, 
  component?: string, 
  component_name?: string, 
  element?: string, 
  element_item?: string,
  class_display?: string
}

type Table = {
  name: string
  description: string
}

type FamilyTables = {
  functional?: Table[]
  assurance?: Table[]
  special?: Table[]
}

const items = ref<Item[]>([])
const q = ref('')
const selectedTable = ref<string>('')
const familyTables = ref<FamilyTables>({})
const tableCounts = ref<Record<string, number>>({})
const loading = ref(false)
const rowsPerPage = 25
const rowsPerPageOptions = [10, 25, 50, 100]

const shouldShowPaginator = computed(() => items.value.length > rowsPerPage)
let timer: ReturnType<typeof setTimeout> | undefined

function debouncedFetch(){
  if (timer) clearTimeout(timer)
  timer = setTimeout(fetchItems, 300)
}

async function fetchFamilyTables() {
  try {
    const res = await api.get('/families')
    familyTables.value = res.data
    
    // Fetch counts for all tables
    await fetchTableCounts()
  } catch (error) {
    console.error('Error fetching family tables:', error)
  }
}

async function fetchTableCounts() {
  try {
    // Fetch counts for family tables
    const allTables = [
      ...(familyTables.value.functional || []),
      ...(familyTables.value.assurance || []),
      ...(familyTables.value.special || [])
    ]

    for (const table of allTables) {
      try {
        const res = await api.get(`/families/${table.name}/count`)
        tableCounts.value[table.name] = res.data.count
      } catch (error) {
        console.error(`Error fetching count for ${table.name}:`, error)
        tableCounts.value[table.name] = 0
      }
    }

    // Fetch count for general components table
    try {
      const res = await api.get('/components')
      tableCounts.value.components = res.data.length
    } catch (error) {
      console.error('Error fetching components count:', error)
      tableCounts.value.components = 0
    }
  } catch (error) {
    console.error('Error fetching table counts:', error)
  }
}

async function selectTable(tableName: string) {
  selectedTable.value = tableName
  q.value = '' // Clear search when switching tables
  await fetchItems()
}

async function fetchItems(){
  if (!selectedTable.value) return
  
  loading.value = true
  try {
    let res
    if (selectedTable.value === 'components') {
      res = await api.get('/components', { params: { q: q.value || undefined } })
    } else {
      res = await api.get(`/families/${selectedTable.value}`, { params: { q: q.value || undefined } })
    }
    // Process items to add class_display field
    items.value = res.data.map((item: Item) => ({
      ...item,
      class_display: item.class || item.class_field || ''
    }))
  } catch (error) {
    console.error('Error fetching items:', error)
    items.value = []
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchFamilyTables()
})
</script>

<style scoped src="./QueryDataPanel.css"></style>
