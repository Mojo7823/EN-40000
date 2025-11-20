# Image Alignment Fix - Complete Solution

**Date:** November 17, 2024  
**Issue:** Images not respecting text-align property in DOCX generation  
**Status:** ✅ RESOLVED

---

## Problem

After implementing text alignment support for paragraphs and headings, images were still not being positioned correctly according to their `text-align` style property. Images always appeared left-aligned regardless of the alignment specified in the HTML.

---

## Root Cause Analysis

The issue had three contributing factors:

### 1. Dual Image Handlers
The code had two separate image handlers:
- **Inline handler** (line 56 in `append_inline_content`) - Handles images within paragraphs
- **Block handler** (line 324 in `append_block_element`) - Handles standalone images

### 2. Parsing Behavior
When HTML is parsed by lxml:
```python
html = '<img src="..." style="text-align: center" />'
fragment = lxml_html.fragment_fromstring(html, create_parent=True)
# Result: Creates wrapper <div> with <img> as child
# The <img> is treated as a block-level element
```

### 3. Missing Fallback Logic
When an image was wrapped in a paragraph (`<p><img /></p>`), the paragraph's alignment was used but the image's own alignment was ignored if the paragraph had no explicit alignment.

---

## Solution

Implemented a three-level fix to handle all image alignment scenarios:

### Level 1: Block-Level Image Handler

**Location:** `server/app/docx_builder/html_converter.py` line 324-353

```python
# Image (block-level)
if tag == "img":
    image_data = decode_base64_image(element.get("src", ""))
    if image_data:
        paragraph = document.add_paragraph()
        if indent:
            paragraph.paragraph_format.left_indent = Pt(indent)
        
        # Apply text alignment to center/right align images
        alignment = parse_text_alignment(element)
        if alignment is not None:
            paragraph.alignment = alignment
        
        run = paragraph.add_run()
        image_stream = BytesIO(image_data)
        # ... add picture with dimensions ...
```

**Handles:**
- Standalone `<img>` tags at block level
- Images parsed as direct children of document
- Creates dedicated paragraph with alignment

### Level 2: Inline Image Handler

**Location:** `server/app/docx_builder/html_converter.py` line 56-82

```python
# Handle images (inline)
if tag == "img":
    image_data = decode_base64_image(element.get("src", ""))
    if image_data:
        run = paragraph.add_run()
        # ... add picture to existing paragraph ...
```

**Handles:**
- Images within paragraphs (`<p><img /></p>`)
- Images inline with text
- Inherits paragraph's alignment

### Level 3: Single-Image Paragraph Detection

**Location:** `server/app/docx_builder/html_converter.py` line 227-237

```python
# Apply text alignment from paragraph
alignment = parse_text_alignment(element)
if alignment is not None:
    paragraph.alignment = alignment
else:
    # Check if paragraph contains a single image and use its alignment
    children = list(element)
    if len(children) == 1 and (children[0].tag or "").lower() == "img" and not (element.text or "").strip():
        img_alignment = parse_text_alignment(children[0])
        if img_alignment is not None:
            paragraph.alignment = img_alignment
```

**Handles:**
- Paragraphs containing only one image
- No explicit paragraph alignment
- Falls back to image's own alignment

---

## Implementation Details

### Alignment Detection Priority

For images in paragraphs, alignment is determined in this order:

1. **Paragraph alignment** - `<p style="text-align: center"><img /></p>`
2. **Image alignment** - `<p><img style="text-align: center" /></p>`
3. **Default** - Left alignment (if neither specified)

### Code Flow

```
HTML Input
    ↓
lxml parsing
    ↓
append_html_to_document()
    ↓
For each child element:
    ↓
append_block_element()
    ↓
Check element tag:
    ├─ <img> → Block handler (creates paragraph + alignment)
    ├─ <p>   → Paragraph handler
    │           ↓
    │       Check for single-image paragraph
    │           ↓
    │       append_inline_content()
    │           ↓
    │       <img> → Inline handler (adds to paragraph)
    └─ Other → Continue processing
```

---

## Test Cases

### Test 1: Standalone Images

**Input:**
```html
<img src="..." style="text-align: left" width="100" />
<img src="..." style="text-align: center" width="100" />
<img src="..." style="text-align: right" width="100" />
```

**Expected:** Three images, each aligned according to their style  
**Result:** ✅ PASS - All images aligned correctly

### Test 2: Images in Aligned Paragraphs

**Input:**
```html
<p style="text-align: center">
  <img src="..." width="100" />
</p>
```

**Expected:** Image centered (inherits paragraph alignment)  
**Result:** ✅ PASS - Image centered

### Test 3: Image with Own Alignment in Paragraph

**Input:**
```html
<p>
  <img src="..." style="text-align: right" width="100" />
</p>
```

**Expected:** Image right-aligned (uses image's alignment)  
**Result:** ✅ PASS - Image right-aligned

### Test 4: Mixed Content

**Input:**
```html
<h1 style="text-align: center">Title</h1>
<p style="text-align: left">Left text</p>
<img src="..." style="text-align: center" width="100" />
<p style="text-align: right">Right text</p>
```

**Expected:** All elements aligned according to their styles  
**Result:** ✅ PASS - All aligned correctly

### Test 5: Image with Text in Paragraph

**Input:**
```html
<p style="text-align: center">
  Some text before
  <img src="..." width="50" />
  Some text after
</p>
```

**Expected:** Entire paragraph (text + image) centered  
**Result:** ✅ PASS - Paragraph centered with image inline

---

## Technical Details

### HTML Parsing by lxml

lxml's `fragment_fromstring` behavior:

```python
# Single element
'<img src="..." />'
→ fragment: <div><img /></div>

# Multiple elements  
'<p>Text</p><img /><p>Text</p>'
→ fragment: <div><p>Text</p><img /><p>Text</p></div>

# Nested
'<p><img /></p>'
→ fragment: <div><p><img /></p></div>
```

The wrapper `<div>` is created automatically and its children are processed by `append_block_element()`.

### python-docx Alignment

Alignment in python-docx is applied at the paragraph level:

```python
from docx.enum.text import WD_PARAGRAPH_ALIGNMENT

paragraph.alignment = WD_PARAGRAPH_ALIGNMENT.LEFT
paragraph.alignment = WD_PARAGRAPH_ALIGNMENT.CENTER
paragraph.alignment = WD_PARAGRAPH_ALIGNMENT.RIGHT
paragraph.alignment = WD_PARAGRAPH_ALIGNMENT.JUSTIFY
```

Images are added as **runs** within paragraphs:
```python
run = paragraph.add_run()
run.add_picture(image_stream, width=Mm(50))
```

The image's position is controlled by the paragraph's alignment property.

---

## Files Modified

### server/app/docx_builder/html_converter.py

**Changes:**
1. Added single-image paragraph detection (lines 227-237)
2. Block-level image handler already existed but was clarified (lines 324-353)
3. Inline image handler already existed (lines 56-82)

**Total Lines Added:** ~10 lines (for single-image detection)

---

## Supported Formats

### HTML Attributes

```html
<img align="center" />
<img align="left" />
<img align="right" />
```

### CSS Styles

```html
<img style="text-align: center" />
<img style="text-align: left" />
<img style="text-align: right" />
```

### Paragraph Inheritance

```html
<p align="center"><img /></p>
<p style="text-align: right"><img /></p>
```

---

## Limitations

### Not Supported

1. **Vertical alignment** - Only horizontal alignment (left/center/right)
2. **Float properties** - CSS `float: left/right` not supported
3. **Absolute positioning** - CSS `position: absolute` not supported
4. **Flexbox/Grid** - Modern CSS layouts not supported

These limitations are inherent to the DOCX format and python-docx library.

---

## Backwards Compatibility

✅ **100% Compatible**

- No breaking changes
- Existing documents without alignment still work
- Default behavior (left align) unchanged
- New alignment features are additive

---

## Performance Impact

**Minimal** - The added logic:
- Checks element type (constant time)
- Parses style attribute (already done)
- Checks children count (O(1) for single-image check)
- No impact on documents without images

---

## Future Enhancements

### Potential Improvements

1. **Image captions** - Support for `<figure>` and `<figcaption>`
2. **Image wrapping** - Text wrapping around images
3. **Image borders** - Border styles from CSS
4. **Image effects** - Shadows, rotation, etc.
5. **Responsive images** - srcset support

---

## Related Issues

This fix completes the alignment support added in:
- [DOCX_ALIGNMENT_AND_CONTROLS.md](./DOCX_ALIGNMENT_AND_CONTROLS.md) - Text alignment
- [DOCX_PREVIEW_IMPROVEMENTS.md](./DOCX_PREVIEW_IMPROVEMENTS.md) - A4 pages

---

## Conclusion

Image alignment is now **fully functional** across all scenarios:

✅ Block-level images  
✅ Inline images in paragraphs  
✅ Single-image paragraphs  
✅ Images with text  
✅ Mixed alignments  

The DOCX preview now correctly reflects all alignment properties from the HTML editor, providing true WYSIWYG functionality.

**Status:** Complete and tested  
**Deployed:** Yes (backend restarted)
