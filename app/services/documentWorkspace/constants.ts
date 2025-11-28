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
export const RISK_PRODUCT_CONTEXT_ASSESSMENT_SECTION_KEY = 'risk-product-context-assessment'

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

// ============================================================================
// Product Context Assessment Requirements (Clause 6.2)
// ============================================================================

export interface ProductContextRequirementDefinition {
  id: string
  subsection: string
  label: string
  description: string
  hasNa: boolean
}

export const PRODUCT_CONTEXT_REQUIREMENTS: ProductContextRequirementDefinition[] = [
  // 6.2.2 Input Documentation
  { id: '6.2.2-a', subsection: '6.2.2', label: 'Input Documentation', description: 'Functional use cases (user stories) documented', hasNa: false },
  { id: '6.2.2-b', subsection: '6.2.2', label: 'Input Documentation', description: 'User types identified and documented', hasNa: false },
  { id: '6.2.2-c', subsection: '6.2.2', label: 'Input Documentation', description: 'Operational environment documented', hasNa: false },
  { id: '6.2.2-d', subsection: '6.2.2', label: 'Input Documentation', description: 'Product architecture documented', hasNa: false },
  { id: '6.2.2-e', subsection: '6.2.2', label: 'Input Documentation', description: 'Third-party components identified', hasNa: false },
  // 6.2.3 Product Context Requirements
  { id: '6.2.3-a', subsection: '6.2.3', label: 'Product Context Requirements', description: 'Intended purpose and reasonably foreseeable use (IPRFU) defined', hasNa: false },
  { id: '6.2.3-b', subsection: '6.2.3', label: 'Product Context Requirements', description: 'Product functions documented', hasNa: false },
  { id: '6.2.3-c', subsection: '6.2.3', label: 'Product Context Requirements', description: 'Operational environment specified', hasNa: false },
  { id: '6.2.3-d', subsection: '6.2.3', label: 'Product Context Requirements', description: 'User types and characteristics defined', hasNa: false },
  { id: '6.2.3-e', subsection: '6.2.3', label: 'Product Context Requirements', description: 'Product architecture described', hasNa: false },
  { id: '6.2.3-f', subsection: '6.2.3', label: 'Product Context Requirements', description: 'RDPS dependencies recorded (if applicable)', hasNa: true },
  { id: '6.2.3-g', subsection: '6.2.3', label: 'Product Context Requirements', description: 'Data processing activities identified (if applicable)', hasNa: true },
  { id: '6.2.3-h', subsection: '6.2.3', label: 'Product Context Requirements', description: 'External interfaces documented (if applicable)', hasNa: true },
  { id: '6.2.3-i', subsection: '6.2.3', label: 'Product Context Requirements', description: 'Security assumptions documented', hasNa: false },
  // 6.2.4 Output
  { id: '6.2.4-a', subsection: '6.2.4', label: 'Output', description: 'Product context documentation complete', hasNa: false },
  { id: '6.2.4-b', subsection: '6.2.4', label: 'Output', description: 'Product context review record available', hasNa: false },
  // 6.2.5 Assessment Criteria
  { id: '6.2.5-a', subsection: '6.2.5', label: 'Assessment Criteria', description: 'Product context is complete and consistent', hasNa: false },
  { id: '6.2.5-b', subsection: '6.2.5', label: 'Assessment Criteria', description: 'Product context is traceable to requirements', hasNa: false },
]
