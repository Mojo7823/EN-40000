import type {
  ConformanceLevelState,
  ConformanceLevelStatus,
} from '../../../types/conformance'
import {
  generateRegulationEntryId,
  buildDefaultPrimaryStandard,
  buildDefaultRelatedStandards,
  buildDefaultRegulatoryEntries,
  CONFORMANCE_LEVEL_OPTIONS,
} from '../../../constants/conformance'
import type {
  StandardsConformanceState,
  RegulatoryConformanceState,
  ConformanceClaimState,
} from '../types'

// ============================================================================
// Inline default builder to avoid circular dependency
// ============================================================================

function buildDefaultStandardsConformanceState(): StandardsConformanceState {
  return {
    primaryStandard: buildDefaultPrimaryStandard(),
    relatedStandards: buildDefaultRelatedStandards(),
    includeOther: false,
    otherNotes: '',
  }
}

// ============================================================================
// Conformance Level Validation
// ============================================================================

const CONFORMANCE_LEVEL_VALUE_SET = new Set<ConformanceLevelStatus>(
  CONFORMANCE_LEVEL_OPTIONS.map((option) => option.value)
)

export function normalizeConformanceStatuses(statuses?: ConformanceLevelStatus[]): ConformanceLevelStatus[] {
  if (!Array.isArray(statuses)) {
    return []
  }
  return statuses.filter((status): status is ConformanceLevelStatus => CONFORMANCE_LEVEL_VALUE_SET.has(status))
}

// ============================================================================
// Standards Conformance Cloner
// ============================================================================

export function cloneStandardsConformanceState(state?: StandardsConformanceState): StandardsConformanceState {
  const source = state ?? buildDefaultStandardsConformanceState()
  return {
    primaryStandard: { ...source.primaryStandard },
    relatedStandards: (source.relatedStandards ?? []).map((entry) => ({ ...entry })),
    includeOther: !!source.includeOther,
    otherNotes: source.otherNotes ?? '',
  }
}

// ============================================================================
// Regulatory Conformance Cloner
// ============================================================================

export function cloneRegulatoryConformanceState(
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

// ============================================================================
// Conformance Level Cloner
// ============================================================================

export function cloneConformanceLevelState(
  state?: ConformanceLevelState,
  legacyHtml?: string
): ConformanceLevelState {
  return {
    statuses: normalizeConformanceStatuses(state?.statuses),
    justificationHtml: state?.justificationHtml ?? legacyHtml ?? '',
  }
}

// ============================================================================
// Conformance Claim Cloner (Combined)
// ============================================================================

export function cloneConformanceClaimState(
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
