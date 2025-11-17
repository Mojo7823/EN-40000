"""Cover page document builder."""
import uuid
from pathlib import Path
from docx import Document
from docx.enum.text import WD_PARAGRAPH_ALIGNMENT
from docx.shared import Mm, Pt

from ..utils.formatters import format_cover_date


def build_cover_document(
    payload,
    image_file: Path = None,
    output_dir: Path = None
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
    
    # Add image if provided
    if image_file:
        image_paragraph = document.add_paragraph()
        image_paragraph.alignment = WD_PARAGRAPH_ALIGNMENT.CENTER
        run = image_paragraph.add_run()
        run.add_picture(str(image_file), width=Mm(120))
        image_paragraph.space_after = Pt(12)
    
    # Add title
    title_text = payload.title.strip() if payload.title else "CRA Documentation Title"
    title_paragraph = document.add_paragraph()
    title_paragraph.alignment = WD_PARAGRAPH_ALIGNMENT.CENTER
    title_run = title_paragraph.add_run(title_text)
    title_run.font.size = Pt(24)
    title_run.font.bold = True
    title_paragraph.space_after = Pt(12)
    
    # Add description
    if payload.description:
        description_paragraph = document.add_paragraph(payload.description.strip())
        description_paragraph.alignment = WD_PARAGRAPH_ALIGNMENT.CENTER
        description_paragraph.space_after = Pt(18)
    
    # Add metadata
    info_items = [
        ("Version", payload.version.strip() if payload.version else "—"),
        ("Revision", payload.revision.strip() if payload.revision else "—"),
        ("Manufacturer/Laboratory", payload.manufacturer.strip() if payload.manufacturer else "—"),
        ("Date", format_cover_date(payload.date)),
    ]
    
    for label, value in info_items:
        paragraph = document.add_paragraph()
        paragraph.space_after = Pt(6)
        run_label = paragraph.add_run(f"{label}: ")
        run_label.font.bold = True
        paragraph.add_run(value)
    
    # Save document
    filename = f"{uuid.uuid4().hex}.docx"
    output_path = output_dir / filename
    document.save(str(output_path))
    return output_path


def add_cover_to_document(document: Document, cover_data: dict, image_file: Path = None):
    """
    Add cover page content to an existing document.
    
    Args:
        document: python-docx Document object
        cover_data: Dictionary with cover page data
        image_file: Optional path to cover image file
    """
    # Add cover image if present
    if image_file:
        image_paragraph = document.add_paragraph()
        image_paragraph.alignment = WD_PARAGRAPH_ALIGNMENT.CENTER
        run = image_paragraph.add_run()
        run.add_picture(str(image_file), width=Mm(120))
        image_paragraph.space_after = Pt(12)
    
    # Add cover title
    title_text = cover_data.get("title", "").strip() or "CRA Documentation Title"
    title_paragraph = document.add_paragraph()
    title_paragraph.alignment = WD_PARAGRAPH_ALIGNMENT.CENTER
    title_run = title_paragraph.add_run(title_text)
    title_run.font.size = Pt(24)
    title_run.font.bold = True
    title_paragraph.space_after = Pt(12)
    
    # Add cover description
    if cover_data.get("description"):
        description_paragraph = document.add_paragraph(cover_data["description"].strip())
        description_paragraph.alignment = WD_PARAGRAPH_ALIGNMENT.CENTER
        description_paragraph.space_after = Pt(18)
    
    # Add cover metadata
    info_items = [
        ("Version", cover_data.get("version", "").strip() or "—"),
        ("Revision", cover_data.get("revision", "").strip() or "—"),
        ("Manufacturer/Laboratory", cover_data.get("manufacturer", "").strip() or "—"),
        ("Date", format_cover_date(cover_data.get("date"))),
    ]
    
    for label, value in info_items:
        paragraph = document.add_paragraph()
        paragraph.space_after = Pt(6)
        run_label = paragraph.add_run(f"{label}: ")
        run_label.font.bold = True
        paragraph.add_run(value)
    
    # Add page break after cover
    document.add_page_break()
