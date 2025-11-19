# Product Context Editor Clickability Fix

**Date:** February 2025  
**Issue:** WYSIWYG text editors on `/risk/product-context` page were hard to click  
**Status:** ✅ Fixed

---

## Problem Description

Users reported that the WYSIWYG text boxes on the Product Context page were intermittently unclickable. The issue occurred when:
- Multiple editor sections were stacked vertically
- "Insert Template" buttons were positioned above editors
- Button elements were overlapping the editor areas below them

This created a frustrating user experience where clicking on the editor would sometimes not work.

---

## Root Cause

The issue was caused by **CSS stacking context and layout problems**:

1. **Overlapping elements**: The `.risk-editor-header` used `flex-wrap: wrap` with `align-items: center`, which allowed buttons to potentially overflow into the space occupied by editors below
2. **Missing z-index management**: No explicit z-index was set to ensure proper layering
3. **Insufficient spacing**: No margin-bottom on headers meant buttons could visually overlap with editors

---

## Solution Implemented

### 1. Updated `.risk-editor-card` (RiskManagement.css)
```css
.risk-editor-card {
  border-top: 1px solid var(--panel-border);
  padding-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  isolation: isolate;  /* ← Creates new stacking context */
}
```

### 2. Enhanced `.risk-editor-header` (RiskManagement.css)
```css
.risk-editor-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;  /* ← Changed from 'center' */
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 12px;      /* ← Increased spacing */
  position: relative;
  z-index: 10;              /* ← Higher z-index to stay above editors */
  min-height: 60px;         /* ← Prevents collapsing */
}

.risk-editor-header button {
  flex-shrink: 0;           /* ← Prevents button shrinking */
  margin-top: 0;            /* ← Aligned with flex-start */
  white-space: nowrap;      /* ← Prevents text wrapping */
}
```

### 3. Updated `.content-card` (RiskManagement.css)
```css
.content-card {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
  position: relative;
  z-index: auto;
  isolation: isolate;       /* ← Isolates stacking context */
}
```

### 4. Updated `.rich-text-editor` (RichTextEditor.css)
```css
.rich-text-editor {
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  z-index: 0;
  isolation: isolate;       /* ← Creates isolated stacking context */
}
```

### 5. Enhanced `.toolbar` (RichTextEditor.css)
```css
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  background: var(--surface-overlay);
  border: 1px solid var(--panel-border);
  border-radius: 10px;
  padding: 12px;
  position: relative;
  z-index: 2;               /* ← Higher than editor */
}
```

### 6. Enhanced `.editor` (RichTextEditor.css)
```css
.editor {
  border: 1px solid var(--panel-border);
  border-radius: 12px;
  padding: 16px;
  background: var(--surface-overlay);
  color: var(--text);
  line-height: 1.6;
  width: 100%;
  cursor: text;
  position: relative;
  z-index: 1;               /* ← Proper layering */
}
```

---

## Key Changes

✅ **isolation: isolate** - Creates independent stacking contexts to prevent overlap  
✅ **align-items: flex-start** - Buttons now align to the top, preventing vertical overlap  
✅ **margin-bottom: 12px** - Increased spacing between header and editor  
✅ **z-index: 10** on header - Ensures buttons stay well above editors  
✅ **z-index: 2** on toolbar - Toolbar stays above editor content  
✅ **z-index: 1** on editor - Proper layering within RichTextEditor  
✅ **min-height: 60px** on header - Prevents collapsing when wrapping  
✅ **white-space: nowrap** on buttons - Prevents button text wrapping  
✅ **flex-shrink: 0** on buttons - Prevents buttons from being squeezed  
✅ **position: relative** - Creates stacking context for z-index to work

**Most Important Fix:** Using `isolation: isolate` creates new stacking contexts for each editor card, preventing elements from different sections from interfering with each other.

---

## Testing Checklist

- [x] Navigate to `/risk/product-context`
- [x] Click on each of the three editor areas:
  - Scope & Intended Use
  - Operational Environment & Dependencies
  - Stakeholders & User Profiles
- [x] Verify editors respond immediately to clicks
- [x] Test "Insert Template" buttons don't block editors below
- [x] Check responsive behavior on smaller screens
- [x] Verify no visual regressions in layout

---

## Files Modified

1. **web/src/views/risk/RiskManagement.css**
   - Updated `.risk-editor-card`
   - Enhanced `.risk-editor-header`
   - Added `.risk-editor-header button` styles

2. **web/src/components/RichTextEditor.css**
   - Updated `.rich-text-editor` with positioning

---

## Impact

This fix applies to:
- `/risk/product-context` (immediate fix)
- Any other pages using `.risk-editor-card` class
- General pattern for stacked editor sections

---

## Prevention

**When creating similar layouts in the future:**
1. Use `align-items: flex-start` for headers with buttons
2. Add explicit `margin-bottom` to prevent overlap
3. Set `position: relative` and appropriate `z-index` values
4. Use `flex-shrink: 0` on buttons to prevent squishing
5. Test clicking behavior with multiple stacked sections

---

## Related Pages

Other risk management pages using similar patterns:
- `/risk/general-approach` - Uses similar editor layout
- Future risk management sections should follow this pattern

---

**Result:** The WYSIWYG editors are now consistently clickable across all screen sizes and states. ✅
