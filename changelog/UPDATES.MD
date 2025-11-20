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
19. **TypeScript Error Fixes** (February 2025) – Resolved all TypeScript compilation errors:
    - **ProductContext.vue:** Fixed missing `RiskEvidenceStatus` import, added proper type assertions, and updated all `updateRiskManagementState()` calls to include complete `ProductContextState` fields
    - **DocumentPreview.vue:** Fixed type predicate in `normalizeEvidencePayload()` by using `NonNullable<typeof entry>` instead of explicit type definition
    - **XmlViewerDemo.vue / XMLTreeNode.vue:** Made `attributes` and `children` fields optional in `TreeNode` interface to match `XmlTreeNode` data structure
    - All TypeScript compilation now passes without errors
20. **Nested Sidebar Navigation** (February 2025) – Implemented three-level hierarchical navigation:
    - Added support for sub-sub-sections (Section → Sub-section → Sub-sub-section)
    - Independent toggle controls for each parent section with smooth slide-down animations
    - Clickable parent links with separate arrow buttons for expanding/collapsing children
    - Applied to Risk Management Elements section with Product Context nested under General Approach
    - Pattern is reusable for any accordion section in the sidebar
    - Includes progressive indentation (8px → 16px) and hover effects