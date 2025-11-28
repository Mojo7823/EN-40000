# Implementation Plan

- [ ] 1. Add TypeScript types and constants for Risk Assessment Methodology
  - [ ] 1.1 Add `LikelihoodLevelEntry` and `RiskAssessmentMethodologyState` interfaces to `app/services/documentWorkspace/types.ts`
    - Add LikelihoodLevelEntry with id, level, numericValue, definition fields
    - Add RiskAssessmentMethodologyState with all WYSIWYG fields, likelihoodLevels array, and evidenceEntries
    - Add riskAssessmentMethodology as optional field to RiskManagementState
    - _Requirements: 1.1, 2.1_
  - [ ] 1.2 Add section key constant `RISK_ASSESSMENT_METHODOLOGY_SECTION_KEY` to `app/services/documentWorkspace/constants.ts`
    - Add constant for section key 'risk-assessment-methodology'
    - Add ID generator function for likelihood level entries
    - _Requirements: 1.1_

- [ ] 2. Add default state and cloner for Risk Assessment Methodology
  - [ ] 2.1 Add `defaultRiskAssessmentMethodologyState` to `app/services/documentWorkspace/defaults.ts`
    - Create default state with empty strings for all HTML fields
    - Create default likelihood levels array (empty or with sample entries)
    - Create default evidence entry for the section
    - _Requirements: 1.1, 1.4_
  - [ ] 2.2 Add `cloneRiskAssessmentMethodologyState` function to `app/services/documentWorkspace/cloners/riskManagementCloners.ts`
    - Implement deep clone for all fields including likelihoodLevels array
    - Clone evidence entries using existing cloneEvidenceEntries helper
    - _Requirements: 1.4_
  - [ ]* 2.3 Write property test for state round-trip
    - **Property 1: State persistence round-trip**
    - **Validates: Requirements 1.4**

- [ ] 3. Add state updater for Risk Assessment Methodology
  - [ ] 3.1 Update `updateRiskManagementState` in `app/services/documentWorkspace/updaters/riskManagementUpdaters.ts`
    - Add handling for riskAssessmentMethodology patch
    - Clone likelihood levels array properly
    - Handle evidence entries with section key
    - _Requirements: 1.2, 2.2, 2.3, 2.4, 3.2, 3.3_
  - [ ]* 3.2 Write property tests for likelihood scale CRUD operations
    - **Property 2: Likelihood scale add increases count**
    - **Property 3: Likelihood scale edit preserves count and updates data**
    - **Property 4: Likelihood scale delete decreases count**
    - **Validates: Requirements 2.2, 2.3, 2.4**

- [ ] 4. Export new types and functions from documentWorkspace index
  - [ ] 4.1 Update `app/services/documentWorkspace/index.ts` exports
    - Export RiskAssessmentMethodologyState and LikelihoodLevelEntry types
    - Export RISK_ASSESSMENT_METHODOLOGY_SECTION_KEY constant
    - Export defaultRiskAssessmentMethodologyState
    - Export cloneRiskAssessmentMethodologyState
    - _Requirements: 1.1_

- [ ] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Update preview payload builder
  - [ ] 6.1 Add risk assessment methodology to `buildRiskManagementPayload` in `app/utils/previewPayload.ts`
    - Add hasRiskAssessmentMethodology content check
    - Build payload with methodology_description_html, likelihood_levels, likelihood_factors_html, justification_html, consistent_application_html, individual_aggregate_risk_html
    - Include evidence_entries in payload
    - _Requirements: 4.1, 4.3, 4.4_
  - [ ]* 6.2 Write property test for payload builder
    - **Property 7: Payload builder includes likelihood scale as array**
    - **Validates: Requirements 4.3**

- [ ] 7. Add backend Pydantic schemas
  - [ ] 7.1 Add `LikelihoodLevelEntry` and `RiskAssessmentMethodologySection` schemas to `backend/app/schemas.py`
    - Add LikelihoodLevelEntry with level, numeric_value, definition fields
    - Add RiskAssessmentMethodologySection with all fields
    - Add risk_assessment_methodology field to RiskManagementSection
    - _Requirements: 4.1_

- [ ] 8. Add DOCX builder for Risk Assessment Methodology section
  - [ ] 8.1 Update `backend/app/docx_builder/risk_management_builder.py`
    - Add `_has_risk_assessment_methodology_content()` check function
    - Add `_append_risk_assessment_methodology_section()` function
    - Render section 5.3.1 header and clause reference
    - Render requirement text in blue formatting
    - Render likelihood scale as formatted table
    - Render all WYSIWYG content sections
    - Render evidence references
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Create the Risk Assessment Methodology page
  - [ ] 10.1 Create `app/pages/risk/assessment-methodology.vue`
    - Add header card with title, clause reference, and preview navigation button
    - Add methodology description card with WYSIWYG editor and template button
    - Add likelihood scale card with UTable, add/edit/delete functionality
    - Add likelihood factors card with WYSIWYG editor
    - Add justification card with WYSIWYG editor and template button
    - Add consistent application card with WYSIWYG editor and template button
    - Add individual/aggregate risk card with WYSIWYG editor and template button
    - Add evidence reference card with evidence tracker
    - Implement state loading from documentWorkspace
    - Implement state persistence with watchers
    - Implement template insertion functions
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3_

- [ ] 11. Update sidebar navigation
  - [ ] 11.1 Update `app/components/dashboard/Sidebar.vue`
    - Add "Risk Acceptance Criteria and Risk Management Methodology" folder after "Product Context Assessment"
    - Add "Risk Assessment and Treatment Methodology" as child item with route `/risk/assessment-methodology`
    - Use appropriate icons (i-heroicons-calculator for methodology)
    - _Requirements: 5.1, 5.2, 5.3_

- [ ] 12. Update evidence list page
  - [ ] 12.1 Update `app/pages/document/evidence.vue` to include Risk Assessment Methodology evidence
    - Add risk assessment methodology section to buildEvidenceRows()
    - Display evidence entries with correct section label
    - _Requirements: 3.4_
  - [ ]* 12.2 Write property test for evidence list integration
    - **Property 6: Evidence entries appear in evidence list with correct section**
    - **Validates: Requirements 3.4**

- [ ] 13. Update preview sections composable
  - [ ] 13.1 Update `app/composables/usePreviewSections.ts`
    - Add risk assessment methodology to sectionList
    - Add to SECTION_GROUP_DEFINITIONS under Risk Management
    - _Requirements: 4.1_

- [ ] 14. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
