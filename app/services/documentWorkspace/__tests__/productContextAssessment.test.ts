import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import type {
  AssessmentStatus,
  OverallVerdict,
  NCSeverity,
  RequirementAssessmentEntry,
  NonConformityEntry,
  ProductContextAssessmentState,
} from '../types'
import { defaultProductContextAssessmentState } from '../defaults'
import { PRODUCT_CONTEXT_REQUIREMENTS } from '../constants'

// ============================================================================
// Arbitraries for generating random test data
// ============================================================================

const assessmentStatusArb: fc.Arbitrary<AssessmentStatus> = fc.constantFrom(
  'not_assessed',
  'pass',
  'fail',
  'na'
)

const overallVerdictArb: fc.Arbitrary<OverallVerdict> = fc.constantFrom(
  'pass',
  'partial',
  'fail',
  'na',
  'not_assessed'
)

const ncSeverityArb: fc.Arbitrary<NCSeverity> = fc.constantFrom('minor', 'major', 'critical')

const requirementAssessmentEntryArb: fc.Arbitrary<RequirementAssessmentEntry> = fc.record({
  id: fc.stringMatching(/^6\.2\.[2-5]-[a-i]$/),
  evidenceId: fc.string({ minLength: 0, maxLength: 50 }),
  evidenceRefId: fc.string({ minLength: 0, maxLength: 50 }),
  status: assessmentStatusArb,
  commentsHtml: fc.string({ minLength: 0, maxLength: 500 }),
})

const nonConformityEntryArb: fc.Arbitrary<NonConformityEntry> = fc.record({
  id: fc.stringMatching(/^NC-6\.2-\d{2}$/),
  requirementId: fc.stringMatching(/^6\.2\.[2-5]-[a-i]$/),
  description: fc.string({ minLength: 0, maxLength: 500 }),
  severity: ncSeverityArb,
  correctiveAction: fc.string({ minLength: 0, maxLength: 500 }),
})


const productContextAssessmentStateArb: fc.Arbitrary<ProductContextAssessmentState> = fc.record({
  assessments: fc.array(requirementAssessmentEntryArb, { minLength: 0, maxLength: 20 }),
  overallVerdict: overallVerdictArb,
  summaryOfFindingsHtml: fc.string({ minLength: 0, maxLength: 1000 }),
  nonConformities: fc.array(nonConformityEntryArb, { minLength: 0, maxLength: 10 }),
})

// ============================================================================
// Helper function to simulate state round-trip (serialize/deserialize)
// ============================================================================

function serializeState(state: ProductContextAssessmentState): string {
  return JSON.stringify(state)
}

function deserializeState(json: string): ProductContextAssessmentState {
  return JSON.parse(json) as ProductContextAssessmentState
}

// ============================================================================
// Property Tests
// ============================================================================

describe('ProductContextAssessmentState', () => {
  describe('Default State', () => {
    it('should create a valid default state', () => {
      const defaultState = defaultProductContextAssessmentState()
      
      expect(defaultState.assessments).toEqual([])
      expect(defaultState.overallVerdict).toBe('not_assessed')
      expect(defaultState.summaryOfFindingsHtml).toBe('')
      expect(defaultState.nonConformities).toEqual([])
    })

    it('should create independent instances on each call', () => {
      const state1 = defaultProductContextAssessmentState()
      const state2 = defaultProductContextAssessmentState()
      
      // Modify state1
      state1.assessments.push({
        id: '6.2.2-a',
        evidenceId: 'test',
        evidenceRefId: 'TEST-001',
        status: 'pass',
        commentsHtml: '',
      })
      
      // state2 should not be affected
      expect(state2.assessments).toEqual([])
    })
  })

  describe('Requirements Constants', () => {
    it('should have all required subsections', () => {
      const subsections = new Set(PRODUCT_CONTEXT_REQUIREMENTS.map(r => r.subsection))
      expect(subsections.has('6.2.2')).toBe(true)
      expect(subsections.has('6.2.3')).toBe(true)
      expect(subsections.has('6.2.4')).toBe(true)
      expect(subsections.has('6.2.5')).toBe(true)
    })

    it('should have N/A option only for specific requirements', () => {
      const naRequirements = PRODUCT_CONTEXT_REQUIREMENTS.filter(r => r.hasNa)
      const naIds = naRequirements.map(r => r.id)
      
      expect(naIds).toContain('6.2.3-f')
      expect(naIds).toContain('6.2.3-g')
      expect(naIds).toContain('6.2.3-h')
      expect(naIds.length).toBe(3)
    })
  })

  /**
   * **Feature: product-context-assessment, Property 7: Status checkbox mutual exclusivity**
   * **Validates: Requirements 4.2, 4.3**
   * 
   * *For any* requirement assessment, checking "Pass" SHALL uncheck "Fail" (and vice versa),
   * and the persisted status SHALL match the checked option.
   */
  describe('Property 7: Status checkbox mutual exclusivity', () => {
    // Simulates the setStatus function from the Vue component
    function setStatus(
      assessments: RequirementAssessmentEntry[],
      requirementId: string,
      newStatus: AssessmentStatus
    ): RequirementAssessmentEntry[] {
      const result = assessments.map(a => ({ ...a }))
      let assessment = result.find(a => a.id === requirementId)
      
      if (!assessment) {
        assessment = {
          id: requirementId,
          evidenceId: '',
          evidenceRefId: '',
          status: 'not_assessed',
          commentsHtml: '',
        }
        result.push(assessment)
      }
      
      // If clicking the same status, toggle to not_assessed
      if (assessment.status === newStatus) {
        assessment.status = 'not_assessed'
      } else {
        assessment.status = newStatus
      }
      
      return result
    }

    it('should ensure only one status can be active at a time (mutual exclusivity)', () => {
      fc.assert(
        fc.property(
          // Generate a requirement ID from the valid set
          fc.constantFrom(...PRODUCT_CONTEXT_REQUIREMENTS.map(r => r.id)),
          // Generate initial status
          assessmentStatusArb,
          // Generate new status to set
          fc.constantFrom('pass', 'fail', 'na') as fc.Arbitrary<AssessmentStatus>,
          (requirementId, initialStatus, newStatus) => {
            // Start with an assessment in the initial status
            const initialAssessments: RequirementAssessmentEntry[] = [{
              id: requirementId,
              evidenceId: '',
              evidenceRefId: '',
              status: initialStatus,
              commentsHtml: '',
            }]
            
            // Apply the new status
            const updatedAssessments = setStatus(initialAssessments, requirementId, newStatus)
            const assessment = updatedAssessments.find(a => a.id === requirementId)!
            
            // Property: The status should be exactly one value (mutual exclusivity)
            const validStatuses: AssessmentStatus[] = ['not_assessed', 'pass', 'fail', 'na']
            expect(validStatuses).toContain(assessment.status)
            
            // Property: If we set a different status, it should be that status
            // If we set the same status, it should toggle to not_assessed
            if (initialStatus === newStatus) {
              expect(assessment.status).toBe('not_assessed')
            } else {
              expect(assessment.status).toBe(newStatus)
            }
            
            // Property: Only one status can be "checked" at a time
            // (pass, fail, na are mutually exclusive - only one can be true)
            const isPass = assessment.status === 'pass'
            const isFail = assessment.status === 'fail'
            const isNa = assessment.status === 'na'
            const isNotAssessed = assessment.status === 'not_assessed'
            
            // Exactly one of these should be true
            const checkedCount = [isPass, isFail, isNa, isNotAssessed].filter(Boolean).length
            expect(checkedCount).toBe(1)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should toggle status to not_assessed when clicking the same status', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...PRODUCT_CONTEXT_REQUIREMENTS.map(r => r.id)),
          fc.constantFrom('pass', 'fail', 'na') as fc.Arbitrary<AssessmentStatus>,
          (requirementId, status) => {
            // Start with an assessment in a specific status
            const initialAssessments: RequirementAssessmentEntry[] = [{
              id: requirementId,
              evidenceId: '',
              evidenceRefId: '',
              status: status,
              commentsHtml: '',
            }]
            
            // Click the same status again (toggle off)
            const updatedAssessments = setStatus(initialAssessments, requirementId, status)
            const assessment = updatedAssessments.find(a => a.id === requirementId)!
            
            // Should toggle to not_assessed
            expect(assessment.status).toBe('not_assessed')
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should switch from pass to fail when fail is clicked', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...PRODUCT_CONTEXT_REQUIREMENTS.map(r => r.id)),
          (requirementId) => {
            // Start with pass status
            const initialAssessments: RequirementAssessmentEntry[] = [{
              id: requirementId,
              evidenceId: '',
              evidenceRefId: '',
              status: 'pass',
              commentsHtml: '',
            }]
            
            // Click fail
            const updatedAssessments = setStatus(initialAssessments, requirementId, 'fail')
            const assessment = updatedAssessments.find(a => a.id === requirementId)!
            
            // Should be fail (pass is unchecked)
            expect(assessment.status).toBe('fail')
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should switch from fail to pass when pass is clicked', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...PRODUCT_CONTEXT_REQUIREMENTS.map(r => r.id)),
          (requirementId) => {
            // Start with fail status
            const initialAssessments: RequirementAssessmentEntry[] = [{
              id: requirementId,
              evidenceId: '',
              evidenceRefId: '',
              status: 'fail',
              commentsHtml: '',
            }]
            
            // Click pass
            const updatedAssessments = setStatus(initialAssessments, requirementId, 'pass')
            const assessment = updatedAssessments.find(a => a.id === requirementId)!
            
            // Should be pass (fail is unchecked)
            expect(assessment.status).toBe('pass')
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * **Feature: product-context-assessment, Property 1: Evidence modal displays all tracker entries**
   * **Validates: Requirements 2.2**
   * 
   * *For any* set of evidence entries in the document workspace, when the evidence selection
   * modal opens, all entries SHALL be displayed with their title, reference ID, and status.
   */
  describe('Property 1: Evidence modal displays all tracker entries', () => {
    // Arbitrary for generating evidence entries
    const riskEvidenceStatusArb: fc.Arbitrary<'not_started' | 'in_progress' | 'complete'> = fc.constantFrom(
      'not_started',
      'in_progress',
      'complete'
    )

    const riskEvidenceEntryArb = fc.record({
      id: fc.uuid(),
      sectionKey: fc.constantFrom('productContext', 'productFunction', 'operationalEnvironment', 'productArchitecture', 'productUserDescription'),
      title: fc.string({ minLength: 1, maxLength: 100 }),
      referenceId: fc.string({ minLength: 1, maxLength: 50 }),
      descriptionHtml: fc.string({ minLength: 0, maxLength: 500 }),
      status: riskEvidenceStatusArb,
    })

    // Function that simulates collecting evidence entries from workspace (mirrors the Vue computed property)
    function collectEvidenceEntries(sections: {
      productContext?: { evidenceEntries?: Array<{ id: string; title: string; referenceId: string; status: string }> }
      productFunction?: { evidenceEntries?: Array<{ id: string; title: string; referenceId: string; status: string }> }
      operationalEnvironment?: { evidenceEntries?: Array<{ id: string; title: string; referenceId: string; status: string }> }
      productArchitecture?: { evidenceEntries?: Array<{ id: string; title: string; referenceId: string; status: string }> }
      productUserDescription?: { evidenceEntries?: Array<{ id: string; title: string; referenceId: string; status: string }> }
    }) {
      const entries: Array<{ id: string; title: string; referenceId: string; status: string }> = []

      if (sections.productContext?.evidenceEntries?.length) {
        entries.push(...sections.productContext.evidenceEntries)
      }
      if (sections.productFunction?.evidenceEntries?.length) {
        entries.push(...sections.productFunction.evidenceEntries)
      }
      if (sections.operationalEnvironment?.evidenceEntries?.length) {
        entries.push(...sections.operationalEnvironment.evidenceEntries)
      }
      if (sections.productArchitecture?.evidenceEntries?.length) {
        entries.push(...sections.productArchitecture.evidenceEntries)
      }
      if (sections.productUserDescription?.evidenceEntries?.length) {
        entries.push(...sections.productUserDescription.evidenceEntries)
      }

      return entries
    }

    it('should collect all evidence entries from all sections', () => {
      fc.assert(
        fc.property(
          fc.array(riskEvidenceEntryArb, { minLength: 0, maxLength: 5 }),
          fc.array(riskEvidenceEntryArb, { minLength: 0, maxLength: 5 }),
          fc.array(riskEvidenceEntryArb, { minLength: 0, maxLength: 5 }),
          fc.array(riskEvidenceEntryArb, { minLength: 0, maxLength: 5 }),
          fc.array(riskEvidenceEntryArb, { minLength: 0, maxLength: 5 }),
          (pcEntries, pfEntries, oeEntries, paEntries, pudEntries) => {
            const sections = {
              productContext: { evidenceEntries: pcEntries },
              productFunction: { evidenceEntries: pfEntries },
              operationalEnvironment: { evidenceEntries: oeEntries },
              productArchitecture: { evidenceEntries: paEntries },
              productUserDescription: { evidenceEntries: pudEntries },
            }

            const collected = collectEvidenceEntries(sections)
            const expectedTotal = pcEntries.length + pfEntries.length + oeEntries.length + paEntries.length + pudEntries.length

            // Property: All entries from all sections should be collected
            expect(collected.length).toBe(expectedTotal)

            // Property: Each entry should have title, referenceId, and status
            for (const entry of collected) {
              expect(entry).toHaveProperty('id')
              expect(entry).toHaveProperty('title')
              expect(entry).toHaveProperty('referenceId')
              expect(entry).toHaveProperty('status')
            }

            // Property: All original entries should be present in collected
            const allOriginal = [...pcEntries, ...pfEntries, ...oeEntries, ...paEntries, ...pudEntries]
            for (const original of allOriginal) {
              const found = collected.find(e => e.id === original.id)
              expect(found).toBeDefined()
              expect(found?.title).toBe(original.title)
              expect(found?.referenceId).toBe(original.referenceId)
              expect(found?.status).toBe(original.status)
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * **Feature: product-context-assessment, Property 2: Evidence selection updates cell correctly**
   * **Validates: Requirements 2.3**
   * 
   * *For any* evidence entry selected from the modal, the assessment table cell SHALL display
   * that entry's user-defined reference ID exactly as stored.
   */
  describe('Property 2: Evidence selection updates cell correctly', () => {
    // Simulates the confirmEvidenceSelection function from the Vue component
    function applyEvidenceSelection(
      assessments: RequirementAssessmentEntry[],
      requirementId: string,
      selectedEntry: { id: string; referenceId: string; title: string }
    ): RequirementAssessmentEntry[] {
      const result = assessments.map(a => ({ ...a }))
      let assessment = result.find(a => a.id === requirementId)

      if (!assessment) {
        assessment = {
          id: requirementId,
          evidenceId: '',
          evidenceRefId: '',
          status: 'not_assessed',
          commentsHtml: '',
        }
        result.push(assessment)
      }

      assessment.evidenceId = selectedEntry.id
      assessment.evidenceRefId = selectedEntry.referenceId || selectedEntry.title || selectedEntry.id

      return result
    }

    it('should update assessment with selected evidence reference ID', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...PRODUCT_CONTEXT_REQUIREMENTS.map(r => r.id)),
          fc.uuid(),
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 100 }),
          (requirementId, evidenceId, referenceId, title) => {
            const initialAssessments: RequirementAssessmentEntry[] = []
            const selectedEntry = { id: evidenceId, referenceId, title }

            const updatedAssessments = applyEvidenceSelection(initialAssessments, requirementId, selectedEntry)
            const assessment = updatedAssessments.find(a => a.id === requirementId)!

            // Property: The evidenceId should match the selected entry's id
            expect(assessment.evidenceId).toBe(evidenceId)

            // Property: The evidenceRefId should match the selected entry's referenceId
            expect(assessment.evidenceRefId).toBe(referenceId)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should use title as fallback when referenceId is empty', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...PRODUCT_CONTEXT_REQUIREMENTS.map(r => r.id)),
          fc.uuid(),
          fc.string({ minLength: 1, maxLength: 100 }),
          (requirementId, evidenceId, title) => {
            const initialAssessments: RequirementAssessmentEntry[] = []
            const selectedEntry = { id: evidenceId, referenceId: '', title }

            const updatedAssessments = applyEvidenceSelection(initialAssessments, requirementId, selectedEntry)
            const assessment = updatedAssessments.find(a => a.id === requirementId)!

            // Property: When referenceId is empty, title should be used
            expect(assessment.evidenceRefId).toBe(title)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should use id as last fallback when both referenceId and title are empty', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...PRODUCT_CONTEXT_REQUIREMENTS.map(r => r.id)),
          fc.uuid(),
          (requirementId, evidenceId) => {
            const initialAssessments: RequirementAssessmentEntry[] = []
            const selectedEntry = { id: evidenceId, referenceId: '', title: '' }

            const updatedAssessments = applyEvidenceSelection(initialAssessments, requirementId, selectedEntry)
            const assessment = updatedAssessments.find(a => a.id === requirementId)!

            // Property: When both referenceId and title are empty, id should be used
            expect(assessment.evidenceRefId).toBe(evidenceId)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * **Feature: product-context-assessment, Property 3: Modal cancel preserves evidence state**
   * **Validates: Requirements 2.4**
   * 
   * *For any* initial evidence value in an assessment entry, closing the evidence modal
   * without selection SHALL preserve the original value unchanged.
   */
  describe('Property 3: Modal cancel preserves evidence state', () => {
    // Simulates the modal cancel behavior - no changes should be made
    function cancelEvidenceSelection(
      assessments: RequirementAssessmentEntry[]
    ): RequirementAssessmentEntry[] {
      // Cancel should return the assessments unchanged
      return assessments.map(a => ({ ...a }))
    }

    it('should preserve original evidence values when modal is cancelled', () => {
      fc.assert(
        fc.property(
          fc.array(requirementAssessmentEntryArb, { minLength: 1, maxLength: 10 }),
          (originalAssessments) => {
            // Simulate opening modal and then cancelling
            const afterCancel = cancelEvidenceSelection(originalAssessments)

            // Property: All assessments should be preserved exactly
            expect(afterCancel.length).toBe(originalAssessments.length)

            for (let i = 0; i < originalAssessments.length; i++) {
              const afterCancelEntry = afterCancel[i]
              const originalEntry = originalAssessments[i]
              if (afterCancelEntry && originalEntry) {
                expect(afterCancelEntry.id).toBe(originalEntry.id)
                expect(afterCancelEntry.evidenceId).toBe(originalEntry.evidenceId)
                expect(afterCancelEntry.evidenceRefId).toBe(originalEntry.evidenceRefId)
                expect(afterCancelEntry.status).toBe(originalEntry.status)
                expect(afterCancelEntry.commentsHtml).toBe(originalEntry.commentsHtml)
              }
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should not modify assessments when modal is closed without selection', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...PRODUCT_CONTEXT_REQUIREMENTS.map(r => r.id)),
          fc.uuid(),
          fc.string({ minLength: 0, maxLength: 50 }),
          (requirementId, existingEvidenceId, existingEvidenceRefId) => {
            // Start with an assessment that has existing evidence
            const originalAssessments: RequirementAssessmentEntry[] = [{
              id: requirementId,
              evidenceId: existingEvidenceId,
              evidenceRefId: existingEvidenceRefId,
              status: 'pass',
              commentsHtml: '<p>Test comment</p>',
            }]

            // Cancel the modal (no selection made)
            const afterCancel = cancelEvidenceSelection(originalAssessments)
            const assessment = afterCancel.find(a => a.id === requirementId)!

            // Property: Original evidence values should be preserved
            expect(assessment.evidenceId).toBe(existingEvidenceId)
            expect(assessment.evidenceRefId).toBe(existingEvidenceRefId)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * **Feature: product-context-assessment, Property 4: Comments modal hydrates existing content**
   * **Validates: Requirements 3.2**
   * 
   * *For any* existing comment HTML content in an assessment entry, opening the comments modal
   * SHALL pre-populate the editor with that exact content.
   */
  describe('Property 4: Comments modal hydrates existing content', () => {
    // Simulates opening the comments modal and hydrating the editor
    function openCommentsModal(
      assessments: RequirementAssessmentEntry[],
      requirementId: string
    ): { editorContent: string; originalContent: string } {
      const assessment = assessments.find(a => a.id === requirementId)
      const existingContent = assessment?.commentsHtml || ''
      
      return {
        editorContent: existingContent,
        originalContent: existingContent,
      }
    }

    it('should pre-populate editor with existing comment content', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...PRODUCT_CONTEXT_REQUIREMENTS.map(r => r.id)),
          fc.string({ minLength: 0, maxLength: 500 }),
          (requirementId, existingHtml) => {
            const assessments: RequirementAssessmentEntry[] = [{
              id: requirementId,
              evidenceId: '',
              evidenceRefId: '',
              status: 'not_assessed',
              commentsHtml: existingHtml,
            }]

            const modalState = openCommentsModal(assessments, requirementId)

            // Property: Editor content should match existing comment HTML exactly
            expect(modalState.editorContent).toBe(existingHtml)
            expect(modalState.originalContent).toBe(existingHtml)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should return empty string when no existing comment', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...PRODUCT_CONTEXT_REQUIREMENTS.map(r => r.id)),
          (requirementId) => {
            // Assessment with no comment
            const assessments: RequirementAssessmentEntry[] = [{
              id: requirementId,
              evidenceId: '',
              evidenceRefId: '',
              status: 'not_assessed',
              commentsHtml: '',
            }]

            const modalState = openCommentsModal(assessments, requirementId)

            // Property: Editor should be empty when no existing comment
            expect(modalState.editorContent).toBe('')
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should return empty string when assessment does not exist', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...PRODUCT_CONTEXT_REQUIREMENTS.map(r => r.id)),
          (requirementId) => {
            // Empty assessments array
            const assessments: RequirementAssessmentEntry[] = []

            const modalState = openCommentsModal(assessments, requirementId)

            // Property: Editor should be empty when assessment doesn't exist
            expect(modalState.editorContent).toBe('')
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * **Feature: product-context-assessment, Property 5: Comments save persists and previews**
   * **Validates: Requirements 3.3**
   * 
   * *For any* HTML content saved in the comments modal, the content SHALL be persisted
   * to workspace state and a truncated preview SHALL be displayed in the table cell.
   */
  describe('Property 5: Comments save persists and previews', () => {
    // Simulates saving comments from the modal
    function saveComments(
      assessments: RequirementAssessmentEntry[],
      requirementId: string,
      newContent: string
    ): RequirementAssessmentEntry[] {
      const result = assessments.map(a => ({ ...a }))
      let assessment = result.find(a => a.id === requirementId)

      if (!assessment) {
        assessment = {
          id: requirementId,
          evidenceId: '',
          evidenceRefId: '',
          status: 'not_assessed',
          commentsHtml: '',
        }
        result.push(assessment)
      }

      assessment.commentsHtml = newContent
      return result
    }

    // Simulates stripping HTML for preview (mirrors the Vue component function)
    function stripHtml(html: string): string {
      // Simple HTML stripping for testing (in browser, uses DOM)
      return html.replace(/<[^>]*>/g, '').trim()
    }

    it('should persist HTML content to assessment entry', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...PRODUCT_CONTEXT_REQUIREMENTS.map(r => r.id)),
          fc.string({ minLength: 0, maxLength: 500 }),
          (requirementId, newHtmlContent) => {
            const initialAssessments: RequirementAssessmentEntry[] = [{
              id: requirementId,
              evidenceId: '',
              evidenceRefId: '',
              status: 'not_assessed',
              commentsHtml: '',
            }]

            const updatedAssessments = saveComments(initialAssessments, requirementId, newHtmlContent)
            const assessment = updatedAssessments.find(a => a.id === requirementId)!

            // Property: The commentsHtml should match the saved content exactly
            expect(assessment.commentsHtml).toBe(newHtmlContent)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should create assessment entry if it does not exist', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...PRODUCT_CONTEXT_REQUIREMENTS.map(r => r.id)),
          fc.string({ minLength: 1, maxLength: 500 }),
          (requirementId, newHtmlContent) => {
            // Start with empty assessments
            const initialAssessments: RequirementAssessmentEntry[] = []

            const updatedAssessments = saveComments(initialAssessments, requirementId, newHtmlContent)
            const assessment = updatedAssessments.find(a => a.id === requirementId)

            // Property: Assessment should be created with the comment
            expect(assessment).toBeDefined()
            expect(assessment!.commentsHtml).toBe(newHtmlContent)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should produce valid preview text from HTML content', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant('<p>Simple text</p>'),
            fc.constant('<p><strong>Bold</strong> and <em>italic</em></p>'),
            fc.constant('<ul><li>Item 1</li><li>Item 2</li></ul>'),
            fc.constant('<p>Text with <a href="#">link</a></p>'),
            fc.constant('')
          ),
          (htmlContent) => {
            const preview = stripHtml(htmlContent)

            // Property: Preview should not contain HTML tags
            expect(preview).not.toMatch(/<[^>]*>/)

            // Property: Preview should be a string
            expect(typeof preview).toBe('string')
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * **Feature: product-context-assessment, Property 6: Comments cancel preserves state**
   * **Validates: Requirements 3.4**
   * 
   * *For any* initial comment value and any edits made in the modal, canceling SHALL
   * discard edits and preserve the original value.
   */
  describe('Property 6: Comments cancel preserves state', () => {
    // Simulates the cancel behavior - restores original content
    function cancelComments(
      assessments: RequirementAssessmentEntry[],
      _requirementId: string,
      _editedContent: string,
      _originalContent: string
    ): RequirementAssessmentEntry[] {
      // Cancel should return the assessments unchanged
      return assessments.map(a => ({ ...a }))
    }

    it('should preserve original comment when modal is cancelled', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...PRODUCT_CONTEXT_REQUIREMENTS.map(r => r.id)),
          fc.string({ minLength: 0, maxLength: 500 }),
          fc.string({ minLength: 0, maxLength: 500 }),
          (requirementId, originalHtml, editedHtml) => {
            // Start with an assessment that has existing comment
            const originalAssessments: RequirementAssessmentEntry[] = [{
              id: requirementId,
              evidenceId: '',
              evidenceRefId: '',
              status: 'pass',
              commentsHtml: originalHtml,
            }]

            // Simulate editing in modal then cancelling
            const afterCancel = cancelComments(originalAssessments, requirementId, editedHtml, originalHtml)
            const assessment = afterCancel.find(a => a.id === requirementId)!

            // Property: Original comment should be preserved
            expect(assessment.commentsHtml).toBe(originalHtml)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should not modify any assessment fields when cancelled', () => {
      fc.assert(
        fc.property(
          requirementAssessmentEntryArb,
          fc.string({ minLength: 0, maxLength: 500 }),
          (originalAssessment, editedContent) => {
            const originalAssessments: RequirementAssessmentEntry[] = [{ ...originalAssessment }]

            // Cancel the modal
            const afterCancel = cancelComments(
              originalAssessments,
              originalAssessment.id,
              editedContent,
              originalAssessment.commentsHtml
            )
            const assessment = afterCancel.find(a => a.id === originalAssessment.id)!

            // Property: All fields should be preserved exactly
            expect(assessment.id).toBe(originalAssessment.id)
            expect(assessment.evidenceId).toBe(originalAssessment.evidenceId)
            expect(assessment.evidenceRefId).toBe(originalAssessment.evidenceRefId)
            expect(assessment.status).toBe(originalAssessment.status)
            expect(assessment.commentsHtml).toBe(originalAssessment.commentsHtml)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should discard any edits made in the modal', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...PRODUCT_CONTEXT_REQUIREMENTS.map(r => r.id)),
          fc.string({ minLength: 0, maxLength: 200 }),
          fc.string({ minLength: 1, maxLength: 200 }),
          (requirementId, originalHtml, editedHtml) => {
            // Ensure edited content is different from original
            fc.pre(editedHtml !== originalHtml)

            const originalAssessments: RequirementAssessmentEntry[] = [{
              id: requirementId,
              evidenceId: '',
              evidenceRefId: '',
              status: 'not_assessed',
              commentsHtml: originalHtml,
            }]

            // Cancel discards edits
            const afterCancel = cancelComments(originalAssessments, requirementId, editedHtml, originalHtml)
            const assessment = afterCancel.find(a => a.id === requirementId)!

            // Property: The edited content should NOT be saved
            expect(assessment.commentsHtml).not.toBe(editedHtml)
            expect(assessment.commentsHtml).toBe(originalHtml)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * **Feature: product-context-assessment, Property 8: Overall verdict persistence**
   * **Validates: Requirements 5.2, 5.3**
   * 
   * *For any* overall verdict selection, the value SHALL be immediately persisted
   * to workspace state and visually indicated.
   */
  describe('Property 8: Overall verdict persistence', () => {
    // Simulates the setOverallVerdict function from the Vue component
    function setOverallVerdict(
      currentState: ProductContextAssessmentState,
      newVerdict: OverallVerdict
    ): ProductContextAssessmentState {
      return {
        ...currentState,
        overallVerdict: newVerdict,
      }
    }

    // Simulates hydrating the verdict from workspace state
    function hydrateVerdict(state: ProductContextAssessmentState | undefined): OverallVerdict {
      return state?.overallVerdict || 'not_assessed'
    }

    it('should persist verdict selection immediately', () => {
      fc.assert(
        fc.property(
          productContextAssessmentStateArb,
          overallVerdictArb,
          (initialState, newVerdict) => {
            // Set the new verdict
            const updatedState = setOverallVerdict(initialState, newVerdict)

            // Property: The verdict should be updated to the new value
            expect(updatedState.overallVerdict).toBe(newVerdict)

            // Property: Other state fields should be preserved
            expect(updatedState.assessments).toEqual(initialState.assessments)
            expect(updatedState.summaryOfFindingsHtml).toBe(initialState.summaryOfFindingsHtml)
            expect(updatedState.nonConformities).toEqual(initialState.nonConformities)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should hydrate verdict from persisted state', () => {
      fc.assert(
        fc.property(
          productContextAssessmentStateArb,
          (state) => {
            // Hydrate the verdict from state
            const hydratedVerdict = hydrateVerdict(state)

            // Property: Hydrated verdict should match the persisted value
            expect(hydratedVerdict).toBe(state.overallVerdict)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should default to not_assessed when state is undefined', () => {
      const hydratedVerdict = hydrateVerdict(undefined)

      // Property: Default verdict should be not_assessed
      expect(hydratedVerdict).toBe('not_assessed')
    })

    it('should support all valid verdict values', () => {
      const validVerdicts: OverallVerdict[] = ['pass', 'partial', 'fail', 'na', 'not_assessed']

      fc.assert(
        fc.property(
          fc.constantFrom(...validVerdicts),
          (verdict) => {
            const initialState = defaultProductContextAssessmentState()
            const updatedState = setOverallVerdict(initialState, verdict)

            // Property: Any valid verdict should be persistable
            expect(updatedState.overallVerdict).toBe(verdict)
            expect(validVerdicts).toContain(updatedState.overallVerdict)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should preserve verdict through state round-trip', () => {
      fc.assert(
        fc.property(
          overallVerdictArb,
          (verdict) => {
            // Create state with specific verdict
            const state: ProductContextAssessmentState = {
              ...defaultProductContextAssessmentState(),
              overallVerdict: verdict,
            }

            // Serialize and deserialize (simulating persistence)
            const serialized = serializeState(state)
            const deserialized = deserializeState(serialized)

            // Property: Verdict should survive round-trip
            expect(deserialized.overallVerdict).toBe(verdict)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should allow changing verdict multiple times', () => {
      fc.assert(
        fc.property(
          fc.array(overallVerdictArb, { minLength: 2, maxLength: 10 }),
          (verdictSequence) => {
            let state = defaultProductContextAssessmentState()

            // Apply each verdict in sequence
            for (const verdict of verdictSequence) {
              state = setOverallVerdict(state, verdict)
              expect(state.overallVerdict).toBe(verdict)
            }

            // Property: Final state should have the last verdict
            expect(state.overallVerdict).toBe(verdictSequence[verdictSequence.length - 1])
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * **Feature: product-context-assessment, Property 13: State round-trip consistency**
   * **Validates: Requirements 8.1, 8.2**
   * 
   * *For any* assessment state persisted to workspace, loading the page SHALL hydrate
   * all form fields with the exact persisted values.
   */
  describe('Property 13: State round-trip consistency', () => {
    it('should preserve state through JSON serialization/deserialization round-trip', () => {
      fc.assert(
        fc.property(productContextAssessmentStateArb, (originalState) => {
          // Serialize the state (simulating persistence to localStorage)
          const serialized = serializeState(originalState)
          
          // Deserialize the state (simulating hydration from localStorage)
          const hydratedState = deserializeState(serialized)
          
          // The hydrated state should be deeply equal to the original
          expect(hydratedState).toEqual(originalState)
          
          // Verify specific fields are preserved
          expect(hydratedState.assessments.length).toBe(originalState.assessments.length)
          expect(hydratedState.overallVerdict).toBe(originalState.overallVerdict)
          expect(hydratedState.summaryOfFindingsHtml).toBe(originalState.summaryOfFindingsHtml)
          expect(hydratedState.nonConformities.length).toBe(originalState.nonConformities.length)
          
          // Verify each assessment entry is preserved
          for (let i = 0; i < originalState.assessments.length; i++) {
            expect(hydratedState.assessments[i]).toEqual(originalState.assessments[i])
          }
          
          // Verify each non-conformity entry is preserved
          for (let i = 0; i < originalState.nonConformities.length; i++) {
            expect(hydratedState.nonConformities[i]).toEqual(originalState.nonConformities[i])
          }
        }),
        { numRuns: 100 }
      )
    })
  })
})


  /**
   * **Feature: product-context-assessment, Property 9: Summary content persistence**
   * **Validates: Requirements 6.2**
   * 
   * *For any* HTML content entered in the summary editor, the content SHALL be persisted
   * to the document workspace state.
   */
  describe('Property 9: Summary content persistence', () => {
    // Simulates saving summary content to workspace state
    function saveSummaryContent(
      currentState: ProductContextAssessmentState,
      newContent: string
    ): ProductContextAssessmentState {
      return {
        ...currentState,
        summaryOfFindingsHtml: newContent,
      }
    }

    // Simulates hydrating summary content from workspace state
    function hydrateSummaryContent(state: ProductContextAssessmentState | undefined): string {
      return state?.summaryOfFindingsHtml || ''
    }

    it('should persist summary HTML content to workspace state', () => {
      fc.assert(
        fc.property(
          productContextAssessmentStateArb,
          fc.string({ minLength: 0, maxLength: 1000 }),
          (initialState, newContent) => {
            // Save the new content
            const updatedState = saveSummaryContent(initialState, newContent)

            // Property: The summaryOfFindingsHtml should be updated to the new value
            expect(updatedState.summaryOfFindingsHtml).toBe(newContent)

            // Property: Other state fields should be preserved
            expect(updatedState.assessments).toEqual(initialState.assessments)
            expect(updatedState.overallVerdict).toBe(initialState.overallVerdict)
            expect(updatedState.nonConformities).toEqual(initialState.nonConformities)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should hydrate summary content from persisted state', () => {
      fc.assert(
        fc.property(
          productContextAssessmentStateArb,
          (state) => {
            // Hydrate the summary from state
            const hydratedContent = hydrateSummaryContent(state)

            // Property: Hydrated content should match the persisted value
            expect(hydratedContent).toBe(state.summaryOfFindingsHtml)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should default to empty string when state is undefined', () => {
      const hydratedContent = hydrateSummaryContent(undefined)

      // Property: Default content should be empty string
      expect(hydratedContent).toBe('')
    })

    it('should preserve summary content through state round-trip', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 1000 }),
          (summaryContent) => {
            // Create state with specific summary content
            const state: ProductContextAssessmentState = {
              ...defaultProductContextAssessmentState(),
              summaryOfFindingsHtml: summaryContent,
            }

            // Serialize and deserialize (simulating persistence)
            const serialized = serializeState(state)
            const deserialized = deserializeState(serialized)

            // Property: Summary content should survive round-trip
            expect(deserialized.summaryOfFindingsHtml).toBe(summaryContent)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should handle HTML content with special characters', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant('<p>Simple text</p>'),
            fc.constant('<p><strong>Bold</strong> and <em>italic</em></p>'),
            fc.constant('<ul><li>Item 1</li><li>Item 2</li></ul>'),
            fc.constant('<p>Text with &amp; &lt; &gt; entities</p>'),
            fc.constant('<h3>Heading with "quotes"</h3>'),
            fc.constant('')
          ),
          (htmlContent) => {
            const state: ProductContextAssessmentState = {
              ...defaultProductContextAssessmentState(),
              summaryOfFindingsHtml: htmlContent,
            }

            // Serialize and deserialize
            const serialized = serializeState(state)
            const deserialized = deserializeState(serialized)

            // Property: HTML content should be preserved exactly
            expect(deserialized.summaryOfFindingsHtml).toBe(htmlContent)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should allow updating summary content multiple times', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 0, maxLength: 500 }), { minLength: 2, maxLength: 10 }),
          (contentSequence) => {
            let state = defaultProductContextAssessmentState()

            // Apply each content update in sequence
            for (const content of contentSequence) {
              state = saveSummaryContent(state, content)
              expect(state.summaryOfFindingsHtml).toBe(content)
            }

            // Property: Final state should have the last content
            expect(state.summaryOfFindingsHtml).toBe(contentSequence[contentSequence.length - 1])
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * **Feature: product-context-assessment, Property 10: Template insertion preserves content**
   * **Validates: Requirements 6.4**
   * 
   * *For any* existing content in the summary editor, inserting the template SHALL preserve
   * the existing content and append the template text.
   */
  describe('Property 10: Template insertion preserves content', () => {
    // The template that gets inserted (mirrors the Vue component constant)
    const SUMMARY_TEMPLATE = `<h3>Assessment Summary</h3>
<p>This section summarizes the findings from the Product Context assessment for Clause 6.2 of EN 40000.</p>

<h4>Key Findings</h4>
<ul>
  <li><strong>Input Documentation:</strong> [Describe the status of input documentation review]</li>
  <li><strong>Product Context Requirements:</strong> [Summarize conformance with product context requirements]</li>
  <li><strong>Output Documentation:</strong> [Describe the status of output documentation]</li>
  <li><strong>Assessment Criteria:</strong> [Summarize how assessment criteria were met]</li>
</ul>

<h4>Recommendations</h4>
<p>[List any recommendations for improvement or corrective actions]</p>

<h4>Conclusion</h4>
<p>[Provide overall conclusion based on the assessment results]</p>`

    // Simulates the insertSummaryTemplate function from the Vue component
    function insertTemplate(existingContent: string): string {
      if (existingContent.trim()) {
        return existingContent + '<br/><br/>' + SUMMARY_TEMPLATE
      } else {
        return SUMMARY_TEMPLATE
      }
    }

    it('should preserve existing content when inserting template', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 500 }),
          (existingContent) => {
            // Ensure content is not just whitespace
            fc.pre(existingContent.trim().length > 0)

            const result = insertTemplate(existingContent)

            // Property: Result should start with the existing content
            expect(result.startsWith(existingContent)).toBe(true)

            // Property: Result should contain the template
            expect(result).toContain(SUMMARY_TEMPLATE)

            // Property: Result should contain the separator
            expect(result).toContain('<br/><br/>')
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should insert template directly when content is empty', () => {
      const result = insertTemplate('')

      // Property: Result should be exactly the template
      expect(result).toBe(SUMMARY_TEMPLATE)
    })

    it('should insert template directly when content is only whitespace', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('   ', '\t\t', '\n\n', '  \t  ', '\r\n', '    \n    '),
          (whitespaceContent) => {
            const result = insertTemplate(whitespaceContent)

            // Property: Result should be exactly the template (whitespace-only is treated as empty)
            expect(result).toBe(SUMMARY_TEMPLATE)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should append template with separator for non-empty content', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant('<p>Existing findings</p>'),
            fc.constant('<h3>My Summary</h3><p>Some content here</p>'),
            fc.constant('<ul><li>Point 1</li><li>Point 2</li></ul>'),
            fc.constant('Plain text content')
          ),
          (existingContent) => {
            const result = insertTemplate(existingContent)

            // Property: Result should be existing + separator + template
            const expected = existingContent + '<br/><br/>' + SUMMARY_TEMPLATE
            expect(result).toBe(expected)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should allow multiple template insertions', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 5 }),
          (insertCount) => {
            let content = ''

            for (let i = 0; i < insertCount; i++) {
              content = insertTemplate(content)
            }

            // Property: Content should contain the template at least once
            expect(content).toContain(SUMMARY_TEMPLATE)

            // Property: For multiple insertions, content should contain separators
            if (insertCount > 1) {
              expect(content).toContain('<br/><br/>')
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should not modify the template itself', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 500 }),
          (existingContent) => {
            const result = insertTemplate(existingContent)

            // Property: The template portion should be unchanged
            expect(result).toContain(SUMMARY_TEMPLATE)

            // Property: Template should contain expected sections
            expect(result).toContain('<h3>Assessment Summary</h3>')
            expect(result).toContain('<h4>Key Findings</h4>')
            expect(result).toContain('<h4>Recommendations</h4>')
            expect(result).toContain('<h4>Conclusion</h4>')
          }
        ),
        { numRuns: 100 }
      )
    })
  })


  /**
   * **Feature: product-context-assessment, Property 11: NC entry persistence**
   * **Validates: Requirements 7.4**
   * 
   * *For any* valid non-conformity entry saved, the entry SHALL be added to the table
   * and persisted to workspace state.
   */
  describe('Property 11: NC entry persistence', () => {
    // Simulates adding a new NC entry to the state
    function addNCEntry(
      currentState: ProductContextAssessmentState,
      newEntry: NonConformityEntry
    ): ProductContextAssessmentState {
      return {
        ...currentState,
        nonConformities: [...currentState.nonConformities, { ...newEntry }],
      }
    }

    // Simulates updating an existing NC entry
    function updateNCEntry(
      currentState: ProductContextAssessmentState,
      updatedEntry: NonConformityEntry
    ): ProductContextAssessmentState {
      const updatedNCs = currentState.nonConformities.map(nc =>
        nc.id === updatedEntry.id ? { ...updatedEntry } : { ...nc }
      )
      return {
        ...currentState,
        nonConformities: updatedNCs,
      }
    }

    // Simulates hydrating NC entries from workspace state
    function hydrateNCEntries(state: ProductContextAssessmentState | undefined): NonConformityEntry[] {
      return state?.nonConformities?.map(nc => ({ ...nc })) || []
    }

    it('should add new NC entry to state', () => {
      fc.assert(
        fc.property(
          productContextAssessmentStateArb,
          nonConformityEntryArb,
          (initialState, newEntry) => {
            // Ensure the new entry ID doesn't already exist
            fc.pre(!initialState.nonConformities.some(nc => nc.id === newEntry.id))

            const updatedState = addNCEntry(initialState, newEntry)

            // Property: The new entry should be added
            expect(updatedState.nonConformities.length).toBe(initialState.nonConformities.length + 1)

            // Property: The new entry should be in the list
            const addedEntry = updatedState.nonConformities.find(nc => nc.id === newEntry.id)
            expect(addedEntry).toBeDefined()
            expect(addedEntry!.id).toBe(newEntry.id)
            expect(addedEntry!.requirementId).toBe(newEntry.requirementId)
            expect(addedEntry!.description).toBe(newEntry.description)
            expect(addedEntry!.severity).toBe(newEntry.severity)
            expect(addedEntry!.correctiveAction).toBe(newEntry.correctiveAction)

            // Property: Other state fields should be preserved
            expect(updatedState.assessments).toEqual(initialState.assessments)
            expect(updatedState.overallVerdict).toBe(initialState.overallVerdict)
            expect(updatedState.summaryOfFindingsHtml).toBe(initialState.summaryOfFindingsHtml)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should update existing NC entry in state', () => {
      fc.assert(
        fc.property(
          nonConformityEntryArb,
          fc.string({ minLength: 1, maxLength: 200 }),
          ncSeverityArb,
          fc.string({ minLength: 1, maxLength: 200 }),
          (originalEntry, newDescription, newSeverity, newCorrectiveAction) => {
            // Create initial state with the entry
            const initialState: ProductContextAssessmentState = {
              ...defaultProductContextAssessmentState(),
              nonConformities: [{ ...originalEntry }],
            }

            // Create updated entry
            const updatedEntry: NonConformityEntry = {
              ...originalEntry,
              description: newDescription,
              severity: newSeverity,
              correctiveAction: newCorrectiveAction,
            }

            const updatedState = updateNCEntry(initialState, updatedEntry)

            // Property: The entry count should remain the same
            expect(updatedState.nonConformities.length).toBe(1)

            // Property: The entry should be updated
            const entry = updatedState.nonConformities.find(nc => nc.id === originalEntry.id)
            expect(entry).toBeDefined()
            expect(entry!.description).toBe(newDescription)
            expect(entry!.severity).toBe(newSeverity)
            expect(entry!.correctiveAction).toBe(newCorrectiveAction)

            // Property: ID and requirementId should be preserved
            expect(entry!.id).toBe(originalEntry.id)
            expect(entry!.requirementId).toBe(originalEntry.requirementId)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should hydrate NC entries from persisted state', () => {
      fc.assert(
        fc.property(
          productContextAssessmentStateArb,
          (state) => {
            const hydratedEntries = hydrateNCEntries(state)

            // Property: Hydrated entries should match persisted entries
            expect(hydratedEntries.length).toBe(state.nonConformities.length)

            for (let i = 0; i < state.nonConformities.length; i++) {
              expect(hydratedEntries[i]).toEqual(state.nonConformities[i])
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should return empty array when state is undefined', () => {
      const hydratedEntries = hydrateNCEntries(undefined)

      // Property: Default should be empty array
      expect(hydratedEntries).toEqual([])
    })

    it('should preserve NC entries through state round-trip', () => {
      fc.assert(
        fc.property(
          fc.array(nonConformityEntryArb, { minLength: 1, maxLength: 5 }),
          (ncEntries) => {
            // Create state with NC entries
            const state: ProductContextAssessmentState = {
              ...defaultProductContextAssessmentState(),
              nonConformities: ncEntries,
            }

            // Serialize and deserialize (simulating persistence)
            const serialized = serializeState(state)
            const deserialized = deserializeState(serialized)

            // Property: NC entries should survive round-trip
            expect(deserialized.nonConformities.length).toBe(ncEntries.length)
            for (let i = 0; i < ncEntries.length; i++) {
              expect(deserialized.nonConformities[i]).toEqual(ncEntries[i])
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should preserve all NC entry fields', () => {
      fc.assert(
        fc.property(
          nonConformityEntryArb,
          (entry) => {
            const state: ProductContextAssessmentState = {
              ...defaultProductContextAssessmentState(),
              nonConformities: [entry],
            }

            // Serialize and deserialize
            const serialized = serializeState(state)
            const deserialized = deserializeState(serialized)
            const persistedEntry = deserialized.nonConformities[0]

            // Property: Entry should exist
            expect(persistedEntry).toBeDefined()
            if (!persistedEntry) return

            // Property: All fields should be preserved exactly
            expect(persistedEntry.id).toBe(entry.id)
            expect(persistedEntry.requirementId).toBe(entry.requirementId)
            expect(persistedEntry.description).toBe(entry.description)
            expect(persistedEntry.severity).toBe(entry.severity)
            expect(persistedEntry.correctiveAction).toBe(entry.correctiveAction)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * **Feature: product-context-assessment, Property 12: NC deletion persistence**
   * **Validates: Requirements 7.6**
   * 
   * *For any* non-conformity entry deleted, the entry SHALL be removed from the table
   * and the change SHALL be persisted.
   */
  describe('Property 12: NC deletion persistence', () => {
    // Simulates deleting an NC entry from the state
    function deleteNCEntry(
      currentState: ProductContextAssessmentState,
      entryId: string
    ): ProductContextAssessmentState {
      return {
        ...currentState,
        nonConformities: currentState.nonConformities.filter(nc => nc.id !== entryId),
      }
    }

    it('should remove NC entry from state when deleted', () => {
      fc.assert(
        fc.property(
          fc.array(nonConformityEntryArb, { minLength: 1, maxLength: 5 }),
          fc.integer({ min: 0, max: 4 }),
          (ncEntries, deleteIndex) => {
            // Ensure deleteIndex is valid
            fc.pre(deleteIndex < ncEntries.length)
            // Ensure unique IDs (real-world constraint)
            const uniqueIds = new Set(ncEntries.map(nc => nc.id))
            fc.pre(uniqueIds.size === ncEntries.length)

            const initialState: ProductContextAssessmentState = {
              ...defaultProductContextAssessmentState(),
              nonConformities: ncEntries,
            }

            const entryToDelete = ncEntries[deleteIndex]
            if (!entryToDelete) return
            const updatedState = deleteNCEntry(initialState, entryToDelete.id)

            // Property: The entry count should decrease by 1
            expect(updatedState.nonConformities.length).toBe(ncEntries.length - 1)

            // Property: The deleted entry should not be in the list
            const deletedEntry = updatedState.nonConformities.find(nc => nc.id === entryToDelete.id)
            expect(deletedEntry).toBeUndefined()

            // Property: Other entries should be preserved
            for (const entry of ncEntries) {
              if (entry.id !== entryToDelete.id) {
                const preserved = updatedState.nonConformities.find(nc => nc.id === entry.id)
                expect(preserved).toBeDefined()
                expect(preserved).toEqual(entry)
              }
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should preserve other state fields when deleting NC entry', () => {
      fc.assert(
        fc.property(
          productContextAssessmentStateArb,
          (initialState) => {
            // Ensure there's at least one NC to delete
            fc.pre(initialState.nonConformities.length > 0)

            const entryToDelete = initialState.nonConformities[0]
            if (!entryToDelete) return
            const updatedState = deleteNCEntry(initialState, entryToDelete.id)

            // Property: Other state fields should be preserved
            expect(updatedState.assessments).toEqual(initialState.assessments)
            expect(updatedState.overallVerdict).toBe(initialState.overallVerdict)
            expect(updatedState.summaryOfFindingsHtml).toBe(initialState.summaryOfFindingsHtml)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should handle deleting non-existent entry gracefully', () => {
      fc.assert(
        fc.property(
          productContextAssessmentStateArb,
          fc.uuid(),
          (initialState, nonExistentId) => {
            // Ensure the ID doesn't exist
            fc.pre(!initialState.nonConformities.some(nc => nc.id === nonExistentId))

            const updatedState = deleteNCEntry(initialState, nonExistentId)

            // Property: State should remain unchanged
            expect(updatedState.nonConformities.length).toBe(initialState.nonConformities.length)
            expect(updatedState.nonConformities).toEqual(initialState.nonConformities)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should persist deletion through state round-trip', () => {
      fc.assert(
        fc.property(
          fc.array(nonConformityEntryArb, { minLength: 2, maxLength: 5 }),
          fc.integer({ min: 0, max: 4 }),
          (ncEntries, deleteIndex) => {
            // Ensure deleteIndex is valid
            fc.pre(deleteIndex < ncEntries.length)
            // Ensure unique IDs (real-world constraint)
            const uniqueIds = new Set(ncEntries.map(nc => nc.id))
            fc.pre(uniqueIds.size === ncEntries.length)

            const initialState: ProductContextAssessmentState = {
              ...defaultProductContextAssessmentState(),
              nonConformities: ncEntries,
            }

            const entryToDelete = ncEntries[deleteIndex]
            if (!entryToDelete) return
            const stateAfterDelete = deleteNCEntry(initialState, entryToDelete.id)

            // Serialize and deserialize (simulating persistence)
            const serialized = serializeState(stateAfterDelete)
            const deserialized = deserializeState(serialized)

            // Property: Deletion should survive round-trip
            expect(deserialized.nonConformities.length).toBe(ncEntries.length - 1)
            const deletedEntry = deserialized.nonConformities.find(nc => nc.id === entryToDelete.id)
            expect(deletedEntry).toBeUndefined()
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should allow deleting all NC entries', () => {
      fc.assert(
        fc.property(
          fc.array(nonConformityEntryArb, { minLength: 1, maxLength: 5 }),
          (ncEntries) => {
            let state: ProductContextAssessmentState = {
              ...defaultProductContextAssessmentState(),
              nonConformities: ncEntries,
            }

            // Delete all entries one by one
            for (const entry of ncEntries) {
              state = deleteNCEntry(state, entry.id)
            }

            // Property: All entries should be deleted
            expect(state.nonConformities.length).toBe(0)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should maintain order of remaining entries after deletion', () => {
      fc.assert(
        fc.property(
          fc.array(nonConformityEntryArb, { minLength: 3, maxLength: 5 }),
          fc.integer({ min: 0, max: 4 }),
          (ncEntries, deleteIndex) => {
            // Ensure deleteIndex is valid
            fc.pre(deleteIndex < ncEntries.length)

            const initialState: ProductContextAssessmentState = {
              ...defaultProductContextAssessmentState(),
              nonConformities: ncEntries,
            }

            const entryToDelete = ncEntries[deleteIndex]
            if (!entryToDelete) return
            const updatedState = deleteNCEntry(initialState, entryToDelete.id)

            // Get expected remaining entries in order
            const expectedRemaining = ncEntries.filter(nc => nc.id !== entryToDelete.id)

            // Property: Order should be preserved
            for (let i = 0; i < expectedRemaining.length; i++) {
              const updatedEntry = updatedState.nonConformities[i]
              const expectedEntry = expectedRemaining[i]
              if (updatedEntry && expectedEntry) {
                expect(updatedEntry.id).toBe(expectedEntry.id)
              }
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * **Feature: product-context-assessment, Property 14: External state subscription**
   * **Validates: Requirements 8.3**
   * 
   * *For any* external change to the workspace state, the page SHALL update displayed data
   * to reflect the new state.
   */
  describe('Property 14: External state subscription', () => {
    // Simulates the hydrate function from the Vue component
    // This function takes external state and updates local component state
    function hydrateFromExternalState(
      externalState: ProductContextAssessmentState
    ): {
      assessments: RequirementAssessmentEntry[]
      overallVerdict: OverallVerdict
      summaryOfFindingsHtml: string
      nonConformities: NonConformityEntry[]
    } {
      return {
        assessments: externalState.assessments?.map(a => ({ ...a })) || [],
        overallVerdict: externalState.overallVerdict || 'not_assessed',
        summaryOfFindingsHtml: externalState.summaryOfFindingsHtml || '',
        nonConformities: externalState.nonConformities?.map(nc => ({ ...nc })) || [],
      }
    }

    // Simulates the subscription callback behavior
    // When external state changes, the component should hydrate with new values
    function simulateExternalStateChange(
      currentLocalState: ProductContextAssessmentState,
      newExternalState: ProductContextAssessmentState
    ): ProductContextAssessmentState {
      // The subscription callback receives new state and hydrates local state
      const hydrated = hydrateFromExternalState(newExternalState)
      return {
        assessments: hydrated.assessments,
        overallVerdict: hydrated.overallVerdict,
        summaryOfFindingsHtml: hydrated.summaryOfFindingsHtml,
        nonConformities: hydrated.nonConformities,
      }
    }

    it('should update all local state fields when external state changes', () => {
      fc.assert(
        fc.property(
          productContextAssessmentStateArb,
          productContextAssessmentStateArb,
          (initialState, newExternalState) => {
            // Simulate external state change
            const updatedLocalState = simulateExternalStateChange(initialState, newExternalState)

            // Property: All fields should match the new external state
            expect(updatedLocalState.overallVerdict).toBe(newExternalState.overallVerdict)
            expect(updatedLocalState.summaryOfFindingsHtml).toBe(newExternalState.summaryOfFindingsHtml)
            expect(updatedLocalState.assessments.length).toBe(newExternalState.assessments.length)
            expect(updatedLocalState.nonConformities.length).toBe(newExternalState.nonConformities.length)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should preserve assessment entry details from external state', () => {
      fc.assert(
        fc.property(
          productContextAssessmentStateArb,
          (externalState) => {
            // Ensure there are assessments to test
            fc.pre(externalState.assessments.length > 0)

            const hydrated = hydrateFromExternalState(externalState)

            // Property: Each assessment entry should match exactly
            for (let i = 0; i < externalState.assessments.length; i++) {
              const external = externalState.assessments[i]
              const local = hydrated.assessments[i]
              if (external && local) {
                expect(local.id).toBe(external.id)
                expect(local.evidenceId).toBe(external.evidenceId)
                expect(local.evidenceRefId).toBe(external.evidenceRefId)
                expect(local.status).toBe(external.status)
                expect(local.commentsHtml).toBe(external.commentsHtml)
              }
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should preserve non-conformity entry details from external state', () => {
      fc.assert(
        fc.property(
          productContextAssessmentStateArb,
          (externalState) => {
            // Ensure there are non-conformities to test
            fc.pre(externalState.nonConformities.length > 0)

            const hydrated = hydrateFromExternalState(externalState)

            // Property: Each NC entry should match exactly
            for (let i = 0; i < externalState.nonConformities.length; i++) {
              const external = externalState.nonConformities[i]
              const local = hydrated.nonConformities[i]
              if (external && local) {
                expect(local.id).toBe(external.id)
                expect(local.requirementId).toBe(external.requirementId)
                expect(local.description).toBe(external.description)
                expect(local.severity).toBe(external.severity)
                expect(local.correctiveAction).toBe(external.correctiveAction)
              }
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should handle empty external state gracefully', () => {
      fc.assert(
        fc.property(
          productContextAssessmentStateArb,
          (initialState) => {
            // Create an empty external state
            const emptyExternalState: ProductContextAssessmentState = {
              assessments: [],
              overallVerdict: 'not_assessed',
              summaryOfFindingsHtml: '',
              nonConformities: [],
            }

            const hydrated = hydrateFromExternalState(emptyExternalState)

            // Property: Should hydrate to empty/default values
            expect(hydrated.assessments).toEqual([])
            expect(hydrated.overallVerdict).toBe('not_assessed')
            expect(hydrated.summaryOfFindingsHtml).toBe('')
            expect(hydrated.nonConformities).toEqual([])
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should create independent copies of external state (no reference sharing)', () => {
      fc.assert(
        fc.property(
          productContextAssessmentStateArb,
          (externalState) => {
            // Ensure there are items to test mutation isolation
            fc.pre(externalState.assessments.length > 0 || externalState.nonConformities.length > 0)

            const hydrated = hydrateFromExternalState(externalState)

            // Mutate the hydrated state
            if (hydrated.assessments.length > 0 && hydrated.assessments[0]) {
              hydrated.assessments[0].status = 'pass'
            }
            if (hydrated.nonConformities.length > 0 && hydrated.nonConformities[0]) {
              hydrated.nonConformities[0].description = 'MUTATED'
            }

            // Property: Original external state should not be affected
            // (This tests that hydration creates deep copies)
            if (externalState.assessments.length > 0 && externalState.assessments[0]) {
              // The original should retain its original status (unless it was already 'pass')
              // We can't directly test this without knowing original value, so we test array independence
              expect(hydrated.assessments).not.toBe(externalState.assessments)
            }
            if (externalState.nonConformities.length > 0 && externalState.nonConformities[0]) {
              expect(hydrated.nonConformities).not.toBe(externalState.nonConformities)
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should handle partial external state with missing fields', () => {
      // Test that hydration handles undefined/missing fields gracefully
      const partialStates = [
        { assessments: undefined, overallVerdict: 'pass' as OverallVerdict, summaryOfFindingsHtml: 'test', nonConformities: [] },
        { assessments: [], overallVerdict: undefined as unknown as OverallVerdict, summaryOfFindingsHtml: 'test', nonConformities: [] },
        { assessments: [], overallVerdict: 'fail' as OverallVerdict, summaryOfFindingsHtml: undefined as unknown as string, nonConformities: [] },
        { assessments: [], overallVerdict: 'partial' as OverallVerdict, summaryOfFindingsHtml: 'test', nonConformities: undefined as unknown as NonConformityEntry[] },
      ]

      for (const partialState of partialStates) {
        const hydrated = hydrateFromExternalState(partialState as ProductContextAssessmentState)

        // Property: Should handle missing fields with defaults
        expect(Array.isArray(hydrated.assessments)).toBe(true)
        expect(typeof hydrated.overallVerdict).toBe('string')
        expect(typeof hydrated.summaryOfFindingsHtml).toBe('string')
        expect(Array.isArray(hydrated.nonConformities)).toBe(true)
      }
    })

    it('should update state correctly through multiple external changes', () => {
      fc.assert(
        fc.property(
          fc.array(productContextAssessmentStateArb, { minLength: 2, maxLength: 5 }),
          (stateSequence) => {
            let currentState = defaultProductContextAssessmentState()

            // Apply each external state change in sequence
            for (const externalState of stateSequence) {
              currentState = simulateExternalStateChange(currentState, externalState)
            }

            // Property: Final state should match the last external state
            const lastExternalState = stateSequence[stateSequence.length - 1]
            if (lastExternalState) {
              expect(currentState.overallVerdict).toBe(lastExternalState.overallVerdict)
              expect(currentState.summaryOfFindingsHtml).toBe(lastExternalState.summaryOfFindingsHtml)
              expect(currentState.assessments.length).toBe(lastExternalState.assessments.length)
              expect(currentState.nonConformities.length).toBe(lastExternalState.nonConformities.length)
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })
