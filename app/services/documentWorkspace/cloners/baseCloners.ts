import type {
  ThirdPartyComponentsState,
  RiskEvidenceEntry,
} from '../types'
import { generateEvidenceEntryId } from '../constants'

// ============================================================================
// Third Party Components Cloner
// ============================================================================

const defaultThirdPartyComponentsState: ThirdPartyComponentsState = {
  entries: [],
  managementApproachHtml: '',
  evidenceReferenceHtml: '',
}

export function cloneThirdPartyState(state?: ThirdPartyComponentsState): ThirdPartyComponentsState {
  const source = state ?? defaultThirdPartyComponentsState
  return {
    entries: (source.entries ?? []).map((entry) => ({ ...entry })),
    managementApproachHtml: source.managementApproachHtml ?? '',
    evidenceReferenceHtml: source.evidenceReferenceHtml ?? '',
  }
}

// ============================================================================
// Evidence Entries Cloner
// ============================================================================

export function cloneEvidenceEntries(
  entries?: RiskEvidenceEntry[],
  fallbackSectionKey = 'risk-product-context'
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
