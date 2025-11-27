import { sessionService } from './sessionService'
import type {
  ConformanceLevelState,
  ConformanceLevelStatus,
  ConformanceStandardEntry,
  RegulatoryReferenceEntry,
} from '../types/conformance'
import {
  buildDefaultPrimaryStandard,
  buildDefaultRelatedStandards,
  buildDefaultRegulatoryEntries,
  generateRegulationEntryId,
  CONFORMANCE_LEVEL_OPTIONS,
} from '../constants/conformance'

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
  productArchitectureHtml: string
  thirdPartyComponents: ThirdPartyComponentsState
}

export interface ThirdPartyComponentEntry {
  id: string
  componentName: string
  componentType: string
  version: string
  supplier: string
  purpose: string
  license: string
}

export interface ThirdPartyComponentsState {
  entries: ThirdPartyComponentEntry[]
  managementApproachHtml: string
  evidenceReferenceHtml: string
}

export interface StandardsConformanceState {
  primaryStandard: ConformanceStandardEntry
  relatedStandards: ConformanceStandardEntry[]
  includeOther: boolean
  otherNotes: string
}

export interface RegulatoryConformanceState {
  additionalRegulations: RegulatoryReferenceEntry[]
}

export interface ConformanceClaimState {
  standardsConformance: StandardsConformanceState
  regulatoryConformance: RegulatoryConformanceState
  conformanceLevel: ConformanceLevelState
}

export interface DocumentConventionTerminologyEntry {
  id: string
  term: string
  definition: string
  reference: string
}

export interface DocumentConventionState {
  terminologyEntries: DocumentConventionTerminologyEntry[]
  evidenceNotationHtml: string
  requirementNotationHtml: string
  assessmentVerdictsHtml: string
}

export type RiskEvidenceStatus = 'not_started' | 'in_progress' | 'complete'

export interface RiskEvidenceEntry {
  id: string
  sectionKey: string
  title: string
  referenceId: string
  descriptionHtml: string
  status: RiskEvidenceStatus
}

export interface ProductContextState {
  intendedPurposeHtml: string
  specificIntendedUsesHtml: string
  foreseeableUseHtml: string
  evidenceEntries: RiskEvidenceEntry[]
}

export interface ProductFunctionState {
  primaryFunctionsHtml: string
  securityFunctionsHtml: string
  evidenceEntries: RiskEvidenceEntry[]
}

export interface RiskManagementState {
  generalApproachHtml: string
  productContext: ProductContextState
  productFunction: ProductFunctionState
}

export interface DocumentWorkspaceState {
  cover: CoverFormState
  introduction: IntroductionFormState
  purposeScope: PurposeScopeState
  productIdentification: ProductIdentificationState
  manufacturerInformation: ManufacturerInformationState
  productOverview: ProductOverviewState
  conformanceClaim: ConformanceClaimState
  documentConvention: DocumentConventionState
  riskManagement: RiskManagementState
  lastUpdated: string
}

const STORAGE_KEY_BASE = 'cratool_document_workspace'

// Get user-specific storage key
function getUserStorageKey(): string {
  const userToken = sessionService.getUserToken()
  return `${STORAGE_KEY_BASE}_${userToken}`
}
const CONFORMANCE_LEVEL_VALUE_SET = new Set<ConformanceLevelStatus>(
  CONFORMANCE_LEVEL_OPTIONS.map((option) => option.value)
)
const TERMINOLOGY_ID_PREFIX = 'term-'

export const RISK_PRODUCT_CONTEXT_SECTION_KEY = 'risk-product-context'
export const RISK_PRODUCT_FUNCTION_SECTION_KEY = 'risk-product-function'

export const RISK_EVIDENCE_STATUS_OPTIONS = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'complete', label: 'Complete' },
] as const

const EVIDENCE_ID_PREFIX = 'evidence-'

export function generateEvidenceEntryId(sectionKey = RISK_PRODUCT_CONTEXT_SECTION_KEY) {
  const random = Math.random().toString(36).slice(2, 8)
  const timestamp = Date.now().toString(36)
  return `${EVIDENCE_ID_PREFIX}${sectionKey}-${timestamp}-${random}`
}

export function generateTerminologyEntryId() {
  const random = Math.random().toString(36).slice(2, 8)
  const timestamp = Date.now().toString(36)
  return `${TERMINOLOGY_ID_PREFIX}${timestamp}-${random}`
}

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

const defaultTerminologyEntries: DocumentConventionTerminologyEntry[] = [
  {
    id: 'term-product',
    term: 'Product with digital elements',
    definition:
      'A product or system that contains digital components or software functions which can process, transmit, or store data.',
    reference: 'Regulation (EU) 2024/2847',
  },
  {
    id: 'term-cybersecurity',
    term: 'Cybersecurity',
    definition:
      'The ability to protect devices, networks, and services from digital attacks that compromise confidentiality, integrity, or availability.',
    reference: 'prEN 40000-1-1',
  },
  {
    id: 'term-vulnerability',
    term: 'Vulnerability',
    definition:
      'A weakness in design, implementation, or operation that an attacker could exploit to compromise the product.',
    reference: 'Regulation (EU) 2024/2847',
  },
  {
    id: 'term-risk',
    term: 'Risk',
    definition:
      'The combination of the likelihood of a cybersecurity event occurring and the severity of its impact.',
    reference: 'prEN 40000-1-1',
  },
  {
    id: 'term-rdps',
    term: 'RDPS',
    definition:
      'Remote Digital Product Support services used to monitor, configure, or update the product post-deployment.',
    reference: 'EN 40000-1-2',
  },
  {
    id: 'term-sbom',
    term: 'SBOM',
    definition: 'Software Bill of Materials describing all software components within the product.',
    reference: 'ENISA SBOM requirements',
  },
  {
    id: 'term-iprfu',
    term: 'IPRFU',
    definition:
      'Installed Product Release and Field Updates covering deployed versions and corrective maintenance.',
    reference: 'Internal engineering procedure',
  },
]

const defaultDocumentConventionState: DocumentConventionState = {
  terminologyEntries: defaultTerminologyEntries.map((entry) => ({ ...entry })),
  evidenceNotationHtml:
    '<p>Throughout this document, evidence is referenced in green using the following notation:</p><p><span style="color: #0f9d58"><strong>[EVD-XXX]</strong></span> - Evidence document reference</p><p><span style="color: #0f9d58"><strong>[DOC-XXX]</strong></span> - Supporting documentation reference</p><p><span style="color: #0f9d58"><strong>[TEST-XXX]</strong></span> - Test report reference</p><p><span style="color: #0f9d58"><strong>[ARCH-XXX]</strong></span> - Architecture documentation reference</p><p>All evidence documents are listed in <strong>Appendix A: Evidence Register</strong>.</p>',
  requirementNotationHtml:
    '<p>Requirements from EN 40000-1-2-2025 are presented in blue and italicized to distinguish them from descriptive text.</p><p><strong>Example:</strong></p><p><em><span style="color: #3b82f6">Requirement [Clause X.X.X]:</span></em></p><p><em>"The product shall..."</em></p>',
  assessmentVerdictsHtml:
    '<p>Each requirement is assessed using the following verdicts:</p><ul><li><strong><span style="color: #16a34a">PASS</span></strong> - Requirement is fully satisfied with adequate evidence</li><li><strong><span style="color: #dc2626">FAIL</span></strong> - Requirement is not satisfied</li><li><strong><span style="color: #f97316">PARTIAL</span></strong> - Requirement is partially satisfied (details provided)</li><li><strong><span style="color: #6b7280">N/A</span></strong> - Requirement is not applicable to this product</li></ul>',
}

const defaultProductContextState: ProductContextState = {
  intendedPurposeHtml: '',
  specificIntendedUsesHtml: '',
  foreseeableUseHtml: '',
  evidenceEntries: [
    {
      id: `${RISK_PRODUCT_CONTEXT_SECTION_KEY}-evidence`,
      sectionKey: RISK_PRODUCT_CONTEXT_SECTION_KEY,
      title: 'Product Context Evidence Reference',
      referenceId: '',
      descriptionHtml: '',
      status: 'not_started',
    },
  ],
}

const defaultProductFunctionState: ProductFunctionState = {
  primaryFunctionsHtml: '',
  securityFunctionsHtml: '',
  evidenceEntries: [
    {
      id: `${RISK_PRODUCT_FUNCTION_SECTION_KEY}-evidence`,
      sectionKey: RISK_PRODUCT_FUNCTION_SECTION_KEY,
      title: 'Product Functions Evidence Reference',
      referenceId: '',
      descriptionHtml: '',
      status: 'not_started',
    },
  ],
}

const defaultRiskManagementState: RiskManagementState = {
  generalApproachHtml: '',
  productContext: cloneProductContextState(defaultProductContextState),
  productFunction: cloneProductFunctionState(defaultProductFunctionState),
}

const defaultState: DocumentWorkspaceState = {
  cover: { ...defaultCoverState },
  introduction: { ...defaultIntroductionState },
  purposeScope: {
    scopeSelections: [],
    assessmentStart: '',
    assessmentEnd: '',
    methodologyHtml: '',
  },
  productIdentification: {
    productDescriptionHtml: '',
    keyFunctionsHtml: '',
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
    productDescriptionHtml: '',
    productArchitectureHtml: '',
    thirdPartyComponents: {
      entries: [],
      managementApproachHtml: '',
      evidenceReferenceHtml: '',
    },
  },
  conformanceClaim: cloneConformanceClaimState(),
  documentConvention: cloneDocumentConventionState(defaultDocumentConventionState),
  riskManagement: cloneRiskManagementState(defaultRiskManagementState),
  lastUpdated: new Date(0).toISOString(),
}

let inMemoryState: DocumentWorkspaceState = cloneState(defaultState)

const hasStorage = () => typeof localStorage !== 'undefined'

type WorkspaceListener = (state: DocumentWorkspaceState) => void
const listeners = new Set<WorkspaceListener>()

function cloneThirdPartyState(state?: ThirdPartyComponentsState): ThirdPartyComponentsState {
  const source = state ?? defaultState.productOverview.thirdPartyComponents
  return {
    entries: (source.entries ?? []).map((entry) => ({ ...entry })),
    managementApproachHtml: source.managementApproachHtml ?? '',
    evidenceReferenceHtml: source.evidenceReferenceHtml ?? '',
  }
}

function cloneEvidenceEntries(
  entries?: RiskEvidenceEntry[],
  fallbackSectionKey = RISK_PRODUCT_CONTEXT_SECTION_KEY
): RiskEvidenceEntry[] {
  if (!Array.isArray(entries)) {
    return []
  }
  return entries.map((entry, index) => ({
    id: entry.id || generateEvidenceEntryId(`${fallbackSectionKey}-${index}`),
    sectionKey: entry.sectionKey || fallbackSectionKey,
    title: entry.title ?? '',
    referenceId: entry.referenceId ?? '',
    descriptionHtml: entry.descriptionHtml ?? '',
    status: entry.status ?? 'not_started',
  }))
}

type LegacyProductContextState = {
  scopeDefinitionHtml?: string
  operationalEnvironmentHtml?: string
  stakeholderProfilesHtml?: string
  evidenceEntries?: RiskEvidenceEntry[]
}

function cloneProductContextState(state?: ProductContextState | LegacyProductContextState): ProductContextState {
  const source = state ?? defaultProductContextState
  const typedSource = source as ProductContextState
  const legacy = source as LegacyProductContextState | undefined
  const evidenceSource =
    (Array.isArray(typedSource.evidenceEntries) && typedSource.evidenceEntries.length
      ? typedSource.evidenceEntries
      : undefined) ??
    (Array.isArray(legacy?.evidenceEntries) && legacy?.evidenceEntries?.length
      ? legacy?.evidenceEntries
      : undefined) ??
    defaultProductContextState.evidenceEntries

  return {
    intendedPurposeHtml: typedSource.intendedPurposeHtml ?? legacy?.scopeDefinitionHtml ?? '',
    specificIntendedUsesHtml:
      typedSource.specificIntendedUsesHtml ?? legacy?.operationalEnvironmentHtml ?? '',
    foreseeableUseHtml: typedSource.foreseeableUseHtml ?? legacy?.stakeholderProfilesHtml ?? '',
    evidenceEntries: cloneEvidenceEntries(evidenceSource, RISK_PRODUCT_CONTEXT_SECTION_KEY),
  }
}

function cloneProductFunctionState(state?: ProductFunctionState): ProductFunctionState {
  const source = state ?? defaultProductFunctionState
  const evidenceSource =
    Array.isArray(source.evidenceEntries) && source.evidenceEntries.length
      ? source.evidenceEntries
      : defaultProductFunctionState.evidenceEntries

  return {
    primaryFunctionsHtml: source.primaryFunctionsHtml ?? '',
    securityFunctionsHtml: source.securityFunctionsHtml ?? '',
    evidenceEntries: cloneEvidenceEntries(evidenceSource, RISK_PRODUCT_FUNCTION_SECTION_KEY),
  }
}

function cloneRiskManagementState(state?: RiskManagementState): RiskManagementState {
  const source = state ?? defaultRiskManagementState
  return {
    generalApproachHtml: source.generalApproachHtml ?? '',
    productContext: cloneProductContextState(source.productContext),
    productFunction: cloneProductFunctionState(source.productFunction),
  }
}

function cloneTerminologyEntries(
  entries?: DocumentConventionTerminologyEntry[]
): DocumentConventionTerminologyEntry[] {
  if (!Array.isArray(entries)) {
    return defaultTerminologyEntries.map((entry) => ({ ...entry }))
  }
  return entries.map((entry) => ({
    id: entry.id || generateTerminologyEntryId(),
    term: entry.term ?? '',
    definition: entry.definition ?? '',
    reference: entry.reference ?? '',
  }))
}

function buildDefaultStandardsConformanceState(): StandardsConformanceState {
  return {
    primaryStandard: buildDefaultPrimaryStandard(),
    relatedStandards: buildDefaultRelatedStandards(),
    includeOther: false,
    otherNotes: '',
  }
}

function cloneStandardsConformanceState(state?: StandardsConformanceState): StandardsConformanceState {
  const source = state ?? buildDefaultStandardsConformanceState()
  return {
    primaryStandard: { ...source.primaryStandard },
    relatedStandards: (source.relatedStandards ?? []).map((entry) => ({ ...entry })),
    includeOther: !!source.includeOther,
    otherNotes: source.otherNotes ?? '',
  }
}

function cloneRegulatoryConformanceState(
  state?: RegulatoryConformanceState,
  legacyHtml?: string
): RegulatoryConformanceState {
  const baseEntries = state?.additionalRegulations?.length
    ? state.additionalRegulations
    : buildDefaultRegulatoryEntries()
  const clonedEntries = baseEntries.map((entry) => ({ ...entry }))

  const legacyText = typeof legacyHtml === 'string' ? legacyHtml.replace(/<[^>]+>/g, '').trim() : ''
  if (!state?.additionalRegulations?.length && legacyText) {
    clonedEntries.push({
      id: generateRegulationEntryId(),
      regulation: 'Legacy Narrative',
      description: legacyText,
      source: 'custom',
    })
  }

  return {
    additionalRegulations: clonedEntries,
  }
}

function normalizeConformanceStatuses(statuses?: ConformanceLevelStatus[]): ConformanceLevelStatus[] {
  if (!Array.isArray(statuses)) {
    return []
  }
  return statuses.filter((status): status is ConformanceLevelStatus => CONFORMANCE_LEVEL_VALUE_SET.has(status))
}

function cloneConformanceLevelState(
  state?: ConformanceLevelState,
  legacyHtml?: string
): ConformanceLevelState {
  return {
    statuses: normalizeConformanceStatuses(state?.statuses),
    justificationHtml: state?.justificationHtml ?? legacyHtml ?? '',
  }
}

function cloneConformanceClaimState(
  state?: Partial<ConformanceClaimState> & {
    regulatoryConformanceHtml?: string
    conformanceLevelHtml?: string
  }
): ConformanceClaimState {
  const source =
    state ?? {
      standardsConformance: buildDefaultStandardsConformanceState(),
      regulatoryConformance: { additionalRegulations: buildDefaultRegulatoryEntries() },
      conformanceLevel: { statuses: [], justificationHtml: '' },
    }
  return {
    standardsConformance: cloneStandardsConformanceState(source.standardsConformance),
    regulatoryConformance: cloneRegulatoryConformanceState(
      source.regulatoryConformance,
      source.regulatoryConformanceHtml
    ),
    conformanceLevel: cloneConformanceLevelState(source.conformanceLevel, source.conformanceLevelHtml),
  }
}

function cloneDocumentConventionState(state?: DocumentConventionState): DocumentConventionState {
  const source = state ?? defaultDocumentConventionState
  return {
    terminologyEntries: cloneTerminologyEntries(source.terminologyEntries),
    evidenceNotationHtml: source.evidenceNotationHtml ?? '',
    requirementNotationHtml: source.requirementNotationHtml ?? '',
    assessmentVerdictsHtml: source.assessmentVerdictsHtml ?? '',
  }
}

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
    productOverview: {
      ...state.productOverview,
      thirdPartyComponents: cloneThirdPartyState(state.productOverview.thirdPartyComponents),
    },
    conformanceClaim: cloneConformanceClaimState(state.conformanceClaim),
    documentConvention: cloneDocumentConventionState(state.documentConvention),
    riskManagement: cloneRiskManagementState(state.riskManagement),
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
    const storageKey = getUserStorageKey()
    localStorage.setItem(storageKey, JSON.stringify(state))
  }
  if (shouldNotify) {
    notifyListeners(inMemoryState)
  }
}

function readFromStorage(): DocumentWorkspaceState | null {
  if (!hasStorage()) return null
  const storageKey = getUserStorageKey()
  const raw = localStorage.getItem(storageKey)
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
  const currentThirdParty = inMemoryState.productOverview.thirdPartyComponents
  const nextThirdParty =
    patch.thirdPartyComponents !== undefined
      ? {
          entries: patch.thirdPartyComponents.entries
            ? patch.thirdPartyComponents.entries.map((entry) => ({ ...entry }))
            : currentThirdParty.entries.map((entry) => ({ ...entry })),
          managementApproachHtml:
            patch.thirdPartyComponents.managementApproachHtml ?? currentThirdParty.managementApproachHtml,
          evidenceReferenceHtml:
            patch.thirdPartyComponents.evidenceReferenceHtml ?? currentThirdParty.evidenceReferenceHtml,
        }
      : cloneThirdPartyState(currentThirdParty)

  const next: DocumentWorkspaceState = {
    ...inMemoryState,
    productOverview: {
      ...inMemoryState.productOverview,
      ...patch,
      thirdPartyComponents: nextThirdParty,
    },
    lastUpdated: new Date().toISOString(),
  }

  persistState(next)
  return { ...next }
}

export function updateConformanceClaimState(
  patch: Partial<ConformanceClaimState>
): DocumentWorkspaceState {
  const current = inMemoryState.conformanceClaim
  const baseStandards = current.standardsConformance
  const baseRegulatory = current.regulatoryConformance
  const baseConformanceLevel = current.conformanceLevel
  const patchedStandards = patch.standardsConformance
    ? {
        primaryStandard: {
          ...baseStandards.primaryStandard,
          ...(patch.standardsConformance.primaryStandard ?? {}),
        },
        relatedStandards:
          patch.standardsConformance.relatedStandards !== undefined
            ? patch.standardsConformance.relatedStandards.map((entry) => ({ ...entry }))
            : baseStandards.relatedStandards.map((entry) => ({ ...entry })),
        includeOther: patch.standardsConformance.includeOther ?? baseStandards.includeOther,
        otherNotes: patch.standardsConformance.otherNotes ?? baseStandards.otherNotes,
      }
    : baseStandards
  const patchedRegulatory = patch.regulatoryConformance
    ? {
        additionalRegulations:
          patch.regulatoryConformance.additionalRegulations !== undefined
            ? patch.regulatoryConformance.additionalRegulations.map((entry) => ({ ...entry }))
            : baseRegulatory.additionalRegulations.map((entry) => ({ ...entry })),
      }
    : baseRegulatory
  const patchedConformanceLevel = patch.conformanceLevel
    ? {
        statuses:
          patch.conformanceLevel.statuses !== undefined
            ? normalizeConformanceStatuses(patch.conformanceLevel.statuses)
            : normalizeConformanceStatuses(baseConformanceLevel.statuses),
        justificationHtml: patch.conformanceLevel.justificationHtml ?? baseConformanceLevel.justificationHtml,
      }
    : baseConformanceLevel

  const nextClaim: ConformanceClaimState = {
    standardsConformance:
      patch.standardsConformance !== undefined
        ? patchedStandards
        : cloneStandardsConformanceState(baseStandards),
    regulatoryConformance:
      patch.regulatoryConformance !== undefined
        ? patchedRegulatory
        : cloneRegulatoryConformanceState(baseRegulatory),
    conformanceLevel:
      patch.conformanceLevel !== undefined
        ? patchedConformanceLevel
        : cloneConformanceLevelState(baseConformanceLevel),
  }

  const next: DocumentWorkspaceState = {
    ...inMemoryState,
    conformanceClaim: nextClaim,
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

export function updateDocumentConventionState(
  patch: Partial<DocumentConventionState>
): DocumentWorkspaceState {
  const current = inMemoryState.documentConvention

  const nextConvention: DocumentConventionState = {
    terminologyEntries:
      patch.terminologyEntries !== undefined
        ? cloneTerminologyEntries(patch.terminologyEntries)
        : cloneTerminologyEntries(current.terminologyEntries),
    evidenceNotationHtml: patch.evidenceNotationHtml ?? current.evidenceNotationHtml,
    requirementNotationHtml: patch.requirementNotationHtml ?? current.requirementNotationHtml,
    assessmentVerdictsHtml: patch.assessmentVerdictsHtml ?? current.assessmentVerdictsHtml,
  }

  const next: DocumentWorkspaceState = {
    ...inMemoryState,
    documentConvention: nextConvention,
    lastUpdated: new Date().toISOString(),
  }

  persistState(next)
  return { ...next }
}

export function updateRiskManagementState(
  patch: Partial<RiskManagementState>
): DocumentWorkspaceState {
  const current = inMemoryState.riskManagement
  const currentProductContext = current.productContext || cloneProductContextState()
  const currentProductFunction = current.productFunction || cloneProductFunctionState()

  let nextProductContext: ProductContextState
  if (patch.productContext) {
    const productContextPatch = patch.productContext
    const patchedEvidence =
      productContextPatch.evidenceEntries !== undefined
        ? productContextPatch.evidenceEntries.length
          ? cloneEvidenceEntries(productContextPatch.evidenceEntries, RISK_PRODUCT_CONTEXT_SECTION_KEY)
          : cloneEvidenceEntries(defaultProductContextState.evidenceEntries, RISK_PRODUCT_CONTEXT_SECTION_KEY)
        : cloneEvidenceEntries(currentProductContext.evidenceEntries, RISK_PRODUCT_CONTEXT_SECTION_KEY)

    nextProductContext = {
      intendedPurposeHtml:
        productContextPatch.intendedPurposeHtml ?? currentProductContext.intendedPurposeHtml,
      specificIntendedUsesHtml:
        productContextPatch.specificIntendedUsesHtml ?? currentProductContext.specificIntendedUsesHtml,
      foreseeableUseHtml:
        productContextPatch.foreseeableUseHtml ?? currentProductContext.foreseeableUseHtml,
      evidenceEntries: patchedEvidence,
    }
  } else {
    nextProductContext = cloneProductContextState(currentProductContext)
  }

  if (!nextProductContext.evidenceEntries.length) {
    nextProductContext.evidenceEntries = cloneEvidenceEntries(
      defaultProductContextState.evidenceEntries,
      RISK_PRODUCT_CONTEXT_SECTION_KEY
    )
  }

  let nextProductFunction: ProductFunctionState
  if (patch.productFunction) {
    const productFunctionPatch = patch.productFunction
    const patchedEvidence =
      productFunctionPatch.evidenceEntries !== undefined
        ? productFunctionPatch.evidenceEntries.length
          ? cloneEvidenceEntries(productFunctionPatch.evidenceEntries, RISK_PRODUCT_FUNCTION_SECTION_KEY)
          : cloneEvidenceEntries(defaultProductFunctionState.evidenceEntries, RISK_PRODUCT_FUNCTION_SECTION_KEY)
        : cloneEvidenceEntries(currentProductFunction.evidenceEntries, RISK_PRODUCT_FUNCTION_SECTION_KEY)

    nextProductFunction = {
      primaryFunctionsHtml:
        productFunctionPatch.primaryFunctionsHtml ?? currentProductFunction.primaryFunctionsHtml,
      securityFunctionsHtml:
        productFunctionPatch.securityFunctionsHtml ?? currentProductFunction.securityFunctionsHtml,
      evidenceEntries: patchedEvidence,
    }
  } else {
    nextProductFunction = cloneProductFunctionState(currentProductFunction)
  }

  if (!nextProductFunction.evidenceEntries.length) {
    nextProductFunction.evidenceEntries = cloneEvidenceEntries(
      defaultProductFunctionState.evidenceEntries,
      RISK_PRODUCT_FUNCTION_SECTION_KEY
    )
  }

  const nextRiskManagement: RiskManagementState = {
    generalApproachHtml: patch.generalApproachHtml ?? current.generalApproachHtml,
    productContext: nextProductContext,
    productFunction: nextProductFunction,
  }

  const next: DocumentWorkspaceState = {
    ...inMemoryState,
    riskManagement: nextRiskManagement,
    lastUpdated: new Date().toISOString(),
  }

  persistState(next)
  return { ...next }
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

export function subscribeDocumentWorkspace(listener: WorkspaceListener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
