"""CSS and HTML style parsing utilities."""
import re
from typing import Optional, Dict
from docx.shared import RGBColor
from docx.enum.text import WD_PARAGRAPH_ALIGNMENT


def parse_margin_left(style: Optional[str]) -> Optional[float]:
    """
    Extract left margin value from CSS style string.
    
    Args:
        style: CSS style string (e.g., 'margin-left: 20px; color: red;')
        
    Returns:
        Margin value in points, or None if not found
    """
    if not style:
        return None
    
    match = re.search(r"margin-left\s*:\s*([0-9.]+)px", style)
    if not match:
        return None
    
    try:
        from .converters import px_to_points
        return px_to_points(float(match.group(1)))
    except ValueError:
        return None


def parse_color(value: Optional[str]) -> Optional[RGBColor]:
    """
    Parse color value from CSS string (hex or rgb format).
    
    Args:
        value: Color string (e.g., '#ff0000', 'rgb(255, 0, 0)', 'red')
        
    Returns:
        RGBColor object, or None if invalid format
    """
    if not value:
        return None
    
    color = value.strip().lower()
    
    # Handle hex colors
    if color.startswith("#"):
        hex_value = color[1:]
        # Expand shorthand hex (e.g., #f00 -> #ff0000)
        if len(hex_value) == 3:
            hex_value = "".join(ch * 2 for ch in hex_value)
        
        if len(hex_value) == 6:
            try:
                r = int(hex_value[0:2], 16)
                g = int(hex_value[2:4], 16)
                b = int(hex_value[4:6], 16)
                return RGBColor(r, g, b)
            except ValueError:
                return None
    
    # Handle rgb() colors
    elif color.startswith("rgb"):
        numbers = re.findall(r"[0-9]{1,3}", color)
        if len(numbers) >= 3:
            try:
                r, g, b = (min(255, max(0, int(num))) for num in numbers[:3])
                return RGBColor(r, g, b)
            except ValueError:
                return None
    
    return None


def collect_inline_styles(element) -> Dict[str, any]:
    """
    Collect inline styles from HTML element.
    
    Args:
        element: lxml HTML element
        
    Returns:
        Dictionary with style properties (bold, italic, underline, strike, color, size)
    """
    styles = {
        "bold": False,
        "italic": False,
        "underline": False,
        "strike": False,
        "color": None,
        "size": None,
    }
    
    tag = (element.tag or "").lower()
    
    # Tag-based styling
    if tag in {"strong", "b"}:
        styles["bold"] = True
    if tag in {"em", "i"}:
        styles["italic"] = True
    if tag in {"u", "ins"}:
        styles["underline"] = True
    if tag in {"s", "strike", "del"}:
        styles["strike"] = True
    
    # Parse inline style attribute
    style_attr = element.get("style", "")
    for rule in style_attr.split(";"):
        rule = rule.strip().lower()
        if not rule:
            continue
        
        if "bold" in rule:
            styles["bold"] = True
        if "italic" in rule:
            styles["italic"] = True
        if "underline" in rule:
            styles["underline"] = True
        if "line-through" in rule:
            styles["strike"] = True
        
        if rule.startswith("color"):
            parts = rule.split(":", 1)
            if len(parts) == 2:
                parsed = parse_color(parts[1])
                if parsed:
                    styles["color"] = parsed
    
    # Check color attribute
    color_attr = element.get("color")
    parsed_color = parse_color(color_attr)
    if parsed_color:
        styles["color"] = parsed_color
    
    return styles


def merge_styles(parent: Dict[str, any], child: Dict[str, any]) -> Dict[str, any]:
    """
    Merge parent and child styles, with child taking precedence.
    
    Args:
        parent: Parent style dictionary
        child: Child style dictionary
        
    Returns:
        Merged style dictionary
    """
    merged = parent.copy()
    
    for key, value in child.items():
        if key in {"color", "size"}:
            if value is not None:
                merged[key] = value
        elif value:
            merged[key] = True
    
    return merged


def parse_text_alignment(element) -> Optional[WD_PARAGRAPH_ALIGNMENT]:
    """
    Parse text alignment from HTML element.
    
    Args:
        element: lxml HTML element
        
    Returns:
        WD_PARAGRAPH_ALIGNMENT value or None
    """
    # Check align attribute
    align_attr = (element.get("align") or "").lower()
    if align_attr:
        if align_attr == "left":
            return WD_PARAGRAPH_ALIGNMENT.LEFT
        elif align_attr == "center":
            return WD_PARAGRAPH_ALIGNMENT.CENTER
        elif align_attr == "right":
            return WD_PARAGRAPH_ALIGNMENT.RIGHT
        elif align_attr == "justify":
            return WD_PARAGRAPH_ALIGNMENT.JUSTIFY
    
    # Check style attribute for text-align
    style_attr = element.get("style", "")
    for rule in style_attr.split(";"):
        rule = rule.strip().lower()
        if rule.startswith("text-align"):
            parts = rule.split(":", 1)
            if len(parts) == 2:
                align_value = parts[1].strip()
                if align_value == "left":
                    return WD_PARAGRAPH_ALIGNMENT.LEFT
                elif align_value == "center":
                    return WD_PARAGRAPH_ALIGNMENT.CENTER
                elif align_value == "right":
                    return WD_PARAGRAPH_ALIGNMENT.RIGHT
                elif align_value == "justify":
                    return WD_PARAGRAPH_ALIGNMENT.JUSTIFY
    
    return None


def apply_styles_to_run(run, styles: Dict[str, any]) -> None:
    """
    Apply style dictionary to a docx Run object.
    
    Args:
        run: python-docx Run object
        styles: Style dictionary
    """
    if styles.get("bold"):
        run.bold = True
    if styles.get("italic"):
        run.italic = True
    if styles.get("underline"):
        run.underline = True
    if styles.get("strike"):
        run.strike = True
    
    color = styles.get("color")
    if color:
        run.font.color.rgb = color
    
    size = styles.get("size")
    if size:
        run.font.size = size
