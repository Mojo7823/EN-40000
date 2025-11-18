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

### 3. Requirements Table Demo
**File:** `web/src/views/demo/RequirementsTableDemo.vue`  
**Route:** `/demo/table`

**Purpose:** CRUD-style table demo showcasing technical requirements management interface. This serves as a reference implementation for table patterns used throughout the application.

**Features:**
- **Add requirements** via modal dialog with validation
- **Delete requirements** with trash icon button (🗑️)
- **Professional table styling** with proper borders and alignment
- **Interactive hover effects** on delete buttons
- **Persistent storage** via demoStorage service
- **Empty state handling** with helpful messaging

**Recent Improvements (January 2025):**
- ✅ Replaced "Remove" text with trash icon (🗑️) for better UX
- ✅ Fixed table border alignment - borders now span fully to edges
- ✅ Changed `border-collapse` from `collapse` to `separate` for better border control
- ✅ Added hover effects on trash icon (background highlight + scale animation)
- ✅ Proper cell border management (between cells only, not on outer edges)
- ✅ **Pattern Applied To:** Third-Party Components (`/product-overview/third-party-components`) and Standards Conformance (`/conformance/standards`)

> ⚠️ **Important:** The legacy table-formatting procedure described below is outdated. Follow the live responsive implementations in `web/src/views/product/ThirdPartyComponents.css` and `web/src/views/conformance/ConformancePages.css` (min-width tables inside scrollable shells + centered action columns) until this documentation is fully rewritten.

**Table Styling Pattern:**
```css
table {
  border-collapse: separate;  /* Important for border control */
  border-spacing: 0;
  border: 1px solid var(--panel-border);
  border-radius: 12px;
}

/* Borders between cells only */
th:not(:last-child),
td:not(:last-child) {
  border-right: 1px solid var(--panel-border);
}

tbody tr:not(:last-child) td {
  border-bottom: 1px solid var(--panel-border);
}
```

**Delete Button Pattern:**
```vue
<button 
  class="link danger" 
  type="button" 
  @click="removeEntry(entry.id)" 
  aria-label="Remove entry" 
  title="Remove"
>
  🗑️
</button>
```

**Use this demo as reference for:**
- Table layouts in new features
- Icon-based action buttons
- Modal forms with validation
- CRUD operations with local storage

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

**Last major update:** November 17, 2024 - Added alignment features, refactoring notes, and comprehensive project documentation.
