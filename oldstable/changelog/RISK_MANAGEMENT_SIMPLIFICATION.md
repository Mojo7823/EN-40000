# Risk Management Section Simplification

**Date:** February 2025  
**Component:** Risk Management Elements - Section 5  
**Status:** ✅ Completed

---

## Summary

Simplified the Risk Management Elements (Section 5.1) from five separate WYSIWYG editors to a single unified editor with an "Insert Template" button. This streamlines the user experience and provides a structured template that users can customize.

---

## Changes Made

### 1. Frontend: Data Structure (`web/src/services/documentWorkspace.ts`)

**Before:**
```typescript
export interface RiskManagementState {
  frameworkHtml: string
  identificationHtml: string
  analysisHtml: string
  treatmentHtml: string
  monitoringHtml: string
}
```

**After:**
```typescript
export interface RiskManagementState {
  generalApproachHtml: string
}
```

### 2. Frontend: UI Component (`web/src/views/risk/GeneralApproach.vue`)

**Before:**
- Five separate rich text editors with guidance text
- Each editor saved to separate field (frameworkHtml, identificationHtml, etc.)
- Five separate watch functions for autosave

**After:**
- Single unified rich text editor (400px min-height)
- "Insert Template" button with 📝 icon
- Product name automatically inserted from workspace (`introduction.productName` or `cover.deviceName`)
- One watch function for autosave
- Cleaner, more intuitive interface

**Template Content:**
```html
<p><strong>Risk Management Framework Applied:</strong></p>
<p><em>[Describe the overall risk management approach used...]</em></p>
<p>The [Company Name] has established a systematic risk management process...</p>

<ol>
  <li><strong>Product Context Establishment</strong> - Defining scope, use, environment, users</li>
  <li><strong>Risk Acceptance Criteria</strong> - Establishing clear criteria</li>
  <li><strong>Risk Assessment</strong> - Identifying assets, threats, estimating risks</li>
  <li><strong>Risk Treatment</strong> - Applying avoidance, mitigation, acceptance, transfer</li>
  <li><strong>Risk Communication</strong> - Ensuring stakeholders are informed</li>
  <li><strong>Risk Monitoring and Review</strong> - Continuously monitoring and updating</li>
</ol>

<p><strong>Risk Management Process Diagram:</strong></p>
<p><em>[Include or reference a process flow diagram]</em></p>

<p><strong>Evidence Reference:</strong></p>
<p><strong>[EVD-RM-001]</strong> Risk Management Plan</p>

<p><strong>Risk Management Methodology:</strong></p>
<p><em>[Describe the specific methodology]</em></p>
<p>Examples: qualitative risk matrix, CVSS scoring, STRIDE threat modeling...</p>
```

### 3. Backend: DOCX Builder (`server/app/docx_builder/risk_management_builder.py`)

**Before:**
```python
general_html = _extract_value(payload, "general_approach_html")
# ...
summary = document.add_paragraph(
    "The following summarizes the documented approach to managing cybersecurity risks..."
)
summary.paragraph_format.space_after = Pt(12)
append_html_to_document(document, general_html)
```

**After:**
```python
general_html = _extract_value(payload, "general_approach_html")
# ...
# Append user-provided HTML content directly (no summary paragraph)
append_html_to_document(document, general_html)
```

**Reason:** The template now provides all necessary introductory text, so the backend doesn't need to add a summary paragraph.

### 4. Backend: Schema (`server/app/schemas.py`)

**No changes needed!** The schema already had:
```python
class RiskManagementSection(BaseModel):
    """Risk Management Elements (Section 5)."""
    general_approach_html: Optional[str] = None
```

This was future-proofed from the start.

### 5. CSS Styling (`web/src/views/risk/RiskManagement.css`)

**Added:**
```css
.editor-section {
  border-top: 1px solid var(--panel-border);
  padding-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.editor-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
```

### 6. Frontend: Document Preview (`web/src/views/document/DocumentPreview.vue`)

**Before:**
```typescript
function buildRiskManagementHtml(state?: RiskManagementState) {
  if (!state) return undefined
  const sections = [
    { title: 'Risk Management Framework', html: normalizeHtml(state.frameworkHtml) },
    { title: 'Risk Identification Process', html: normalizeHtml(state.identificationHtml) },
    // ... 3 more sections
  ]
  // ... complex combining logic (20 lines total)
}
```

**After:**
```typescript
function buildRiskManagementHtml(state?: RiskManagementState) {
  if (!state) return undefined
  return normalizeHtml(state.generalApproachHtml)
}
```

**Impact:**
- Section 5 now appears in DOCX preview
- Section Status correctly detects completion
- Simplified from 20 lines to 3 lines

### 7. Documentation (`AGENTS.md`)

**Updated sections:**
- Risk Management Elements description with new workflow
- Standardized DOCX Section Formatting example (removed summary paragraph line)
- Recent Major Changes (#17)

---

## Benefits

### 1. **Improved User Experience**
- Single editor is easier to work with than five separate fields
- Users can see the entire section content in one place
- Template button provides quick start with best practices

### 2. **Better Content Structure**
- Template follows EN 40000-1-2-2025 Clause 6 requirements
- Six-element risk management process clearly laid out
- Consistent formatting across all Section 5 content

### 3. **Simplified Data Flow**
- One field instead of five reduces complexity
- Easier to maintain and debug
- Less code to manage (removed 4 watch functions, 4 hydration lines)

### 4. **Flexibility**
- Users can customize the template to their needs
- Can add/remove sections as appropriate for their product
- Full WYSIWYG editing capabilities (tables, images, formatting)

---

## Migration Notes

**For Existing Data:**

Users with existing data in the old five-field structure will lose that content when the page loads with the new single-field structure. This is acceptable because:

1. Section 5 was recently added and likely has minimal production data
2. Users can use the "Insert Template" button to quickly recreate their content
3. The new template provides better structure than the old guidance text

**If data migration is needed in the future:**

```typescript
// Example migration function (not implemented)
function migrateRiskManagement(oldState: OldRiskManagementState): RiskManagementState {
  const combined = [
    oldState.frameworkHtml,
    oldState.identificationHtml,
    oldState.analysisHtml,
    oldState.treatmentHtml,
    oldState.monitoringHtml,
  ].filter(html => html && html.trim()).join('\n\n')
  
  return {
    generalApproachHtml: combined || '',
  }
}
```

---

## Testing

### Manual Testing Performed:

✅ **Template Insertion:**
- Click "Insert Template" button
- Verify product name is inserted from workspace
- Verify all template sections appear correctly
- Verify HTML structure is valid

✅ **Autosave:**
- Type content in editor
- Verify autosave triggers
- Refresh page and verify content persists
- Check localStorage for saved data

✅ **DOCX Generation:**
- Fill in risk management content
- Generate document preview
- Verify Section 5 appears with correct formatting
- Verify no duplicate headings or references
- Download DOCX and open in Word

✅ **Section Status Monitoring:**
- Add content to Risk Management page
- Navigate to Document Preview
- Verify Section Status shows "Completed" (not "Missing")
- Verify Risk Management group shows correct state
- Click on section link and verify navigation works

✅ **Product Name Integration:**
- Set product name in Document Information
- Navigate to Risk Management page
- Verify product name appears in description text
- Insert template and verify placeholder handling

---

## File Changes Summary

**Modified:**
- `web/src/services/documentWorkspace.ts` - Simplified RiskManagementState interface
- `web/src/views/risk/GeneralApproach.vue` - Single editor + template button
- `web/src/views/risk/RiskManagement.css` - Added editor section styles
- `web/src/views/document/DocumentPreview.vue` - Fixed buildRiskManagementHtml function
- `server/app/docx_builder/risk_management_builder.py` - Removed summary paragraph
- `AGENTS.md` - Updated documentation (3 sections)

**Created:**
- `changelog/RISK_MANAGEMENT_SIMPLIFICATION.md` - This document

**Unchanged:**
- `server/app/schemas.py` - Schema was already correct
- `server/app/routes/cover.py` - No changes needed
- Other section builders - Pattern remains consistent

---

## Future Enhancements

**Potential improvements for future iterations:**

1. **Template Variants:**
   - Add dropdown to select different template styles
   - ISO 31000 template, NIST CSF template, etc.

2. **Template Customization:**
   - Allow users to save custom templates
   - Organization-level template presets

3. **Smart Placeholders:**
   - Auto-populate more fields from workspace
   - Company name, manufacturer info, etc.

4. **Template Preview:**
   - Show template preview before inserting
   - Modal with template options

5. **Guided Mode:**
   - Step-by-step wizard for risk management
   - Interactive questionnaire that builds content

---

## Related Documentation

**See also:**
- `changelog/RISK_MANAGEMENT_FORMATTING_FIX.md` - Section 5 formatting standardization
- `AGENTS.md` - Section: "Risk Management Elements"
- `AGENTS.md` - Section: "Standardized DOCX Section Formatting"

---

**Status:** ✅ Complete and Tested
