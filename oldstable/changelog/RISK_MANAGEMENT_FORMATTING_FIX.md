# Risk Management Section Formatting Fix

**Date:** February 2025  
**Component:** DOCX Generation - Risk Management Builder  
**Status:** ✅ Completed

---

## Summary

Fixed Section 5 (Risk Management Elements) formatting to follow the standardized pattern used across all other sections in the CRA documentation. The main issue was the incorrect placement of the reference line, which appeared after the subsection heading instead of after the main heading.

---

## Changes Made

### 1. Backend: `server/app/docx_builder/risk_management_builder.py`

**Before:**
```
5. RISK MANAGEMENT ELEMENTS
5.1 General Approach to Risk Management
[Reference: Clause 6.1 - General]
[Reference: Clause 5 - Risk Management Elements]
The following summarizes...
```

**After:**
```
5. RISK MANAGEMENT ELEMENTS
[Reference: Clause 6.1 - General]
5.1 General Approach to Risk Management
[Reference: Clause 5 - Risk Management Elements]
The following summarizes...
```

**Key Changes:**
- ✅ Added explicit page break using `document.add_page_break()`
- ✅ Changed from `document.add_heading()` to manual paragraph formatting
- ✅ Main heading now uses 20pt bold font
- ✅ Subsection heading uses 18pt bold font
- ✅ References use bold font instead of Quote style
- ✅ Main section reference now appears BEFORE subsection heading
- ✅ Proper spacing applied throughout (8pt, 10pt, 6pt, 12pt)

### 2. Documentation: `AGENTS.md`

**Added New Section:** "Standardized DOCX Section Formatting"

**Content:**
- Complete code template for section builders
- Key formatting rules and spacing guidelines
- Correct order example with visual annotations
- List of correct implementations to reference
- Best practices for creating new section builders

**Updated:**
- Recent Major Changes section (#16)
- Cross-references to related builders

---

## Standardized Format Pattern

All major sections (2, 4, 5, etc.) now follow this consistent pattern:

1. **Page break** - `document.add_page_break()`
2. **Main heading** - 20pt bold (e.g., "5. RISK MANAGEMENT ELEMENTS")
3. **Main reference** - Bold (e.g., "[Reference: Clause 6.1 - General]")
4. **Subsection heading** - 18pt bold (e.g., "5.1 General Approach...")
5. **Subsection reference** - Bold (e.g., "[Reference: Clause 5...]")
6. **Intro paragraph** - Optional explanatory text
7. **User content** - HTML from rich text editors

---

## Implementation Details

### Heading Formatting
```python
# Main section heading (20pt)
heading = document.add_paragraph()
heading_run = heading.add_run("X. SECTION TITLE")
heading_run.font.size = Pt(20)
heading_run.font.bold = True
heading.space_after = Pt(8)

# Subsection heading (18pt)
subheading = document.add_paragraph()
subheading_run = subheading.add_run("X.Y Subsection Title")
subheading_run.font.size = Pt(18)
subheading_run.font.bold = True
subheading.space_before = Pt(6)
subheading.space_after = Pt(6)
```

### Reference Formatting
```python
# Reference with bold text (NOT Quote style)
reference = document.add_paragraph("[Reference: Clause X.Y - Description]")
reference.runs[0].font.bold = True
reference.space_after = Pt(10)
```

---

## Consistency Across Sections

### ✅ Sections Following Standard Pattern:

1. **Section 2 - Product Overview** (`product_overview_builder.py`)
   - Page break → Heading → Reference → Subsection → Content
   
2. **Section 4 - Document Conventions** (`document_convention_builder.py`)
   - Page break → Heading → Subsections with references
   
3. **Section 5 - Risk Management** (`risk_management_builder.py`)
   - Page break → Heading → Reference → Subsection → Reference → Content

---

## Testing

**Test Script:**
```python
from app.docx_builder.risk_management_builder import append_risk_management_section
from app.docx_builder.section_builders import create_base_document

doc = create_base_document()
class TestPayload:
    general_approach_html = '<p>Test content</p>'
append_risk_management_section(doc, TestPayload())
doc.save('test.docx')
```

**Verification:**
- ✅ Document starts on new page
- ✅ Main heading appears first (20pt bold)
- ✅ Main reference appears second (bold)
- ✅ Subsection heading appears third (18pt bold)
- ✅ Subsection reference appears fourth (bold)
- ✅ Summary paragraph appears fifth
- ✅ User HTML content appears last

---

## Benefits

1. **Professional Consistency** - All sections follow the same visual pattern
2. **Easier Maintenance** - Clear template for future section builders
3. **Better Documentation** - Comprehensive guide in AGENTS.md
4. **Correct Order** - References properly associated with their headings
5. **Clean Separation** - User content clearly separated from structural elements

---

## Future Work

When creating new section builders:
1. Copy the pattern from `risk_management_builder.py`
2. Follow the template in AGENTS.md
3. Use manual paragraph formatting, not `document.add_heading()`
4. Place main reference BEFORE subsection heading
5. Keep user HTML separate from structural elements

---

## Related Files

**Modified:**
- `server/app/docx_builder/risk_management_builder.py`
- `AGENTS.md`

**Reference Implementations:**
- `server/app/docx_builder/product_overview_builder.py`
- `server/app/docx_builder/document_convention_builder.py`

**Documentation:**
- `AGENTS.md` - Section: "Standardized DOCX Section Formatting"
- `AGENTS.md` - Recent Major Changes #16

---

**Status:** ✅ Complete and Documented
