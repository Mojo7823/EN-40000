export interface DemoSfrEntry {
  id: string
  classCode: string
  componentId: string
  summary: string
}

export interface DemoState {
  modalNote: string
  editorHtml: string
  docxHtml: string
  xmlSampleId: string
  sfrTable: DemoSfrEntry[]
  lastUpdated: string
}

const STORAGE_KEY = 'ccgentool2_demo_state'

const createId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2, 10)
}

const defaultState: DemoState = {
  modalNote: '',
  editorHtml: '<p>Compose rich content here…</p>',
  docxHtml: '<p>Generate DOCX previews from this content.</p>',
  xmlSampleId: 'fcs',
  sfrTable: [
    {
      id: createId(),
      classCode: 'FAU',
      componentId: 'FAU_GEN.1',
      summary: 'Basic audit data generation',
    },
  ],
  lastUpdated: new Date(0).toISOString(),
}

let inMemoryState: DemoState = { ...defaultState }

const hasStorage = () => typeof localStorage !== 'undefined'

function readFromStorage(): DemoState | null {
  if (!hasStorage()) return null
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    return {
      ...defaultState,
      ...parsed,
    }
  } catch (error) {
    console.warn('Failed to parse demo state from storage:', error)
    return null
  }
}

function persistState(state: DemoState) {
  inMemoryState = { ...state }
  if (hasStorage()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }
}

export function loadDemoState(): DemoState {
  const stored = readFromStorage()
  if (stored) {
    inMemoryState = { ...stored }
    return { ...stored }
  }
  persistState(defaultState)
  return { ...defaultState }
}

export function updateDemoState(patch: Partial<DemoState>): DemoState {
  const next: DemoState = {
    ...inMemoryState,
    ...patch,
    lastUpdated: new Date().toISOString(),
  }
  persistState(next)
  return { ...next }
}

export function clearDemoState(): DemoState {
  if (hasStorage()) {
    localStorage.removeItem(STORAGE_KEY)
  }
  persistState(defaultState)
  return { ...defaultState }
}

export function exportDemoState() {
  const state = loadDemoState()
  return {
    exportedAt: new Date().toISOString(),
    state,
  }
}

export function importDemoState(payload: { state: DemoState } | DemoState): DemoState {
  const state = 'state' in payload ? payload.state : payload
  const merged: DemoState = {
    ...defaultState,
    ...state,
    lastUpdated: new Date().toISOString(),
  }
  persistState(merged)
  return { ...merged }
}
