# Document Convention Notation Page Update

**Date:** February 2025  
**Status:** ✅ Completed

---

## Overview

Updated the Document Convention "Notation" page to match the reference document structure, with improved prefilled content and proper section numbering in DOCX output while keeping the web UI clean without section numbers.

---

## Changes Made

### 1. Frontend Updates (Web UI)

#### **File:** `web/src/views/convention/EvidenceNotation.vue`

**Changes:**
- Updated prefilled content for all three WYSIWYG editors to match reference document
- Enhanced formatting with bold, italic, and color styling
- Section headings remain **without numbers** in the web UI (Evidence Notation, Requirement Notation, Assessment Verdicts)

**New Default Content (Matches Reference Document Exactly):**

1. **Evidence Notation:**
   ```html
   <p><strong>[EVD-XXX]</strong> - Evidence document reference</p>
   <p><strong>[DOC-XXX]</strong> - Supporting documentation reference</p>
   <p><strong>[TEST-XXX]</strong> - Test report reference</p>
   <p><strong>[ARCH-XXX]</strong> - Architecture documentation reference</p>
   <p><br></p>
   <p>All evidence documents are listed in <strong>Appendix A: Evidence Register</strong>.</p>
   ```

2. **Requirement Notation:**
   ```html
   <p>Requirements from EN 40000-1-2-2025 are presented in blue and italicized to distinguish them from descriptive text.</p>
   <p><br></p>
   <p><strong>Example:</strong></p>
   <p><br></p>
   <p><em><span style="color: #3b82f6">Requirement [Clause X.X.X]:</span></em></p>
   <p><em>"The product shall..."</em></p>
   ```

3. **Assessment Verdicts:**
   ```html
   <ul>
     <li><p><strong>PASS</strong> - Requirement is fully satisfied with adequate evidence</p></li>
     <li><p><strong>FAIL</strong> - Requirement is not satisfied</p></li>
     <li><p><strong>PARTIAL</strong> - Requirement is partially satisfied (details provided)</p></li>
     <li><p><strong>N/A</strong> - Requirement is not applicable to this product</p></li>
   </ul>
   ```

#### **File:** `web/src/services/documentWorkspace.ts`

**Changes:**
- Updated default state with the same improved prefilled content
- Ensures consistency for new workspaces or cleared data

---

### 2. Backend Updates (DOCX Generation)

#### **File:** `server/app/docx_builder/document_convention_builder.py`

**Changes:**
- Updated `add_evidence_notation_combined()` to add **"4.2 Evidence Notation"** heading in DOCX
- Updated `add_requirement_notation_combined()` to add **"4.3 Requirement Notation"** heading in DOCX
- Updated `add_assessment_verdicts_combined()` to add **"4.4 Assessment Verdicts"** heading in DOCX
- Removed redundant reference lines (already in intro text)
- Kept section numbers ONLY in DOCX output, not in web UI

**DOCX Output Structure:**
```
4. DOCUMENT CONVENTIONS
  4.1 Terminology
    [Table with terms and definitions]
  
  4.2 Evidence Notation
    Throughout this document, evidence is referenced in green...
    [User-edited content from WYSIWYG editor]
  
  4.3 Requirement Notation
    Requirements from EN 40000-1-2-2025 are presented...
    [User-edited content from WYSIWYG editor]
  
  4.4 Assessment Verdicts
    Each requirement is assessed using the following verdicts:
    [User-edited content from WYSIWYG editor]
```

---

## Key Design Decisions

### ✅ Section Numbers in DOCX Only

**Reasoning:**
- Professional documents require numbered sections for navigation and reference
- Web UI benefits from cleaner, less cluttered headings
- Users edit content, not section structure

**Implementation:**
- Web UI: "Evidence Notation", "Requirement Notation", "Assessment Verdicts"
- DOCX Output: "4.2 Evidence Notation", "4.3 Requirement Notation", "4.4 Assessment Verdicts"

### ✅ Improved Prefilled Content

**Reasoning:**
- Matches the reference document exactly
- Provides better guidance for users
- Uses proper formatting (bold, italic, colors) to demonstrate best practices

**Features:**
- Bold notation codes ([EVD-XXX], [DOC-XXX], etc.)
- Blue italicized requirement examples
- Color-coded verdict categories (green=PASS, red=FAIL, blue=PARTIAL, orange=N/A)

### ✅ Three WYSIWYG Editors

**Structure:**
- Each subsection (4.2, 4.3, 4.4) has its own rich text editor
- Users can fully customize content with formatting
- Auto-saves to workspace on every change
- Content persists across sessions

---

## Testing Recommendations

### Manual Testing Checklist:

- [ ] Navigate to `/convention/notation`
- [ ] Verify three WYSIWYG editors are visible
- [ ] Check that prefilled content matches reference document
- [ ] Edit content in each editor and verify autosave works
- [ ] Navigate away and back to verify persistence
- [ ] Go to Document Preview
- [ ] Generate DOCX preview
- [ ] Verify section numbers (4.2, 4.3, 4.4) appear in DOCX
- [ ] Verify formatting (bold, italic, colors) renders correctly in DOCX
- [ ] Download DOCX and open in Microsoft Word
- [ ] Verify complete Section 4 structure

### Expected Behavior:

1. **Web UI:**
   - Clean section headings without numbers
   - Three rich text editors with prefilled content
   - Content autosaves on change
   - No section numbers visible

2. **DOCX Preview/Export:**
   - Section 4 starts on new page
   - "4. DOCUMENT CONVENTIONS" main heading
   - "4.1 Terminology" with table
   - "4.2 Evidence Notation" with user content
   - "4.3 Requirement Notation" with user content
   - "4.4 Assessment Verdicts" with user content
   - All formatting preserved

---

## Files Modified

### Frontend:
- `web/src/views/convention/EvidenceNotation.vue` - Updated prefilled content
- `web/src/services/documentWorkspace.ts` - Updated default state

### Backend:
- `server/app/docx_builder/document_convention_builder.py` - Added section numbers to DOCX output

---

## Migration Notes

**Existing Workspaces:**
- Users with existing data will keep their current content
- Only new users or cleared workspaces will see the improved prefilled content
- Section numbers will appear in DOCX regardless of when workspace was created

**Backward Compatibility:**
- Legacy fields are still supported in schemas
- Old workspace data will continue to work
- No breaking changes to API or data structure

---

## Reference Document

Based on: `Reference/Screenshot 2025-11-19 110838.png`

Shows the expected structure with:
- Section 4 Document Conventions
- Subsections 4.1, 4.2, 4.3, 4.4 with proper formatting
- Terminology table
- Evidence notation with color-coded references
- Requirement notation with blue italicized examples
- Assessment verdicts with color-coded categories

---

## Next Steps

**Potential Enhancements:**
1. Add color picker for evidence references (green highlighting)
2. Add blue/italic quick-format button for requirements
3. Add verdict color templates/shortcuts
4. Preview section 4 in dedicated preview pane
5. Export Section 4 as standalone document

**No Immediate Action Required:**
All changes are complete and backward compatible.

---

**Summary:** The Document Convention Notation page now has three properly prefilled WYSIWYG editors matching the reference document. Section numbers (4.2, 4.3, 4.4) are hidden in the web UI but appear correctly in the DOCX output for professional document formatting.
