import { sessionService } from '../sessionService'
import { STORAGE_KEY_BASE } from './constants'
import type { DocumentWorkspaceState, WorkspaceListener } from './types'
import {
  defaultCoverState,
  defaultIntroductionState,
  defaultPurposeScopeState,
  defaultProductIdentificationState,
  defaultManufacturerInformationState,
  defaultProductOverviewState,
  defaultThirdPartyComponentsState,
  defaultDocumentConventionState,
  defaultRiskManagementState,
} from './defaults'
import {
  cloneState,
  cloneThirdPartyState,
  cloneConformanceClaimState,
  cloneDocumentConventionState,
  cloneRiskManagementState,
} from './cloners'

// ============================================================================
// Build Default State (defined here to avoid circular deps with cloners)
// ============================================================================

export function buildDefaultState(): DocumentWorkspaceState {
  return {
    cover: { ...defaultCoverState },
    introduction: { ...defaultIntroductionState },
    purposeScope: { ...defaultPurposeScopeState },
    productIdentification: { ...defaultProductIdentificationState },
    manufacturerInformation: { ...defaultManufacturerInformationState },
    productOverview: {
      ...defaultProductOverviewState,
      thirdPartyComponents: { ...defaultThirdPartyComponentsState, entries: [] },
    },
    conformanceClaim: cloneConformanceClaimState(),
    documentConvention: cloneDocumentConventionState(defaultDocumentConventionState),
    riskManagement: cloneRiskManagementState(defaultRiskManagementState),
    lastUpdated: new Date(0).toISOString(),
  }
}

// ============================================================================
// Storage Key Management
// ============================================================================

export function getUserStorageKey(): string {
  const userToken = sessionService.getUserToken()
  return `${STORAGE_KEY_BASE}_${userToken}`
}

export const hasStorage = () => typeof localStorage !== 'undefined'

// ============================================================================
// In-Memory State & Listeners
// ============================================================================

let inMemoryState: DocumentWorkspaceState = buildDefaultState()
const listeners = new Set<WorkspaceListener>()

export function getInMemoryState(): DocumentWorkspaceState {
  return inMemoryState
}

export function setInMemoryState(state: DocumentWorkspaceState): void {
  inMemoryState = state
}

// ============================================================================
// Listener Management
// ============================================================================

export function notifyListeners(state: DocumentWorkspaceState): void {
  const snapshot = cloneState(state)
  listeners.forEach((listener) => {
    try {
      listener(snapshot)
    } catch (error) {
      console.error('Document workspace listener failed', error)
    }
  })
}

export function subscribeDocumentWorkspace(listener: WorkspaceListener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// ============================================================================
// Persistence
// ============================================================================

export function persistState(state: DocumentWorkspaceState, shouldNotify = true): void {
  inMemoryState = cloneState(state)
  if (hasStorage()) {
    const storageKey = getUserStorageKey()
    localStorage.setItem(storageKey, JSON.stringify(state))
  }
  if (shouldNotify) {
    notifyListeners(inMemoryState)
  }
}

export function readFromStorage(): DocumentWorkspaceState | null {
  if (!hasStorage()) return null
  const storageKey = getUserStorageKey()
  const raw = localStorage.getItem(storageKey)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    return {
      ...buildDefaultState(),
      ...parsed,
      cover: {
        ...defaultCoverState,
        ...parsed.cover,
      },
      introduction: {
        ...defaultIntroductionState,
        ...parsed.introduction,
      },
      purposeScope: {
        ...defaultPurposeScopeState,
        ...parsed.purposeScope,
        scopeSelections: Array.isArray(parsed.purposeScope?.scopeSelections)
          ? [...parsed.purposeScope.scopeSelections]
          : [],
      },
      productIdentification: {
        ...defaultProductIdentificationState,
        ...parsed.productIdentification,
      },
      manufacturerInformation: {
        ...defaultManufacturerInformationState,
        ...parsed.manufacturerInformation,
      },
      productOverview: {
        ...defaultProductOverviewState,
        ...parsed.productOverview,
        thirdPartyComponents: cloneThirdPartyState(parsed.productOverview?.thirdPartyComponents),
      },
      conformanceClaim: cloneConformanceClaimState(parsed.conformanceClaim),
      documentConvention: cloneDocumentConventionState(parsed.documentConvention),
      riskManagement: cloneRiskManagementState(parsed.riskManagement),
    }
  } catch (error) {
    console.warn('Failed to parse document workspace state:', error)
    return null
  }
}

// ============================================================================
// Load & Clear
// ============================================================================

export function loadDocumentWorkspace(): DocumentWorkspaceState {
  const stored = readFromStorage()
  if (stored) {
    inMemoryState = cloneState(stored)
    return cloneState(stored)
  }
  const defaultState = buildDefaultState()
  persistState(defaultState, false)
  return cloneState(defaultState)
}

export function clearDocumentWorkspace(): DocumentWorkspaceState {
  const defaultState = buildDefaultState()
  persistState(defaultState)
  sessionService.clearCoverData()
  return cloneState(defaultState)
}

// ============================================================================
// Export & Import
// ============================================================================

export function exportDocumentWorkspace() {
  const state = loadDocumentWorkspace()
  return {
    exportedAt: new Date().toISOString(),
    state,
  }
}

export function importDocumentWorkspace(payload: { state: DocumentWorkspaceState } | DocumentWorkspaceState): DocumentWorkspaceState {
  const state = 'state' in payload ? payload.state : payload
  const defaultState = buildDefaultState()
  const merged: DocumentWorkspaceState = {
    ...defaultState,
    ...state,
    cover: {
      ...defaultCoverState,
      ...state.cover,
    },
    introduction: {
      ...defaultIntroductionState,
      ...state.introduction,
    },
    purposeScope: {
      ...defaultPurposeScopeState,
      ...state.purposeScope,
      scopeSelections: Array.isArray(state.purposeScope?.scopeSelections)
        ? [...state.purposeScope.scopeSelections]
        : [],
    },
    productIdentification: {
      ...defaultProductIdentificationState,
      ...state.productIdentification,
    },
    manufacturerInformation: {
      ...defaultManufacturerInformationState,
      ...state.manufacturerInformation,
    },
    productOverview: {
      ...defaultProductOverviewState,
      ...state.productOverview,
      thirdPartyComponents: cloneThirdPartyState(state.productOverview?.thirdPartyComponents),
    },
    conformanceClaim: cloneConformanceClaimState(state.conformanceClaim),
    documentConvention: cloneDocumentConventionState(state.documentConvention),
    riskManagement: cloneRiskManagementState(state.riskManagement),
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
