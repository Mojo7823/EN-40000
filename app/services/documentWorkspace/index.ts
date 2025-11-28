// ============================================================================
// Document Workspace - Modular State Management
// ============================================================================
// This module provides centralized state management for the CRA Tool document.
// It has been modularized for maintainability:
//
// - types.ts: All TypeScript interfaces
// - constants.ts: Section keys, prefixes, ID generators
// - defaults.ts: Default state values
// - cloners/: Deep clone helpers for each section
// - updaters/: State update functions
// - storage.ts: localStorage persistence & listeners
// ============================================================================

// Re-export all types
export type {
  CoverFormState,
  IntroductionFormState,
  PurposeScopeState,
  ProductIdentificationState,
  ManufacturerInformationState,
  ThirdPartyComponentEntry,
  ThirdPartyComponentsState,
  ProductOverviewState,
  StandardsConformanceState,
  RegulatoryConformanceState,
  ConformanceClaimState,
  DocumentConventionTerminologyEntry,
  DocumentConventionState,
  RiskEvidenceStatus,
  RiskEvidenceEntry,
  ProductContextState,
  LegacyProductContextState,
  ProductFunctionState,
  ProductOperationalEnvironmentState,
  HardwareComponentEntry,
  SoftwareComponentEntry,
  RdpsComponentEntry,
  ComponentInterfaceEntry,
  ProductArchitectureState,
  ProductUserDescriptionState,
  RiskManagementState,
  DocumentWorkspaceState,
  WorkspaceListener,
} from './types'

// Re-export constants
export {
  STORAGE_KEY_BASE,
  RISK_PRODUCT_CONTEXT_SECTION_KEY,
  RISK_PRODUCT_FUNCTION_SECTION_KEY,
  RISK_OPERATIONAL_ENVIRONMENT_SECTION_KEY,
  RISK_PRODUCT_ARCHITECTURE_SECTION_KEY,
  RISK_PRODUCT_USER_DESCRIPTION_SECTION_KEY,
  TERMINOLOGY_ID_PREFIX,
  EVIDENCE_ID_PREFIX,
  RISK_EVIDENCE_STATUS_OPTIONS,
  generateEvidenceEntryId,
  generateTerminologyEntryId,
} from './constants'

// Re-export storage functions
export {
  loadDocumentWorkspace,
  clearDocumentWorkspace,
  exportDocumentWorkspace,
  importDocumentWorkspace,
  subscribeDocumentWorkspace,
} from './storage'

// Re-export all updaters
export {
  updateCoverState,
  updateIntroductionState,
  updatePurposeScopeState,
  updateProductIdentificationState,
  updateManufacturerInformationState,
  updateProductOverviewState,
  updateDocumentConventionState,
  updateConformanceClaimState,
  updateRiskManagementState,
} from './updaters'
