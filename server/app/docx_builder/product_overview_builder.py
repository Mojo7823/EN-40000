"""Product Overview section rendering."""
from typing import Any

from docx import Document
from docx.shared import Pt

from .html_converter import append_html_to_document

DESCRIPTION_PLACEHOLDER = (
    "[Provide a detailed description of the product highlighting physical, software, connectivity, user interface, and data processing characteristics.]"
)


def append_product_overview_section(document: Document, overview_data: Any):
    """Append Section 2 - Product Overview."""
    document.add_page_break()

    heading = document.add_paragraph()
    heading_run = heading.add_run("2. Product Overview")
    heading_run.font.size = Pt(20)
    heading_run.font.bold = True
    heading.space_after = Pt(10)

    sub_heading = document.add_paragraph()
    sub_run = sub_heading.add_run("2.1 Product Description")
    sub_run.font.size = Pt(18)
    sub_run.font.bold = True
    sub_heading.space_after = Pt(6)

    reference = document.add_paragraph("[Reference: Clause 6.2 - Product Context]")
    reference.runs[0].font.bold = True
    reference.space_after = Pt(10)

    intro = document.add_paragraph(
        "Provide a detailed description of the product, including the following areas as applicable:"
    )
    intro.runs[0].font.italic = True
    intro.space_after = Pt(10)

    _add_guidance_line(document, "Physical Characteristics", "Describe hardware components, form factor, interfaces.")
    _add_guidance_line(document, "Software Characteristics", "Describe software architecture, programming languages, frameworks.")
    _add_guidance_line(document, "Network Connectivity", "Describe network capabilities, protocols, communication mechanisms.")
    _add_guidance_line(document, "User Interface", "Describe how users interact with the product (GUI, API, CLI, physical controls).")
    _add_guidance_line(document, "Data Processing", "Describe what types of data the product processes, stores, or transmits.")

    description_html = _get_overview_value(overview_data, "product_description_html")
    if description_html:
        append_html_to_document(document, description_html)
    else:
        placeholder = document.add_paragraph(DESCRIPTION_PLACEHOLDER)
        placeholder.runs[0].font.italic = True


def _add_guidance_line(document: Document, title: str, description: str):
    paragraph = document.add_paragraph()
    title_run = paragraph.add_run(f"{title}: ")
    title_run.font.bold = True
    detail_run = paragraph.add_run(description)
    detail_run.font.italic = True
    paragraph.space_after = Pt(4)


def _get_overview_value(source: Any, key: str) -> str:
    if not source:
        return ""
    if isinstance(source, dict):
        value = source.get(key)
    else:
        value = getattr(source, key, None)
    if value is None:
        return ""
    return str(value).strip()
