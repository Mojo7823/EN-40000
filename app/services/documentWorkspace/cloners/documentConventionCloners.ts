import type {
  DocumentConventionTerminologyEntry,
  DocumentConventionState,
} from '../types'
import { generateTerminologyEntryId } from '../constants'

// ============================================================================
// Inline defaults to avoid circular dependency
// ============================================================================

const defaultTerminologyEntries: DocumentConventionTerminologyEntry[] = [
  { id: 'term-product', term: 'Product with digital elements', definition: 'A product or system that contains digital components or software functions which can process, transmit, or store data.', reference: 'Regulation (EU) 2024/2847' },
  { id: 'term-cybersecurity', term: 'Cybersecurity', definition: 'The ability to protect devices, networks, and services from digital attacks that compromise confidentiality, integrity, or availability.', reference: 'prEN 40000-1-1' },
  { id: 'term-vulnerability', term: 'Vulnerability', definition: 'A weakness in design, implementation, or operation that an attacker could exploit to compromise the product.', reference: 'Regulation (EU) 2024/2847' },
  { id: 'term-risk', term: 'Risk', definition: 'The combination of the likelihood of a cybersecurity event occurring and the severity of its impact.', reference: 'prEN 40000-1-1' },
  { id: 'term-rdps', term: 'RDPS', definition: 'Remote Digital Product Support services used to monitor, configure, or update the product post-deployment.', reference: 'EN 40000-1-2' },
  { id: 'term-sbom', term: 'SBOM', definition: 'Software Bill of Materials describing all software components within the product.', reference: 'ENISA SBOM requirements' },
  { id: 'term-iprfu', term: 'IPRFU', definition: 'Installed Product Release and Field Updates covering deployed versions and corrective maintenance.', reference: 'Internal engineering procedure' },
]

const defaultDocumentConventionState: DocumentConventionState = {
  terminologyEntries: defaultTerminologyEntries.map((entry) => ({ ...entry })),
  evidenceNotationHtml: '<p>Throughout this document, evidence is referenced in green using the following notation:</p><p><span style="color: #0f9d58"><strong>[EVD-XXX]</strong></span> - Evidence document reference</p><p><span style="color: #0f9d58"><strong>[DOC-XXX]</strong></span> - Supporting documentation reference</p><p><span style="color: #0f9d58"><strong>[TEST-XXX]</strong></span> - Test report reference</p><p><span style="color: #0f9d58"><strong>[ARCH-XXX]</strong></span> - Architecture documentation reference</p><p>All evidence documents are listed in <strong>Appendix A: Evidence Register</strong>.</p>',
  requirementNotationHtml: '<p>Requirements from EN 40000-1-2-2025 are presented in blue and italicized to distinguish them from descriptive text.</p><p><strong>Example:</strong></p><p><em><span style="color: #3b82f6">Requirement [Clause X.X.X]:</span></em></p><p><em>"The product shall..."</em></p>',
  assessmentVerdictsHtml: '<p>Each requirement is assessed using the following verdicts:</p><ul><li><strong><span style="color: #16a34a">PASS</span></strong> - Requirement is fully satisfied with adequate evidence</li><li><strong><span style="color: #dc2626">FAIL</span></strong> - Requirement is not satisfied</li><li><strong><span style="color: #f97316">PARTIAL</span></strong> - Requirement is partially satisfied (details provided)</li><li><strong><span style="color: #6b7280">N/A</span></strong> - Requirement is not applicable to this product</li></ul>',
}

// ============================================================================
// Terminology Entries Cloner
// ============================================================================

export function cloneTerminologyEntries(
  entries?: DocumentConventionTerminologyEntry[]
): DocumentConventionTerminologyEntry[] {
  if (!Array.isArray(entries)) {
    return defaultTerminologyEntries.map((entry) => ({ ...entry }))
  }
  return entries.map((entry) => ({
    id: entry.id || generateTerminologyEntryId(),
    term: entry.term ?? '',
    definition: entry.definition ?? '',
    reference: entry.reference ?? '',
  }))
}

// ============================================================================
// Document Convention State Cloner
// ============================================================================

export function cloneDocumentConventionState(state?: DocumentConventionState): DocumentConventionState {
  const source = state ?? defaultDocumentConventionState
  return {
    terminologyEntries: cloneTerminologyEntries(source.terminologyEntries),
    evidenceNotationHtml: source.evidenceNotationHtml ?? '',
    requirementNotationHtml: source.requirementNotationHtml ?? '',
    assessmentVerdictsHtml: source.assessmentVerdictsHtml ?? '',
  }
}
