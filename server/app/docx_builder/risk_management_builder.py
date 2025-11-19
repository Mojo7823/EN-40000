"""Risk Management Elements section builder."""
from typing import Optional

from docx import Document
from docx.shared import Pt

from .html_converter import append_html_to_document


def append_risk_management_section(document: Document, payload: Optional[object]) -> None:
    """Append Section 5 - Risk Management Elements to the document."""
    if not payload:
        return

    general_html = _extract_value(payload, "general_approach_html")
    if not general_html:
        return

    heading = document.add_heading("5. RISK MANAGEMENT ELEMENTS", level=1)
    heading.paragraph_format.space_before = Pt(24)
    heading.paragraph_format.space_after = Pt(4)
    heading.paragraph_format.page_break_before = True

    reference = document.add_paragraph("[Reference: Clause 6.1 - General]")
    reference.style = "Quote"
    reference.paragraph_format.space_after = Pt(10)

    subheading = document.add_heading("5.1 General Approach to Risk Management", level=2)
    subheading.paragraph_format.space_before = Pt(6)
    subheading.paragraph_format.space_after = Pt(4)

    clause_reference = document.add_paragraph("[Reference: Clause 5 - Risk Management Elements]")
    clause_reference.style = "Quote"
    clause_reference.paragraph_format.space_after = Pt(8)

    summary = document.add_paragraph(
        "The following summarizes the documented approach to managing cybersecurity risks throughout the product lifecycle:"
    )
    summary.paragraph_format.space_after = Pt(12)

    append_html_to_document(document, general_html)


def _extract_value(payload: object, field: str) -> Optional[str]:
    if isinstance(payload, dict):
        value = payload.get(field)
    else:
        value = getattr(payload, field, None)
    if value and isinstance(value, str) and value.strip():
        return value
    return None
