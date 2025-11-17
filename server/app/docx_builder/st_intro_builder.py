"""ST Introduction (CRA Documentation Introduction) document builder."""
import uuid
from pathlib import Path
from docx import Document

from .section_builders import create_base_document, add_documentation_intro_section, add_section_with_html
from .cover_builder import add_cover_to_document


def build_st_intro_combined_document(payload, image_file: Path, output_dir: Path) -> Path:
    """
    Build a combined CRA Documentation Introduction document from all sections.
    
    Note: Function name retains 'st_intro' prefix for backward compatibility.
    ST = Security Target (Common Criteria legacy term, now: CRA Documentation)
    
    Args:
        payload: STIntroPreviewRequest with all section data
        image_file: Optional path to cover image
        output_dir: Directory to save document
        
    Returns:
        Path to generated DOCX file
    """
    # Clear previous previews
    for existing in output_dir.glob("*.docx"):
        existing.unlink(missing_ok=True)
    
    document = create_base_document()
    
    # Add cover page if provided
    if payload.cover_data:
        try:
            add_cover_to_document(document, payload.cover_data, image_file)
        except Exception:
            pass  # Skip if cover generation fails
    
    # Add main Documentation Introduction section
    add_documentation_intro_section(document)
    
    # Add subsections
    if payload.st_reference_html:
        add_section_with_html(
            document,
            "1.1",
            "Documentation Reference",
            payload.st_reference_html
        )
    
    if payload.toe_reference_html:
        add_section_with_html(
            document,
            "1.2",
            "Product Reference",
            payload.toe_reference_html
        )
    
    if payload.toe_overview_html:
        add_section_with_html(
            document,
            "1.3",
            "Product Overview",
            payload.toe_overview_html
        )
    
    if payload.toe_description_html:
        add_section_with_html(
            document,
            "1.4",
            "Product Description",
            payload.toe_description_html
        )
    
    # Save document
    filename = f"{uuid.uuid4().hex}.docx"
    output_path = output_dir / filename
    document.save(str(output_path))
    return output_path
