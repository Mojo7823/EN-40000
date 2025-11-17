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

export interface IntroductionFormState {
  productName: string
  productVersion: string
  productType: string
  manufacturerName: string
  manufacturerAddress: string
  status: string
  preparedBy: string
  reviewedBy: string
  approvedBy: string
}

export interface PurposeScopeState {
  scopeSelections: string[]
  assessmentStart: string
  assessmentEnd: string
  methodologyHtml: string
}

export interface ProductIdentificationState {
  productDescriptionHtml: string
  keyFunctionsHtml: string
  targetMarket: string
}

export interface ManufacturerInformationState {
  legalEntity: string
  registrationNumber: string
  address: string
  contactPerson: string
  phone: string
}

export interface ProductOverviewState {
  productDescriptionHtml: string
}

export interface DocumentWorkspaceState {
  cover: CoverFormState
  introduction: IntroductionFormState
  purposeScope: PurposeScopeState
  productIdentification: ProductIdentificationState
  manufacturerInformation: ManufacturerInformationState
  productOverview: ProductOverviewState
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

const defaultIntroductionState: IntroductionFormState = {
  productName: '',
  productVersion: '',
  productType: '',
  manufacturerName: '',
  manufacturerAddress: '',
  status: '',
  preparedBy: '',
  reviewedBy: '',
  approvedBy: '',
}

const defaultState: DocumentWorkspaceState = {
  cover: { ...defaultCoverState },
  introduction: { ...defaultIntroductionState },
  purposeScope: {
    scopeSelections: [],
    assessmentStart: '',
    assessmentEnd: '',
    methodologyHtml:
      '<p><em>Describe the methodology used – e.g., document review, interviews, technical testing, code review, penetration testing.</em></p>',
  },
  productIdentification: {
    productDescriptionHtml:
      '<p><em>Summarize the product’s architecture, deployment model, and distinguishing traits.</em></p>',
    keyFunctionsHtml:
      '<ol><li><em>Function 1</em></li><li><em>Function 2</em></li><li><em>Function 3</em></li></ol>',
    targetMarket: '',
  },
  manufacturerInformation: {
    legalEntity: '',
    registrationNumber: '',
    address: '',
    contactPerson: '',
    phone: '',
  },
  productOverview: {
    productDescriptionHtml:
      '<p><strong>2. Product Overview</strong></p><p><em>Provide a detailed description of the product including hardware, software, connectivity, user interface, and data processing characteristics.</em></p>',
  },
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
    introduction: { ...state.introduction },
    purposeScope: {
      scopeSelections: [...state.purposeScope.scopeSelections],
      assessmentStart: state.purposeScope.assessmentStart,
      assessmentEnd: state.purposeScope.assessmentEnd,
      methodologyHtml: state.purposeScope.methodologyHtml,
    },
    productIdentification: { ...state.productIdentification },
    manufacturerInformation: { ...state.manufacturerInformation },
    productOverview: { ...state.productOverview },
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
      introduction: {
        ...defaultIntroductionState,
        ...parsed.introduction,
      },
      purposeScope: {
        ...defaultState.purposeScope,
        ...parsed.purposeScope,
        scopeSelections: Array.isArray(parsed.purposeScope?.scopeSelections)
          ? [...parsed.purposeScope.scopeSelections]
          : [],
      },
      productIdentification: {
        ...defaultState.productIdentification,
        ...parsed.productIdentification,
      },
      manufacturerInformation: {
        ...defaultState.manufacturerInformation,
        ...parsed.manufacturerInformation,
      },
      productOverview: {
        ...defaultState.productOverview,
        ...parsed.productOverview,
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

export function updateIntroductionState(patch: Partial<IntroductionFormState>): DocumentWorkspaceState {
  const next: DocumentWorkspaceState = {
    ...inMemoryState,
    introduction: {
      ...inMemoryState.introduction,
      ...patch,
    },
    lastUpdated: new Date().toISOString(),
  }

  persistState(next)
  return { ...next }
}

export function updatePurposeScopeState(patch: Partial<PurposeScopeState>): DocumentWorkspaceState {
  const nextSelections = patch.scopeSelections
    ? [...patch.scopeSelections]
    : [...inMemoryState.purposeScope.scopeSelections]

  const next: DocumentWorkspaceState = {
    ...inMemoryState,
    purposeScope: {
      ...inMemoryState.purposeScope,
      ...patch,
      scopeSelections: nextSelections,
    },
    lastUpdated: new Date().toISOString(),
  }

  persistState(next)
  return { ...next }
}

export function updateProductIdentificationState(
  patch: Partial<ProductIdentificationState>
): DocumentWorkspaceState {
  const next: DocumentWorkspaceState = {
    ...inMemoryState,
    productIdentification: {
      ...inMemoryState.productIdentification,
      ...patch,
    },
    lastUpdated: new Date().toISOString(),
  }

  persistState(next)
  return { ...next }
}

export function updateManufacturerInformationState(
  patch: Partial<ManufacturerInformationState>
): DocumentWorkspaceState {
  const next: DocumentWorkspaceState = {
    ...inMemoryState,
    manufacturerInformation: {
      ...inMemoryState.manufacturerInformation,
      ...patch,
    },
    lastUpdated: new Date().toISOString(),
  }

  persistState(next)
  return { ...next }
}

export function updateProductOverviewState(
  patch: Partial<ProductOverviewState>
): DocumentWorkspaceState {
  const next: DocumentWorkspaceState = {
    ...inMemoryState,
    productOverview: {
      ...inMemoryState.productOverview,
      ...patch,
    },
    lastUpdated: new Date().toISOString(),
  }

  persistState(next)
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
    introduction: {
      ...defaultIntroductionState,
      ...state.introduction,
    },
    purposeScope: {
      ...defaultState.purposeScope,
      ...state.purposeScope,
      scopeSelections: Array.isArray(state.purposeScope?.scopeSelections)
        ? [...state.purposeScope.scopeSelections]
        : [],
    },
    productIdentification: {
      ...defaultState.productIdentification,
      ...state.productIdentification,
    },
    manufacturerInformation: {
      ...defaultState.manufacturerInformation,
      ...state.manufacturerInformation,
    },
    productOverview: {
      ...defaultState.productOverview,
      ...state.productOverview,
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
