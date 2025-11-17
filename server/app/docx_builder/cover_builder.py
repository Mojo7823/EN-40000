"""Cover page document builder."""
import uuid
from pathlib import Path
from typing import Any, Optional
from docx import Document
from docx.enum.text import WD_PARAGRAPH_ALIGNMENT
from docx.shared import Mm, Pt

from ..utils.formatters import format_cover_date

COVER_HEADER_TEXT = "EN 40000-1-2-2025 Conformity Assessment"


def build_cover_document(
    payload,
    image_file: Optional[Path] = None,
    output_dir: Optional[Path] = None
) -> Path:
    """
    Build a cover page DOCX document.
    
    Args:
        payload: CoverPreviewRequest with cover page data
        image_file: Optional path to cover image file
        output_dir: Directory to save the document
        
    Returns:
        Path to generated DOCX file
    """
    # Clear previous previews
    for existing in output_dir.glob("*.docx"):
        existing.unlink(missing_ok=True)
    
    document = Document()
    section = document.sections[0]
    section.page_height = Mm(297)
    section.page_width = Mm(210)
    section.top_margin = Mm(20)
    section.bottom_margin = Mm(20)
    section.left_margin = Mm(25)
    section.right_margin = Mm(25)
    
    _render_cover_content(document, payload, image_file)
    
    # Save document
    filename = f"{uuid.uuid4().hex}.docx"
    output_path = output_dir / filename
    document.save(str(output_path))
    return output_path


def add_cover_to_document(document: Document, cover_data: dict, image_file: Optional[Path] = None):
    """
    Add cover page content to an existing document.
    
    Args:
        document: python-docx Document object
        cover_data: Dictionary with cover page data
        image_file: Optional path to cover image file
    """
    _render_cover_content(document, cover_data, image_file)
    
    # Add page break after cover
    document.add_page_break()


def _render_cover_content(document: Document, data: Any, image_file: Optional[Path]):
    """Render the standardized cover layout used across previews."""
    def add_centered_paragraph(
        text: str,
        *,
        size: int = 12,
        bold: bool = False,
        space_after: Pt = Pt(6),
        space_before: Optional[Pt] = None,
    ):
        paragraph = document.add_paragraph()
        paragraph.alignment = WD_PARAGRAPH_ALIGNMENT.CENTER
        if space_before is not None:
            paragraph.paragraph_format.space_before = space_before
        run = paragraph.add_run(text)
        run.font.size = Pt(size)
        run.font.bold = bold
        paragraph.space_after = space_after
        return paragraph
    
    def get_value(key: str):
        if isinstance(data, dict):
            return data.get(key)
        return getattr(data, key, None)
    
    def split_lines(value: Any):
        if not value:
            return []
        return [line.strip() for line in str(value).splitlines() if line.strip()]
    
    add_centered_paragraph(
        COVER_HEADER_TEXT,
        size=15,
        bold=True,
        space_after=Pt(28),
        space_before=Pt(18),
    )
    
    title_text = (get_value("title") or "").strip() or "CRA Documentation Title"
    add_centered_paragraph(title_text, size=28, bold=True, space_after=Pt(16))
    
    description_lines = split_lines(get_value("description"))
    for line in description_lines:
        add_centered_paragraph(line, size=14, space_after=Pt(6))
    
    add_centered_paragraph("", space_after=Pt(10))
    
    if image_file:
        image_paragraph = document.add_paragraph()
        image_paragraph.alignment = WD_PARAGRAPH_ALIGNMENT.CENTER
        run = image_paragraph.add_run()
        run.add_picture(str(image_file), width=Mm(120))
        image_paragraph.space_after = Pt(22)
    
    version_value = (get_value("version") or "").strip() or "—"
    add_centered_paragraph(f"Version: {version_value}", size=14, space_after=Pt(12))
    
    revision_value = get_value("revision")
    formatted_revision = format_cover_date(revision_value)
    add_centered_paragraph(f"Revision  : {formatted_revision}", size=14, space_after=Pt(28))
    
    # Large spacer to push the footer content toward the bottom of the page
    spacer = document.add_paragraph()
    spacer.alignment = WD_PARAGRAPH_ALIGNMENT.CENTER
    spacer.paragraph_format.space_before = Pt(200)
    
    add_centered_paragraph("Document Prepared By", size=14, bold=True, space_after=Pt(8))
    
    manufacturer_lines = split_lines(get_value("manufacturer"))
    address_lines = split_lines(get_value("laboratory_address"))
    
    if not manufacturer_lines and not address_lines:
        add_centered_paragraph("—", size=13, space_after=Pt(4))
    else:
        for line in manufacturer_lines + address_lines:
            add_centered_paragraph(line, size=13, space_after=Pt(4))
