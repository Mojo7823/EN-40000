# CRA-Tool Migration Plan
## From oldstable to Nuxt 4

**Status:** 32% Complete (8/25 pages migrated)
**Last Updated:** 2025-11-23

---

## 🎯 Executive Summary

**Good News:**
- ✅ Backend is 100% migrated and functional
- ✅ State management (`documentWorkspace.ts`) is complete with all required interfaces
- ✅ All update functions exist and are ready to use
- ✅ Document builders (DOCX generation) are fully functional

**Challenge:**
- ❌ Only 8 out of 25 pages have been migrated
- ❌ Missing 17 pages, primarily document editing forms
- ❌ The UI forms to collect data are missing, but the data layer is ready

**This means:** Migration is primarily a **frontend UI task** - creating Vue forms that use existing state management.

---

## 📊 State Management Analysis

All required state interfaces exist in `app/services/documentWorkspace.ts`:

| State Interface | Update Function | Has Page? | Backend Ready? |
|----------------|----------------|-----------|----------------|
| `CoverFormState` | `updateCoverState` | ✅ Yes | ✅ Yes |
| `IntroductionFormState` | `updateIntroductionState` | ✅ Yes | ✅ Yes |
| `PurposeScopeState` | `updatePurposeScopeState` | ❌ **Missing** | ✅ Yes |
| `ProductIdentificationState` | `updateProductIdentificationState` | ❌ **Missing** | ✅ Yes |
| `ManufacturerInformationState` | `updateManufacturerInformationState` | ❌ **Missing** | ✅ Yes |
| `ProductOverviewState` | `updateProductOverviewState` | ❌ **Missing** | ✅ Yes |
| `ConformanceClaimState` | `updateConformanceClaimState` | ✅ Partial | ✅ Yes |
| `DocumentConventionState` | `updateDocumentConventionState` | ❌ **Missing** | ✅ Yes |
| `RiskManagementState` | `updateRiskManagementState` | ❌ **Missing** | ✅ Yes |
| `ProductContextState` | (part of RiskManagement) | ❌ **Missing** | ✅ Yes |

**Key Insight:** State management is ready - we just need to build the forms!

---

## 🎨 Migration Categories

### Category A: Core Document Sections (High Priority)
**Critical for generating a complete CRA document**

#### A1. Section 1 - Introduction & Scope
- **A1.1** `document/purpose-scope.vue`
  - **State:** `PurposeScopeState` ✅ Ready
  - **Backend:** `IntroductionSectionsRenderer._add_purpose_scope_section()` ✅ Ready
  - **Complexity:** ⭐⭐ Medium
  - **Dependencies:** None
  - **Description:** Lifecycle phase selection, assessment timeline, methodology

#### A1.2 `document/product-identification.vue`
- **State:** `ProductIdentificationState` ✅ Ready
- **Backend:** `IntroductionSectionsRenderer._add_product_identification_section()` ✅ Ready
- **Complexity:** ⭐⭐ Medium
- **Dependencies:** None
- **Description:** Product description, key functions, target market

#### A1.3 `document/manufacturer-information.vue`
- **State:** `ManufacturerInformationState` ✅ Ready
- **Backend:** `IntroductionSectionsRenderer._add_manufacturer_information_section()` ✅ Ready
- **Complexity:** ⭐ Easy
- **Dependencies:** None
- **Description:** Simple form with legal entity, registration, address, contact

---

#### A2. Section 2 - Product Overview

#### A2.1 `product-overview/description.vue`
- **State:** `ProductOverviewState.productDescriptionHtml` ✅ Ready
- **Backend:** `ProductOverviewRenderer` ✅ Ready
- **Complexity:** ⭐⭐ Medium
- **Dependencies:** None
- **Description:** Rich text editor for product description

#### A2.2 `product-overview/architecture.vue`
- **State:** `ProductOverviewState.productArchitectureHtml` ✅ Ready
- **Backend:** `ProductOverviewRenderer` ✅ Ready
- **Complexity:** ⭐⭐ Medium
- **Dependencies:** None
- **Description:** Rich text editor for architecture overview, components, interfaces

#### A2.3 `product-overview/third-party-components.vue`
- **State:** `ProductOverviewState.thirdPartyComponents` ✅ Ready
- **Backend:** `ProductOverviewRenderer` ✅ Ready
- **Complexity:** ⭐⭐⭐ Complex
- **Dependencies:** None
- **Description:** Table/list management for third-party components (CRUD operations)
- **Features:**
  - Add/edit/delete component entries
  - Fields: componentName, componentType, version, supplier, purpose, license
  - Management approach (rich text)
  - Evidence reference (rich text)

---

#### A3. Section 4 - Document Convention

#### A3.1 `convention/terminology.vue`
- **State:** `DocumentConventionState.terminologyEntries` ✅ Ready
- **Backend:** `build_document_convention_section()` ✅ Ready
- **Complexity:** ⭐⭐⭐ Complex
- **Dependencies:** None
- **Description:** Terminology table management (CRUD)
- **Features:**
  - Add/edit/delete terminology entries
  - Fields: term, definition, reference
  - Helper function `generateTerminologyEntryId()` exists

#### A3.2 `convention/notation.vue`
- **State:** `DocumentConventionState` (evidenceNotationHtml, requirementNotationHtml, assessmentVerdictsHtml) ✅ Ready
- **Backend:** `build_document_convention_section()` ✅ Ready
- **Complexity:** ⭐⭐ Medium
- **Dependencies:** None
- **Description:** Three rich text editors for notation sections (4.2, 4.3, 4.4)

---

#### A4. Section 5 - Risk Management

#### A4.1 `risk/general-approach.vue`
- **State:** `RiskManagementState.generalApproachHtml` ✅ Ready
- **Backend:** `RiskManagementRenderer` ✅ Ready
- **Complexity:** ⭐⭐ Medium
- **Dependencies:** None
- **Description:** Rich text editor for general risk management approach (Section 5.1)

#### A4.2 `pcontext/intended-purpose.vue`
- **State:** `ProductContextState` ✅ Ready
- **Backend:** `RiskManagementRenderer` ✅ Ready
- **Complexity:** ⭐⭐⭐ Complex
- **Dependencies:** None
- **Description:** Product context with evidence tracking
- **Features:**
  - Intended purpose (rich text)
  - Specific intended uses (rich text)
  - Foreseeable use (rich text)
  - Evidence entries (CRUD with RiskEvidenceEntry)
  - Helper function `generateEvidenceEntryId()` exists

---

### Category B: Supporting Features (Medium Priority)

#### B1. Evidence Management

#### B1.1 `document/evidence.vue`
- **State:** Likely uses `RiskEvidenceEntry[]` structure
- **Backend:** Integrated in various sections
- **Complexity:** ⭐⭐⭐ Complex
- **Dependencies:** Evidence tracker component exists
- **Description:** Centralized evidence viewing/management
- **Note:** `EvidenceTracker.vue` component already exists and may fulfill this need

---

### Category C: Demo & Developer Tools (Low Priority)

#### C1. Development Utilities

#### C1.1 `demo/xml-viewer.vue` + `XMLTreeNode.vue` component
- **State:** None
- **Backend:** None
- **Complexity:** ⭐⭐ Medium
- **Dependencies:** Recursive component
- **Description:** XML debugging/viewing tool
- **Use Case:** Development and debugging

#### C1.2 `demo/tree.vue`
- **State:** None
- **Backend:** None
- **Complexity:** ⭐ Easy
- **Dependencies:** May use XMLTreeNode
- **Description:** Tree component demonstration

#### C1.3 `demo/storage.vue`
- **State:** None
- **Backend:** None
- **Complexity:** ⭐ Easy
- **Dependencies:** None
- **Description:** localStorage inspection tool

#### C1.4 Settings Components
- `settings/ModifyDataPanel.vue`
- `settings/QueryDataPanel.vue`
- `settings/XmlParserPanel.vue`
- **Complexity:** ⭐⭐ Medium each
- **Description:** Development/admin tools

---

## 🎯 Recommended Migration Phases

### Phase 1: Critical Path (Complete the Document) - 40 hours
**Goal:** Enable generation of a complete CRA document

**Priority Order:**

1. **A1.3** `document/manufacturer-information.vue` - ⭐ Easy (4 hours)
   - Simple form with 5 fields
   - Good warmup task
   - No dependencies

2. **A1.1** `document/purpose-scope.vue` - ⭐⭐ Medium (6 hours)
   - Lifecycle phase checkboxes
   - Date fields
   - Rich text editor for methodology

3. **A1.2** `document/product-identification.vue` - ⭐⭐ Medium (6 hours)
   - Two rich text editors
   - One text field
   - Similar to existing pages

4. **A2.1** `product-overview/description.vue` - ⭐⭐ Medium (4 hours)
   - Single rich text editor
   - Reference existing pages

5. **A2.2** `product-overview/architecture.vue` - ⭐⭐ Medium (4 hours)
   - Single rich text editor
   - Reference existing pages

6. **A3.2** `convention/notation.vue` - ⭐⭐ Medium (6 hours)
   - Three rich text editors
   - Section headings and guidance

7. **A4.1** `risk/general-approach.vue` - ⭐⭐ Medium (4 hours)
   - Single rich text editor
   - Template insertion button

8. **A2.3** `product-overview/third-party-components.vue` - ⭐⭐⭐ Complex (8 hours)
   - CRUD table for components
   - Two rich text editors
   - Complex state management

9. **A3.1** `convention/terminology.vue` - ⭐⭐⭐ Complex (6 hours)
   - CRUD table for terminology
   - Similar to third-party components

**Phase 1 Output:** Ability to generate complete CRA documents with all sections populated

---

### Phase 2: Enhanced Features - 16 hours
**Goal:** Add advanced risk management and evidence tracking

10. **A4.2** `pcontext/intended-purpose.vue` - ⭐⭐⭐ Complex (10 hours)
    - Three rich text editors
    - Evidence tracker integration
    - Complex nested state

11. **B1.1** `document/evidence.vue` - ⭐⭐⭐ Complex (6 hours)
    - Review if needed (EvidenceTracker component may cover this)
    - Centralized evidence management
    - Filter/search functionality

**Phase 2 Output:** Complete risk management workflow with evidence tracking

---

### Phase 3: Developer Experience (Optional) - 12 hours
**Goal:** Restore development and debugging tools

12. **C1.1** XML Viewer (`demo/xml-viewer.vue` + `XMLTreeNode.vue`) - ⭐⭐ Medium (6 hours)
13. **C1.2** `demo/tree.vue` - ⭐ Easy (2 hours)
14. **C1.3** `demo/storage.vue` - ⭐ Easy (2 hours)
15. Settings panels - ⭐⭐ Medium (2 hours each × 3 = 6 hours) - only if needed

**Phase 3 Output:** Enhanced developer debugging capabilities

---

## 📋 Quick Start Guide for Each Page

### Template for Creating a New Page

```vue
<template>
  <div class="page-container">
    <section class="card title-card">
      <div>
        <p class="eyebrow">[Section Name]</p>
        <h1>[Page Title]</h1>
        <p class="muted">[Description]</p>
      </div>
      <div class="title-card-actions">
        <NuxtLink to="/document/preview" class="btn ghost">
          Go to Document Preview
        </NuxtLink>
      </div>
    </section>

    <section class="card form-card">
      <!-- Form content here -->
    </section>
  </div>
</template>

<script setup lang="ts">
import { useDocumentWorkspace } from '~/composables/useDocumentWorkspace'

const {
  loadDocumentWorkspace,
  updateXXXState,
  subscribeDocumentWorkspace
} = useDocumentWorkspace()

const state = ref(loadDocumentWorkspace())
const form = reactive({
  // Initialize from state.xxx
})

// Watch for external updates
subscribeDocumentWorkspace((newState) => {
  Object.assign(form, newState.xxx)
})

// Save changes
watch(form, () => {
  updateXXXState(form)
}, { deep: true })
</script>
```

---

## 🔧 Implementation Checklist for Each Page

- [ ] Create Vue file in correct directory
- [ ] Import `useDocumentWorkspace` composable
- [ ] Initialize form state from workspace
- [ ] Subscribe to workspace updates
- [ ] Watch form changes and call update function
- [ ] Add RichTextEditor for HTML fields
- [ ] Add proper styling (card, title-card, form-card classes)
- [ ] Test state persistence (reload page, check localStorage)
- [ ] Test navigation to/from document preview
- [ ] Verify DOCX generation includes the new data

---

## 📊 Complexity Breakdown

| Complexity | Page Type | Estimated Time | Example |
|-----------|-----------|----------------|---------|
| ⭐ Easy | Simple forms with basic inputs | 2-4 hours | manufacturer-information |
| ⭐⭐ Medium | Rich text editors, multiple fields | 4-6 hours | purpose-scope, notation |
| ⭐⭐⭐ Complex | CRUD tables, nested state, multiple editors | 6-10 hours | third-party-components, terminology |

---

## 🎯 Success Metrics

### Phase 1 Complete When:
- [ ] All Section 1 pages working (Introduction)
- [ ] All Section 2 pages working (Product Overview)
- [ ] All Section 4 pages working (Document Convention)
- [ ] Section 5.1 working (Risk Management approach)
- [ ] Can generate complete DOCX with all sections populated
- [ ] All state persists correctly in localStorage
- [ ] Navigation works between all pages

### Phase 2 Complete When:
- [ ] Product Context section working
- [ ] Evidence tracking fully functional
- [ ] Risk management workflow complete

### Phase 3 Complete When:
- [ ] All demo/debugging tools restored (if needed)

---

## 🚀 Getting Started

### Option 1: Follow the Plan
Start with **A1.3** (manufacturer-information) and work through Phase 1 in order.

### Option 2: Pick Your Priority
Choose from the list based on:
- **Business Priority:** What sections are most critical for your users?
- **Ease of Implementation:** Start with ⭐ Easy tasks for quick wins
- **Dependencies:** What do other features depend on?

### Option 3: Parallel Development
- Developer 1: Section 1 pages (A1.1, A1.2, A1.3)
- Developer 2: Section 2 pages (A2.1, A2.2, A2.3)
- Developer 3: Section 4 & 5 pages (A3.1, A3.2, A4.1)

---

## 📝 Notes

1. **State management is complete** - No need to modify `documentWorkspace.ts`
2. **Backend is ready** - All DOCX builders working
3. **Components exist** - RichTextEditor, EvidenceTracker ready to use
4. **Pattern is established** - Reference existing pages (cover, introduction, conformance)
5. **Testing is easy** - Just check localStorage and DOCX generation

---

## 🎨 Design Patterns to Follow

### From Existing Pages:

**Cover Page Pattern:**
- Title card with eyebrow + heading + description
- Form card with inputs
- Image upload handling
- Reference: `app/pages/document/cover.vue`

**Rich Text Editor Pattern:**
- Use `RichTextEditor.vue` component
- min-height="400px" or similar
- Placeholder text
- Reference: `app/pages/document/introduction.vue`

**Table Management Pattern:**
- Use Nuxt UI Table component
- Add/Edit/Delete buttons
- Modal for add/edit forms
- Reference: `app/pages/conformance/standards.vue`

---

## 📚 Reference Files

**For Understanding:**
- `app/services/documentWorkspace.ts` - All state interfaces and update functions
- `app/services/sessionService.ts` - Storage layer
- `app/composables/useDocumentWorkspace.ts` - Composable wrapper

**For UI Patterns:**
- `app/pages/document/cover.vue` - Form with image upload
- `app/pages/document/introduction.vue` - Multiple text inputs
- `app/pages/conformance/standards.vue` - Table CRUD operations
- `app/pages/conformance/level.vue` - Checkbox groups + rich text

**For Backend Understanding:**
- `backend/app/docx_builder/introduction_sections.py` - Section 1 builder
- `backend/app/docx_builder/product_overview_builder.py` - Section 2 builder
- `backend/app/docx_builder/document_convention_builder.py` - Section 4 builder
- `backend/app/docx_builder/risk_management_builder.py` - Section 5 builder

**Old Reference (for features/layout):**
- `oldstable/web/pages/` - Original implementations
- Can copy structure but must update to Nuxt 4 syntax

---

## 🎯 Next Steps

**Choose your approach:**

1. **Quick Wins:** Start with ⭐ Easy pages for momentum
2. **Critical Path:** Follow Phase 1 in order for complete document generation
3. **Custom Priority:** Pick specific sections based on business needs

**Then:**
1. Review this plan
2. Select which pages to implement first
3. Create a detailed task list for chosen pages
4. Start implementation with first page
5. Test, iterate, and move to next page

---

**Estimated Total Time:**
- **Phase 1 (Critical):** 40 hours → Complete CRA document generation
- **Phase 2 (Enhanced):** 16 hours → Full risk management
- **Phase 3 (Optional):** 12 hours → Developer tools
- **Total:** 68 hours for complete migration

**Current Progress:** 8 pages done, 17 pages remaining
