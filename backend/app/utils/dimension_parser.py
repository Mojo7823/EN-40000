"""HTML element dimension parsing utilities."""
import re
from typing import Optional


CSS_WIDTH_RE = re.compile(r"width\s*:\s*([0-9.]+)px", re.IGNORECASE)
CSS_HEIGHT_RE = re.compile(r"height\s*:\s*([0-9.]+)px", re.IGNORECASE)


def extract_dimension_px(element, attr_name: str) -> Optional[float]:
    """
    Extract dimension (width or height) from HTML element in pixels.
    
    Checks in order:
    1. CSS style attribute
    2. Direct width/height attribute
    3. colwidth attribute (for TipTap table columns)
    
    Args:
        element: lxml HTML element
        attr_name: 'width' or 'height'
        
    Returns:
        Dimension value in pixels, or None if not found
    """
    if element is None:
        return None
    
    # Check CSS style
    style = element.get("style", "")
    regex = CSS_WIDTH_RE if attr_name == "width" else CSS_HEIGHT_RE
    match = regex.search(style)
    if match:
        try:
            return float(match.group(1))
        except (TypeError, ValueError):
            pass
    
    # Check direct attribute
    attr_value = element.get(attr_name)
    if attr_value:
        try:
            return float(attr_value)
        except (TypeError, ValueError):
            pass
    
    # Check colwidth for table columns (TipTap specific)
    # TipTap uses "colwidth" attribute (not "data-colwidth")
    if attr_name == "width":
        colwidth = element.get("colwidth") or element.get("data-colwidth")
        if colwidth:
            try:
                parts = [float(part) for part in str(colwidth).split(",") if part.strip()]
                if parts:
                    return parts[0]
            except (TypeError, ValueError):
                pass
    
    return None


def extract_table_column_widths(table_element, max_cols: int) -> list:
    """
    Extract column widths from table element.
    
    Args:
        table_element: lxml HTML table element
        max_cols: Maximum number of columns
        
    Returns:
        List of column widths in pixels (None for unspecified columns)
    """
    widths = [None] * max_cols
    
    # Check <colgroup> elements
    colgroup = table_element.find("colgroup")
    if colgroup is not None:
        for idx, col in enumerate(colgroup.findall("col")):
            if idx >= max_cols:
                break
            width_px = extract_dimension_px(col, "width")
            if width_px:
                widths[idx] = width_px
    
    # Check individual cells
    for row in table_element.findall(".//tr"):
        cells = [cell for cell in row if (cell.tag or "").lower() in {"th", "td"}]
        for idx, cell in enumerate(cells):
            if idx >= max_cols:
                break
            if widths[idx] is None:
                width_px = extract_dimension_px(cell, "width")
                if width_px:
                    widths[idx] = width_px
    
    return widths
