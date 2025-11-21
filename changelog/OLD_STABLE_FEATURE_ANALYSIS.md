# Old Stable Repository - Feature Analysis

## Overview
The `oldstable` folder contains a comprehensive CRA (Cyber Resilience Act) Tool built with:
- **Frontend:** Nuxt 3 + Vue 3 + TypeScript
- **Backend:** FastAPI + Python + SQLAlchemy
- **Database:** SQLite (for component/requirement storage)
- **Document Generation:** python-docx (DOCX generation)

---

## 🎯 Core Features & Modules

### 1. **Rich Text Editor (TipTap-based)**
- **Location:** `oldstable/web/components/RichTextEditor.vue`
- **Features:**
  - Text formatting (Bold, Italic, Underline, Strike, Code)
  - Headings (H1-H6)
  - Text alignment (Left, Center, Right, Justify)
  - Lists (Bullet, Ordered, Task lists)
  - Text colors and highlighting
  - Tables with resize/merge capabilities
  - Image embedding with alignment
  - Links and code blocks
  - Undo/Redo
  - Export to HTML
- **Dependencies:** @tiptap/vue-3, @tiptap/starter-kit, @tiptap/extension-*

### 2. **Document Workspace Management**
- **Location:** `oldstable/web/services/documentWorkspace.ts`
- **Features:**
  - Centralized state management for document sections
  - Browser localStorage persistence
  - Import/Export workspace as JSON
  - Real-time state synchronization
  - Section-based updates:
    - Cover page
    - Introduction
    - Purpose & Scope
    - Product Identification
    - Product Overview
    - Manufacturer Information
    - Conformance Claims
    - Document Convention
    - Risk Management
- **Key Functions:**
  - `loadDocumentWorkspace()` - Load workspace from localStorage
  - `exportDocumentWorkspace()` - Export as JSON
  - `importDocumentWorkspace()` - Import from JSON
  - `updateXXXState()` - Update specific sections
  - `subscribeDocumentWorkspace()` - Listen to changes

### 3. **DOCX Document Generation**
- **Location:** `oldstable/server/app/docx_builder/`
- **Modules:**
  - `cover_builder.py` - Cover page generation
  - `introduction_sections.py` - Introduction sections
  - `product_overview_builder.py` - Product overview
  - `conformance_claim_builder.py` - Conformance claims
  - `document_convention_builder.py` - Document conventions
  - `risk_management_builder.py` - Risk management
  - `html_converter.py` - HTML to DOCX conversion
  - `final_builder.py` - Final document assembly
- **Features:**
  - HTML to DOCX conversion with formatting
  - Table generation with styles
  - Image handling and alignment
  - Custom paragraph styles
  - Heading hierarchy
  - List formatting (bullet/numbered)

### 4. **Component Database System**
- **Location:** `oldstable/server/app/models.py`
- **Structure:** Based on Common Criteria (CC) standard
- **Tables:**
  - **Functional Requirements (F-class):**
    - FAU - Security audit
    - FCO - Communication
    - FCS - Cryptographic support
    - FDP - User data protection
    - FIA - Identification and authentication
    - FMT - Security management
    - FPR - Privacy
    - FPT - Protection of TSF
    - FRU - Resource utilization
    - FTA - Product access
    - FTP - Trusted path/channels
  - **Assurance Requirements (A-class):**
    - ACO - Composition
    - ADV - Development
    - AGD - Guidance documents
    - ALC - Life-cycle support
    - APE - Protection Profile evaluation
    - ASE - CRA Documentation evaluation
    - ATE - Tests
    - AVA - Vulnerability assessment
  - **Special Tables:**
    - `components` - General component storage
    - `element_list_db` - Colored XML elements

### 5. **XML Tree Viewer**
- **Location:** `oldstable/web/components/XMLTreeNode.vue`
- **Features:**
  - Hierarchical tree rendering
  - Expand/collapse nodes
  - Color-coded elements
  - Interactive navigation
  - Sample data integration

### 6. **Requirements Table (CRUD)**
- **Location:** `oldstable/web/pages/demo/table.vue`
- **Features:**
  - Add/Edit/Delete requirements
  - Inline editing
  - Search/filter capabilities
  - Responsive design
  - Data persistence

### 7. **Modal Framework**
- **Location:** `oldstable/web/pages/demo/modal.vue`
- **Features:**
  - Reusable overlay component
  - Multi-step experiences
  - Confirmation dialogs
  - Custom content slots
  - Keyboard navigation (ESC to close)

### 8. **Risk Evidence Tracker**
- **Location:** `oldstable/web/components/RiskEvidenceTracker.vue`
- **Features:**
  - Track risk evidence entries
  - Add/remove evidence
  - Evidence categorization
  - Integration with document workspace

---

## 📄 Page Structure (Old Stable)

### Document Pages (`oldstable/web/pages/document/`)
1. **cover.vue** - Document cover page
2. **introduction.vue** - Introduction section
3. **purpose-scope.vue** - Purpose and scope
4. **product-identification.vue** - Product identification
5. **manufacturer-information.vue** - Manufacturer details
6. **evidence.vue** - Evidence tracking
7. **preview.vue** - Document preview
8. **load-save.vue** - Load/save workspace

### Conformance Pages (`oldstable/web/pages/conformance/`)
1. **standards.vue** - Standards compliance
2. **regulatory.vue** - Regulatory requirements
3. **level.vue** - Conformance levels

### Convention Pages (`oldstable/web/pages/convention/`)
1. **terminology.vue** - Terminology definitions
2. **notation.vue** - Notation conventions

### Product Overview Pages (`oldstable/web/pages/product-overview/`)
1. **description.vue** - Product description
2. **architecture.vue** - Product architecture
3. **third-party-components.vue** - Third-party components

### Product Context Pages (`oldstable/web/pages/pcontext/`)
1. **intended-purpose.vue** - Intended purpose

### Risk Management Pages (`oldstable/web/pages/risk/`)
1. **general-approach.vue** - Risk management approach

### Demo Pages (`oldstable/web/pages/demo/`)
1. **modal.vue** - Modal demo
2. **table.vue** - Requirements table demo
3. **editor.vue** - Rich text editor demo
4. **xml-viewer.vue** - XML tree viewer demo
5. **docx-preview.vue** - DOCX preview demo
6. **storage.vue** - Storage/persistence demo
7. **tree.vue** - Tree component demo

---

## 🔌 API Endpoints (Backend)

### Health & Info
- `GET /` - API information
- `GET /health` - Health check

### Components (Requirements Database)
- `GET /components/family/{family}` - Get components by family
- `POST /components` - Create component
- `PUT /components/{id}` - Update component
- `DELETE /components/{id}` - Delete component

### Cover Page
- `POST /cover/generate` - Generate cover page

### Preview (DOCX Generation)
- `POST /preview/introduction` - Generate introduction
- `POST /preview/product-overview` - Generate product overview
- `POST /preview/conformance-claim` - Generate conformance claim
- `POST /preview/document-convention` - Generate document convention
- `POST /preview/risk-management` - Generate risk management
- `POST /preview/full-document` - Generate full document

---

## 🎨 Styling & UI Patterns

### CSS Variables Pattern
- Uses CSS custom properties for theming
- Dark mode support
- Consistent color palette
- Variables: `--primary`, `--text`, `--panel`, `--surface`, etc.

### Component Patterns
1. **Card Layout:** Border, padding, background
2. **Modal Overlay:** Fixed positioning, backdrop blur
3. **Form Controls:** Consistent input styling
4. **Button States:** Hover, active, disabled
5. **Responsive Grid:** Auto-fit columns

---

## 🔧 Key Technologies & Dependencies

### Frontend
- **Framework:** Nuxt 3
- **UI Library:** Custom components + Nuxt UI (newer version)
- **Rich Text:** TipTap
- **State Management:** Composables + localStorage
- **HTTP Client:** $fetch (Nuxt native)

### Backend
- **Framework:** FastAPI
- **ORM:** SQLAlchemy
- **Database:** SQLite
- **Document Gen:** python-docx
- **Image Processing:** PIL (Pillow)
- **HTML Parsing:** BeautifulSoup4

---

## 📦 Migration Strategy - Small Features First

### Phase 1: Core Components (Start Here)
1. ✅ **Basic Layout** - Already done (Sidebar, Header)
2. ⏭️ **Rich Text Editor** - Reuse TipTap implementation
3. ⏭️ **Modal Framework** - Simple, standalone component

### Phase 2: Data Management
4. ⏭️ **Document Workspace Service** - localStorage persistence
5. ⏭️ **Requirements Table** - CRUD with backend integration
6. ⏭️ **Component Database Models** - SQLAlchemy models

### Phase 3: Document Features
7. ⏭️ **XML Tree Viewer** - Visualization component
8. ⏭️ **DOCX Preview** - Document generation
9. ⏭️ **Cover Page Builder** - First document section

### Phase 4: Full Document System
10. ⏭️ **Document Pages** - All section pages
11. ⏭️ **Conformance Pages** - Standards and regulatory
12. ⏭️ **Risk Management** - Risk evidence tracker

### Phase 5: Advanced Features
13. ⏭️ **Settings Panel** - Data modification tools
14. ⏭️ **Import/Export** - Workspace persistence
15. ⏭️ **Full Document Generation** - Complete DOCX export

---

## 🚀 Recommended First Feature to Migrate

### **Feature: Rich Text Editor**
**Why start here?**
- ✅ Standalone component (minimal dependencies)
- ✅ Already has TipTap in current project
- ✅ Highly reusable across document sections
- ✅ Clear functionality boundaries
- ✅ Easy to test independently

**Files to migrate:**
1. `oldstable/web/components/RichTextEditor.vue` → `app/components/RichTextEditor.vue`
2. `oldstable/web/components/RichTextEditor.css` → Include in component

**Dependencies needed:**
- @tiptap/vue-3 ✅ (already installed)
- @tiptap/starter-kit ✅ (already installed)
- @tiptap/extension-highlight ✅ (already installed)
- @tiptap/extension-typography ✅ (already installed)
- Additional: @tiptap/extension-text-align, @tiptap/extension-color, @tiptap/extension-table

**Estimated effort:** ~1-2 hours (mostly updating styling to Nuxt UI conventions)

---

## 📝 Notes
- The old system is well-structured and modular
- Most components are independent and can be migrated individually
- The backend API is clean and follows REST principles
- Document workspace uses localStorage - consider adding backend persistence
- Common Criteria (CC) terminology is used throughout - maintain for compatibility

---

## Next Steps
1. Review this analysis with the team
2. Decide on first feature to migrate (recommendation: Rich Text Editor)
3. Set up migration checklist for chosen feature
4. Test in isolation before integrating
5. Document any changes or improvements made during migration
