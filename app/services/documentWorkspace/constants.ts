// ============================================================================
// Storage Keys
// ============================================================================

export const STORAGE_KEY_BASE = 'cratool_document_workspace'

// ============================================================================
// Section Keys
// ============================================================================

export const RISK_PRODUCT_CONTEXT_SECTION_KEY = 'risk-product-context'
export const RISK_PRODUCT_FUNCTION_SECTION_KEY = 'risk-product-function'
export const RISK_OPERATIONAL_ENVIRONMENT_SECTION_KEY = 'risk-operational-environment'
export const RISK_PRODUCT_ARCHITECTURE_SECTION_KEY = 'risk-product-architecture'
export const RISK_PRODUCT_USER_DESCRIPTION_SECTION_KEY = 'risk-product-user-description'

// ============================================================================
// ID Prefixes
// ============================================================================

export const TERMINOLOGY_ID_PREFIX = 'term-'
export const EVIDENCE_ID_PREFIX = 'evidence-'

// ============================================================================
// Status Options
// ============================================================================

export const RISK_EVIDENCE_STATUS_OPTIONS = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'complete', label: 'Complete' },
] as const

// ============================================================================
// ID Generators
// ============================================================================

export function generateEvidenceEntryId(sectionKey = RISK_PRODUCT_CONTEXT_SECTION_KEY): string {
  const random = Math.random().toString(36).slice(2, 8)
  const timestamp = Date.now().toString(36)
  return `${EVIDENCE_ID_PREFIX}${sectionKey}-${timestamp}-${random}`
}

export function generateTerminologyEntryId(): string {
  const random = Math.random().toString(36).slice(2, 8)
  const timestamp = Date.now().toString(36)
  return `${TERMINOLOGY_ID_PREFIX}${timestamp}-${random}`
}
