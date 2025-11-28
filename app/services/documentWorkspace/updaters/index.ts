// Re-export all updaters from a single entry point

// Base updaters
export {
  updateCoverState,
  updateIntroductionState,
  updatePurposeScopeState,
  updateProductIdentificationState,
  updateManufacturerInformationState,
  updateProductOverviewState,
  updateDocumentConventionState,
} from './baseUpdaters'

// Conformance updaters
export { updateConformanceClaimState } from './conformanceUpdaters'

// Risk management updaters
export { updateRiskManagementState } from './riskManagementUpdaters'
