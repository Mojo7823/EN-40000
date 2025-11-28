import { sessionService } from '../../sessionService'
import type {
  DocumentWorkspaceState,
  CoverFormState,
  IntroductionFormState,
  PurposeScopeState,
  ProductIdentificationState,
  ManufacturerInformationState,
  ProductOverviewState,
  DocumentConventionState,
} from '../types'
import {
  getInMemoryState,
  persistState,
} from '../storage'
import {
  cloneThirdPartyState,
  cloneTerminologyEntries,
} from '../cloners'

// ============================================================================
// Cover State Updater
// ============================================================================

export function updateCoverState(patch: Partial<CoverFormState>): DocumentWorkspaceState {
  const inMemoryState = getInMemoryState()
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

// ============================================================================
// Introduction State Updater
// ============================================================================

export function updateIntroductionState(patch: Partial<IntroductionFormState>): DocumentWorkspaceState {
  const inMemoryState = getInMemoryState()
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

// ============================================================================
// Purpose & Scope State Updater
// ============================================================================

export function updatePurposeScopeState(patch: Partial<PurposeScopeState>): DocumentWorkspaceState {
  const inMemoryState = getInMemoryState()
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

// ============================================================================
// Product Identification State Updater
// ============================================================================

export function updateProductIdentificationState(
  patch: Partial<ProductIdentificationState>
): DocumentWorkspaceState {
  const inMemoryState = getInMemoryState()
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

// ============================================================================
// Manufacturer Information State Updater
// ============================================================================

export function updateManufacturerInformationState(
  patch: Partial<ManufacturerInformationState>
): DocumentWorkspaceState {
  const inMemoryState = getInMemoryState()
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

// ============================================================================
// Product Overview State Updater
// ============================================================================

export function updateProductOverviewState(
  patch: Partial<ProductOverviewState>
): DocumentWorkspaceState {
  const inMemoryState = getInMemoryState()
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

// ============================================================================
// Document Convention State Updater
// ============================================================================

export function updateDocumentConventionState(
  patch: Partial<DocumentConventionState>
): DocumentWorkspaceState {
  const inMemoryState = getInMemoryState()
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
