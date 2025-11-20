"""Unit conversion utilities."""


def px_to_points(px_value: float) -> float:
    """
    Convert pixels to points.
    
    Approximate conversion assuming 96px = 72pt
    
    Args:
        px_value: Value in pixels
        
    Returns:
        Value in points
    """
    return px_value * 0.75


def px_to_mm(px: float) -> float:
    """
    Convert pixels to millimeters.
    
    Args:
        px: Value in pixels
        
    Returns:
        Value in millimeters
    """
    return px * 0.264583
