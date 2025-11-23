# 🚀 CRA TOOL MIGRATION PLAN

**Date:** $(date)  
**Current Progress:** ~60% Complete (Backend 100%, Frontend Foundation 100%, Document Pages 0%)

---

## 📊 CURRENT STATE ANALYSIS

### ✅ What's Already Complete
- **Backend:** 100% migrated (5 routes, 11 DOCX builders, 22 DB tables, 7 utilities)
- **Frontend Foundation:** 100% migrated (services, core components, composables)
- **Demo Pages:** 12 pages working (dashboard, table, modal, CRUD, WYSIWYG, DOCX generation, etc.)

### ❌ What Needs Migration
- **18 Document/Feature Pages** from `oldstable/web/pages/`
- **3 Advanced Components** (XMLTreeNode, Settings panels)
- **Testing & Refinement**

---

## 🎯 MIGRATION STRATEGY

Based on the analysis of the old stable site and migration status report, I recommend a **phased approach prioritizing core document workflow first**.

---

## 📋 PHASE 1: QUICK WINS - Document Foundation (HIGHEST PRIORITY)
**Timeline:** 1 week  
**Impact:** HIGH - Enables basic document workflow

### 1.1 Load/Save Page ⭐⭐⭐
**Complexity:** 🟢 LOW (169 lines)  
**Time Estimate:** 2-3 hours  
**Why First:** 
- Simple, standalone functionality
- No dependencies on other pages
- Enables testing full workspace lifecycle
- High value for effort

**What it does:**
- Import/Export workspace JSON
- Display current workspace state
- Clear workspace
- Refresh state view

**Migration Steps:**
1. Create `/app/pages/document/load-save.vue`
2. Convert old styling to Nuxt UI components (UCard, UButton, etc.)
3. Use existing `useDocumentWorkspace()` composable ✅
4. Replace old CSS variables with Tailwind classes
5. Add toast notifications (Nuxt UI)
6. Test import/export functionality

**Dependencies:**
- ✅ `useDocumentWorkspace()` - Already migrated
- ✅ Document workspace service - Already migrated

---

### 1.2 Cover Page ⭐⭐⭐
**Complexity:** 🟡 MEDIUM (323 lines)  
**Time Estimate:** 4-5 hours  
**Why Second:** Foundation page that other pages reference

**What it does:**
- Device name, description
- Cover image upload (drag & drop)
- Version number, revision date
- Lab name and address
- Auto-save to workspace

**Migration Steps:**
1. Create `/app/pages/document/cover.vue`
2. Convert form fields to Nuxt UI components (UInput, UTextarea, UFormGroup)
3. Implement image upload with preview (keep drag & drop)
4. Use existing cover API endpoint ✅
5. Add image validation
6. Wire up to documentWorkspace
7. Test image upload to backend

**Dependencies:**
- ✅ Cover API (`/api/cover`) - Already exists
- ✅ `useDocumentWorkspace()` - Already migrated
- ✅ Session service - Already migrated

**Special Features:**
- Drag & drop image upload
- Image preview
- File validation
- Auto-save on change

---

### 1.3 Introduction Page ⭐⭐⭐
**Complexity:** 🟡 MEDIUM (333 lines)  
**Time Estimate:** 4-5 hours  
**Why Third:** First content page, relatively straightforward

**What it does:**
- Product name, version, type
- Manufacturer name and address
- Status (Draft/Final/Revision/Custom)
- Prepared/Reviewed/Approved by fields
- Custom status modal

**Migration Steps:**
1. Create `/app/pages/document/introduction.vue`
2. Convert all form fields to Nuxt UI components
3. Implement custom status modal using UModal
4. Add status dropdown with custom option
5. Wire up to documentWorkspace
6. Test auto-save functionality

**Dependencies:**
- ✅ `useDocumentWorkspace()` - Already migrated
- ✅ Introduction state in workspace - Already exists

**Special Features:**
- Custom status modal dialog
- Auto-save on field change
- External state sync

---

## 📋 PHASE 2: Content Pages (HIGH PRIORITY)
**Timeline:** 1 week  
**Impact:** MEDIUM-HIGH - Core content editing

### 2.1 Purpose & Scope Page ⭐⭐
**Complexity:** 🟡 MEDIUM  
**Time Estimate:** 4-5 hours

**What it does:**
- Rich text editor for purpose
- Rich text editor for scope
- Auto-save to workspace

**Migration Steps:**
1. Create `/app/pages/document/purpose-scope.vue`
2. Use existing `RichTextEditor.vue` component ✅
3. Two editor instances (purpose & scope)
4. Wire up to documentWorkspace
5. Test content persistence

**Dependencies:**
- ✅ `RichTextEditor.vue` - Already migrated
- ✅ `useDocumentWorkspace()` - Already migrated

---

### 2.2 Product Identification Page ⭐⭐
**Complexity:** 🟡 MEDIUM  
**Time Estimate:** 4-5 hours

**What it does:**
- Product identification details
- Rich text content areas
- Auto-save

**Migration Steps:**
1. Create `/app/pages/document/product-identification.vue`
2. Use RichTextEditor for content sections
3. Form fields for structured data
4. Wire up to documentWorkspace
5. Test persistence

---

### 2.3 Manufacturer Information Page ⭐⭐
**Complexity:** 🟡 MEDIUM  
**Time Estimate:** 4-5 hours

**What it does:**
- Manufacturer details
- Contact information
- Rich text sections

**Migration Steps:**
1. Create `/app/pages/document/manufacturer-information.vue`
2. Mix of form fields and rich text
3. Wire up to documentWorkspace
4. Test save/load

---

### 2.4 Evidence Tracking Page ⭐⭐
**Complexity:** 🟢 LOW  
**Time Estimate:** 2-3 hours

**What it does:**
- Evidence list management
- Status tracking
- Evidence metadata

**Migration Steps:**
1. Create `/app/pages/document/evidence.vue`
2. Use existing `EvidenceTracker.vue` component ✅
3. Simple page wrapper
4. Wire up to documentWorkspace

**Dependencies:**
- ✅ `EvidenceTracker.vue` - Already migrated ✅
- ✅ `useDocumentWorkspace()` - Already migrated

---

## 📋 PHASE 3: Preview Page (CRITICAL BUT COMPLEX)
**Timeline:** 1-2 weeks  
**Impact:** VERY HIGH - Enables full document generation workflow

### 3.1 Preview Page ⭐⭐⭐⭐⭐
**Complexity:** 🔴 HIGH (1,389 lines!)  
**Time Estimate:** 12-16 hours  
**Why Later:** Most complex page, needs other pages completed first

**What it does:**
- Full document preview with all sections
- Pagination system
- Section navigation
- Download DOCX functionality
- Status indicators for each section
- Real-time preview of document structure
- Multiple preview endpoints (cover, conformance, risk, etc.)

**Migration Steps:**
1. Create `/app/pages/document/preview.vue`
2. Break into smaller components:
   - `PreviewHeader.vue` - Header with download button
   - `PreviewNavigation.vue` - Section navigation sidebar
   - `PreviewContent.vue` - Main content area with pagination
   - `PreviewStatusBar.vue` - Status indicators
3. Implement pagination system
4. Wire up all preview API endpoints ✅
5. Implement section status tracking
6. Add download functionality
7. Test with all section types

**Dependencies:**
- ✅ All preview APIs - Already exist in backend
- ✅ All other document pages - Should be completed first
- ✅ `useDocumentWorkspace()` - Already migrated

**Special Features:**
- Complex pagination
- Multiple preview types
- Section status tracking
- Real-time document assembly
- Download workflow

**Recommendation:** Tackle this AFTER Phase 1 & 2 are complete, so you can test with real content.

---

## 📋 PHASE 4: Product Overview Pages
**Timeline:** 1-1.5 weeks  
**Impact:** MEDIUM - Complete product section

### 4.1 Product Description ⭐
**Complexity:** 🟡 MEDIUM  
**Time Estimate:** 4-5 hours

### 4.2 Product Architecture ⭐
**Complexity:** 🟡 MEDIUM  
**Time Estimate:** 4-5 hours

### 4.3 Third-Party Components ⭐
**Complexity:** 🟡 MEDIUM  
**Time Estimate:** 4-5 hours

All three pages follow similar pattern:
- Rich text editors
- Table components for structured data
- Wire up to documentWorkspace
- Test persistence and preview integration

---

## 📋 PHASE 5: Conformance & Convention Pages
**Timeline:** 1.5-2 weeks  
**Impact:** MEDIUM - Complete conformance section

### 5.1 Standards Conformance ⭐
**Complexity:** 🟡 MEDIUM  
**Time Estimate:** 4-5 hours

### 5.2 Regulatory Conformance ⭐
**Complexity:** 🟡 MEDIUM  
**Time Estimate:** 4-5 hours

### 5.3 Conformance Level ⭐
**Complexity:** 🟢 LOW  
**Time Estimate:** 3-4 hours

### 5.4 Terminology ⭐
**Complexity:** 🟡 MEDIUM  
**Time Estimate:** 4-5 hours

### 5.5 Notation ⭐
**Complexity:** 🟡 MEDIUM  
**Time Estimate:** 4-5 hours

All use existing conformance types and constants ✅

---

## 📋 PHASE 6: Risk & Context Pages
**Timeline:** 1 week  
**Impact:** MEDIUM - Complete risk section

### 6.1 General Approach (Risk) ⭐
**Complexity:** 🟡 MEDIUM  
**Time Estimate:** 4-5 hours

### 6.2 Intended Purpose (Context) ⭐
**Complexity:** 🟡 MEDIUM  
**Time Estimate:** 4-5 hours

---

## 📋 PHASE 7: Advanced Components (Optional)
**Timeline:** 1-2 weeks  
**Impact:** LOW-MEDIUM - Admin features

### 7.1 XMLTreeNode Component
**Complexity:** 🟡 MEDIUM  
**Time Estimate:** 6-8 hours
- Recursive component
- Tree visualization
- Used for XML viewing

### 7.2 Settings Panels (3 panels)
**Complexity:** 🟡 MEDIUM  
**Time Estimate:** 8-10 hours total
- ModifyDataPanel
- QueryDataPanel
- XmlParserPanel

---

## 🎯 RECOMMENDED STARTING POINT

### **START WITH PHASE 1: Quick Wins (3 pages)**

#### Week 1 Schedule:
- **Day 1-2:** Load/Save page (2-3 hours) + Testing
- **Day 3-4:** Cover page (4-5 hours) + Testing
- **Day 5:** Introduction page (4-5 hours) + Testing

**Total Time:** ~12-15 hours over 1 week

**Why this order:**
1. **Load/Save** - Simple, enables testing, no dependencies
2. **Cover** - Foundation page, has image upload feature
3. **Introduction** - First content page, proves pattern works

**After Week 1, you'll have:**
- ✅ Working document import/export
- ✅ Cover page with image upload
- ✅ Introduction page with custom status
- ✅ Proven migration pattern for remaining pages
- ✅ Confidence that the architecture works
- ✅ Real progress: +3 pages = +11% completion

---

## 📊 OVERALL TIMELINE

| Phase | Duration | Pages | Total Completion |
|-------|----------|-------|------------------|
| **Current** | - | 12 demo pages | 60% |
| **Phase 1** | 1 week | +3 pages | 65% |
| **Phase 2** | 1 week | +4 pages | 72% |
| **Phase 3** | 1-2 weeks | +1 page (complex) | 77% |
| **Phase 4** | 1-1.5 weeks | +3 pages | 82% |
| **Phase 5** | 1.5-2 weeks | +5 pages | 90% |
| **Phase 6** | 1 week | +2 pages | 93% |
| **Phase 7** | 1-2 weeks | +4 components | 100% |
| **TOTAL** | **9-12 weeks** | **22+ items** | **100%** |

---

## 💡 MIGRATION PATTERNS TO FOLLOW

### Pattern 1: Simple Form Page (Load/Save, Introduction)
```vue
<template>
  <div class="container mx-auto p-6">
    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <div>
            <p class="text-sm text-gray-500">Section Name</p>
            <h1 class="text-2xl font-bold">Page Title</h1>
          </div>
          <div class="flex gap-2">
            <UButton variant="ghost" to="/document/preview">Preview</UButton>
            <UButton color="red" @click="clearForm">Clear</UButton>
          </div>
        </div>
      </template>

      <form @submit.prevent>
        <UFormGroup label="Field Name">
          <UInput v-model="form.fieldName" />
        </UFormGroup>
        <!-- More fields -->
      </form>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const workspace = useDocumentWorkspace()
const form = reactive({ ...workspace.loadDocumentWorkspace().sectionName })

watch(form, (value) => {
  workspace.updateSectionState({ ...value })
}, { deep: true })
</script>
```

### Pattern 2: Rich Text Page (Purpose/Scope, Product Description)
```vue
<template>
  <div class="container mx-auto p-6">
    <UCard>
      <template #header>
        <h1 class="text-2xl font-bold">Page Title</h1>
      </template>

      <div class="space-y-6">
        <div>
          <h2 class="text-lg font-semibold mb-2">Section 1</h2>
          <RichTextEditor v-model="content1" />
        </div>

        <div>
          <h2 class="text-lg font-semibold mb-2">Section 2</h2>
          <RichTextEditor v-model="content2" />
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const workspace = useDocumentWorkspace()
const content1 = ref(workspace.loadDocumentWorkspace().section.content1)
const content2 = ref(workspace.loadDocumentWorkspace().section.content2)

watch([content1, content2], ([c1, c2]) => {
  workspace.updateSectionState({ content1: c1, content2: c2 })
})
</script>
```

### Pattern 3: Component with Existing Tracker (Evidence Page)
```vue
<template>
  <div class="container mx-auto p-6">
    <UCard>
      <template #header>
        <h1 class="text-2xl font-bold">Evidence Tracking</h1>
      </template>

      <EvidenceTracker v-model="evidenceList" />
    </UCard>
  </div>
</template>

<script setup lang="ts">
const workspace = useDocumentWorkspace()
const evidenceList = ref(workspace.loadDocumentWorkspace().evidence.list)

watch(evidenceList, (value) => {
  workspace.updateEvidenceState({ list: value })
}, { deep: true })
</script>
```

---

## 🔑 KEY MIGRATION PRINCIPLES

### ✅ DO:
1. **Use Nuxt UI components** (UCard, UButton, UInput, UFormGroup, UModal, etc.)
2. **Use Tailwind CSS** for styling (replace CSS variables)
3. **Reuse existing components** (RichTextEditor, EvidenceTracker)
4. **Keep auto-save functionality** with watch()
5. **Use existing composables** (useDocumentWorkspace)
6. **Add toast notifications** for user feedback
7. **Test each page** before moving to next
8. **Maintain feature parity** with old pages

### ❌ DON'T:
1. Don't copy old CSS variables - use Tailwind
2. Don't use RouterLink - use NuxtLink or UButton with `to` prop
3. Don't create new services - use existing ones
4. Don't skip testing
5. Don't try to do too much at once
6. Don't migrate Phase 3 (Preview) until Phase 1 & 2 are done

---

## 🚀 IMMEDIATE NEXT STEPS

### **Recommended: Start with Load/Save Page**

**Step-by-step for today:**

1. **Create the file structure:**
   ```bash
   mkdir -p app/pages/document
   touch app/pages/document/load-save.vue
   ```

2. **Copy template from old page** and start converting:
   - Replace `<div class="card">` with `<UCard>`
   - Replace `<button class="btn">` with `<UButton>`
   - Replace CSS classes with Tailwind
   - Keep the logic (it's already good!)

3. **Test the page:**
   - Visit http://localhost:3000/document/load-save
   - Test import functionality
   - Test export functionality
   - Test clear functionality

4. **Move to next page** when complete

---

## 📈 SUCCESS METRICS

### After Phase 1 (Week 1):
- ✅ Can create, save, and load documents
- ✅ Can add cover information with images
- ✅ Can edit introduction details
- ✅ Full workspace lifecycle working
- ✅ +3 pages migrated

### After Phase 2 (Week 2):
- ✅ Can edit all basic document sections
- ✅ Evidence tracking working
- ✅ Rich text editing in multiple sections
- ✅ +7 pages total migrated

### After Phase 3 (Week 4):
- ✅ Can preview full document
- ✅ Can generate and download DOCX
- ✅ Full workflow complete
- ✅ MVP is functional!

---

## 🎯 FINAL RECOMMENDATION

**START NOW with Phase 1, Page 1: Load/Save**

This page is:
- ✅ Simple (169 lines)
- ✅ Standalone (no dependencies on other pages)
- ✅ High value (enables testing)
- ✅ Fast to complete (2-3 hours)
- ✅ Builds confidence

**After completing Load/Save, we can:**
1. Validate the migration pattern works
2. Test the full import/export cycle
3. Build momentum for the next pages
4. Make adjustments to the plan if needed

---

## 📞 QUESTIONS TO CONSIDER

Before we start, let me know your preference:

1. **Priority:** Do you want to prioritize:
   - ✅ **Option A: Quick Wins** (Load/Save → Cover → Introduction) - Fastest progress
   - **Option B: End-to-End** (All pages needed for one full document workflow)
   - **Option C: Specific Feature** (Focus on one area like Product Overview)

2. **Pace:** How much time can you dedicate?
   - **Full-time:** ~8 hours/day → Complete Phase 1 in 2-3 days
   - **Part-time:** ~4 hours/day → Complete Phase 1 in 1 week
   - **Casual:** ~2 hours/day → Complete Phase 1 in 2 weeks

3. **Complexity:** Should we start with:
   - ✅ **Easiest first** (Load/Save) - Recommended
   - **Most critical first** (Preview page) - Risky but high impact
   - **Mixed approach** - Balance easy and critical

---

**My recommendation: Start with Option A (Quick Wins) at whatever pace works for you. Let's begin with the Load/Save page!**

