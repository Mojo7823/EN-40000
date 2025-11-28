import type {
  DocumentWorkspaceState,
  ConformanceClaimState,
} from '../types'
import {
  getInMemoryState,
  persistState,
} from '../storage'
import {
  cloneStandardsConformanceState,
  cloneRegulatoryConformanceState,
  cloneConformanceLevelState,
  normalizeConformanceStatuses,
} from '../cloners'

// ============================================================================
// Conformance Claim State Updater
// ============================================================================

export function updateConformanceClaimState(
  patch: Partial<ConformanceClaimState>
): DocumentWorkspaceState {
  const inMemoryState = getInMemoryState()
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
