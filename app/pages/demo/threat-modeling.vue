<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'

const toast = useToast()

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

// Likelihood type for risk calculation
type Likelihood = 'Low' | 'Medium' | 'High' | 'Critical'

interface Threat {
  id: string
  category: ThreatCategory
  title: string
  description: string
  severity: 'Low' | 'Medium' | 'High' | 'Critical'
  likelihood: Likelihood
  status: 'Open' | 'Mitigated' | 'Accepted' | 'Transferred'
  mitigation?: string
}

// STRIDE category descriptions for tooltips
const strideDescriptions: Record<ThreatCategory, string> = {
  'Spoofing': 'Impersonating something or someone else',
  'Tampering': 'Modifying data or code',
  'Repudiation': 'Claiming to have not performed an action',
  'Information Disclosure': 'Exposing information to unauthorized users',
  'Denial of Service': 'Deny or degrade service to users',
  'Elevation of Privilege': 'Gain capabilities without proper authorization'
}

// Threat templates based on element type and STRIDE category
const threatTemplates: Record<string, Record<ThreatCategory, { title: string; description: string; mitigation: string }[]>> = {
  process: {
    'Spoofing': [
      { title: 'Process Impersonation', description: 'An attacker could impersonate this process to gain unauthorized access', mitigation: 'Implement strong authentication and process verification' }
    ],
    'Tampering': [
      { title: 'Code Injection', description: 'Malicious code could be injected into the process', mitigation: 'Input validation and code signing' },
      { title: 'Memory Corruption', description: 'Process memory could be tampered with', mitigation: 'Use memory-safe languages and ASLR' }
    ],
    'Repudiation': [
      { title: 'Action Denial', description: 'Users may deny performing actions through this process', mitigation: 'Implement comprehensive audit logging' }
    ],
    'Information Disclosure': [
      { title: 'Memory Leak', description: 'Sensitive data may leak through process memory', mitigation: 'Secure memory handling and encryption' }
    ],
    'Denial of Service': [
      { title: 'Resource Exhaustion', description: 'Process resources could be exhausted', mitigation: 'Implement rate limiting and resource quotas' }
    ],
    'Elevation of Privilege': [
      { title: 'Privilege Escalation', description: 'Attackers could gain elevated privileges', mitigation: 'Apply principle of least privilege' }
    ]
  },
  dataStore: {
    'Spoofing': [
      { title: 'Database Impersonation', description: 'Fake database could intercept data', mitigation: 'Use TLS and certificate validation' }
    ],
    'Tampering': [
      { title: 'SQL Injection', description: 'Malicious SQL could modify data', mitigation: 'Use parameterized queries and input validation' },
      { title: 'Unauthorized Data Modification', description: 'Data could be modified without authorization', mitigation: 'Implement access controls and integrity checks' }
    ],
    'Repudiation': [
      { title: 'Audit Log Tampering', description: 'Audit logs could be modified or deleted', mitigation: 'Implement tamper-proof logging' }
    ],
    'Information Disclosure': [
      { title: 'Unauthorized Data Access', description: 'Sensitive data could be accessed by unauthorized users', mitigation: 'Implement encryption at rest and access controls' },
      { title: 'Data Leakage', description: 'Data could leak through backup or exports', mitigation: 'Encrypt backups and control data exports' }
    ],
    'Denial of Service': [
      { title: 'Storage Exhaustion', description: 'Storage space could be exhausted', mitigation: 'Implement storage quotas and monitoring' }
    ],
    'Elevation of Privilege': [
      { title: 'Database Admin Access', description: 'Attackers could gain database admin privileges', mitigation: 'Restrict admin access and use role-based permissions' }
    ]
  },
  externalEntity: {
    'Spoofing': [
      { title: 'User Impersonation', description: 'Attackers could impersonate legitimate users', mitigation: 'Implement multi-factor authentication' },
      { title: 'Identity Theft', description: 'User credentials could be stolen', mitigation: 'Use secure credential storage and rotation' }
    ],
    'Tampering': [
      { title: 'Request Manipulation', description: 'User requests could be intercepted and modified', mitigation: 'Use HTTPS and request signing' }
    ],
    'Repudiation': [
      { title: 'Transaction Denial', description: 'Users may deny initiating transactions', mitigation: 'Implement non-repudiation mechanisms' }
    ],
    'Information Disclosure': [
      { title: 'Credential Exposure', description: 'User credentials could be exposed', mitigation: 'Use secure authentication protocols' }
    ],
    'Denial of Service': [
      { title: 'Account Lockout', description: 'Legitimate users could be locked out', mitigation: 'Implement smart lockout policies' }
    ],
    'Elevation of Privilege': [
      { title: 'Role Escalation', description: 'Users could gain unauthorized roles', mitigation: 'Implement strict role assignment controls' }
    ]
  },
  dataFlow: {
    'Spoofing': [
      { title: 'Man-in-the-Middle', description: 'Attacker could intercept communication', mitigation: 'Use TLS/SSL encryption' }
    ],
    'Tampering': [
      { title: 'Data Modification in Transit', description: 'Data could be modified during transmission', mitigation: 'Implement message authentication codes' }
    ],
    'Repudiation': [
      { title: 'Message Origin Denial', description: 'Sender may deny sending a message', mitigation: 'Use digital signatures' }
    ],
    'Information Disclosure': [
      { title: 'Eavesdropping', description: 'Data could be intercepted during transmission', mitigation: 'Use end-to-end encryption' }
    ],
    'Denial of Service': [
      { title: 'Network Flooding', description: 'Network could be overwhelmed with traffic', mitigation: 'Implement DDoS protection' }
    ],
    'Elevation of Privilege': [
      { title: 'Session Hijacking', description: 'Attacker could hijack authenticated sessions', mitigation: 'Implement secure session management' }
    ]
  }
}

// Undo/Redo action types
type ActionType = 'ADD_SHAPE' | 'DELETE_SHAPE' | 'MOVE_SHAPE' | 'ADD_TRUST_BOUNDARY' | 'DELETE_TRUST_BOUNDARY' | 'MOVE_TRUST_BOUNDARY' | 'ADD_DATA_FLOW' | 'DELETE_DATA_FLOW' | 'ADD_THREAT' | 'DELETE_THREAT' | 'UPDATE_THREAT' | 'UPDATE_SHAPE' | 'UPDATE_DATA_FLOW'

interface HistoryAction {
  type: ActionType
  data: unknown
  reverseData: unknown
}

// Risk score mapping
const riskScoreMap: Record<string, number> = {
  'Low': 1,
  'Medium': 2,
  'High': 3,
  'Critical': 4
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
const likelihoodLevels = ['Low', 'Medium', 'High', 'Critical'] as const
const statusOptions = ['Open', 'Mitigated', 'Accepted', 'Transferred'] as const

// State
const shapes = ref<Shape[]>([])
const trustBoundaries = ref<TrustBoundary[]>([])
const dataFlows = ref<DataFlow[]>([])
const selectedShapeType = ref<ShapeType | null>(null)
const selectedShape = ref<Shape | TrustBoundary | DataFlow | null>(null)
const isAddingDataFlow = ref(false)
const dataFlowStart = ref<string | null>(null)
const focusedShapeId = ref<string | null>(null)

// Modal states
const showShapeModal = ref(false)
const showThreatModal = ref(false)
const showDataFlowModal = ref(false)
const showKeyboardShortcutsModal = ref(false)
const isEditingThreat = ref(false)
const editingThreatId = ref<string | null>(null)

// Filter and sort state for threat registry
const filterSeverity = ref('All')
const filterStatus = ref('All')
const filterCategory = ref('All')
const sortColumn = ref<'element' | 'category' | 'title' | 'severity' | 'status' | 'riskScore'>('riskScore')
const sortDirection = ref<'asc' | 'desc'>('desc')

// Undo/Redo state
const historyStack = ref<HistoryAction[]>([])
const historyIndex = ref(-1)
const isUndoRedoAction = ref(false)

// File input ref for import
const fileInputRef = ref<HTMLInputElement | null>(null)

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
  likelihood: 'Medium' as Likelihood,
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

// Compute risk score for a threat
function calculateRiskScore(severity: string, likelihood: string): number {
  return riskScoreMap[severity] * riskScoreMap[likelihood]
}

function getRiskScoreLabel(score: number): string {
  if (score >= 12) return 'Critical'
  if (score >= 6) return 'High'
  if (score >= 3) return 'Medium'
  return 'Low'
}

function getRiskScoreColor(score: number): string {
  if (score >= 12) return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300'
  if (score >= 6) return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300'
  if (score >= 3) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300'
  return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300'
}

// Filtered and sorted threats for registry
const filteredThreats = computed(() => {
  let filtered = [...allThreats.value]
  
  // Apply filters
  if (filterSeverity.value !== 'All') {
    filtered = filtered.filter(({ threat }) => threat.severity === filterSeverity.value)
  }
  if (filterStatus.value !== 'All') {
    filtered = filtered.filter(({ threat }) => threat.status === filterStatus.value)
  }
  if (filterCategory.value !== 'All') {
    filtered = filtered.filter(({ threat }) => threat.category === filterCategory.value)
  }
  
  // Apply sorting
  filtered.sort((a, b) => {
    let comparison = 0
    switch (sortColumn.value) {
      case 'element':
        comparison = a.shape.label.localeCompare(b.shape.label)
        break
      case 'category':
        comparison = a.threat.category.localeCompare(b.threat.category)
        break
      case 'title':
        comparison = a.threat.title.localeCompare(b.threat.title)
        break
      case 'severity':
        comparison = riskScoreMap[a.threat.severity] - riskScoreMap[b.threat.severity]
        break
      case 'status':
        comparison = a.threat.status.localeCompare(b.threat.status)
        break
      case 'riskScore': {
        const scoreA = calculateRiskScore(a.threat.severity, a.threat.likelihood || 'Medium')
        const scoreB = calculateRiskScore(b.threat.severity, b.threat.likelihood || 'Medium')
        comparison = scoreA - scoreB
        break
      }
    }
    return sortDirection.value === 'asc' ? comparison : -comparison
  })
  
  return filtered
})

// Threat templates for current element
const currentThreatTemplates = computed(() => {
  if (!selectedShape.value || !('threats' in selectedShape.value)) return []
  const elementType = selectedShape.value.type
  const templates = threatTemplates[elementType]
  if (!templates) return []
  return templates[threatForm.category] || []
})

// Average risk score
const averageRiskScore = computed(() => {
  if (allThreats.value.length === 0) return 0
  const total = allThreats.value.reduce((sum, { threat }) => {
    return sum + calculateRiskScore(threat.severity, threat.likelihood || 'Medium')
  }, 0)
  return Math.round((total / allThreats.value.length) * 10) / 10
})

// Can undo/redo
const canUndo = computed(() => historyIndex.value >= 0)
const canRedo = computed(() => historyIndex.value < historyStack.value.length - 1)

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
    low: 0,
    avgRiskScore: averageRiskScore.value
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

// History/Undo-Redo functions
function pushToHistory(action: HistoryAction) {
  if (isUndoRedoAction.value) return
  
  // Remove any future history if we're not at the end
  if (historyIndex.value < historyStack.value.length - 1) {
    historyStack.value = historyStack.value.slice(0, historyIndex.value + 1)
  }
  
  historyStack.value.push(action)
  historyIndex.value = historyStack.value.length - 1
  
  // Limit history size
  if (historyStack.value.length > 50) {
    historyStack.value.shift()
    historyIndex.value--
  }
}

function undo() {
  if (!canUndo.value) return
  
  isUndoRedoAction.value = true
  const action = historyStack.value[historyIndex.value]
  
  applyReverseAction(action)
  historyIndex.value--
  
  nextTick(() => {
    isUndoRedoAction.value = false
  })
}

function redo() {
  if (!canRedo.value) return
  
  isUndoRedoAction.value = true
  historyIndex.value++
  const action = historyStack.value[historyIndex.value]
  
  applyAction(action)
  
  nextTick(() => {
    isUndoRedoAction.value = false
  })
}

function applyAction(action: HistoryAction) {
  switch (action.type) {
    case 'ADD_SHAPE':
      shapes.value.push(action.data as Shape)
      break
    case 'DELETE_SHAPE':
      shapes.value = shapes.value.filter(s => s.id !== (action.data as Shape).id)
      break
    case 'ADD_TRUST_BOUNDARY':
      trustBoundaries.value.push(action.data as TrustBoundary)
      break
    case 'DELETE_TRUST_BOUNDARY':
      trustBoundaries.value = trustBoundaries.value.filter(b => b.id !== (action.data as TrustBoundary).id)
      break
    case 'ADD_DATA_FLOW':
      dataFlows.value.push(action.data as DataFlow)
      break
    case 'DELETE_DATA_FLOW':
      dataFlows.value = dataFlows.value.filter(f => f.id !== (action.data as DataFlow).id)
      break
    case 'ADD_THREAT': {
      const { elementId, threat, elementType } = action.data as { elementId: string; threat: Threat; elementType: string }
      if (elementType === 'dataFlow') {
        const flow = dataFlows.value.find(f => f.id === elementId)
        if (flow) flow.threats.push(threat)
      } else {
        const shape = shapes.value.find(s => s.id === elementId)
        if (shape) shape.threats.push(threat)
      }
      break
    }
    case 'DELETE_THREAT': {
      const { elementId, threatId, elementType } = action.data as { elementId: string; threatId: string; elementType: string }
      if (elementType === 'dataFlow') {
        const flow = dataFlows.value.find(f => f.id === elementId)
        if (flow) flow.threats = flow.threats.filter(t => t.id !== threatId)
      } else {
        const shape = shapes.value.find(s => s.id === elementId)
        if (shape) shape.threats = shape.threats.filter(t => t.id !== threatId)
      }
      break
    }
    case 'UPDATE_THREAT': {
      const { elementId, threat, elementType } = action.data as { elementId: string; threat: Threat; elementType: string }
      if (elementType === 'dataFlow') {
        const flow = dataFlows.value.find(f => f.id === elementId)
        if (flow) {
          const index = flow.threats.findIndex(t => t.id === threat.id)
          if (index !== -1) flow.threats[index] = threat
        }
      } else {
        const shape = shapes.value.find(s => s.id === elementId)
        if (shape) {
          const index = shape.threats.findIndex(t => t.id === threat.id)
          if (index !== -1) shape.threats[index] = threat
        }
      }
      break
    }
    case 'MOVE_SHAPE': {
      const { id, x, y } = action.data as { id: string; x: number; y: number }
      const shape = shapes.value.find(s => s.id === id)
      if (shape) {
        shape.x = x
        shape.y = y
      }
      break
    }
    case 'MOVE_TRUST_BOUNDARY': {
      const { id, x, y } = action.data as { id: string; x: number; y: number }
      const boundary = trustBoundaries.value.find(b => b.id === id)
      if (boundary) {
        boundary.x = x
        boundary.y = y
      }
      break
    }
  }
}

function applyReverseAction(action: HistoryAction) {
  switch (action.type) {
    case 'ADD_SHAPE':
      shapes.value = shapes.value.filter(s => s.id !== (action.data as Shape).id)
      break
    case 'DELETE_SHAPE':
      shapes.value.push(action.reverseData as Shape)
      break
    case 'ADD_TRUST_BOUNDARY':
      trustBoundaries.value = trustBoundaries.value.filter(b => b.id !== (action.data as TrustBoundary).id)
      break
    case 'DELETE_TRUST_BOUNDARY':
      trustBoundaries.value.push(action.reverseData as TrustBoundary)
      break
    case 'ADD_DATA_FLOW':
      dataFlows.value = dataFlows.value.filter(f => f.id !== (action.data as DataFlow).id)
      break
    case 'DELETE_DATA_FLOW':
      dataFlows.value.push(action.reverseData as DataFlow)
      break
    case 'ADD_THREAT': {
      const { elementId, threat, elementType } = action.data as { elementId: string; threat: Threat; elementType: string }
      if (elementType === 'dataFlow') {
        const flow = dataFlows.value.find(f => f.id === elementId)
        if (flow) flow.threats = flow.threats.filter(t => t.id !== threat.id)
      } else {
        const shape = shapes.value.find(s => s.id === elementId)
        if (shape) shape.threats = shape.threats.filter(t => t.id !== threat.id)
      }
      break
    }
    case 'DELETE_THREAT': {
      const { elementId, threat, elementType } = action.reverseData as { elementId: string; threat: Threat; elementType: string }
      if (elementType === 'dataFlow') {
        const flow = dataFlows.value.find(f => f.id === elementId)
        if (flow) flow.threats.push(threat)
      } else {
        const shape = shapes.value.find(s => s.id === elementId)
        if (shape) shape.threats.push(threat)
      }
      break
    }
    case 'UPDATE_THREAT': {
      // For undo, we restore the old threat from reverseData
      const { elementId, threat, elementType } = action.reverseData as { elementId: string; threat: Threat; elementType: string }
      if (elementType === 'dataFlow') {
        const flow = dataFlows.value.find(f => f.id === elementId)
        if (flow) {
          const index = flow.threats.findIndex(t => t.id === threat.id)
          if (index !== -1) flow.threats[index] = threat
        }
      } else {
        const shape = shapes.value.find(s => s.id === elementId)
        if (shape) {
          const index = shape.threats.findIndex(t => t.id === threat.id)
          if (index !== -1) shape.threats[index] = threat
        }
      }
      break
    }
    case 'MOVE_SHAPE': {
      const { id, x, y } = action.reverseData as { id: string; x: number; y: number }
      const shape = shapes.value.find(s => s.id === id)
      if (shape) {
        shape.x = x
        shape.y = y
      }
      break
    }
    case 'MOVE_TRUST_BOUNDARY': {
      const { id, x, y } = action.reverseData as { id: string; x: number; y: number }
      const boundary = trustBoundaries.value.find(b => b.id === id)
      if (boundary) {
        boundary.x = x
        boundary.y = y
      }
      break
    }
  }
}

// Sort column toggle
function toggleSort(column: typeof sortColumn.value) {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortDirection.value = 'desc'
  }
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

// Cancel current operation
function cancelCurrentOperation() {
  selectedShapeType.value = null
  isAddingDataFlow.value = false
  dataFlowStart.value = null
  focusedShapeId.value = null
}

function handleCanvasClick(event: MouseEvent) {
  const canvas = event.currentTarget as HTMLElement
  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  // Clear focused shape when clicking on canvas
  focusedShapeId.value = null
  
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
    pushToHistory({
      type: 'ADD_TRUST_BOUNDARY',
      data: boundary,
      reverseData: null
    })
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
    pushToHistory({
      type: 'ADD_SHAPE',
      data: shape,
      reverseData: null
    })
    selectedShapeType.value = null
  }
}

function handleShapeClick(shape: Shape | TrustBoundary, event: MouseEvent) {
  event.stopPropagation()
  
  // Set focus for keyboard navigation
  focusedShapeId.value = shape.id
  
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
      pushToHistory({
        type: 'ADD_DATA_FLOW',
        data: flow,
        reverseData: null
      })
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
    const flow = selectedShape.value as DataFlow
    flow.label = dataFlowForm.label
    flow.description = dataFlowForm.description
  }
  showDataFlowModal.value = false
}

function deleteSelectedShape() {
  const shape = selectedShape.value
  if (!shape) return
  
  if (shape.type === 'trustBoundary') {
    const boundaryToDelete = trustBoundaries.value.find(b => b.id === shape.id)
    if (boundaryToDelete) {
      pushToHistory({
        type: 'DELETE_TRUST_BOUNDARY',
        data: { id: shape.id },
        reverseData: { ...boundaryToDelete }
      })
    }
    trustBoundaries.value = trustBoundaries.value.filter(b => b.id !== shape.id)
  } else if (shape.type === 'dataFlow') {
    const flowToDelete = dataFlows.value.find(f => f.id === shape.id)
    if (flowToDelete) {
      pushToHistory({
        type: 'DELETE_DATA_FLOW',
        data: { id: shape.id },
        reverseData: { ...flowToDelete, threats: [...flowToDelete.threats] }
      })
    }
    dataFlows.value = dataFlows.value.filter(f => f.id !== shape.id)
  } else {
    // Remove shape and its related data flows
    const shapeId = shape.id
    const shapeToDelete = shapes.value.find(s => s.id === shapeId)
    if (shapeToDelete) {
      pushToHistory({
        type: 'DELETE_SHAPE',
        data: { id: shapeId },
        reverseData: { ...shapeToDelete, threats: [...shapeToDelete.threats] }
      })
    }
    shapes.value = shapes.value.filter(s => s.id !== shapeId)
    dataFlows.value = dataFlows.value.filter(f => f.fromId !== shapeId && f.toId !== shapeId)
  }
  
  selectedShape.value = null
  focusedShapeId.value = null
  showShapeModal.value = false
  showDataFlowModal.value = false
}

// Delete focused element (for keyboard shortcut)
function deleteFocusedElement() {
  if (!focusedShapeId.value) return
  
  const shapeToDelete = shapes.value.find(s => s.id === focusedShapeId.value)
  const boundaryToDelete = trustBoundaries.value.find(b => b.id === focusedShapeId.value)
  
  if (shapeToDelete) {
    pushToHistory({
      type: 'DELETE_SHAPE',
      data: { id: shapeToDelete.id },
      reverseData: { ...shapeToDelete, threats: [...shapeToDelete.threats] }
    })
    shapes.value = shapes.value.filter(s => s.id !== focusedShapeId.value)
    dataFlows.value = dataFlows.value.filter(f => f.fromId !== focusedShapeId.value && f.toId !== focusedShapeId.value)
  } else if (boundaryToDelete) {
    pushToHistory({
      type: 'DELETE_TRUST_BOUNDARY',
      data: { id: boundaryToDelete.id },
      reverseData: { ...boundaryToDelete }
    })
    trustBoundaries.value = trustBoundaries.value.filter(b => b.id !== focusedShapeId.value)
  }
  
  focusedShapeId.value = null
}

function openAddThreatModal() {
  isEditingThreat.value = false
  editingThreatId.value = null
  threatForm.category = 'Spoofing'
  threatForm.title = ''
  threatForm.description = ''
  threatForm.severity = 'Medium'
  threatForm.likelihood = 'Medium'
  threatForm.status = 'Open'
  threatForm.mitigation = ''
  showThreatModal.value = true
}

function openEditThreatModal(threat: Threat) {
  isEditingThreat.value = true
  editingThreatId.value = threat.id
  threatForm.category = threat.category
  threatForm.title = threat.title
  threatForm.description = threat.description
  threatForm.severity = threat.severity
  threatForm.likelihood = threat.likelihood || 'Medium'
  threatForm.status = threat.status
  threatForm.mitigation = threat.mitigation || ''
  showThreatModal.value = true
}

function applyTemplate(template: { title: string; description: string; mitigation: string }) {
  threatForm.title = template.title
  threatForm.description = template.description
  threatForm.mitigation = template.mitigation
}

function addThreat() {
  if (!selectedShape.value || !('threats' in selectedShape.value)) return
  
  const threat: Threat = {
    id: generateId(),
    category: threatForm.category,
    title: threatForm.title,
    description: threatForm.description,
    severity: threatForm.severity,
    likelihood: threatForm.likelihood,
    status: threatForm.status,
    mitigation: threatForm.mitigation
  }
  
  selectedShape.value.threats.push(threat)
  pushToHistory({
    type: 'ADD_THREAT',
    data: { elementId: selectedShape.value.id, threat, elementType: selectedShape.value.type },
    reverseData: null
  })
  showThreatModal.value = false
}

function updateThreat() {
  if (!selectedShape.value || !('threats' in selectedShape.value) || !editingThreatId.value) return
  
  const threatIndex = selectedShape.value.threats.findIndex(t => t.id === editingThreatId.value)
  if (threatIndex === -1) return
  
  const oldThreat = { ...selectedShape.value.threats[threatIndex] }
  
  selectedShape.value.threats[threatIndex] = {
    id: editingThreatId.value,
    category: threatForm.category,
    title: threatForm.title,
    description: threatForm.description,
    severity: threatForm.severity,
    likelihood: threatForm.likelihood,
    status: threatForm.status,
    mitigation: threatForm.mitigation
  }
  
  pushToHistory({
    type: 'UPDATE_THREAT',
    data: { elementId: selectedShape.value.id, threat: selectedShape.value.threats[threatIndex], elementType: selectedShape.value.type },
    reverseData: { elementId: selectedShape.value.id, threat: oldThreat, elementType: selectedShape.value.type }
  })
  
  showThreatModal.value = false
  isEditingThreat.value = false
  editingThreatId.value = null
}

function saveThreat() {
  if (isEditingThreat.value) {
    updateThreat()
  } else {
    addThreat()
  }
}

function removeThreat(threatId: string) {
  if (!selectedShape.value || !('threats' in selectedShape.value)) return
  
  const threatToRemove = selectedShape.value.threats.find(t => t.id === threatId)
  if (threatToRemove) {
    pushToHistory({
      type: 'DELETE_THREAT',
      data: { elementId: selectedShape.value.id, threatId, elementType: selectedShape.value.type },
      reverseData: { elementId: selectedShape.value.id, threat: { ...threatToRemove }, elementType: selectedShape.value.type }
    })
  }
  
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
      // Migrate old data: add likelihood field if missing
      shapes.value = (data.shapes || []).map((shape: Shape) => ({
        ...shape,
        threats: shape.threats.map(threat => ({
          ...threat,
          likelihood: threat.likelihood || 'Medium'
        }))
      }))
      trustBoundaries.value = data.trustBoundaries || []
      dataFlows.value = (data.dataFlows || []).map((flow: DataFlow) => ({
        ...flow,
        threats: flow.threats.map(threat => ({
          ...threat,
          likelihood: threat.likelihood || 'Medium'
        }))
      }))
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
    historyStack.value = []
    historyIndex.value = -1
    localStorage.removeItem(STORAGE_KEY)
  }
}

// Export/Import functions
function exportToJSON() {
  const data = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    shapes: shapes.value,
    trustBoundaries: trustBoundaries.value,
    dataFlows: dataFlows.value
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `threat-model-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function triggerImportJSON() {
  fileInputRef.value?.click()
}

function handleImportJSON(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string)
      
      // Validate and migrate data
      if (data.shapes && Array.isArray(data.shapes)) {
        shapes.value = data.shapes.map((shape: Shape) => ({
          ...shape,
          threats: (shape.threats || []).map(threat => ({
            ...threat,
            likelihood: threat.likelihood || 'Medium'
          }))
        }))
      }
      if (data.trustBoundaries && Array.isArray(data.trustBoundaries)) {
        trustBoundaries.value = data.trustBoundaries
      }
      if (data.dataFlows && Array.isArray(data.dataFlows)) {
        dataFlows.value = data.dataFlows.map((flow: DataFlow) => ({
          ...flow,
          threats: (flow.threats || []).map(threat => ({
            ...threat,
            likelihood: threat.likelihood || 'Medium'
          }))
        }))
      }
      
      // Reset history after import
      historyStack.value = []
      historyIndex.value = -1
      
      toast.add({ title: 'Success', description: 'Threat model imported successfully!', color: 'success' })
    } catch (error) {
      console.error('Failed to import:', error)
      toast.add({ title: 'Error', description: 'Failed to import threat model. Please check the file format.', color: 'error' })
    }
  }
  reader.readAsText(file)
  
  // Reset input value to allow importing the same file again
  input.value = ''
}

function exportToCSV() {
  if (allThreats.value.length === 0) {
    toast.add({ title: 'Info', description: 'No threats to export.', color: 'neutral' })
    return
  }
  
  const headers = ['Element', 'Element Type', 'Category', 'Title', 'Description', 'Severity', 'Likelihood', 'Risk Score', 'Status', 'Mitigation']
  const rows = allThreats.value.map(({ shape, threat }) => {
    const riskScore = calculateRiskScore(threat.severity, threat.likelihood || 'Medium')
    return [
      shape.label,
      shape.type,
      threat.category,
      threat.title,
      threat.description.replace(/"/g, '""'),
      threat.severity,
      threat.likelihood || 'Medium',
      `${riskScore} (${getRiskScoreLabel(riskScore)})`,
      threat.status,
      (threat.mitigation || '').replace(/"/g, '""')
    ].map(field => `"${field}"`).join(',')
  })
  
  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `threat-registry-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Keyboard event handler
function handleKeyDown(event: KeyboardEvent) {
  // Don't handle keyboard shortcuts when typing in an input
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
    return
  }
  
  // Escape - cancel current operation
  if (event.key === 'Escape') {
    if (showShapeModal.value || showDataFlowModal.value || showThreatModal.value || showKeyboardShortcutsModal.value) {
      showShapeModal.value = false
      showDataFlowModal.value = false
      showThreatModal.value = false
      showKeyboardShortcutsModal.value = false
    } else {
      cancelCurrentOperation()
    }
    return
  }
  
  // Delete - remove focused element
  if (event.key === 'Delete' || event.key === 'Backspace') {
    if (focusedShapeId.value && !showShapeModal.value && !showDataFlowModal.value && !showThreatModal.value) {
      event.preventDefault()
      deleteFocusedElement()
    }
    return
  }
  
  // Ctrl+Z - Undo
  if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
    event.preventDefault()
    undo()
    return
  }
  
  // Ctrl+Y or Ctrl+Shift+Z - Redo
  if ((event.ctrlKey || event.metaKey) && (event.key === 'y' || (event.key === 'z' && event.shiftKey))) {
    event.preventDefault()
    redo()
    return
  }
  
  // ? - Show keyboard shortcuts
  if (event.key === '?' && !event.ctrlKey && !event.metaKey) {
    event.preventDefault()
    showKeyboardShortcutsModal.value = true
    return
  }
}

// Auto-save on changes
watch([shapes, trustBoundaries, dataFlows], () => {
  saveToStorage()
}, { deep: true })

// Mouse move/up handlers and keyboard events
onMounted(() => {
  loadFromStorage()
  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Hidden file input for JSON import -->
    <input
      ref="fileInputRef"
      type="file"
      accept=".json"
      class="hidden"
      aria-label="Import threat model from JSON file"
      @change="handleImportJSON"
    >
    
    <div class="container mx-auto px-4 py-6">
      <!-- Header -->
      <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            Threat Modeling
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            Create Data Flow Diagrams and identify threats using STRIDE methodology
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <!-- Undo/Redo buttons -->
          <UButton
            :disabled="!canUndo"
            color="neutral"
            variant="soft"
            aria-label="Undo last action (Ctrl+Z)"
            @click="undo"
          >
            <UIcon name="i-heroicons-arrow-uturn-left" class="mr-1" />
            Undo
          </UButton>
          <UButton
            :disabled="!canRedo"
            color="neutral"
            variant="soft"
            aria-label="Redo last action (Ctrl+Y)"
            @click="redo"
          >
            <UIcon name="i-heroicons-arrow-uturn-right" class="mr-1" />
            Redo
          </UButton>
          
          <!-- Export/Import buttons -->
          <UButton color="primary" variant="soft" aria-label="Export threat model to JSON" @click="exportToJSON">
            <UIcon name="i-heroicons-arrow-down-tray" class="mr-1" />
            Export JSON
          </UButton>
          <UButton color="primary" variant="soft" aria-label="Import threat model from JSON" @click="triggerImportJSON">
            <UIcon name="i-heroicons-arrow-up-tray" class="mr-1" />
            Import JSON
          </UButton>
          <UButton color="primary" variant="soft" aria-label="Export threat registry to CSV" @click="exportToCSV">
            <UIcon name="i-heroicons-table-cells" class="mr-1" />
            Export CSV
          </UButton>
          
          <!-- Keyboard shortcuts help -->
          <UButton color="neutral" variant="ghost" aria-label="Show keyboard shortcuts" @click="showKeyboardShortcutsModal = true">
            <UIcon name="i-heroicons-question-mark-circle" />
          </UButton>
          
          <!-- Clear all button -->
          <UButton color="error" variant="soft" aria-label="Clear all elements" @click="clearAll">
            <UIcon name="i-heroicons-trash" class="mr-2" />
            Clear All
          </UButton>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow" role="status" aria-label="Total threats count">
          <div class="text-sm text-gray-500 dark:text-gray-400">Total Threats</div>
          <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ threatStats.total }}</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow" role="status" aria-label="Open threats count">
          <div class="text-sm text-gray-500 dark:text-gray-400">Open</div>
          <div class="text-2xl font-bold text-red-600">{{ threatStats.open }}</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow" role="status" aria-label="Mitigated threats count">
          <div class="text-sm text-gray-500 dark:text-gray-400">Mitigated</div>
          <div class="text-2xl font-bold text-green-600">{{ threatStats.mitigated }}</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow" role="status" aria-label="Critical and high severity threats count">
          <div class="text-sm text-gray-500 dark:text-gray-400">Critical/High</div>
          <div class="text-2xl font-bold text-orange-600">{{ threatStats.critical + threatStats.high }}</div>
        </div>
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow" role="status" aria-label="Average risk score">
          <div class="text-sm text-gray-500 dark:text-gray-400">Avg Risk Score</div>
          <div class="text-2xl font-bold" :class="getRiskScoreColor(threatStats.avgRiskScore)">
            {{ threatStats.avgRiskScore || '-' }}
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Shape Picker Sidebar -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
          <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Shape Picker
          </h2>
          
          <div class="space-y-2" role="listbox" aria-label="Shape types">
            <div
              v-for="shape in shapeDefinitions"
              :key="shape.type"
              role="option"
              :aria-selected="selectedShapeType === shape.type"
              tabindex="0"
              class="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
              :class="selectedShapeType === shape.type ? 'bg-primary-100 dark:bg-primary-900 border-2 border-primary-500' : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'"
              @click="selectShapeType(shape.type)"
              @keydown.enter="selectShapeType(shape.type)"
              @keydown.space.prevent="selectShapeType(shape.type)"
            >
              <UIcon :name="shape.icon" class="w-6 h-6 text-gray-600 dark:text-gray-300" />
              <div>
                <div class="font-medium text-gray-800 dark:text-gray-200">{{ shape.label }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">{{ shape.description }}</div>
              </div>
            </div>
            
            <!-- Data Flow Button -->
            <div
              role="option"
              :aria-selected="isAddingDataFlow"
              tabindex="0"
              class="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
              :class="isAddingDataFlow ? 'bg-primary-100 dark:bg-primary-900 border-2 border-primary-500' : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'"
              @click="startDataFlowMode"
              @keydown.enter="startDataFlowMode"
              @keydown.space.prevent="startDataFlowMode"
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
              For data flows, click on two shapes to connect them. Press <kbd class="px-1 py-0.5 bg-blue-100 dark:bg-blue-800 rounded">?</kbd> for shortcuts.
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
              role="button"
              tabindex="0"
              :aria-label="`${shape.type} element: ${shape.label}. ${shape.threats.length} threats.`"
              class="absolute cursor-pointer select-none focus:outline-none"
              :class="{ 
                'ring-2 ring-primary-500': dataFlowStart === shape.id,
                'ring-2 ring-yellow-500 ring-offset-2': focusedShapeId === shape.id
              }"
              :style="{ left: shape.x + 'px', top: shape.y + 'px' }"
              @click="handleShapeClick(shape, $event)"
              @mousedown="startDrag(shape, $event)"
              @keydown.enter="handleShapeClick(shape, $event)"
              @keydown.space.prevent="handleShapeClick(shape, $event)"
              @focus="focusedShapeId = shape.id"
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
                :aria-label="`${shape.threats.length} threats`"
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

      <!-- Threat Registry -->
      <div class="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Threat Registry
        </h2>
        
        <!-- Filters -->
        <div v-if="allThreats.length > 0" class="flex flex-wrap gap-4 mb-4">
          <div class="flex items-center gap-2">
            <label for="filter-severity" class="text-sm text-gray-600 dark:text-gray-400">Severity:</label>
            <select
              id="filter-severity"
              v-model="filterSeverity"
              class="rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
              aria-label="Filter by severity"
            >
              <option value="All">All</option>
              <option v-for="level in severityLevels" :key="level" :value="level">{{ level }}</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <label for="filter-status" class="text-sm text-gray-600 dark:text-gray-400">Status:</label>
            <select
              id="filter-status"
              v-model="filterStatus"
              class="rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
              aria-label="Filter by status"
            >
              <option value="All">All</option>
              <option v-for="status in statusOptions" :key="status" :value="status">{{ status }}</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <label for="filter-category" class="text-sm text-gray-600 dark:text-gray-400">Category:</label>
            <select
              id="filter-category"
              v-model="filterCategory"
              class="rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
              aria-label="Filter by STRIDE category"
            >
              <option value="All">All</option>
              <option v-for="cat in threatCategories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>
          <div class="text-sm text-gray-500 dark:text-gray-400 ml-auto">
            Showing {{ filteredThreats.length }} of {{ allThreats.length }} threats
          </div>
        </div>
        
        <div v-if="allThreats.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
          <UIcon name="i-heroicons-shield-exclamation" class="w-12 h-12 mx-auto mb-2" />
          <p>No threats identified yet. Click on elements to add threats.</p>
        </div>
        
        <div v-else-if="filteredThreats.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
          <UIcon name="i-heroicons-funnel" class="w-12 h-12 mx-auto mb-2" />
          <p>No threats match the current filters.</p>
        </div>
        
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm" role="grid" aria-label="Threat registry table">
            <thead>
              <tr class="border-b dark:border-gray-700">
                <th 
                  class="text-left p-2 font-medium text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  role="columnheader"
                  :aria-sort="sortColumn === 'element' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'"
                  @click="toggleSort('element')"
                >
                  Element
                  <UIcon v-if="sortColumn === 'element'" :name="sortDirection === 'asc' ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" class="inline w-4 h-4" />
                </th>
                <th 
                  class="text-left p-2 font-medium text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  role="columnheader"
                  :aria-sort="sortColumn === 'category' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'"
                  @click="toggleSort('category')"
                >
                  Category
                  <UIcon v-if="sortColumn === 'category'" :name="sortDirection === 'asc' ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" class="inline w-4 h-4" />
                </th>
                <th 
                  class="text-left p-2 font-medium text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  role="columnheader"
                  :aria-sort="sortColumn === 'title' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'"
                  @click="toggleSort('title')"
                >
                  Title
                  <UIcon v-if="sortColumn === 'title'" :name="sortDirection === 'asc' ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" class="inline w-4 h-4" />
                </th>
                <th 
                  class="text-left p-2 font-medium text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  role="columnheader"
                  :aria-sort="sortColumn === 'severity' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'"
                  @click="toggleSort('severity')"
                >
                  Severity
                  <UIcon v-if="sortColumn === 'severity'" :name="sortDirection === 'asc' ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" class="inline w-4 h-4" />
                </th>
                <th 
                  class="text-left p-2 font-medium text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  role="columnheader"
                  :aria-sort="sortColumn === 'riskScore' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'"
                  @click="toggleSort('riskScore')"
                >
                  Risk Score
                  <UIcon v-if="sortColumn === 'riskScore'" :name="sortDirection === 'asc' ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" class="inline w-4 h-4" />
                </th>
                <th 
                  class="text-left p-2 font-medium text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  role="columnheader"
                  :aria-sort="sortColumn === 'status' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'"
                  @click="toggleSort('status')"
                >
                  Status
                  <UIcon v-if="sortColumn === 'status'" :name="sortDirection === 'asc' ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'" class="inline w-4 h-4" />
                </th>
                <th class="text-left p-2 font-medium text-gray-600 dark:text-gray-300">Mitigation</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="{ shape, threat } in filteredThreats" :key="threat.id" class="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td class="p-2 text-gray-800 dark:text-gray-200">{{ shape.label }}</td>
                <td class="p-2 text-gray-600 dark:text-gray-400">{{ threat.category }}</td>
                <td class="p-2 text-gray-800 dark:text-gray-200">{{ threat.title }}</td>
                <td class="p-2">
                  <span :class="getSeverityColor(threat.severity)" class="px-2 py-1 rounded-full text-xs font-medium">
                    {{ threat.severity }}
                  </span>
                </td>
                <td class="p-2">
                  <span :class="getRiskScoreColor(calculateRiskScore(threat.severity, threat.likelihood || 'Medium'))" class="px-2 py-1 rounded-full text-xs font-medium">
                    {{ calculateRiskScore(threat.severity, threat.likelihood || 'Medium') }} ({{ getRiskScoreLabel(calculateRiskScore(threat.severity, threat.likelihood || 'Medium')) }})
                  </span>
                </td>
                <td class="p-2">
                  <span :class="getStatusColor(threat.status)" class="px-2 py-1 rounded-full text-xs font-medium">
                    {{ threat.status }}
                  </span>
                </td>
                <td class="p-2 text-gray-600 dark:text-gray-400 max-w-xs">
                  <div v-if="threat.mitigation" class="truncate" :title="threat.mitigation">
                    {{ threat.mitigation }}
                  </div>
                  <span v-else class="text-gray-400 dark:text-gray-500 italic">None</span>
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
            <UInput v-model="shapeForm.label" aria-label="Element label" />
          </UFormField>
          
          <UFormField label="Description">
            <UTextarea v-model="shapeForm.description" :rows="3" aria-label="Element description" />
          </UFormField>
          
          <!-- Threats section (only for shapes with threats) -->
          <div v-if="selectedShape && 'threats' in selectedShape">
            <div class="flex items-center justify-between mb-2">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Threats</label>
              <UButton size="xs" aria-label="Add new threat" @click="openAddThreatModal">
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
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium text-gray-800 dark:text-gray-200">{{ threat.title }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    {{ threat.category }} - {{ threat.severity }} 
                    <span class="ml-1" :class="getRiskScoreColor(calculateRiskScore(threat.severity, threat.likelihood || 'Medium'))">
                      (Risk: {{ calculateRiskScore(threat.severity, threat.likelihood || 'Medium') }})
                    </span>
                  </div>
                </div>
                <div class="flex gap-1 ml-2">
                  <UButton size="xs" color="neutral" variant="ghost" aria-label="Edit threat" @click="openEditThreatModal(threat)">
                    <UIcon name="i-heroicons-pencil" />
                  </UButton>
                  <UButton size="xs" color="error" variant="ghost" aria-label="Remove threat" @click="removeThreat(threat.id)">
                    <UIcon name="i-heroicons-trash" />
                  </UButton>
                </div>
              </div>
            </div>
          </div>
          
          <div class="flex justify-between pt-4">
            <UButton color="error" variant="soft" aria-label="Delete element" @click="deleteSelectedShape">
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
            <UInput v-model="dataFlowForm.label" aria-label="Data flow label" />
          </UFormField>
          
          <UFormField label="Description">
            <UTextarea v-model="dataFlowForm.description" :rows="3" aria-label="Data flow description" />
          </UFormField>
          
          <!-- Threats section for data flows -->
          <div v-if="selectedDataFlow">
            <div class="flex items-center justify-between mb-2">
              <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Threats</label>
              <UButton size="xs" aria-label="Add new threat" @click="openAddThreatModal">
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
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium text-gray-800 dark:text-gray-200">{{ threat.title }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">
                    {{ threat.category }} - {{ threat.severity }}
                    <span class="ml-1" :class="getRiskScoreColor(calculateRiskScore(threat.severity, threat.likelihood || 'Medium'))">
                      (Risk: {{ calculateRiskScore(threat.severity, threat.likelihood || 'Medium') }})
                    </span>
                  </div>
                </div>
                <div class="flex gap-1 ml-2">
                  <UButton size="xs" color="neutral" variant="ghost" aria-label="Edit threat" @click="openEditThreatModal(threat)">
                    <UIcon name="i-heroicons-pencil" />
                  </UButton>
                  <UButton size="xs" color="error" variant="ghost" aria-label="Remove threat" @click="removeThreat(threat.id)">
                    <UIcon name="i-heroicons-trash" />
                  </UButton>
                </div>
              </div>
            </div>
          </div>
          
          <div class="flex justify-between pt-4">
            <UButton color="error" variant="soft" aria-label="Delete data flow" @click="deleteSelectedShape">
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

    <!-- Add/Edit Threat Modal -->
    <UModal v-model:open="showThreatModal" :title="isEditingThreat ? 'Edit Threat' : 'Add Threat'" description="Identify a threat using STRIDE methodology">
      <template #body>
        <div class="space-y-4">
          <UFormField label="Category (STRIDE)">
            <div class="flex items-center gap-2">
              <USelect v-model="threatForm.category" :items="threatCategories" class="flex-1" aria-label="STRIDE threat category" />
              <div class="text-xs text-gray-500 dark:text-gray-400 max-w-48" :title="strideDescriptions[threatForm.category]">
                <UIcon name="i-heroicons-information-circle" class="w-4 h-4 inline" />
                {{ strideDescriptions[threatForm.category] }}
              </div>
            </div>
          </UFormField>
          
          <!-- Threat Templates/Suggestions -->
          <div v-if="currentThreatTemplates.length > 0 && !isEditingThreat" class="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <div class="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
              <UIcon name="i-heroicons-light-bulb" class="w-4 h-4 inline mr-1" />
              Suggested Threats
            </div>
            <div class="flex flex-wrap gap-2">
              <UButton
                v-for="(template, index) in currentThreatTemplates"
                :key="index"
                size="xs"
                color="primary"
                variant="soft"
                :aria-label="`Apply template: ${template.title}`"
                @click="applyTemplate(template)"
              >
                {{ template.title }}
              </UButton>
            </div>
          </div>
          
          <UFormField label="Title" required>
            <UInput v-model="threatForm.title" placeholder="Brief threat description" aria-label="Threat title" />
          </UFormField>
          
          <UFormField label="Description">
            <UTextarea v-model="threatForm.description" :rows="3" placeholder="Detailed threat explanation" aria-label="Threat description" />
          </UFormField>
          
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Severity">
              <USelect v-model="threatForm.severity" :items="[...severityLevels]" aria-label="Threat severity" />
            </UFormField>
            
            <UFormField label="Likelihood">
              <USelect v-model="threatForm.likelihood" :items="[...likelihoodLevels]" aria-label="Threat likelihood" />
            </UFormField>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Status">
              <USelect v-model="threatForm.status" :items="[...statusOptions]" aria-label="Threat status" />
            </UFormField>
            
            <UFormField label="Risk Score">
              <div class="flex items-center h-10">
                <span :class="getRiskScoreColor(calculateRiskScore(threatForm.severity, threatForm.likelihood))" class="px-3 py-1.5 rounded-full text-sm font-medium">
                  {{ calculateRiskScore(threatForm.severity, threatForm.likelihood) }} ({{ getRiskScoreLabel(calculateRiskScore(threatForm.severity, threatForm.likelihood)) }})
                </span>
              </div>
            </UFormField>
          </div>
          
          <UFormField label="Mitigation">
            <UTextarea v-model="threatForm.mitigation" :rows="2" placeholder="How to mitigate this threat" aria-label="Threat mitigation strategy" />
          </UFormField>
          
          <div class="flex justify-end gap-2 pt-4">
            <UButton color="neutral" variant="ghost" @click="showThreatModal = false">Cancel</UButton>
            <UButton :disabled="!threatForm.title" color="primary" @click="saveThreat">
              {{ isEditingThreat ? 'Update Threat' : 'Add Threat' }}
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
    
    <!-- Keyboard Shortcuts Modal -->
    <UModal v-model:open="showKeyboardShortcutsModal" title="Keyboard Shortcuts" description="Quick reference for keyboard shortcuts">
      <template #body>
        <div class="space-y-4">
          <div class="grid gap-3">
            <div class="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
              <span class="text-gray-700 dark:text-gray-300">Undo</span>
              <kbd class="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-sm">Ctrl+Z</kbd>
            </div>
            <div class="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
              <span class="text-gray-700 dark:text-gray-300">Redo</span>
              <kbd class="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-sm">Ctrl+Y</kbd>
            </div>
            <div class="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
              <span class="text-gray-700 dark:text-gray-300">Delete selected element</span>
              <kbd class="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-sm">Delete</kbd>
            </div>
            <div class="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
              <span class="text-gray-700 dark:text-gray-300">Cancel operation / Close modal</span>
              <kbd class="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-sm">Escape</kbd>
            </div>
            <div class="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
              <span class="text-gray-700 dark:text-gray-300">Show this help</span>
              <kbd class="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-sm">?</kbd>
            </div>
          </div>
          
          <div class="pt-4 border-t dark:border-gray-700">
            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">STRIDE Categories</h4>
            <div class="grid gap-2 text-sm">
              <div v-for="(desc, category) in strideDescriptions" :key="category" class="flex gap-2">
                <span class="font-medium text-gray-700 dark:text-gray-300 min-w-32">{{ category }}:</span>
                <span class="text-gray-500 dark:text-gray-400">{{ desc }}</span>
              </div>
            </div>
          </div>
          
          <div class="flex justify-end pt-4">
            <UButton color="neutral" variant="ghost" @click="showKeyboardShortcutsModal = false">Close</UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>
