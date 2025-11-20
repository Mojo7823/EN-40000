"""Formatting utilities for dates and text."""
from datetime import datetime
from typing import Optional


def format_cover_date(date_value: Optional[str]) -> str:
    """
    Format date string for cover page display.
    
    Args:
        date_value: ISO format date string or custom format
        
    Returns:
        Formatted date string or em dash if invalid/empty
    """
    if not date_value:
        return "—"
    
    try:
        parsed = datetime.fromisoformat(date_value)
        return parsed.strftime("%d %B %Y")
    except ValueError:
        return date_value
