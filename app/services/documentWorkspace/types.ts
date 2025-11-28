import type {
  ConformanceLevelState,
  ConformanceStandardEntry,
  RegulatoryReferenceEntry,
} from '../../types/conformance'

// ============================================================================
// Cover & Introduction
// ============================================================================

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

// ============================================================================
// Purpose & Scope
// ============================================================================

export interface PurposeScopeState {
  scopeSelections: string[]
  assessmentStart: string
  assessmentEnd: string
  methodologyHtml: string
}

// ============================================================================
// Product Identification & Manufacturer
// ============================================================================

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

// ============================================================================
// Product Overview & Third Party Components
// ============================================================================

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

export interface ProductOverviewState {
  productDescriptionHtml: string
  productArchitectureHtml: string
  thirdPartyComponents: ThirdPartyComponentsState
}

// ============================================================================
// Conformance Claim
// ============================================================================

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

// ============================================================================
// Document Convention
// ============================================================================

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

// ============================================================================
// Risk Management - Evidence
// ============================================================================

export type RiskEvidenceStatus = 'not_started' | 'in_progress' | 'complete'

export interface RiskEvidenceEntry {
  id: string
  sectionKey: string
  title: string
  referenceId: string
  descriptionHtml: string
  status: RiskEvidenceStatus
}

// ============================================================================
// Risk Management - Product Context
// ============================================================================

export interface ProductContextState {
  intendedPurposeHtml: string
  specificIntendedUsesHtml: string
  foreseeableUseHtml: string
  evidenceEntries: RiskEvidenceEntry[]
}

// Legacy type for migration
export type LegacyProductContextState = {
  scopeDefinitionHtml?: string
  operationalEnvironmentHtml?: string
  stakeholderProfilesHtml?: string
  evidenceEntries?: RiskEvidenceEntry[]
}

// ============================================================================
// Risk Management - Product Function
// ============================================================================

export interface ProductFunctionState {
  primaryFunctionsHtml: string
  securityFunctionsHtml: string
  evidenceEntries: RiskEvidenceEntry[]
}

// ============================================================================
// Risk Management - Operational Environment
// ============================================================================

export interface ProductOperationalEnvironmentState {
  physicalEnvironmentHtml: string
  networkEnvironmentHtml: string
  systemEnvironmentHtml: string
  operationalConstraintsHtml: string
  rdpsEnvironmentHtml: string
  evidenceEntries: RiskEvidenceEntry[]
}

// ============================================================================
// Risk Management - Product Architecture
// ============================================================================

export interface HardwareComponentEntry {
  id: string
  componentName: string
  function: string
  interfaces: string
  securityFunctions: string
}

export interface SoftwareComponentEntry {
  id: string
  type: string
  function: string
  thirdParty: boolean
  interfaces: string
  securityFunctions: string
}

export interface RdpsComponentEntry {
  id: string
  component: string
  provider: string
  function: string
  location: string
  developmentResponsibility: string
  operationResponsibility: string
}

export interface ComponentInterfaceEntry {
  id: string
  interface: string
  componentA: string
  componentB: string
  protocol: string
  authentication: string
  dataExchanged: string
}

export interface ProductArchitectureState {
  architectureDescriptionHtml: string
  noHardwareComponents: boolean
  hardwareComponents: HardwareComponentEntry[]
  softwareComponents: SoftwareComponentEntry[]
  noRdpsComponents: boolean
  rdpsComponents: RdpsComponentEntry[]
  componentInterfaces: ComponentInterfaceEntry[]
  architectureDiagramHtml: string
  evidenceEntries: RiskEvidenceEntry[]
}

// ============================================================================
// Risk Management - Product User Description
// ============================================================================

export interface ProductUserDescriptionState {
  userDescriptionHtml: string
  noRdps: boolean
  rdpsConsiderationsHtml: string
  evidenceEntries: RiskEvidenceEntry[]
}

// ============================================================================
// Risk Management - Product Context Assessment
// ============================================================================

// Assessment status for each requirement
export type AssessmentStatus = 'not_assessed' | 'pass' | 'fail' | 'na'

// Overall verdict for the clause
export type OverallVerdict = 'pass' | 'partial' | 'fail' | 'na' | 'not_assessed'

// Non-conformity severity levels
export type NCSeverity = 'minor' | 'major' | 'critical'

// Individual requirement assessment entry
export interface RequirementAssessmentEntry {
  id: string                    // e.g., "6.2.2-a"
  evidenceId: string           // Reference to evidence entry ID
  evidenceRefId: string        // Display reference ID from evidence
  status: AssessmentStatus
  commentsHtml: string
}

// Non-conformity entry
export interface NonConformityEntry {
  id: string                   // e.g., "NC-6.2-01"
  requirementId: string        // e.g., "6.2.3-f"
  description: string
  severity: NCSeverity
  correctiveAction: string
}

// Product Context Assessment state
export interface ProductContextAssessmentState {
  assessments: RequirementAssessmentEntry[]
  overallVerdict: OverallVerdict
  summaryOfFindingsHtml: string
  nonConformities: NonConformityEntry[]
}

// ============================================================================
// Risk Management - Risk Assessment and Treatment Methodology
// ============================================================================

export interface RiskAssessmentMethodologyState {
  methodologyDescriptionHtml: string
  justificationHtml: string
  consistentApplicationHtml: string
  individualAggregateRiskHtml: string
  evidenceEntries: RiskEvidenceEntry[]
}

// ============================================================================
// Risk Management - Combined State
// ============================================================================

export interface RiskManagementState {
  generalApproachHtml: string
  productContext: ProductContextState
  productFunction: ProductFunctionState
  operationalEnvironment: ProductOperationalEnvironmentState
  productArchitecture: ProductArchitectureState
  productUserDescription?: ProductUserDescriptionState
  productContextAssessment?: ProductContextAssessmentState
  riskAssessmentMethodology?: RiskAssessmentMethodologyState
}

// ============================================================================
// Document Workspace - Root State
// ============================================================================

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

// ============================================================================
// Listener Type
// ============================================================================

export type WorkspaceListener = (state: DocumentWorkspaceState) => void
