import type { DocumentWorkspaceState } from '../types'
import { cloneThirdPartyState } from './baseCloners'
import { cloneConformanceClaimState } from './conformanceCloners'
import { cloneDocumentConventionState } from './documentConventionCloners'
import { cloneRiskManagementState } from './riskManagementCloners'

// ============================================================================
// Full State Cloner
// ============================================================================

export function cloneState(state: DocumentWorkspaceState): DocumentWorkspaceState {
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
