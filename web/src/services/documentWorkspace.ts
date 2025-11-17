import { sessionService } from './sessionService'

export interface CoverFormState {
  deviceName: string
  deviceDescription: string
  versionNumber: string
  revisionDate: string
  labName: string
  labAddress: string
  imageData: string | null
  imageName: string | null
  imagePath: string | null
}

export interface DocumentWorkspaceState {
  cover: CoverFormState
  lastUpdated: string
}

const STORAGE_KEY = 'cratool_document_workspace'

const defaultCoverState: CoverFormState = {
  deviceName: '',
  deviceDescription: '',
  versionNumber: '',
  revisionDate: '',
  labName: '',
  labAddress: '',
  imageData: null,
  imageName: null,
  imagePath: null,
}

const defaultState: DocumentWorkspaceState = {
  cover: { ...defaultCoverState },
  lastUpdated: new Date(0).toISOString(),
}

let inMemoryState: DocumentWorkspaceState = { ...defaultState }

const hasStorage = () => typeof localStorage !== 'undefined'

type WorkspaceListener = (state: DocumentWorkspaceState) => void
const listeners = new Set<WorkspaceListener>()

function cloneState(state: DocumentWorkspaceState): DocumentWorkspaceState {
  return {
    ...state,
    cover: { ...state.cover },
  }
}

function notifyListeners(state: DocumentWorkspaceState) {
  const snapshot = cloneState(state)
  listeners.forEach((listener) => {
    try {
      listener(snapshot)
    } catch (error) {
      console.error('Document workspace listener failed', error)
    }
  })
}

function persistState(state: DocumentWorkspaceState, shouldNotify = true) {
  inMemoryState = cloneState(state)
  if (hasStorage()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }
  if (shouldNotify) {
    notifyListeners(inMemoryState)
  }
}

function readFromStorage(): DocumentWorkspaceState | null {
  if (!hasStorage()) return null
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    return {
      ...defaultState,
      ...parsed,
      cover: {
        ...defaultCoverState,
        ...parsed.cover,
      },
    }
  } catch (error) {
    console.warn('Failed to parse document workspace state:', error)
    return null
  }
}

export function loadDocumentWorkspace(): DocumentWorkspaceState {
  const stored = readFromStorage()
  if (stored) {
    inMemoryState = cloneState(stored)
    return cloneState(stored)
  }
  persistState(defaultState, false)
  return cloneState(defaultState)
}

export function updateCoverState(patch: Partial<CoverFormState>): DocumentWorkspaceState {
  const next: DocumentWorkspaceState = {
    ...inMemoryState,
    cover: {
      ...inMemoryState.cover,
      ...patch,
    },
    lastUpdated: new Date().toISOString(),
  }

  persistState(next)

  // Keep legacy session cover data up to date so other modules can re-use it
  const { cover } = next
  sessionService.saveCoverData(
    {
      title: cover.deviceName,
      description: cover.deviceDescription,
      version: cover.versionNumber,
      revision: cover.revisionDate,
      manufacturer: cover.labName,
      laboratory_name: cover.labName,
      laboratory_address: cover.labAddress,
      date: cover.revisionDate,
    },
    cover.imagePath,
    cover.imageData
  )

  return { ...next }
}

export function clearDocumentWorkspace(): DocumentWorkspaceState {
  persistState(defaultState)
  sessionService.clearCoverData()
  return cloneState(defaultState)
}

export function exportDocumentWorkspace() {
  const state = loadDocumentWorkspace()
  return {
    exportedAt: new Date().toISOString(),
    state,
  }
}

export function importDocumentWorkspace(payload: { state: DocumentWorkspaceState } | DocumentWorkspaceState) {
  const state = 'state' in payload ? payload.state : payload
  const merged: DocumentWorkspaceState = {
    ...defaultState,
    ...state,
    cover: {
      ...defaultCoverState,
      ...state.cover,
    },
    lastUpdated: new Date().toISOString(),
  }
  persistState(merged)
  const { cover } = merged
  sessionService.saveCoverData(
    {
      title: cover.deviceName,
      description: cover.deviceDescription,
      version: cover.versionNumber,
      revision: cover.revisionDate,
      manufacturer: cover.labName,
      laboratory_name: cover.labName,
      laboratory_address: cover.labAddress,
      date: cover.revisionDate,
    },
    cover.imagePath,
    cover.imageData
  )
  return cloneState(merged)
}

export function subscribeDocumentWorkspace(listener: WorkspaceListener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
