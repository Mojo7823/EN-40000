import {
  loadDocumentWorkspace,
  updateCoverState,
  updateIntroductionState,
  updatePurposeScopeState,
  updateProductIdentificationState,
  updateProductOverviewState,
  updateManufacturerInformationState,
  updateConformanceClaimState,
  updateDocumentConventionState,
  updateRiskManagementState,
  clearDocumentWorkspace,
  exportDocumentWorkspace,
  importDocumentWorkspace,
  subscribeDocumentWorkspace,
  generateTerminologyEntryId,
  generateEvidenceEntryId,
} from '~/services/documentWorkspace'

/**
 * Composable for Document Workspace that handles SSR gracefully
 * Returns stub functions during SSR, real implementations on client
 */
export const useDocumentWorkspace = () => {
  return {
    loadDocumentWorkspace,
    updateCoverState,
    updateIntroductionState,
    updatePurposeScopeState,
    updateProductIdentificationState,
    updateProductOverviewState,
    updateManufacturerInformationState,
    updateConformanceClaimState,
    updateDocumentConventionState,
    updateRiskManagementState,
    clearDocumentWorkspace,
    exportDocumentWorkspace,
    importDocumentWorkspace,
    subscribeDocumentWorkspace,
    generateTerminologyEntryId,
    generateEvidenceEntryId,
  }
}
