
═══════════════════════════════════════════════════════════════
           OLDSTABLE COMPLETE FEATURE LIST
═══════════════════════════════════════════════════════════════

TOTAL STATISTICS
================
Frontend Pages: 25 pages (9,894 lines)
Components: 6 components
Services: 3 services
Backend Routes: 4 route files
DOCX Builders: 9 builder files
Database Models: 21 tables
API Endpoints: 40+ endpoints

═══════════════════════════════════════════════════════════════

FRONTEND PAGES (25 PAGES)
═══════════════════════════════════════════════════════════════

DOCUMENT MANAGEMENT (8 pages)
──────────────────────────────
1. document/cover.vue
   - Cover page editor
   - Image upload
   - Document title, version, date
   - Organization info

2. document/introduction.vue
   - Introduction section editor
   - Reference documents
   - Document structure overview
   - Rich text content

3. document/purpose-scope.vue
   - Purpose statement
   - Scope definition
   - Assessment methodology
   - Rich text editor

4. document/product-identification.vue
   - Product name, version
   - Product description
   - Key functions
   - Security features

5. document/manufacturer-information.vue
   - Company name, address
   - Contact information
   - Website, support details
   - Compliance officer info

6. document/evidence.vue
   - Evidence tracking
   - Document references
   - Test reports
   - Certification docs

7. document/preview.vue (1,389 lines - LARGEST PAGE)
   - Full document preview
   - Section navigation
   - Pagination handling
   - DOCX generation triggers
   - Download management
   - Status tracking

8. document/load-save.vue
   - Export workspace to JSON
   - Import workspace from JSON
   - Clear all data
   - Backup/restore

PRODUCT OVERVIEW (3 pages)
───────────────────────────
9. product-overview/description.vue
   - Product overview content
   - General description
   - Key capabilities
   - Rich text editor

10. product-overview/architecture.vue
    - System architecture
    - Component diagram
    - Data flow
    - Security architecture

11. product-overview/third-party-components.vue
    - Third-party component list
    - Version tracking
    - License information
    - Security considerations

PRODUCT CONTEXT (1 page)
─────────────────────────
12. pcontext/intended-purpose.vue
    - Intended use cases
    - Target environments
    - User personas
    - Risk evidence tracker integration

CONFORMANCE (3 pages)
──────────────────────
13. conformance/standards.vue
    - Primary standards
    - Related standards
    - Standards table management

14. conformance/regulatory.vue
    - Regulatory references
    - Compliance requirements
    - Regulation list management

15. conformance/level.vue
    - Conformance level selection
    - Full/Partial/Non-conformance
    - Justification text

DOCUMENT CONVENTION (2 pages)
──────────────────────────────
16. convention/terminology.vue
    - Term definitions
    - Glossary management
    - Add/edit/delete terms
    - Term references

17. convention/notation.vue
    - Evidence notation
    - Requirement notation
    - Formatting conventions
    - Style guide

RISK MANAGEMENT (1 page)
─────────────────────────
18. risk/general-approach.vue
    - Risk management methodology
    - Approach description
    - Process overview
    - Rich text editor

DEMO/TESTING PAGES (7 pages)
─────────────────────────────
19. demo/modal.vue
    - Modal component demo
    - demoStorage integration
    - Open/close functionality

20. demo/table.vue
    - Requirements table demo
    - Search/filter
    - CRUD operations
    - demoStorage integration

21. demo/editor.vue
    - Rich text editor demo
    - TipTap showcase
    - demoStorage integration

22. demo/xml-viewer.vue
    - XML tree viewer demo
    - Sample XML data
    - Collapsible tree

23. demo/docx-preview.vue
    - DOCX preview demo
    - HTML to DOCX conversion
    - Preview display

24. demo/storage.vue
    - Storage demo
    - Import/export demo
    - demoStorage showcase

25. demo/tree.vue
    - Tree component demo
    - Hierarchical data display

MAIN PAGE
─────────
26. index.vue
    - Main dashboard
    - Navigation hub
    - Welcome screen

═══════════════════════════════════════════════════════════════

FRONTEND COMPONENTS (6 COMPONENTS)
═══════════════════════════════════════════════════════════════

1. RichTextEditor.vue (608 lines)
   - TipTap-based rich text editor
   - Full toolbar (Bold, Italic, Underline, Strike, etc.)
   - Headings (H1-H4)
   - Lists (Bullet, Ordered, Task)
   - Text alignment (Left, Center, Right, Justify)
   - Colors and highlighting
   - Tables with resize/merge
   - Image upload with alignment
   - Superscript/Subscript
   - Code blocks
   - Undo/Redo

2. RiskEvidenceTracker.vue (216 lines)
   - Risk evidence management
   - Fields: title, referenceId, status, notes
   - Status tracking (various states)
   - Add/edit/delete evidence
   - Section mapping
   - Integration with documentWorkspace

3. Sidebar.vue
   - Navigation sidebar
   - Multi-level menu
   - Active route highlighting
   - Collapsible sections

4. XMLTreeNode.vue
   - XML tree visualization
   - Recursive node rendering
   - Expand/collapse functionality
   - Color-coded elements
   - Interactive navigation

5. settings/ModifyDataPanel.vue
   - Data modification interface
   - Component management
   - CRUD operations

6. settings/QueryDataPanel.vue
   - Data query interface
   - Search/filter components
   - Results display

7. settings/XmlParserPanel.vue
   - XML parsing utility
   - Parse and validate XML
   - Display parsed structure

═══════════════════════════════════════════════════════════════

FRONTEND SERVICES (3 SERVICES)
═══════════════════════════════════════════════════════════════

1. documentWorkspace.ts (939 lines) ✅ MIGRATED
   - Central state management
   - 9 document sections:
     * Cover
     * Introduction
     * Purpose & Scope
     * Product Identification
     * Product Overview
     * Manufacturer Information
     * Conformance Claim
     * Document Convention
     * Risk Management
   - localStorage persistence
   - Import/Export JSON
   - Subscribe to changes
   - Generate IDs for entries

2. sessionService.ts ✅ MIGRATED
   - Legacy cover data compatibility
   - Session-based storage
   - Backward compatibility layer

3. demoStorage.ts
   - Demo page data persistence
   - Fields:
     * modalNote
     * editorHtml
     * docxHtml
     * xmlSampleId
     * sfrTable (DemoSfrEntry[])
   - Import/Export demo data
   - Clear demo state

═══════════════════════════════════════════════════════════════

FRONTEND COMPOSABLES (1 COMPOSABLE)
═══════════════════════════════════════════════════════════════

1. useDocumentWorkspace.ts ✅ MIGRATED
   - Vue composable wrapper
   - Exposes documentWorkspace functions
   - SSR-safe implementation

2. useApi.ts
   - API call wrapper
   - Error handling
   - Response normalization

═══════════════════════════════════════════════════════════════

FRONTEND UTILITIES (3 UTILITIES)
═══════════════════════════════════════════════════════════════

1. coverImage.ts
   - Cover image handling
   - Base64 conversion
   - Image validation

2. dataUrl.ts
   - Data URL utilities
   - Base64 encoding/decoding

3. securityObjectivesPreview.ts
   - Security objectives preview generation

4. securityPreview.ts
   - Security section preview

5. spdPreview.ts
   - SPD (Security Problem Definition) preview

═══════════════════════════════════════════════════════════════

FRONTEND CONSTANTS & DATA
═══════════════════════════════════════════════════════════════

1. constants/conformance.ts ✅ MIGRATED
   - Default conformance standards
   - Regulatory references
   - Status options

2. data/xmlSamples.ts
   - Sample XML data
   - Test data for XML viewer

3. types/conformance.ts ✅ MIGRATED
   - TypeScript interfaces
   - Type definitions

4. types/docx-preview.d.ts
   - DOCX preview types

═══════════════════════════════════════════════════════════════

BACKEND API ROUTES (4 FILES, 40+ ENDPOINTS)
═══════════════════════════════════════════════════════════════

1. routes/health.py ✅ MIGRATED
   GET  /
   GET  /health

2. routes/preview.py (312 lines) ✅ MIGRATED
   POST /preview/sfr/preview
   GET  /preview/sfr/preview/{user_id}/{filename}
   POST /preview/sar/preview
   GET  /preview/sar/preview/{user_id}/{filename}
   POST /preview/spd/preview
   GET  /preview/spd/preview/{user_id}/{filename}
   POST /preview/so/preview
   GET  /preview/so/preview/{user_id}/{filename}
   POST /preview/tss/preview
   GET  /preview/tss/preview/{user_id}/{filename}
   POST /preview/st-intro/preview
   GET  /preview/st-intro/preview/{user_id}/{filename}
   POST /preview/final-preview
   GET  /preview/final-preview/download/{user_id}/{filename}
   POST /preview/final-preview/cleanup/{user_id}

3. routes/cover.py ✅ MIGRATED
   POST /cover/upload
   POST /cover/generate-preview
   GET  /cover/preview/{user_id}/{filename}
   POST /cover/cleanup/{user_id}

4. routes/components.py ✅ MIGRATED
   GET  /components/family/{family}
   POST /components
   PUT  /components/{component_id}
   DELETE /components/{component_id}

═══════════════════════════════════════════════════════════════

BACKEND DOCX BUILDERS (9 FILES, 2,245 LINES)
═══════════════════════════════════════════════════════════════

1. html_converter.py (400 lines) ✅ MIGRATED
   - Core HTML to DOCX conversion
   - Handles all HTML tags:
     * Headings (h1-h6)
     * Paragraphs (p)
     * Lists (ul, ol, li)
     * Tables (table, tr, td, th)
     * Formatting (strong, em, u, s, code)
     * Images (img)
     * Spans with styles
   - Text alignment parsing
   - Color parsing
   - Style application

2. section_builders.py (156 lines) ✅ MIGRATED
   - Base document helpers
   - Common formatting functions
   - Paragraph styles
   - Section utilities

3. cover_builder.py (204 lines) ✅ MIGRATED
   - Cover page generation
   - Image insertion
   - Title formatting
   - Metadata placement

4. introduction_sections.py (362 lines) ✅ MIGRATED
   - Introduction section generation
   - Reference documents
   - Document structure
   - Purpose and scope

5. product_overview_builder.py (261 lines) ✅ MIGRATED
   - Product description
   - Architecture diagrams
   - Component lists
   - Feature descriptions

6. conformance_claim_builder.py (175 lines) ✅ MIGRATED
   - Standards conformance
   - Regulatory references
   - Conformance levels
   - Justifications

7. document_convention_builder.py (203 lines) ✅ MIGRATED
   - Terminology definitions
   - Notation conventions
   - Style guidelines
   - Formatting rules

8. risk_management_builder.py (197 lines) ✅ MIGRATED
   - Risk management approach
   - Risk evidence
   - Methodology description

9. final_builder.py (208 lines) ✅ MIGRATED
   - Assembles complete document
   - Combines all sections
   - Table of contents
   - Page numbering
   - Headers/footers

═══════════════════════════════════════════════════════════════

BACKEND UTILITIES (6 FILES)
═══════════════════════════════════════════════════════════════

1. style_parser.py ✅ MIGRATED
   - CSS style parsing
   - Inline style extraction
   - Style application to DOCX

2. dimension_parser.py ✅ MIGRATED
   - Size parsing (px, pt, em, %)
   - Dimension conversion
   - Unit handling

3. converters.py ✅ MIGRATED
   - Data type conversions
   - Format transformations

4. image_handler.py ✅ MIGRATED
   - Image processing
   - Base64 to image
   - Image insertion in DOCX
   - Size calculations

5. formatters.py ✅ MIGRATED
   - Text formatting utilities
   - Number formatting
   - Date formatting

6. validators.py ✅ MIGRATED
   - Input validation
   - Data sanitization
   - Type checking

═══════════════════════════════════════════════════════════════

BACKEND DATABASE MODELS (21 TABLES)
═══════════════════════════════════════════════════════════════

GENERAL
───────
1. components (General component storage)
2. element_list_db (Colored XML elements)

FUNCTIONAL REQUIREMENTS (F-class) - 11 tables
──────────────────────────────────────────────
3. fau_db - Security audit
4. fco_db - Communication
5. fcs_db - Cryptographic support
6. fdp_db - User data protection
7. fia_db - Identification and authentication
8. fmt_db - Security management
9. fpr_db - Privacy
10. fpt_db - Protection of TSF
11. fru_db - Resource utilization
12. fta_db - Product access
13. ftp_db - Trusted path/channels

ASSURANCE REQUIREMENTS (A-class) - 8 tables
────────────────────────────────────────────
14. aco_db - Composition
15. adv_db - Development
16. agd_db - Guidance documents
17. alc_db - Life-cycle support
18. ape_db - Protection Profile evaluation
19. ase_db - CRA Documentation evaluation
20. ate_db - Tests
21. ava_db - Vulnerability assessment

Note: These are legacy Common Criteria classifications
      kept for backward compatibility

═══════════════════════════════════════════════════════════════

MIGRATION STATUS SUMMARY
═══════════════════════════════════════════════════════════════

✅ COMPLETED (Foundation + DOCX System)
────────────────────────────────────────
- Document Workspace Service (939 lines)
- Session Service
- Rich Text Editor (608 lines)
- DOCX Backend System (23 files, 2,245+ lines)
- Database initialized (21 tables)
- DOCX Generation Demo page
- 32 API endpoints working

❌ NOT MIGRATED YET
───────────────────
- 25 document/demo pages (9,894 lines)
- 5 additional components (XMLTreeNode, Settings panels, etc.)
- 1 service (demoStorage.ts)
- 1 composable (useApi.ts)
- 5 utility files
- Risk Evidence Tracker component
- XML sample data

PERCENTAGE COMPLETE
───────────────────
Backend: ~90% (DOCX system complete, APIs working)
Frontend: ~15% (Foundation complete, pages not built)
Overall: ~40%

