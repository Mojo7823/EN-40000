# Agent Knowledge Base - CRA Tool (EN-40000)

**Last Updated:** February 2025  
**Project:** CRA Tool - Cyber Resilience Act Documentation Tool  
**Status:** Active Development

---

## 📋 Quick Reference

**Project Type:** Full-stack web application (FastAPI + Vue 3)  
**Purpose:** Create and manage CRA (Cyber Resilience Act) compliance documentation  
**Primary Function:** Generate professional DOCX documents from rich HTML content  

**Key URLs:**
- Frontend: http://127.0.0.1:5173
- Backend API: http://127.0.0.1:8000
- API Docs: http://127.0.0.1:8000/docs

**Start/Stop:**
```bash
./dev_start.sh    # Starts both backend and frontend
./dev_stop.sh     # Stops both servers
./dev_fresh.sh    # Stops servers and clears .venv/node_modules caches
```

---

## 🏗️ Architecture Overview

### Backend (Python/FastAPI)

**Location:** `server/`

**Tech Stack:**
- FastAPI (async web framework)
- SQLAlchemy (ORM)
- python-docx (DOCX generation)
- SQLite/PostgreSQL (database)
- Uvicorn (ASGI server)

**Key Files:**
```
server/
├── app/
│   ├── main.py              # Application entry (92 lines - refactored!)
│   ├── config.py            # Configuration constants
│   ├── database.py          # Database setup
│   ├── models.py            # SQLAlchemy models (20 tables)
│   ├── schemas.py           # Pydantic request/response models
│   │
│   ├── routes/              # API endpoints (modular)
│   │   ├── health.py        # Health check
│   │   ├── components.py    # Component CRUD
│   │   ├── cover.py         # Cover page handling
│   │   └── preview.py       # Document preview generation
│   │
│   ├── docx_builder/        # Document generation
│   │   ├── html_converter.py        # HTML → DOCX conversion
│   │   ├── cover_builder.py         # Cover layout + orchestration
│   │   ├── introduction_sections.py # 1.1–1.4 Introduction subsections
│   │   ├── product_overview_builder.py # Section 2 Product Overview renderer
│   │   ├── section_builders.py      # Section helpers
│   │   ├── st_intro_builder.py      # ST Introduction
│   │   └── final_builder.py         # Final documents
│   │
│   └── utils/               # Utility functions
│       ├── validators.py    # User ID validation
│       ├── formatters.py    # Date/text formatting
│       ├── converters.py    # Unit conversions (px/pt/mm)
│       ├── image_handler.py # Image processing
│       ├── style_parser.py  # CSS/HTML parsing
│       └── dimension_parser.py # HTML dimensions
│
├── requirements.txt         # Python dependencies
├── run.py                   # Server entry point
└── cratool.db              # SQLite database (auto-created)
```

**Database:** 20 tables for security requirements
- 11 functional requirement tables (FAU, FCS, FIA, etc.)
- 8 assurance requirement tables (ACO, ADV, ATE, etc.)
- 1 general component table
- See `changelog/DATABASE.md` for full schema

### Frontend (Vue 3/TypeScript)

**Location:** `web/`

**Tech Stack:**
- Vue 3 (Composition API)
- Vite (build tool)
- TypeScript
- TipTap (rich text editor)
- Vue Router 4
- Pinia (state management)
- docx-preview (DOCX rendering)

**Key Files:**
```
web/
├── src/
│   ├── App.vue              # Root component
│   ├── main.ts              # Application entry
│   │
│   ├── components/
│   │   ├── RichTextEditor.vue    # TipTap editor (IMPORTANT!)
│   │   ├── RequirementsTable.vue
│   │   └── XmlViewer.vue
│   │
│   ├── views/
│   │   ├── Dashboard.vue
│   │   ├── document/
│   │   │   ├── CoverPage.vue        # Form + drag/drop uploader
│   │   │   ├── DocumentPreview.vue  # Cover-only preview/download
│   │   │   └── DocumentStorage.vue  # Load/Save workspace JSON
│   │   └── demo/
│   │       ├── DocxPreviewDemo.vue
│   │       ├── EditorDemo.vue
│   │       ├── TableDemo.vue
│   │       └── XmlViewerDemo.vue
│   │
│   ├── router/              # Vue Router config
│   ├── services/            # API and storage services
│   ├── utils/               # Helper functions
│   └── data/                # Sample data
│
├── package.json             # npm dependencies
└── vite.config.ts          # Vite configuration
```

---

## 🎯 Core Features

### 1. Rich Text Editor
**File:** `web/src/components/RichTextEditor.vue`

**Capabilities:**
- Full WYSIWYG editing with TipTap
- Text formatting (bold, italic, underline, strikethrough)
- Headings (H1-H4)
- Lists (bullet, numbered, task)
- Tables with dynamic rows/columns
- Images with base64 encoding
- Text colors and highlighting
- Superscript/subscript
- **Text alignment** (left, center, right, justify) - for text AND images!
- Live HTML preview

**Recent Changes:**
- Added 'image' to TextAlign types (Line 357)
- Now supports image alignment in editor

### 2. Document Management Suite

#### Cover Page (`web/src/views/document/CoverPage.vue`)
- Title card + cover form: device name/description, version, revision date, lab info
- Drag & drop (or click) uploader with live image preview/remove controls
- Auto-saves to shared document workspace; persists image data/path via session service

#### Document Information (`web/src/views/document/DocumentInformation.vue`)
- Dedicated Introduction entry form for Product Name, Version, Type, Manufacturer, address, and responsible parties
- Vertical layout with multi-line fields (Prepared/Reviewed) supporting newline-separated names
- Status dropdown (Draft/Final/Revision/Custom Status). Selecting “Custom Status” launches a modal to collect arbitrary text that is then persisted
- Shares state via `documentWorkspace` so Document Preview and cover generation can consume the same data

#### Product Identification (`web/src/views/document/ProductIdentification.vue`)
- Product Name/Version/Type inputs stay in sync with Document Information (shared `documentWorkspace.introduction` fields)
- Two TipTap-rich editors capture Product Description and Key Product Functions with autosave + placeholder guidance
- Target Market stored in a large textarea for long-form audience notes
- State persists via `documentWorkspace.productIdentification` and feeds Section Status + backend DOCX payloads

#### Manufacturer Information (`web/src/views/document/ManufacturerInformation.vue`)
- Collects legal entity, registration number, address, contact person, and phone details
- Shares the same autosave/documentWorkspace wiring via `manufacturerInformation` slice
- Simple responsive form layout styled like other introduction forms; data feeds Section Status + DOCX section 1.4

#### Product Overview (`web/src/views/product/ProductDescription.vue`)
- Dedicated accordion beneath Introduction in the sidebar
- Guidance block mirrors Clause 6.2 layout (Physical/Software/Connectivity/UI/Data Processing prompts)
- TipTap editor captures the Section 2.1 Product Description narrative; autosaves to `documentWorkspace.productOverview`
- **Product Architecture Overview** (`web/src/views/product/ProductArchitectureOverview.vue`) lives on `/product-overview/architecture` and uses the same Rich Text workflow to collect Clause 6.2.1.5 content (Key Components, Interactions, Interfaces, RDPS, Evidence Reference). This view writes to `productOverview.productArchitectureHtml` so both subsections stay in sync with Document Preview + DOCX generation. When creating new Product Overview pages, always use the shared workspace helpers (`loadDocumentWorkspace`, `updateProductOverviewState`, `subscribeDocumentWorkspace`) so autosave + subscriptions continue to work.
- **Third-Party Components** (`web/src/views/product/ThirdPartyComponents.vue`) covers Clause 7.11. Highlights:
  - Table UI with row-click editing, keyboard focus, checkbox multi-select, and trash-icon actions. Bulk delete launches a confirmation modal that blocks clicks correctly (early builds had transparent overlays; keep `.tp-modal-overlay` aligned with the shared modal styles to avoid regressions).
  - Editor modal validates Component Name, exposes Delete from the form, and drives updates through `updateProductOverviewState({ thirdPartyComponents: ... })`.
  - Two TipTap editors capture “Third-Party Component Management Approach” and “Evidence Reference” text. Defaults are blank so Section Status doesn’t mark the section “Completed” before the user enters real content.
- Feeds the Section Status card, `/cover/preview` payload, and the new product overview DOCX builder

#### Purpose & Scope (`web/src/views/document/PurposeScope.vue`)
- Renders a pre-written 1.2 Purpose & Scope narrative with live `[Product Name]` placeholders
- Interactive lifecycle phase list using checkbox-style buttons stored in workspace state
- Assessment Period date pickers (start/end) and a TipTap-powered Assessment Methodology editor for rich formatting
- Data auto-saves via `documentWorkspace` and feeds both Document Preview summaries and DOCX generation

-#### Document Preview (`web/src/views/document/DocumentPreview.vue`)
- Pulls Cover + Introduction + Purpose/Sscope + Product Identification + Product Overview + Manufacturer Information workspace data to call `/cover/preview`
- Enforces presence of Product Name (falls back to Cover Device Name)
- Section Status card entries double as RouterLink buttons (Cover, Document Information, Purpose & Scope, Product Identification, Product Overview, Manufacturer Information, Third-Party Components) with hover animations and completion badges
- Uploads base64 image to backend if needed before generating preview
- Status card + DOCX pane auto-update via workspace subscriptions; payload now includes `product_identification`, `product_overview`, and `manufacturer_information` so sections 1.3/1.4/2.1 render in DOCX preview/downloads
- **Preview UX:** The DOCX renderer now sits inside its own scrollable viewport (`.docx-preview-viewport`) so zooming or paging never scrolls the rest of the app. Prev/next buttons scroll the viewport to the selected page, and passive scroll listeners keep the active page indicator synchronized with the user’s scroll position.
- **Pagination:** Section 2 HTML is split server-side only when a subsection exceeds ~2,800 characters so long narratives auto-map to new Word pages without creating half-empty sheets. The cover footer is written into the first-page footer so lab addresses sit flush with the bottom margin.

> Backend note: `CoverPreviewRequest` accepts `introduction`, `purpose_scope`, `product_identification`, `product_overview`, and `manufacturer_information` payloads. `cover_builder.py` handles the cover page then delegates sections 1.1–1.4 to `introduction_sections.py` and section 2 to `product_overview_builder.py`.


#### Load & Save (`web/src/views/document/DocumentStorage.vue`)
- JSON export/import/clear for document workspace
- Refresh button re-reads localStorage; file picker loads saved snapshots (updates other pages)
- Mirrors demo storage UI but scoped to cover + introduction state

#### Document Convention (`web/src/views/convention/`)
**Purpose:** Define terminology, evidence notation, requirement notation, and assessment verdicts used throughout the CRA documentation (Section 4).

**Four Subsections:**

1. **Terminology** (`Terminology.vue`)
   - CRUD table for managing terms and definitions
   - Click-to-edit rows with modal form
   - Default entries: Product with digital elements, Cybersecurity, Vulnerability, Risk, RDPS, SBOM, IPRFU
   - References prEN 40000-1-1 (Vocabulary) and Regulation (EU) 2024/2847
   - Data persists in `documentWorkspace.documentConvention.terminologyEntries`

2. **Evidence Notation** (`EvidenceNotation.vue`)
   - Three rich text editors for:
     - Evidence Reference Format ([EV-XXX], [DOC-XXX], [TEST-XXX], [CODE-XXX])
     - Evidence Categories (Design Documents, Implementation, Test Evidence, Process Evidence)
     - Example References
   - Auto-saves to workspace on change

3. **Requirement Notation** (`RequirementNotation.vue`)
   - Three rich text editors for:
     - Requirement Reference Format (Clause X.Y.Z, REQ-XYZ, [Essential], [Conditional])
     - Requirement Categories (Design, Lifecycle, Risk Management, Vulnerability Management)
     - Conformance Statement Format (Requirement Statement, Applicability, Implementation, Evidence, Verdict)
   - Auto-saves to workspace on change

4. **Assessment Verdicts** (`AssessmentVerdicts.vue`)
   - Three rich text editors for:
     - Verdict Categories (PASS, FAIL, NOT APPLICABLE, CONDITIONAL PASS)
     - Assessment Criteria (Evidence Completeness, Implementation Correctness, Test Results, Documentation Quality)
     - Overall Conformance Determination
   - Auto-saves to workspace on change

**Backend Integration:**
- Schema: `DocumentConventionSection` in `server/app/schemas.py`
- Builder: `document_convention_builder.py` renders Section 4 in DOCX
- Preview: Included in `/cover/preview` endpoint payload
- DOCX: Section 4 starts on new page with terminology table and formatted subsections

#### Risk Management Elements (`web/src/views/risk/GeneralApproach.vue`)
- **Single WYSIWYG editor** captures all Section 5.1 content in one unified rich text field (`general_approach_html`)
- **"Insert Template" button** pre-fills the editor with a structured template that includes:
  - Risk Management Framework Applied heading with guidance text
  - Six-element numbered list (Product Context, Risk Acceptance, Risk Assessment, Risk Treatment, Risk Communication, Monitoring & Review)
  - Placeholders for Risk Management Process Diagram and Evidence Reference
  - Risk Management Methodology section with example text
  - Template automatically inserts `[Product Name]` from workspace or uses placeholder
- Autosaves through `updateRiskManagementState` to `documentWorkspace.riskManagement.generalApproachHtml`
- **Formatting Rule:** Section 5 in the DOCX is rendered exclusively by `risk_management_builder.py`. It always starts on a new page with the following order enforced server-side:
  1. `5. RISK MANAGEMENT ELEMENTS`
  2. `[Reference: Clause 6.1 - General]`
  3. `5.1 General Approach to Risk Management`
  4. `[Reference: Clause 5 - Risk Management Elements]`
  5. User-provided HTML content directly (no summary paragraph added by backend)
- Because the backend controls those headings/references, **do not** inject extra section numbers or duplicate references inside the editor. The template provides all necessary structure within the content area.
- Preview/export payload: `risk_management.general_approach_html` field containing the complete formatted content from the single editor.

### 3. DOCX Preview Engine (Demo)
**File:** `web/src/views/demo/DocxPreviewDemo.vue`

**Features:**
- **A4 page sizing** (794px × 1123px) with proper margins
- **Zoom controls** (50%-200% with +/- buttons)
- **Page navigation** (previous/next with page counter)
- **Text alignment** (left, center, right, justify)
- **Image alignment** (left, center, right)
- Realistic print preview with shadows
- Download generated DOCX files

**Recent Enhancements (Nov 2024):**
- A4 page dimensions with 1-inch margins
- Interactive zoom controls (6 functions added)
- Page navigation with smooth scrolling
- Full alignment support for text and images
- Professional control bar UI

**Backend DOCX Generation:**
**Files:** `server/app/docx_builder/html_converter.py`, `server/app/utils/style_parser.py`

**Capabilities:**
- HTML → DOCX conversion with styling
- Paragraphs, headings, lists, tables, images
- Text alignment parsing from HTML/CSS
- Image alignment (block-level and inline)
- Color support (hex and rgb)
- Font sizes and styles
- Margins and indentation
- Keeps list text inline with bullet/number markers by suppressing redundant paragraph breaks

**Recent Fixes:**
- Added `parse_text_alignment()` function
- Block-level image handler with alignment
- Single-image paragraph detection
- Three-level image alignment support
- Suppressed extra line breaks for `<p>` tags nested in `<li>` so DOCX bullets match the editor
- Cover builder now delegates Introduction subsections to `introduction_sections.py` and renders Product Overview via `product_overview_builder.py`

### 📊 **DOCX Table Export Handling** (CRITICAL!)

**All tables exported to DOCX MUST use the standardized "Table Grid" style to prevent formatting issues.**

#### **Standard Table Pattern:**

```python
def _render_table(document: Document, entries: List[dict]):
    """Standard table rendering pattern for DOCX export."""
    # Define column headers
    headers = ["Column 1", "Column 2", "Column 3"]
    
    # Create table with header row
    table = document.add_table(rows=1, cols=len(headers))
    table.style = "Table Grid"  # ← CRITICAL: Always use "Table Grid"
    
    # Populate header row
    header_cells = table.rows[0].cells
    for idx, label in enumerate(headers):
        paragraph = header_cells[idx].paragraphs[0]
        run = paragraph.add_run(label)
        run.font.bold = True
    
    # Add data rows
    for entry in entries:
        row_cells = table.add_row().cells
        row_cells[0].text = entry.get("field1") or ""
        row_cells[1].text = entry.get("field2") or ""
        row_cells[2].text = entry.get("field3") or ""
```

#### **Why "Table Grid" Style?**

✅ **DO use `"Table Grid"`:**
- Automatic column width adjustment
- Fits content within page margins
- Professional appearance
- Consistent with Word defaults
- Works across all document sections

❌ **DON'T use:**
- `"Light Grid Accent 1"` - Can cause width issues
- Fixed widths (`table.autofit = False`) - Tables span across pages
- Manual width settings (`cell.width = Inches(x)`) - Breaks on different page sizes

#### **Implementation Examples:**

**✅ Correct Implementation (Third-Party Components):**
```python
# server/app/docx_builder/product_overview_builder.py
def _render_components_table(document: Document, entries: List[dict]):
    headers = ["Component Name", "Type", "Version", "Supplier", "Purpose", "License"]
    table = document.add_table(rows=1, cols=len(headers))
    table.style = "Table Grid"  # ← Correct!
    
    header_cells = table.rows[0].cells
    for idx, label in enumerate(headers):
        paragraph = header_cells[idx].paragraphs[0]
        run = paragraph.add_run(label)
        run.font.bold = True
    
    for entry in entries:
        row_cells = table.add_row().cells
        row_cells[0].text = entry.get("component_name") or ""
        row_cells[1].text = entry.get("component_type") or ""
        # ... etc
```

**✅ Correct Implementation (Terminology):**
```python
# server/app/docx_builder/document_convention_builder.py
def _render_terminology_section(document: Document, entries: Optional[Sequence[dict]]):
    table = document.add_table(rows=1, cols=3)
    table.style = "Table Grid"  # ← Correct!
    
    header_cells = table.rows[0].cells
    for label, cell in zip(["Term", "Definition", "Reference"], header_cells):
        paragraph = cell.paragraphs[0]
        run = paragraph.add_run(label)
        run.font.bold = True
    
    for entry in normalized_entries:
        row_cells = table.add_row().cells
        row_cells[0].text = entry["term"]
        row_cells[1].text = entry["definition"]
        row_cells[2].text = entry["reference"]
```

#### **Files Using Correct Pattern:**

✅ `product_overview_builder.py` - Third-Party Components table (6 columns)
✅ `document_convention_builder.py` - Terminology table (3 columns)

#### **Common Mistakes to Avoid:**

❌ **Mistake 1: Fixed Widths**
```python
# DON'T DO THIS
table.autofit = False
table.allow_autofit = False
widths = [Inches(2.0), Inches(3.7), Inches(1.3)]
for index, width in enumerate(widths):
    for cell in table.columns[index].cells:
        cell.width = width
```

❌ **Mistake 2: Wrong Style**
```python
# DON'T DO THIS
table.style = "Light Grid Accent 1"  # Can cause width issues
```

❌ **Mistake 3: Manual Formatting**
```python
# DON'T DO THIS - Overly complex
for cell in row:
    for paragraph in cell.paragraphs:
        for run in paragraph.runs:
            run.font.size = Pt(10)
        paragraph.paragraph_format.space_after = Pt(0)
```

#### **When Creating New Tables:**

1. Always use `table.style = "Table Grid"`
2. Let Word handle column widths automatically
3. Use simple bold headers: `run.font.bold = True`
4. Use `row_cells[i].text = value` for data
5. Test export with various content lengths
6. Verify table fits within page margins

### 🎯 **Standardized DOCX Section Formatting** (CRITICAL!)

**All section builders MUST follow this consistent pattern for professional document generation.**

#### **Standard Section Structure:**

```python
def append_section_to_document(document: Document, payload: Optional[object]) -> None:
    """Append Section X to the document."""
    if not payload:
        return
    
    # Extract content
    content_html = _extract_value(payload, "content_field_name")
    if not content_html:
        return
    
    # 1. Add page break before section (for major sections)
    document.add_page_break()
    
    # 2. Main section heading (Level 1)
    heading = document.add_paragraph()
    heading_run = heading.add_run("X. SECTION TITLE")
    heading_run.font.size = Pt(20)
    heading_run.font.bold = True
    heading.space_after = Pt(8)
    
    # 3. Reference right after main heading
    reference = document.add_paragraph("[Reference: Clause X.Y - Description]")
    reference.runs[0].font.bold = True
    reference.space_after = Pt(10)
    
    # 4. Subsection heading (Level 2)
    subheading = document.add_paragraph()
    subheading_run = subheading.add_run("X.Y Subsection Title")
    subheading_run.font.size = Pt(18)
    subheading_run.font.bold = True
    subheading.space_before = Pt(6)
    subheading.space_after = Pt(6)
    
    # 5. Reference for subsection
    sub_reference = document.add_paragraph("[Reference: Clause X.Y.Z - Details]")
    sub_reference.runs[0].font.bold = True
    sub_reference.space_after = Pt(10)
    
    # 6. Introductory paragraph (optional)
    intro = document.add_paragraph("Introductory text explaining the section...")
    intro.paragraph_format.space_after = Pt(12)
    
    # 7. Append user-provided HTML content
    append_html_to_document(document, content_html)
```

#### **Key Formatting Rules:**

1. **Page Breaks:** Major sections (2, 4, 5, etc.) start on a new page using `document.add_page_break()`
2. **Heading Hierarchy:**
   - Main section (X.): 20pt, bold
   - Subsection (X.Y): 18pt, bold
3. **References:**
   - Always appear immediately after their corresponding heading
   - Use bold font, not Quote style
   - Main section reference comes BEFORE subsection heading
4. **Spacing:**
   - Main heading: `space_after = Pt(8)`
   - Reference: `space_after = Pt(10)`
   - Subsection: `space_before = Pt(6)`, `space_after = Pt(6)`
   - Intro paragraph: `space_after = Pt(12)`

#### **Correct Order Example (Section 5):**

```
5. RISK MANAGEMENT ELEMENTS                    ← Main heading (20pt, bold)
[Reference: Clause 6.1 - General]             ← Main reference (bold)
5.1 General Approach to Risk Management        ← Subsection heading (18pt, bold)
[Reference: Clause 5 - Risk Management Elements] ← Subsection reference (bold)
[User-provided HTML content]                   ← Rich text from editor (template includes all structure)
```

#### **Implementation Files:**

✅ **Correct Implementations:**
- `product_overview_builder.py` - Section 2
- `document_convention_builder.py` - Section 4
- `risk_management_builder.py` - Section 5 (updated February 2025)

**When creating new section builders:**
1. Copy the pattern from `risk_management_builder.py`
2. Use `document.add_paragraph()` with manual font sizing, NOT `document.add_heading()`
3. Never use Quote style for references (use bold font instead)
4. Always place main section reference BEFORE subsection heading
5. Keep user HTML separate - let backend control all structural elements

### 3. Requirements Table Demo
**File:** `web/src/views/demo/RequirementsTableDemo.vue`  
**Route:** `/demo/table`

**Purpose:** CRUD-style table demo showcasing technical requirements management interface. This serves as a reference implementation for table patterns used throughout the application.

**Features:**
- **Add requirements** via modal dialog with validation
- **Delete requirements** with trash icon button (🗑️)
- **Professional table styling** with proper borders and alignment
- **Interactive hover effects** on table rows
- **Persistent storage** via demoStorage service
- **Empty state handling** with helpful messaging

## 🎨 **Unified Table Design System** (Updated February 2025)

All tables across the application now follow a **consistent, clean design pattern**. When creating or updating tables, follow these guidelines:

### **HTML Structure:**

```vue
<section class="card content-card">
  <article class="template-body">
    <p class="section-heading">Section Title</p>
    <p class="reference-line">[Reference: Clause X.Y]</p>
    <p>Description text</p>
  </article>

  <div class="table-section">
    <div class="table-wrapper">
      <table class="your-table-name">
        <thead>
          <tr>
            <th>Column 1</th>
            <th>Column 2</th>
            <th class="action-column">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="entries.length === 0">
            <td class="empty-state" colspan="3">No entries yet.</td>
          </tr>
          <tr 
            v-for="entry in entries" 
            :key="entry.id"
            class="clickable-row"
            @click="openEditModal(entry)"
          >
            <td>{{ entry.field1 }}</td>
            <td>{{ entry.field2 }}</td>
            <td class="action-column" @click.stop>
              <button class="link danger" @click="removeEntry(entry.id)">
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <button class="btn primary" @click="openAddModal">Add Entry</button>
  </div>
</section>
```

### **CSS Styling Pattern:**

```css
/* Card and layout */
.content-card {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;  /* Important: proper spacing from edges */
}

.template-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  line-height: 1.6;
}

.section-heading {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text);  /* Plain text, not colored */
  margin: 0;
}

.reference-line {
  font-weight: 600;
  margin: 0;
}

/* Table container */
.table-section {
  border-top: 1px solid var(--panel-border);
  padding-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.table-wrapper {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid var(--panel-border);
}

/* Table styling */
.your-table-name {
  width: 100%;
  min-width: 700px;  /* Adjust based on content */
  border-collapse: separate;
  border-spacing: 0;
}

.your-table-name thead {
  background: var(--surface-alt);
}

.your-table-name th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 700;
  color: var(--text);
  white-space: nowrap;
}

.your-table-name td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--panel-border);
}

/* Hover effects - only on data rows */
.your-table-name tbody tr.clickable-row {
  cursor: pointer;
  transition: all 0.2s ease;
}

.your-table-name tbody tr.clickable-row:hover {
  background: var(--surface-alt);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.your-table-name tbody tr:last-child td {
  border-bottom: none;
}

/* Action column */
.action-column {
  width: 100px;
  text-align: center !important;
}

.your-table-name .link.danger {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  font-size: 1.2rem;
  transition: transform 0.2s, background-color 0.2s;
  border-radius: 6px;
}

.your-table-name .link.danger:hover {
  transform: scale(1.1);
  background-color: rgba(255, 59, 48, 0.1);
}

/* Empty state */
.empty-state {
  text-align: center !important;
  color: var(--text-muted);
  font-style: italic;
  padding: 32px 16px !important;
}
```

### **Special Features:**

**For tables with checkboxes (e.g., Third-Party Components):**

```vue
<th class="checkbox-column"></th>
<td class="checkbox-column" @click.stop>
  <input type="checkbox" :checked="isSelected(entry.id)" @change="toggleRowSelection(entry.id)" />
</td>
```

```css
.checkbox-column {
  width: 52px;
  min-width: 52px;
  max-width: 52px;
  text-align: center !important;
}

.your-table-name input[type='checkbox'] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}
```

### **Key Design Principles:**

✅ **Consistent padding:** All cards use `padding: 24px` - content should never touch edges
✅ **Plain headings:** Section headings use `color: var(--text)`, not blue or other colors
✅ **Clean borders:** Border only around the table wrapper, bottom borders between rows
✅ **Smooth hover:** Subtle shadow + 1px lift on hover for clickable rows
✅ **Centered actions:** Action columns (delete/edit icons) are centered
✅ **Empty states:** Friendly messages when tables are empty
✅ **Responsive:** Tables scroll horizontally on smaller screens

### **Pages Using This Pattern:**

✅ Document Convention - Terminology
✅ Document Convention - Evidence/Requirement/Assessment pages
✅ Standards Conformance
✅ Regulatory Conformance
✅ Third-Party Components (with checkboxes)
✅ Requirements Table Demo

**Use this pattern for all new table implementations!**

### 4. XML Tree Viewer
**Purpose:** Visualize hierarchical security data

**Features:**
- Expandable/collapsible tree
- Color-coded components
- Sample datasets (cryptographic, authentication)
- No XML upload needed

### 5. Workspace Persistence (Document Management)
**Purpose:** Synchronize Cover + Introduction + Product Identification + Product Overview state across Document Management pages + allow JSON backup/restore.

**File:** `web/src/services/documentWorkspace.ts`

**Features:**
- Shared store for cover form fields + image blob/path **and** Introduction/Purpose/Product Identification/Product Overview data (product info, lifecycle scope, methodology, description/functions/market, section 2 narrative)
- `load/update/export/import/clear` helpers with localStorage persistence
- Subscription API so Cover, Preview, Introduction, Purpose & Scope, and Storage views stay in sync (listeners auto-update UIs)
- Keeps `sessionService` cover cache in sync for legacy backend flows

---

## 📚 Important Documentation

**Must-Read for New Agents:**
1. `README.md` - Project overview and quick start
2. `changelog/REFACTORING_GUIDE.md` - Code structure (CRITICAL!)
3. `changelog/DATABASE.md` - Database schema
4. `changelog/GLOSSARY.md` - Legacy terminology (CC → CRA)

**Recent Work Documentation:**
1. `changelog/DOCX_PREVIEW_IMPROVEMENTS.md` - A4 page sizing
2. `changelog/DOCX_ALIGNMENT_AND_CONTROLS.md` - Alignment + controls
3. `changelog/IMAGE_ALIGNMENT_FIX.md` - Image alignment fix
4. `changelog/CLEANUP_SUMMARY.md` - Legacy cleanup
5. `changelog/TEST_REPORT.md` - Testing results

---

## 🔑 Key Concepts

### Legacy Terminology (Common Criteria)

This project was originally "CCGenTool" (Common Criteria Generation Tool) and has been rebranded for CRA compliance. You'll see legacy terms in code:

| Legacy (CC) | Modern (CRA) | Meaning |
|-------------|--------------|---------|
| ST | CRA Documentation | Security Target → CRA Documentation |
| TOE | Product | Target of Evaluation → Product |
| SFR | Technical Requirements | Security Functional Requirements |
| SAR | Assurance Requirements | Security Assurance Requirements |
| TSS | Product Summary Spec | TOE Summary Specification |
| TSF | Product Security Functions | TOE Security Functions |

**See:** `changelog/GLOSSARY.md` for complete reference

**Why keep legacy terms?**
- Backward compatibility
- API contracts
- Database schema (20 tables with legacy names)
- Variable names throughout codebase

**Approach:**
- Keep internal names unchanged
- Add comments explaining legacy terms
- Update user-facing text to CRA terminology

### Refactored Architecture

**IMPORTANT:** The `main.py` was recently refactored from **1,508 lines** to **92 lines**!

**Old Structure:** Everything in one massive file  
**New Structure:** Modular organization

**See:** `changelog/REFACTORING_GUIDE.md` for:
- Module breakdown
- Migration details
- Where to add new code
- Developer guidelines

**Adding New Features:**
- Routes → `server/app/routes/`
- Document builders → `server/app/docx_builder/`
- Utilities → `server/app/utils/`
- Schemas → `server/app/schemas.py`

---

## 🛠️ Development Workflow

### Starting Work

```bash
# 1. Check current status
./dev_stop.sh

# 2. Start servers
./dev_start.sh

# 3. Wait for startup (5 seconds)
sleep 5

# 4. Check health
curl http://127.0.0.1:8000/health

# 5. Open frontend
open http://127.0.0.1:5173
```

### Backend Development

**Making Changes:**
1. Edit files in `server/app/`
2. Uvicorn auto-reloads on save
3. Check logs: `tail -f .devserver/backend.log`

**Adding API Endpoint:**
```python
# 1. Create new file in server/app/routes/
# server/app/routes/my_feature.py

from fastapi import APIRouter

router = APIRouter()

@router.get("/my-endpoint")
def my_function():
    return {"status": "ok"}

# 2. Import in main.py
from .routes.my_feature import router as my_feature_router
app.include_router(my_feature_router, tags=["MyFeature"])
```

**Adding Document Builder:**
```python
# server/app/docx_builder/my_builder.py

from .section_builders import create_base_document
from .html_converter import append_html_to_document

def build_my_document(content: str, output_dir: Path) -> Path:
    document = create_base_document()
    append_html_to_document(document, content)
    # Save and return path
    return output_path
```

### Frontend Development

**Making Changes:**
1. Edit files in `web/src/`
2. Vite hot-reloads instantly
3. Check console for errors

**Adding New Component:**
```vue
<!-- web/src/components/MyComponent.vue -->
<script setup lang="ts">
import { ref } from 'vue'

const myState = ref('')
</script>

<template>
  <div class="my-component">
    <!-- UI here -->
  </div>
</template>

<style scoped>
.my-component {
  /* Styles here */
}
</style>
```

**TipTap Extensions:**
Located in `web/src/components/RichTextEditor.vue` around line 340-370

**Current Extensions:**
- Document, Paragraph, Text (base)
- Bold, Italic, Underline, Strike
- Heading, BulletList, OrderedList, TaskList
- TextAlign (with image support!)
- TextColor, Highlight
- Image, ImageResize
- Table, TableRow, TableHeader, TableCell
- And more...

**To modify editor:**
```typescript
// Line 357 - TextAlign configuration
TextAlign.configure({ 
  types: ['heading', 'paragraph', 'image']  // Important: includes 'image'!
}),
```

### **Modal Pattern**

All modals across the application follow the **ModalDemo pattern** for consistency:

**Reference:** `web/src/views/demo/ModalDemo.vue`

**Structure:**
```vue
<div v-if="showModal" class="demo-modal-overlay" @click="closeModal">
  <div class="demo-modal" role="dialog" aria-modal="true" @click.stop>
    <header class="demo-modal-header">
      <h2 id="modalTitle">Modal Title</h2>
      <button class="modal-close" @click="closeModal" aria-label="Close">×</button>
    </header>
    <form class="demo-modal-body" @submit.prevent="saveEntry">
      <!-- Form fields here -->
    </form>
    <footer class="demo-modal-footer">
      <div class="modal-footer-left">
        <button v-if="editMode" class="btn danger" @click="deleteEntry">Delete</button>
      </div>
      <div class="modal-footer-right">
        <button class="btn ghost" @click="closeModal">Cancel</button>
        <button class="btn primary" type="button" @click="saveEntry">Save</button>
      </div>
    </footer>
  </div>
</div>
```

**CSS:**
```css
.demo-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(2px);
  z-index: 50;
}

.demo-modal {
  width: min(600px, 100%);
  background: var(--panel);
  border-radius: 16px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.25);
}
```

**Used in:**
- Terminology (add/edit terms)
- Third-Party Components (add/edit components)
- Standards/Regulatory Conformance (add/edit entries)
- Requirements Table Demo (add/edit requirements)

---

## 🐛 Common Issues & Solutions

### Issue: Port Already in Use

```bash
# Solution 1: Use stop script
./dev_stop.sh

# Solution 2: Kill manually
lsof -i :8000  # Find backend PID
lsof -i :5173  # Find frontend PID
kill -9 <PID>
```

### Issue: Database Locked (SQLite)

```bash
# Find zombie processes
ps aux | grep python | grep -v grep
kill -9 <PID>

# Restart cleanly
./dev_stop.sh
./dev_start.sh
```

### Issue: Frontend Build Errors

```bash
cd web
rm -rf node_modules package-lock.json
npm install
```

### Issue: Image Alignment Not Working

**Check these:**
1. TipTap config includes 'image' in TextAlign types (Line 357)
2. Backend has `parse_text_alignment()` in style_parser.py
3. Backend applies alignment in html_converter.py (3 places)
4. Image has style="text-align: X" in HTML

### Issue: DOCX Preview Not Showing

**Check:**
1. Backend server running on port 8000
2. API endpoint returns path field in response
3. Frontend can fetch from the path
4. docx-preview library loaded

---

## 🧪 Testing

### Manual Testing

**DOCX Preview:**
1. Go to `/demo/docx-preview`
2. Add content with text and images
3. Apply different alignments
4. Click "Generate Preview"
5. Verify alignments in preview
6. Test zoom controls (+/-)
7. Test page navigation (‹/›)
8. Download and open in Word

**API Testing:**
```bash
# Health check
curl http://127.0.0.1:8000/health

# Generate preview
curl -X POST http://127.0.0.1:8000/security/sfr/preview \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test", "html_content": "<p>Test</p>"}'

# List components
curl http://127.0.0.1:8000/components
```

### Verification Checklist

**After Making Changes:**
- [ ] Backend compiles without errors
- [ ] Frontend builds without errors
- [ ] Health endpoint responds
- [ ] Can generate DOCX preview
- [ ] Download works
- [ ] No console errors

---

## 📊 Project Statistics

**Backend:**
- Total files: 23 (after refactoring)
- Main application: 92 lines (was 1,508!)
- Routes: 4 modules, ~500 lines
- Document builders: 5 modules, ~800 lines
- Utils: 6 modules, ~450 lines

**Frontend:**
- Components: 10+ reusable components
- Views: 6 demo pages
- Lines of code: ~5,000 (estimated)

**Database:**
- Tables: 20
- Models: SQLAlchemy ORM
- Storage: SQLite (default), PostgreSQL (supported)

---

## 🎓 Best Practices

### Code Style

**Python (Backend):**
- Use type hints
- Add docstrings to functions
- Follow PEP 8
- Use async/await for I/O operations
- Keep functions under 50 lines

**TypeScript (Frontend):**
- Use Composition API (not Options API)
- Define types for props and state
- Use `ref` and `reactive` appropriately
- Component files: PascalCase
- Utility files: camelCase

### Documentation

**When Adding Features:**
1. Update this AGENTS.md file
2. Add inline comments for complex logic
3. Update README.md if user-facing
4. Create changelog entry if significant

**When Fixing Bugs:**
1. Document the issue
2. Explain the fix
3. Add test case
4. Update relevant docs

### Git Workflow

**Branches:**
- `main` - Production-ready code
- Feature branches for new work

**Commit Messages:**
- Use clear, descriptive messages
- Reference issues if applicable
- Example: "feat: add image alignment support"

---

## 🚀 Deployment

**Current Setup:** Development only

**For Production:**
1. Build frontend: `cd web && npm run build`
2. Serve static files from `web/dist/`
3. Run backend with Gunicorn/Uvicorn
4. Use PostgreSQL instead of SQLite
5. Set environment variables
6. Configure reverse proxy (Nginx)
7. Add SSL/TLS certificates

---

## 📞 Getting Help

**Resources:**
1. Check `README.md` first
2. Review `changelog/` documentation
3. Check API docs at `/docs`
4. Look at existing code examples
5. Grep for similar implementations

**Common Grep Patterns:**
```bash
# Find where something is used
grep -r "function_name" server/

# Find route definitions
grep -n "@router" server/app/routes/*.py

# Find component usage
grep -r "ComponentName" web/src/
```

---

## ⚠️ Critical Notes

### DO NOT CHANGE:

1. **API endpoint paths** - External dependencies may exist
2. **Database table names** - Would require migration
3. **Environment variable names** - Production configs use them
4. **Request/response schemas** - Frontend depends on them

### BE CAREFUL WITH:

1. **TipTap extensions** - Can break editor functionality
2. **docx-preview options** - Affects rendering
3. **Alignment logic** - Three-level system (block, inline, paragraph)
4. **Zoom/navigation** - State management is complex

### ALWAYS TEST:

1. Generate DOCX preview after changes
2. Try different alignments (text and images)
3. Test zoom and page navigation
4. Verify download works
5. Check in actual Microsoft Word

---

## 🎯 Recent Major Changes (Late 2024 – Early 2025)

1. **Document Management rollout** – Added Cover, Document Preview, and Load & Save routes + sidebar section.
2. **Cover page UX** – New drag/drop image uploader, expanded metadata form, and professional DOCX formatting (single-line conformity heading, inline “Revision  : date”, bottom-aligned “Document Prepared By” block).
3. **Shared workspace service** – `documentWorkspace.ts` now powers cover state with subscriptions, JSON import/export, and legacy session sync.
4. **Document Information + Purpose & Scope** – New Introduction forms capture lifecycle coverage, assessment periods, and methodology with a TipTap editor. Data syncs to Document Preview summaries and DOCX generation.
5. **Document Preview page** – Section Status card + DOCX preview layout replacing the older snapshot cards.
6. **Cover builder refactor** – `CoverDocumentRenderer` centralizes cover/introduction rendering logic for easier maintenance.
7. **Load & Save page** – JSON export/import/clear UI for the Document Management workspace, mirroring the demo storage flow.
8. **Dev tooling** – `dev_start.sh` tracks dependency hashes, `dev_stop.sh` terminates entire process trees, and `dev_fresh.sh` wipes .venv/node_modules to start clean.
9. **Product Identification rollout** – Dedicated page with synchronized metadata, dual rich-text editors, and target-market capture feeding DOCX section 1.3.
10. **Preview + DOCX polish** – Section Status links navigate to editor pages, and DOCX bullet rendering now keeps text inline after HTML converter fixes.
11. **Manufacturer Information rollout** – New form + workspace state populates section 1.4 and displays in the preview & completion tracker.
12. **Product Overview rollout** – Sidebar accordion + TipTap editor for Section 2.1 Product Description with dedicated DOCX builder.
13. **Preview refactor (Real Document Approach)** – Removed smart pagination logic from conformance_claim_builder and product_overview_builder. Preview now uses the actual generated DOCX file instead of attempting to predict pagination, ensuring 100% accuracy between preview and export. Word handles natural pagination while we maintain clean section breaks.
14. **Document Convention section** (February 2025) – Added Section 4 with four subsections:
    - Terminology (CRUD table with click-to-edit rows)
    - Evidence Notation (rich text editors for format, categories, examples)
    - Requirement Notation (rich text editors for format, categories, conformance)
    - Assessment Verdicts (rich text editors for verdicts, criteria, determination)
    - Full workspace persistence and DOCX generation with page break
15. **Unified Table Design System** (February 2025) – Complete standardization of all tables across the application:
    - Removed nested cards and toolbars for cleaner structure
    - Consistent `.table-wrapper` with rounded borders
    - Smooth hover effects (shadow + 1px lift) on clickable rows
    - Centered action columns with trash icon hover effects
    - Proper card padding (24px) so content doesn't touch edges
    - Plain section headings (no colored text)
    - Applied to: Standards Conformance, Regulatory Conformance, Third-Party Components, Terminology, and all demo tables
16. **Standardized DOCX Section Formatting** (February 2025) – Established uniform formatting pattern for all section builders:
    - Fixed Section 5 (Risk Management) to follow standard heading/reference order
    - Main section reference now appears BEFORE subsection heading (not after)
    - All sections use manual paragraph formatting (20pt/18pt) instead of built-in heading styles
    - References use bold font instead of Quote style for consistency
    - Page breaks added to major sections (2, 4, 5, etc.)
    - Documentation added to AGENTS.md with code template and formatting rules
17. **Risk Management Simplification** (February 2025) – Streamlined Section 5 from five editors to one:
    - Replaced five separate WYSIWYG editors with single unified editor for all Section 5.1 content
    - Added "Insert Template" button that pre-fills structured content with product name placeholder
    - Template includes Risk Management Framework, 6-element list, process diagram placeholder, evidence reference, and methodology section
    - Updated `RiskManagementState` interface to use single `generalApproachHtml` field
    - Removed backend summary paragraph - template provides all content structure
    - Simplified data flow: single field in workspace, schema, and builder
18. **DOCX Table Export Standardization** (February 2025) – Fixed table formatting issues in exported documents:
    - Changed Document Convention terminology table from "Light Grid Accent 1" to "Table Grid" style
    - Removed fixed column widths that caused tables to span across pages
    - Simplified table rendering to match Third-Party Components pattern
    - Added comprehensive documentation for DOCX table export handling
    - All tables now use consistent "Table Grid" style with automatic width adjustment

---

## 📝 TODO / Future Enhancements

**Ideas for Future Work:**
- [ ] Keyboard shortcuts for zoom/navigation
- [ ] Fit-to-width zoom preset
- [ ] Page thumbnail previews
- [ ] Export specific pages
- [ ] Landscape orientation support
- [ ] Different paper sizes (Letter, Legal)
- [ ] Unit tests for document builders
- [ ] Integration tests for API
- [ ] Authentication/authorization
- [ ] Rate limiting

---

## 🎓 Learning Resources

**Technologies Used:**
- FastAPI: https://fastapi.tiangolo.com/
- Vue 3: https://vuejs.org/
- TipTap: https://tiptap.dev/
- python-docx: https://python-docx.readthedocs.io/
- SQLAlchemy: https://www.sqlalchemy.org/

**Related Standards:**
- Common Criteria: https://www.commoncriteriaportal.org/
- CRA (EU): https://digital-strategy.ec.europa.eu/en/policies/cyber-resilience-act

---

**This knowledge base is maintained for AI agents working on the CRA Tool project. Keep it updated as the project evolves!**

**Last major update:** January 2025 - Added Conformance Claim smart pagination to eliminate DOCX export gaps.
