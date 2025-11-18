# Preview Architecture - Real Document Approach

## System Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│                  (DocumentPreview.vue)                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 1. POST /cover/preview
                              │    (payload with all sections)
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND API                              │
│                    (routes/cover.py)                            │
│                                                                 │
│  generate_cover_preview(payload)                                │
│    ├─ Resolve image path                                       │
│    ├─ Get output directory                                     │
│    └─ Call: build_cover_document(payload, image, output_dir)   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 2. Generate DOCX
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DOCUMENT BUILDER                              │
│                  (cover_builder.py)                             │
│                                                                 │
│  build_cover_document():                                        │
│    ├─ Create A4 document                                       │
│    ├─ Render Cover Page                                        │
│    ├─ [PAGE BREAK] ──────────────────────────────              │
│    ├─ Render Introduction Sections                             │
│    │   ├─ 1.1 Document Information                             │
│    │   ├─ [PAGE BREAK]                                         │
│    │   ├─ 1.2 Purpose & Scope                                  │
│    │   ├─ [PAGE BREAK]                                         │
│    │   ├─ 1.3 Product Identification                           │
│    │   ├─ [PAGE BREAK]                                         │
│    │   └─ 1.4 Manufacturer Information                         │
│    ├─ [PAGE BREAK] ──────────────────────────────────          │
│    ├─ Render Product Overview                                  │
│    │   ├─ 2.1 Product Description                              │
│    │   │   └─ append_html_to_document() [No chunking]          │
│    │   ├─ [PAGE BREAK]                                         │
│    │   ├─ 2.2 Product Architecture                             │
│    │   │   └─ append_html_to_document() [No chunking]          │
│    │   ├─ [PAGE BREAK]                                         │
│    │   └─ 2.3 Third-Party Components                           │
│    ├─ [PAGE BREAK] ──────────────────────────────────          │
│    ├─ Render Conformance Claim                                 │
│    │   ├─ 3.1 Standards Conformance                            │
│    │   ├─ 3.2 Regulatory Conformance                           │
│    │   │   └─ append_html_to_document() [No chunking]          │
│    │   └─ 3.3 Conformance Level                                │
│    │       └─ append_html_to_document() [No chunking]          │
│    └─ Save to disk: {uuid}.docx                                │
│                                                                 │
│  Returns: Path object                                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 3. Return file path
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND API                              │
│                    (routes/cover.py)                            │
│                                                                 │
│  Return JSON:                                                   │
│    {                                                            │
│      "status": "ready",                                         │
│      "path": "/cover/preview/{user_id}/{filename}.docx"         │
│    }                                                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 4. Fetch REAL DOCX file
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│                  (DocumentPreview.vue)                          │
│                                                                 │
│  const buffer = await api.get(path, {responseType: 'arraybuffer'})│
│                                                                 │
│  await renderAsync(buffer.data, container, ...)                 │
│                                                                 │
│  ┌───────────────────────────────────────────┐                 │
│  │        DOCX Preview Container             │                 │
│  │   (Rendered by docx-preview library)      │                 │
│  │                                           │                 │
│  │   [Displays ACTUAL DOCX file]             │                 │
│  │   - Exact pagination Word will use        │                 │
│  │   - Real formatting                       │                 │
│  │   - True WYSIWYG                          │                 │
│  └───────────────────────────────────────────┘                 │
│                                                                 │
│  User clicks "Download"                                         │
│    → Downloads THE SAME FILE shown in preview                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Components

### 1. HTML to DOCX Conversion

```
┌──────────────────────────────────────────┐
│     HTML Content (WYSIWYG Editor)        │
│                                          │
│   <p>Long paragraph...</p>               │
│   <ul><li>Item 1</li>...</ul>            │
│   <table>...</table>                     │
└──────────────────────────────────────────┘
                  │
                  │ append_html_to_document()
                  │ (No chunking, no char limits)
                  ↓
┌──────────────────────────────────────────┐
│      Python-docx Document Object         │
│                                          │
│   Paragraph("Long paragraph...")         │
│   BulletList(Item 1, ...)                │
│   Table(rows, cols)                      │
└──────────────────────────────────────────┘
                  │
                  │ document.save()
                  ↓
┌──────────────────────────────────────────┐
│          DOCX File on Disk               │
│                                          │
│   Word automatically handles:            │
│   - Line breaks                          │
│   - Page breaks                          │
│   - Column widths                        │
│   - Image placement                      │
└──────────────────────────────────────────┘
```

### 2. Page Break Strategy

```
✅ Manual Page Breaks (Structural)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

document.add_page_break()

Used ONLY between major sections:
  - After cover
  - Between sections (1, 2, 3)
  - Between long subsections

Purpose: Clean document structure


❌ NO Smart Pagination (Removed)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

_chunk_html_content(html, 3500)
_append_html_with_smart_pagination()

Previously tried to predict where 
Word would break pages.

Removed because:
  - Preview ≠ Export
  - Complex logic
  - Word knows best


✅ Natural Word Pagination (Content)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Word's layout engine

Handles automatically:
  - Paragraph wrapping
  - List continuation
  - Table splits
  - Widow/orphan prevention
  - Keep with next

Result: Professional pagination
```

---

## Data Flow

### Request Payload Structure

```json
{
  "user_id": "user123",
  "title": "Product Name",
  "version": "1.0",
  "revision": "2025-01-15",
  "image_path": "/cover/uploads/user123/image.png",
  
  "introduction": {
    "product_name": "Smart Device",
    "product_version": "1.0",
    "manufacturer": "ACME Corp",
    ...
  },
  
  "purpose_scope": {
    "scope_selections": ["Design", "Implementation"],
    "methodology_html": "<p>Assessment approach...</p>",
    ...
  },
  
  "product_identification": {
    "product_description_html": "<p>Device description...</p>",
    "key_functions_html": "<ul><li>Function 1</li>...</ul>",
    ...
  },
  
  "product_overview": {
    "product_description_html": "<p>Detailed overview...</p>",
    "product_architecture_html": "<p>Architecture...</p>",
    "third_party_components": { ... }
  },
  
  "manufacturer_information": {
    "legal_entity": "ACME Corporation",
    "address": "123 Main St",
    ...
  },
  
  "conformance_claim": {
    "standards_conformance": { ... },
    "regulatory_conformance_html": "<p>Regulatory info...</p>",
    "conformance_level_html": "<p>Conformance details...</p>"
  }
}
```

### File Storage Structure

```
server/
└── temp/
    └── cover_docx/
        └── user123/
            └── a1b2c3d4e5f6.docx  ← Real DOCX file
                                      (This exact file is:)
                                      1. Previewed
                                      2. Downloaded
```

---

## Comparison: Old vs New

### Old Approach (Removed)

```
HTML Content (10,000 chars)
         ↓
   Parse with lxml
         ↓
   Split into chunks
   - Chunk 1: 3,500 chars
   - Chunk 2: 3,500 chars  
   - Chunk 3: 3,000 chars
         ↓
   Render chunk 1
   document.add_page_break() ← Manual
   Render chunk 2
   document.add_page_break() ← Manual
   Render chunk 3
         ↓
   Save to DOCX
         ↓
   Word re-evaluates pagination
   (May disagree with our breaks!)
         ↓
   Preview shows our pagination
   Export shows Word's pagination
   ❌ Mismatch!
```

### New Approach (Current)

```
HTML Content (any length)
         ↓
   Render directly to DOCX
   (No chunking, no char limits)
         ↓
   Word handles ALL pagination
         ↓
   Save to DOCX
         ↓
   Frontend renders SAME file
         ↓
   Preview = Export
   ✅ Perfect match!
```

---

## Benefits Visualization

```
                 BEFORE              |              AFTER
═══════════════════════════════════════════════════════════════
                                     |
  Preview      Export                |   Preview      Export
  ┌──────┐    ┌──────┐              |   ┌──────┐    ┌──────┐
  │Page 1│    │Page 1│              |   │Page 1│    │Page 1│
  │500ch │    │600ch │ ← Different! |   │Real  │    │Real  │
  ├──────┤    ├──────┤              |   │DOCX  │    │DOCX  │
  │Page 2│    │Page 2│              |   │File  │    │File  │
  │3500ch│    │3400ch│ ← Different! |   │      │    │      │
  └──────┘    └──────┘              |   └──────┘    └──────┘
                                     |      ↑            ↑
  ❌ Preview ≠ Export                |      └────────────┘
                                     |      Same file!
                                     |
                                     |   ✅ Preview = Export
```

---

## Summary

### What Changed
- ❌ Removed ~160 lines of pagination logic
- ✅ Simplified to direct HTML rendering
- ✅ Preview uses actual generated DOCX

### What Stayed
- ✅ Section breaks between major sections
- ✅ All HTML rendering capabilities
- ✅ Document structure and formatting

### Result
**Preview IS the real document. What you see is literally what you get.**

