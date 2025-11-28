# Requirements Document

## Introduction

This document specifies the requirements for a new "Product Context - Assessment Summary" page within the `/risk/` section of the CRA Tool. The page provides a comprehensive checklist for assessing conformance with product context requirements per Clause 6.2 of EN 40000. Users can track requirement compliance status, link evidence from the evidence tracker, add comments via WYSIWYG editor, and document non-conformities.

## Glossary

- **Assessment Checklist**: A table of requirements with columns for ID, requirement description, evidence reference, status (Pass/Fail), and comments
- **Evidence Entry**: A reference to supporting documentation stored in the `/document/evidence` section
- **Non-Conformity (NC)**: A documented deviation from a requirement, including severity and corrective action
- **WYSIWYG**: What You See Is What You Get - a rich text editor for formatted content
- **Product Context**: The operational environment, users, functions, and architecture of the product being assessed
- **IPRFU**: Intended Purpose and Reasonably Foreseeable Use

## Requirements

### Requirement 1

**User Story:** As a compliance assessor, I want to view a structured assessment checklist for Clause 6.2 requirements, so that I can systematically evaluate product context conformance.

#### Acceptance Criteria

1. WHEN the user navigates to `/risk/product-context-assessment` THEN the Assessment_Page SHALL display a header card with section title "Product Context - Assessment Summary" and reference "[Reference: Clause 6.2]"
2. WHEN the Assessment_Page loads THEN the Assessment_Page SHALL display an assessment checklist table with columns: ID, Requirement, Evidence, Status, and Comments
3. WHEN the Assessment_Page loads THEN the Assessment_Page SHALL display all requirement rows organized by subsections (6.2.2 Input Documentation, 6.2.3 Product Context Requirements, 6.2.4 Output, 6.2.5 Assessment Criteria)
4. WHEN the user views a requirement row THEN the Assessment_Page SHALL display the requirement ID and description text matching the specification

### Requirement 2

**User Story:** As a compliance assessor, I want to select evidence references from the evidence tracker, so that I can link supporting documentation to each requirement.

#### Acceptance Criteria

1. WHEN the user clicks on an evidence cell in the checklist table THEN the Assessment_Page SHALL display a modal containing all evidence entries from the `/document/evidence` evidence tracker
2. WHEN the evidence selection modal opens THEN the Evidence_Modal SHALL display evidence entries with their title, user-defined reference ID, and status
3. WHEN the user selects an evidence entry from the modal THEN the Assessment_Page SHALL update the evidence cell to display the selected evidence reference ID as entered by the user
4. WHEN the user closes the evidence modal without selection THEN the Assessment_Page SHALL retain the previous evidence value
5. WHEN no evidence entries exist in the tracker THEN the Evidence_Modal SHALL display an empty state message directing user to add evidence first

### Requirement 3

**User Story:** As a compliance assessor, I want to add comments for each requirement using a rich text editor, so that I can document detailed observations and notes.

#### Acceptance Criteria

1. WHEN the user clicks on a comments cell in the checklist table THEN the Assessment_Page SHALL display a modal containing a WYSIWYG editor
2. WHEN the comments modal opens THEN the Comments_Modal SHALL pre-populate the editor with any existing comment content
3. WHEN the user saves the comments modal THEN the Assessment_Page SHALL persist the HTML content and display a truncated preview in the table cell
4. WHEN the user cancels the comments modal THEN the Assessment_Page SHALL discard changes and retain the previous comment value

### Requirement 4

**User Story:** As a compliance assessor, I want to set Pass or Fail status for each requirement, so that I can record the assessment verdict.

#### Acceptance Criteria

1. WHEN the user views a status cell THEN the Assessment_Page SHALL display two checkboxes labeled "Pass" and "Fail"
2. WHEN the user checks "Pass" THEN the Assessment_Page SHALL uncheck "Fail" and persist the status as "pass"
3. WHEN the user checks "Fail" THEN the Assessment_Page SHALL uncheck "Pass" and persist the status as "fail"
4. WHEN neither checkbox is checked THEN the Assessment_Page SHALL persist the status as "not_assessed"
5. WHEN a requirement has N/A option (6.2.3-f, 6.2.3-g, 6.2.3-h) THEN the Assessment_Page SHALL display an additional "N/A" checkbox

### Requirement 5

**User Story:** As a compliance assessor, I want to record an overall verdict for Clause 6.2, so that I can summarize the assessment outcome.

#### Acceptance Criteria

1. WHEN the Assessment_Page loads THEN the Assessment_Page SHALL display an overall verdict section with options: PASS, PARTIAL, FAIL, N/A
2. WHEN the user selects an overall verdict THEN the Assessment_Page SHALL persist the selection and display visual indication of the selected verdict
3. WHEN the user changes the overall verdict THEN the Assessment_Page SHALL update the persisted value immediately

### Requirement 6

**User Story:** As a compliance assessor, I want to write a summary of findings using a rich text editor, so that I can document the assessment conclusions.

#### Acceptance Criteria

1. WHEN the Assessment_Page loads THEN the Assessment_Page SHALL display a "Summary of Findings" card with a WYSIWYG editor
2. WHEN the user edits the summary content THEN the Assessment_Page SHALL persist the HTML content to the document workspace
3. WHEN the user clicks "Insert Template" button THEN the Assessment_Page SHALL insert a predefined template text into the editor
4. WHEN the template is inserted THEN the Assessment_Page SHALL preserve any existing content and append the template

### Requirement 7

**User Story:** As a compliance assessor, I want to document non-conformities in a structured table, so that I can track issues and corrective actions.

#### Acceptance Criteria

1. WHEN the Assessment_Page loads THEN the Assessment_Page SHALL display a "Non-Conformities" card with an empty table
2. WHEN the user clicks "Add Non-Conformity" button THEN the Assessment_Page SHALL display a modal form for entering NC details
3. WHEN the NC modal opens THEN the NC_Modal SHALL display fields for: NC ID, Requirement reference, Description, Severity (Minor/Major/Critical), and Corrective Action
4. WHEN the user saves the NC modal THEN the Assessment_Page SHALL add the entry to the non-conformities table and persist to workspace
5. WHEN the user clicks on an existing NC row THEN the Assessment_Page SHALL open the NC modal for editing
6. WHEN the user deletes an NC entry THEN the Assessment_Page SHALL remove it from the table and persist the change

### Requirement 8

**User Story:** As a compliance assessor, I want all assessment data to persist across sessions, so that I can continue my work without data loss.

#### Acceptance Criteria

1. WHEN the user modifies any assessment data THEN the Assessment_Page SHALL persist changes to the document workspace state
2. WHEN the Assessment_Page loads THEN the Assessment_Page SHALL hydrate all form fields from the persisted workspace state
3. WHEN external changes occur to the workspace THEN the Assessment_Page SHALL update the displayed data via subscription
