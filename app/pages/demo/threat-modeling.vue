<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'

// Shape types for threat modeling (DFD-based)
type ShapeType = 'process' | 'dataStore' | 'externalEntity' | 'dataFlow' | 'trustBoundary'

interface Shape {
  id: string
  type: ShapeType
  x: number
  y: number
  width: number
  height: number
  label: string
  description?: string
  threats: Threat[]
}

interface DataFlow {
  id: string
  type: 'dataFlow'
  fromId: string
  toId: string
  label: string
  description?: string
  threats: Threat[]
}

interface TrustBoundary {
  id: string
  type: 'trustBoundary'
  x: number
  y: number
  width: number
  height: number
  label: string
  description?: string
}

// STRIDE threat categories
type ThreatCategory = 'Spoofing' | 'Tampering' | 'Repudiation' | 'Information Disclosure' | 'Denial of Service' | 'Elevation of Privilege'

interface Threat {
  id: string
  category: ThreatCategory
  title: string
  description: string
  severity: 'Low' | 'Medium' | 'High' | 'Critical'
  status: 'Open' | 'Mitigated' | 'Accepted' | 'Transferred'
  mitigation?: string
}

// Shape definitions for picker
const shapeDefinitions = [
  { type: 'process' as ShapeType, label: 'Process', icon: 'i-heroicons-cog-6-tooth', description: 'Transforms data' },
  { type: 'dataStore' as ShapeType, label: 'Data Store', icon: 'i-heroicons-circle-stack', description: 'Stores data' },
  { type: 'externalEntity' as ShapeType, label: 'External Entity', icon: 'i-heroicons-user', description: 'External actor/system' },
  { type: 'trustBoundary' as ShapeType, label: 'Trust Boundary', icon: 'i-heroicons-shield-check', description: 'Security boundary' }
]

const threatCategories: ThreatCategory[] = [
  'Spoofing',
  'Tampering',
  'Repudiation',
  'Information Disclosure',
  'Denial of Service',
  'Elevation of Privilege'
]

const severityLevels = ['Low', 'Medium', 'High', 'Critical'] as const
const statusOptions = ['Open', 'Mitigated', 'Accepted', 'Transferred'] as const

// State
const shapes = ref<Shape[]>([])
const trustBoundaries = ref<TrustBoundary[]>([])
const dataFlows = ref<DataFlow[]>([])
const selectedShapeType = ref<ShapeType | null>(null)
const selectedShape = ref<Shape | TrustBoundary | DataFlow | null>(null)
const isAddingDataFlow = ref(false)
const dataFlowStart = ref<string | null>(null)

// Modal states
const showShapeModal = ref(false)
const showThreatModal = ref(false)
const showDataFlowModal = ref(false)

// Form states
const shapeForm = reactive({
  label: '',
  description: ''
})

const threatForm = reactive({
  category: 'Spoofing' as ThreatCategory,
  title: '',
  description: '',
  severity: 'Medium' as 'Low' | 'Medium' | 'High' | 'Critical',
  status: 'Open' as 'Open' | 'Mitigated' | 'Accepted' | 'Transferred',
  mitigation: ''
})

const dataFlowForm = reactive({
  label: '',
  description: ''
})

// Canvas dragging
const isDragging = ref(false)
const draggedShape = ref<Shape | TrustBoundary | null>(null)
const dragOffset = ref({ x: 0, y: 0 })

// Computed
const allThreats = computed(() => {
  const threats: { shape: Shape | DataFlow; threat: Threat }[] = []
  shapes.value.forEach(shape => {
    shape.threats.forEach(threat => {
      threats.push({ shape, threat })
    })
  })
  dataFlows.value.forEach(flow => {
    flow.threats.forEach(threat => {
      threats.push({ shape: flow, threat })
    })
  })
  return threats
})

// Computed property for selected data flow to avoid repeated type casting
const selectedDataFlow = computed(() => {
  if (selectedShape.value && selectedShape.value.type === 'dataFlow') {
    return selectedShape.value as DataFlow
  }
  return null
})

const threatStats = computed(() => {
  const stats = {
    total: allThreats.value.length,
    open: 0,
    mitigated: 0,
    accepted: 0,
    transferred: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0
  }
  
  allThreats.value.forEach(({ threat }) => {
    const statusKey = threat.status.toLowerCase()
    const severityKey = threat.severity.toLowerCase()
    
    if (statusKey in stats) {
      stats[statusKey as 'open' | 'mitigated' | 'accepted' | 'transferred']++
    }
    if (severityKey in stats) {
      stats[severityKey as 'critical' | 'high' | 'medium' | 'low']++
    }
  })
  
  return stats
})

// Functions
function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

function selectShapeType(type: ShapeType) {
  if (type === 'trustBoundary') {
    selectedShapeType.value = type
    isAddingDataFlow.value = false
    dataFlowStart.value = null
  } else {
    selectedShapeType.value = type
    isAddingDataFlow.value = false
    dataFlowStart.value = null
  }
}

function startDataFlowMode() {
  isAddingDataFlow.value = true
  selectedShapeType.value = null
  dataFlowStart.value = null
}

function handleCanvasClick(event: MouseEvent) {
  const canvas = event.currentTarget as HTMLElement
  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  if (selectedShapeType.value === 'trustBoundary') {
    const boundary: TrustBoundary = {
      id: generateId(),
      type: 'trustBoundary',
      x: x - 100,
      y: y - 75,
      width: 200,
      height: 150,
      label: `Trust Boundary ${trustBoundaries.value.length + 1}`,
      description: ''
    }
    trustBoundaries.value.push(boundary)
    selectedShapeType.value = null
  } else if (selectedShapeType.value) {
    const shape: Shape = {
      id: generateId(),
      type: selectedShapeType.value,
      x: x - 40,
      y: y - 40,
      width: 80,
      height: 80,
      label: `${selectedShapeType.value} ${shapes.value.length + 1}`,
      description: '',
      threats: []
    }
    shapes.value.push(shape)
    selectedShapeType.value = null
  }
}

function handleShapeClick(shape: Shape | TrustBoundary, event: MouseEvent) {
  event.stopPropagation()
  
  if (isAddingDataFlow.value && 'threats' in shape) {
    if (!dataFlowStart.value) {
      dataFlowStart.value = shape.id
    } else if (dataFlowStart.value !== shape.id) {
      // Create data flow
      const flow: DataFlow = {
        id: generateId(),
        type: 'dataFlow',
        fromId: dataFlowStart.value,
        toId: shape.id,
        label: 'Data Flow',
        description: '',
        threats: []
      }
      dataFlows.value.push(flow)
      dataFlowStart.value = null
      isAddingDataFlow.value = false
    }
  } else {
    selectedShape.value = shape
    shapeForm.label = shape.label
    shapeForm.description = shape.description || ''
    showShapeModal.value = true
  }
}

function handleDataFlowClick(flow: DataFlow, event: MouseEvent) {
  event.stopPropagation()
  selectedShape.value = flow
  dataFlowForm.label = flow.label
  dataFlowForm.description = flow.description || ''
  showDataFlowModal.value = true
}

function saveShapeDetails() {
  if (selectedShape.value && 'type' in selectedShape.value) {
    selectedShape.value.label = shapeForm.label
    selectedShape.value.description = shapeForm.description
  }
  showShapeModal.value = false
}

function saveDataFlowDetails() {
  if (selectedShape.value && selectedShape.value.type === 'dataFlow') {
    (selectedShape.value as DataFlow).label = dataFlowForm.label
    (selectedShape.value as DataFlow).description = dataFlowForm.description
  }
  showDataFlowModal.value = false
}

function deleteSelectedShape() {
  const shape = selectedShape.value
  if (!shape) return
  
  if (shape.type === 'trustBoundary') {
    trustBoundaries.value = trustBoundaries.value.filter(b => b.id !== shape.id)
  } else if (shape.type === 'dataFlow') {
    dataFlows.value = dataFlows.value.filter(f => f.id !== shape.id)
  } else {
    // Remove shape and its related data flows
    const shapeId = shape.id
    shapes.value = shapes.value.filter(s => s.id !== shapeId)
    dataFlows.value = dataFlows.value.filter(f => f.fromId !== shapeId && f.toId !== shapeId)
  }
  
  selectedShape.value = null
  showShapeModal.value = false
  showDataFlowModal.value = false
}

function openAddThreatModal() {
  threatForm.category = 'Spoofing'
  threatForm.title = ''
  threatForm.description = ''
  threatForm.severity = 'Medium'
  threatForm.status = 'Open'
  threatForm.mitigation = ''
  showThreatModal.value = true
}

function addThreat() {
  if (!selectedShape.value || !('threats' in selectedShape.value)) return
  
  const threat: Threat = {
    id: generateId(),
    category: threatForm.category,
    title: threatForm.title,
    description: threatForm.description,
    severity: threatForm.severity,
    status: threatForm.status,
    mitigation: threatForm.mitigation
  }
  
  selectedShape.value.threats.push(threat)
  showThreatModal.value = false
}

function removeThreat(threatId: string) {
  if (!selectedShape.value || !('threats' in selectedShape.value)) return
  selectedShape.value.threats = selectedShape.value.threats.filter(t => t.id !== threatId)
}

function getShapeById(id: string): Shape | undefined {
  return shapes.value.find(s => s.id === id)
}

function getDataFlowPath(flow: DataFlow): string {
  const from = getShapeById(flow.fromId)
  const to = getShapeById(flow.toId)
  
  if (!from || !to) return ''
  
  const startX = from.x + from.width / 2
  const startY = from.y + from.height / 2
  const endX = to.x + to.width / 2
  const endY = to.y + to.height / 2
  
  return `M ${startX} ${startY} L ${endX} ${endY}`
}

function getDataFlowLabelPosition(flow: DataFlow): { x: number; y: number } {
  const from = getShapeById(flow.fromId)
  const to = getShapeById(flow.toId)
  
  if (!from || !to) return { x: 0, y: 0 }
  
  return {
    x: (from.x + from.width / 2 + to.x + to.width / 2) / 2,
    y: (from.y + from.height / 2 + to.y + to.height / 2) / 2 - 10
  }
}

// Dragging handlers
function startDrag(shape: Shape | TrustBoundary, event: MouseEvent) {
  if (isAddingDataFlow.value) return
  
  event.preventDefault()
  isDragging.value = true
  draggedShape.value = shape
  
  const rect = (event.currentTarget as HTMLElement).closest('.canvas-container')?.getBoundingClientRect()
  if (rect) {
    dragOffset.value = {
      x: event.clientX - rect.left - shape.x,
      y: event.clientY - rect.top - shape.y
    }
  }
}

function handleDrag(event: MouseEvent) {
  const shape = draggedShape.value
  if (!isDragging.value || !shape) return
  
  const canvas = document.querySelector('.canvas-container')
  if (!canvas) return
  
  const rect = canvas.getBoundingClientRect()
  const newX = event.clientX - rect.left - dragOffset.value.x
  const newY = event.clientY - rect.top - dragOffset.value.y
  
  shape.x = Math.max(0, Math.min(newX, rect.width - shape.width))
  shape.y = Math.max(0, Math.min(newY, rect.height - shape.height))
}

function stopDrag() {
  isDragging.value = false
  draggedShape.value = null
}

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'Critical': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300'
    case 'High': return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300'
    case 'Medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300'
    case 'Low': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300'
    default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300'
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'Open': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300'
    case 'Mitigated': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300'
    case 'Accepted': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300'
    case 'Transferred': return 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300'
    default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300'
  }
}

// Load/Save from localStorage
const STORAGE_KEY = 'threat_modeling_data'

function saveToStorage() {
  const data = {
    shapes: shapes.value,
    trustBoundaries: trustBoundaries.value,
    dataFlows: dataFlows.value
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function loadFromStorage() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      const data = JSON.parse(saved)
      shapes.value = data.shapes || []
      trustBoundaries.value = data.trustBoundaries || []
      dataFlows.value = data.dataFlows || []
    } catch (error) {
      console.error('Failed to load saved data:', error)
    }
  }
}

function clearAll() {
  if (confirm('Are you sure you want to clear all elements? This cannot be undone.')) {
    shapes.value = []
    trustBoundaries.value = []
    dataFlows.value = []
    localStorage.removeItem(STORAGE_KEY)
  }
}

// Auto-save on changes
watch([shapes, trustBoundaries, dataFlows], () => {
  saveToStorage()
}, { deep: true })

// Mouse move/up handlers
onMounted(() => {
  loadFromStorage()
  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', stopDrag)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="container mx-auto px-4 py-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            Threat Modeling
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            Create Data Flow Diagrams and identify threats using STRIDE methodology
          </p>
        </div>
        <UButton color="error" variant="soft" @click="clearAll">
          <UIcon name="i-heroicons-trash" class="mr-2" />
          Clear All
        </UButton>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <div class="text-sm text-gray-500 dark:text-gray-400">Total Threats</div>
          <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ threatStats.total }}</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <div class="text-sm text-gray-500 dark:text-gray-400">Open</div>
          <div class="text-2xl font-bold text-red-600">{{ threatStats.open }}</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <div class="text-sm text-gray-500 dark:text-gray-400">Mitigated</div>
          <div class="text-2xl font-bold text-green-600">{{ threatStats.mitigated }}</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <div class="text-sm text-gray-500 dark:text-gray-400">Critical/High</div>
          <div class="text-2xl font-bold text-orange-600">{{ threatStats.critical + threatStats.high }}</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Shape Picker Sidebar -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
          <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Shape Picker
          </h2>
          
          <div class="space-y-2">
            <div
              v-for="shape in shapeDefinitions"
              :key="shape.type"
              class="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors"
              :class="selectedShapeType === shape.type ? 'bg-primary-100 dark:bg-primary-900 border-2 border-primary-500' : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'"
              @click="selectShapeType(shape.type)"
            >
              <UIcon :name="shape.icon" class="w-6 h-6 text-gray-600 dark:text-gray-300" />
              <div>
                <div class="font-medium text-gray-800 dark:text-gray-200">{{ shape.label }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">{{ shape.description }}</div>
              </div>
            </div>
            
            <!-- Data Flow Button -->
            <div
              class="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors"
              :class="isAddingDataFlow ? 'bg-primary-100 dark:bg-primary-900 border-2 border-primary-500' : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'"
              @click="startDataFlowMode"
            >
              <UIcon name="i-heroicons-arrow-long-right" class="w-6 h-6 text-gray-600 dark:text-gray-300" />
              <div>
                <div class="font-medium text-gray-800 dark:text-gray-200">Data Flow</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">Connect elements</div>
              </div>
            </div>
          </div>
          
          <div class="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <p class="text-xs text-blue-700 dark:text-blue-300">
              <strong>Tip:</strong> Select a shape type then click on the canvas to place it. 
              For data flows, click on two shapes to connect them.
            </p>
          </div>
        </div>

        <!-- Canvas Area -->
        <div class="lg:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Data Flow Diagram
            </h2>
            <div class="flex gap-2">
              <span v-if="selectedShapeType" class="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-sm">
                Adding: {{ selectedShapeType }}
              </span>
              <span v-if="isAddingDataFlow" class="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-sm">
                {{ dataFlowStart ? 'Click destination shape' : 'Click source shape' }}
              </span>
            </div>
          </div>
          
          <div
            class="canvas-container relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 overflow-hidden"
            style="height: 500px"
            :class="{ 'cursor-crosshair': selectedShapeType || isAddingDataFlow }"
            @click="handleCanvasClick"
          >
            <!-- SVG for data flows and trust boundaries -->
            <svg class="absolute inset-0 w-full h-full pointer-events-none">
              <!-- Trust Boundaries -->
              <g v-for="boundary in trustBoundaries" :key="boundary.id">
                <rect
                  :x="boundary.x"
                  :y="boundary.y"
                  :width="boundary.width"
                  :height="boundary.height"
                  fill="none"
                  stroke="#ef4444"
                  stroke-width="2"
                  stroke-dasharray="8,4"
                  class="pointer-events-auto cursor-move"
                  @click.stop="handleShapeClick(boundary, $event)"
                  @mousedown="startDrag(boundary, $event)"
                />
                <text
                  :x="boundary.x + 8"
                  :y="boundary.y + 20"
                  class="fill-red-600 text-sm font-medium pointer-events-none"
                >
                  {{ boundary.label }}
                </text>
              </g>
              
              <!-- Data Flow Lines -->
              <g v-for="flow in dataFlows" :key="flow.id">
                <defs>
                  <marker
                    :id="`arrowhead-${flow.id}`"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3.5, 0 7"
                      class="fill-blue-500"
                    />
                  </marker>
                </defs>
                <path
                  :d="getDataFlowPath(flow)"
                  fill="none"
                  stroke="#3b82f6"
                  stroke-width="2"
                  :marker-end="`url(#arrowhead-${flow.id})`"
                  class="pointer-events-auto cursor-pointer hover:stroke-blue-700"
                  @click="handleDataFlowClick(flow, $event)"
                />
                <text
                  :x="getDataFlowLabelPosition(flow).x"
                  :y="getDataFlowLabelPosition(flow).y"
                  text-anchor="middle"
                  class="fill-blue-600 dark:fill-blue-400 text-xs font-medium pointer-events-auto cursor-pointer"
                  @click="handleDataFlowClick(flow, $event)"
                >
                  {{ flow.label }}
                </text>
              </g>
            </svg>

            <!-- Shapes -->
            <div
              v-for="shape in shapes"
              :key="shape.id"
              class="absolute cursor-pointer select-none"
              :class="{ 'ring-2 ring-primary-500': dataFlowStart === shape.id }"
              :style="{ left: shape.x + 'px', top: shape.y + 'px' }"
              @click="handleShapeClick(shape, $event)"
              @mousedown="startDrag(shape, $event)"
            >
              <!-- Process (Circle) -->
              <div
                v-if="shape.type === 'process'"
                class="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900 border-2 border-blue-500 flex items-center justify-center text-center p-2 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                <span class="text-xs font-medium text-blue-800 dark:text-blue-200 line-clamp-2">{{ shape.label }}</span>
              </div>
              
              <!-- Data Store (Two parallel lines) -->
              <div
                v-else-if="shape.type === 'dataStore'"
                class="w-20 h-16 bg-green-100 dark:bg-green-900 border-t-2 border-b-2 border-green-500 flex items-center justify-center text-center p-2 hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
              >
                <span class="text-xs font-medium text-green-800 dark:text-green-200 line-clamp-2">{{ shape.label }}</span>
              </div>
              
              <!-- External Entity (Rectangle) -->
              <div
                v-else-if="shape.type === 'externalEntity'"
                class="w-20 h-20 bg-purple-100 dark:bg-purple-900 border-2 border-purple-500 flex items-center justify-center text-center p-2 hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
              >
                <span class="text-xs font-medium text-purple-800 dark:text-purple-200 line-clamp-2">{{ shape.label }}</span>
              </div>
              
              <!-- Threat indicator -->
              <div
                v-if="shape.threats.length > 0"
                class="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
              >
                <span class="text-xs text-white font-bold">{{ shape.threats.length }}</span>
              </div>
            </div>
            
            <!-- Empty state -->
            <div v-if="shapes.length === 0 && trustBoundaries.length === 0" class="absolute inset-0 flex items-center justify-center">
              <div class="text-center text-gray-400 dark:text-gray-500">
                <UIcon name="i-heroicons-squares-2x2" class="w-12 h-12 mx-auto mb-2" />
                <p>Select a shape and click here to add elements</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Threat List -->
      <div class="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Threat Registry
        </h2>
        
        <div v-if="allThreats.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
          <UIcon name="i-heroicons-shield-exclamation" class="w-12 h-12 mx-auto mb-2" />
          <p>No threats identified yet. Click on elements to add threats.</p>
        </div>
        
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b dark:border-gray-700">
                <th class="text-left p-2 font-medium text-gray-600 dark:text-gray-300">Element</th>
                <th class="text-left p-2 font-medium text-gray-600 dark:text-gray-300">Category</th>
                <th class="text-left p-2 font-medium text-gray-600 dark:text-gray-300">Title</th>
                <th class="text-left p-2 font-medium text-gray-600 dark:text-gray-300">Severity</th>
                <th class="text-left p-2 font-medium text-gray-600 dark:text-gray-300">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="{ shape, threat } in allThreats" :key="threat.id" class="border-b dark:border-gray-700">
                <td class="p-2 text-gray-800 dark:text-gray-200">{{ shape.label }}</td>
                <td class="p-2 text-gray-600 dark:text-gray-400">{{ threat.category }}</td>
                <td class="p-2 text-gray-800 dark:text-gray-200">{{ threat.title }}</td>
                <td class="p-2">
                  <span :class="getSeverityColor(threat.severity)" class="px-2 py-1 rounded-full text-xs font-medium">
                    {{ threat.severity }}
                  </span>
                </td>
                <td class="p-2">
                  <span :class="getStatusColor(threat.status)" class="px-2 py-1 rounded-full text-xs font-medium">
                    {{ threat.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Shape Details Modal -->
    <UModal v-model:open="showShapeModal" title="Element Details" description="Configure this element">
      <template #body>
        <div class="space-y-4">
          <UFormField label="Label">
            <UInput v-model="shapeForm.label" />
          </UFormField>
          
          <UFormField label="Description">
            <UTextarea v-model="shapeForm.description" :rows="3" />
          </UFormField>
          
          <!-- Threats section (only for shapes with threats) -->
          <div v-if="selectedShape && 'threats' in selectedShape">
            <div class="flex items-center justify-between mb-2">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Threats</label>
              <UButton size="xs" @click="openAddThreatModal">
                <UIcon name="i-heroicons-plus" class="mr-1" />
                Add Threat
              </UButton>
            </div>
            
            <div v-if="selectedShape.threats.length === 0" class="text-sm text-gray-500 dark:text-gray-400 py-2">
              No threats added yet
            </div>
            
            <div v-else class="space-y-2 max-h-40 overflow-y-auto">
              <div
                v-for="threat in selectedShape.threats"
                :key="threat.id"
                class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
              >
                <div>
                  <div class="text-sm font-medium text-gray-800 dark:text-gray-200">{{ threat.title }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">{{ threat.category }} - {{ threat.severity }}</div>
                </div>
                <UButton size="xs" color="error" variant="ghost" @click="removeThreat(threat.id)">
                  <UIcon name="i-heroicons-trash" />
                </UButton>
              </div>
            </div>
          </div>
          
          <div class="flex justify-between pt-4">
            <UButton color="error" variant="soft" @click="deleteSelectedShape">
              <UIcon name="i-heroicons-trash" class="mr-1" />
              Delete
            </UButton>
            <div class="flex gap-2">
              <UButton color="neutral" variant="ghost" @click="showShapeModal = false">Cancel</UButton>
              <UButton color="primary" @click="saveShapeDetails">Save</UButton>
            </div>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Data Flow Modal -->
    <UModal v-model:open="showDataFlowModal" title="Data Flow Details" description="Configure this data flow">
      <template #body>
        <div class="space-y-4">
          <UFormField label="Label">
            <UInput v-model="dataFlowForm.label" />
          </UFormField>
          
          <UFormField label="Description">
            <UTextarea v-model="dataFlowForm.description" :rows="3" />
          </UFormField>
          
          <!-- Threats section for data flows -->
          <div v-if="selectedDataFlow">
            <div class="flex items-center justify-between mb-2">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Threats</label>
              <UButton size="xs" @click="openAddThreatModal">
                <UIcon name="i-heroicons-plus" class="mr-1" />
                Add Threat
              </UButton>
            </div>
            
            <div v-if="selectedDataFlow.threats.length === 0" class="text-sm text-gray-500 dark:text-gray-400 py-2">
              No threats added yet
            </div>
            
            <div v-else class="space-y-2 max-h-40 overflow-y-auto">
              <div
                v-for="threat in selectedDataFlow.threats"
                :key="threat.id"
                class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
              >
                <div>
                  <div class="text-sm font-medium text-gray-800 dark:text-gray-200">{{ threat.title }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">{{ threat.category }} - {{ threat.severity }}</div>
                </div>
                <UButton size="xs" color="error" variant="ghost" @click="removeThreat(threat.id)">
                  <UIcon name="i-heroicons-trash" />
                </UButton>
              </div>
            </div>
          </div>
          
          <div class="flex justify-between pt-4">
            <UButton color="error" variant="soft" @click="deleteSelectedShape">
              <UIcon name="i-heroicons-trash" class="mr-1" />
              Delete
            </UButton>
            <div class="flex gap-2">
              <UButton color="neutral" variant="ghost" @click="showDataFlowModal = false">Cancel</UButton>
              <UButton color="primary" @click="saveDataFlowDetails">Save</UButton>
            </div>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Add Threat Modal -->
    <UModal v-model:open="showThreatModal" title="Add Threat" description="Identify a new threat using STRIDE">
      <template #body>
        <div class="space-y-4">
          <UFormField label="Category (STRIDE)">
            <USelect v-model="threatForm.category" :items="threatCategories" />
          </UFormField>
          
          <UFormField label="Title" required>
            <UInput v-model="threatForm.title" placeholder="Brief threat description" />
          </UFormField>
          
          <UFormField label="Description">
            <UTextarea v-model="threatForm.description" :rows="3" placeholder="Detailed threat explanation" />
          </UFormField>
          
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Severity">
              <USelect v-model="threatForm.severity" :items="[...severityLevels]" />
            </UFormField>
            
            <UFormField label="Status">
              <USelect v-model="threatForm.status" :items="[...statusOptions]" />
            </UFormField>
          </div>
          
          <UFormField label="Mitigation">
            <UTextarea v-model="threatForm.mitigation" :rows="2" placeholder="How to mitigate this threat" />
          </UFormField>
          
          <div class="flex justify-end gap-2 pt-4">
            <UButton color="neutral" variant="ghost" @click="showThreatModal = false">Cancel</UButton>
            <UButton color="primary" @click="addThreat" :disabled="!threatForm.title">Add Threat</UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
