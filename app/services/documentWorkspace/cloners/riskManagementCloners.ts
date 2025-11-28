import type {
  ProductContextState,
  ProductFunctionState,
  ProductOperationalEnvironmentState,
  ProductArchitectureState,
  ProductUserDescriptionState,
  ProductContextAssessmentState,
  RequirementAssessmentEntry,
  NonConformityEntry,
  RiskManagementState,
  LegacyProductContextState,
  RiskEvidenceEntry,
} from '../types'
import {
  RISK_PRODUCT_CONTEXT_SECTION_KEY,
  RISK_PRODUCT_FUNCTION_SECTION_KEY,
  RISK_OPERATIONAL_ENVIRONMENT_SECTION_KEY,
  RISK_PRODUCT_ARCHITECTURE_SECTION_KEY,
  RISK_PRODUCT_USER_DESCRIPTION_SECTION_KEY,
} from '../constants'
import { cloneEvidenceEntries } from './baseCloners'

// ============================================================================
// Inline defaults to avoid circular dependency with defaults.ts
// ============================================================================

function getDefaultEvidenceEntry(sectionKey: string, title: string): RiskEvidenceEntry {
  return {
    id: `${sectionKey}-evidence`,
    sectionKey,
    title,
    referenceId: '',
    descriptionHtml: '',
    status: 'not_started',
  }
}

const defaultProductContextState: ProductContextState = {
  intendedPurposeHtml: '',
  specificIntendedUsesHtml: '',
  foreseeableUseHtml: '',
  evidenceEntries: [getDefaultEvidenceEntry(RISK_PRODUCT_CONTEXT_SECTION_KEY, 'Product Context Evidence Reference')],
}

const defaultProductFunctionState: ProductFunctionState = {
  primaryFunctionsHtml: '',
  securityFunctionsHtml: '',
  evidenceEntries: [getDefaultEvidenceEntry(RISK_PRODUCT_FUNCTION_SECTION_KEY, 'Product Functions Evidence Reference')],
}

const defaultOperationalEnvironmentState: ProductOperationalEnvironmentState = {
  physicalEnvironmentHtml: '',
  networkEnvironmentHtml: '',
  systemEnvironmentHtml: '',
  operationalConstraintsHtml: '',
  rdpsEnvironmentHtml: '',
  evidenceEntries: [getDefaultEvidenceEntry(RISK_OPERATIONAL_ENVIRONMENT_SECTION_KEY, 'Operational Environment Evidence Reference')],
}

const defaultProductArchitectureState: ProductArchitectureState = {
  architectureDescriptionHtml: '',
  noHardwareComponents: false,
  hardwareComponents: [],
  softwareComponents: [],
  noRdpsComponents: false,
  rdpsComponents: [],
  componentInterfaces: [],
  architectureDiagramHtml: '',
  evidenceEntries: [getDefaultEvidenceEntry(RISK_PRODUCT_ARCHITECTURE_SECTION_KEY, 'Product Architecture Evidence Reference')],
}

const defaultProductUserDescriptionState: ProductUserDescriptionState = {
  userDescriptionHtml: '',
  noRdps: false,
  rdpsConsiderationsHtml: '',
  evidenceEntries: [getDefaultEvidenceEntry(RISK_PRODUCT_USER_DESCRIPTION_SECTION_KEY, 'Product User Description Evidence Reference')],
}

// ============================================================================
// Product Context Cloner
// ============================================================================

export function cloneProductContextState(state?: ProductContextState | LegacyProductContextState): ProductContextState {
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

// ============================================================================
// Product Function Cloner
// ============================================================================

export function cloneProductFunctionState(state?: ProductFunctionState): ProductFunctionState {
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

// ============================================================================
// Operational Environment Cloner
// ============================================================================

export function cloneOperationalEnvironmentState(state?: ProductOperationalEnvironmentState): ProductOperationalEnvironmentState {
  const source = state ?? defaultOperationalEnvironmentState
  const evidenceSource =
    Array.isArray(source.evidenceEntries) && source.evidenceEntries.length
      ? source.evidenceEntries
      : defaultOperationalEnvironmentState.evidenceEntries

  return {
    physicalEnvironmentHtml: source.physicalEnvironmentHtml ?? '',
    networkEnvironmentHtml: source.networkEnvironmentHtml ?? '',
    systemEnvironmentHtml: source.systemEnvironmentHtml ?? '',
    operationalConstraintsHtml: source.operationalConstraintsHtml ?? '',
    rdpsEnvironmentHtml: source.rdpsEnvironmentHtml ?? '',
    evidenceEntries: cloneEvidenceEntries(evidenceSource, RISK_OPERATIONAL_ENVIRONMENT_SECTION_KEY),
  }
}

// ============================================================================
// Product Architecture Cloner
// ============================================================================

export function cloneProductArchitectureState(state?: ProductArchitectureState): ProductArchitectureState {
  const source = state ?? defaultProductArchitectureState
  const evidenceSource =
    Array.isArray(source.evidenceEntries) && source.evidenceEntries.length
      ? source.evidenceEntries
      : defaultProductArchitectureState.evidenceEntries

  return {
    architectureDescriptionHtml: source.architectureDescriptionHtml ?? '',
    noHardwareComponents: source.noHardwareComponents ?? false,
    hardwareComponents: (source.hardwareComponents ?? []).map((c) => ({ ...c })),
    softwareComponents: (source.softwareComponents ?? []).map((c) => ({ ...c })),
    noRdpsComponents: source.noRdpsComponents ?? false,
    rdpsComponents: (source.rdpsComponents ?? []).map((c) => ({ ...c })),
    componentInterfaces: (source.componentInterfaces ?? []).map((c) => ({ ...c })),
    architectureDiagramHtml: source.architectureDiagramHtml ?? '',
    evidenceEntries: cloneEvidenceEntries(evidenceSource, RISK_PRODUCT_ARCHITECTURE_SECTION_KEY),
  }
}

// ============================================================================
// Product User Description Cloner
// ============================================================================

export function cloneProductUserDescriptionState(state?: ProductUserDescriptionState): ProductUserDescriptionState {
  const source = state ?? defaultProductUserDescriptionState
  const evidenceSource =
    Array.isArray(source.evidenceEntries) && source.evidenceEntries.length
      ? source.evidenceEntries
      : defaultProductUserDescriptionState.evidenceEntries

  return {
    userDescriptionHtml: source.userDescriptionHtml ?? '',
    noRdps: source.noRdps ?? false,
    rdpsConsiderationsHtml: source.rdpsConsiderationsHtml ?? '',
    evidenceEntries: cloneEvidenceEntries(evidenceSource, RISK_PRODUCT_USER_DESCRIPTION_SECTION_KEY),
  }
}

// ============================================================================
// Product Context Assessment Cloner
// ============================================================================

// Inline default to avoid circular dependency with defaults.ts
const defaultProductContextAssessmentState: ProductContextAssessmentState = {
  assessments: [],
  overallVerdict: 'not_assessed',
  summaryOfFindingsHtml: '',
  nonConformities: [],
}

function cloneAssessmentEntry(entry: RequirementAssessmentEntry): RequirementAssessmentEntry {
  return {
    id: entry.id,
    evidenceId: entry.evidenceId,
    evidenceRefId: entry.evidenceRefId,
    status: entry.status,
    commentsHtml: entry.commentsHtml,
  }
}

function cloneNonConformityEntry(entry: NonConformityEntry): NonConformityEntry {
  return {
    id: entry.id,
    requirementId: entry.requirementId,
    description: entry.description,
    severity: entry.severity,
    correctiveAction: entry.correctiveAction,
  }
}

export function cloneProductContextAssessmentState(state?: ProductContextAssessmentState): ProductContextAssessmentState {
  const source = state ?? defaultProductContextAssessmentState

  return {
    assessments: (source.assessments ?? []).map(cloneAssessmentEntry),
    overallVerdict: source.overallVerdict ?? 'not_assessed',
    summaryOfFindingsHtml: source.summaryOfFindingsHtml ?? '',
    nonConformities: (source.nonConformities ?? []).map(cloneNonConformityEntry),
  }
}

// ============================================================================
// Risk Management State Cloner (Combined)
// ============================================================================

export function cloneRiskManagementState(state?: RiskManagementState): RiskManagementState {
  const source = state ?? {
    generalApproachHtml: '',
    productContext: defaultProductContextState,
    productFunction: defaultProductFunctionState,
    operationalEnvironment: defaultOperationalEnvironmentState,
    productArchitecture: defaultProductArchitectureState,
    productUserDescription: defaultProductUserDescriptionState,
    productContextAssessment: defaultProductContextAssessmentState,
  }
  return {
    generalApproachHtml: source.generalApproachHtml ?? '',
    productContext: cloneProductContextState(source.productContext),
    productFunction: cloneProductFunctionState(source.productFunction),
    operationalEnvironment: cloneOperationalEnvironmentState(source.operationalEnvironment),
    productArchitecture: cloneProductArchitectureState(source.productArchitecture),
    productUserDescription: cloneProductUserDescriptionState(source.productUserDescription),
    productContextAssessment: cloneProductContextAssessmentState(source.productContextAssessment),
  }
}
