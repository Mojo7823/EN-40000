"""Image handling utilities for base64 decoding and path resolution."""
import base64
from pathlib import Path
from typing import Optional
from fastapi import HTTPException


def decode_base64_image(src: str) -> Optional[bytes]:
    """
    Decode base64-encoded image data from data URI.
    
    Args:
        src: Data URI string (e.g., 'data:image/png;base64,...')
        
    Returns:
        Decoded image bytes, or None if invalid format
    """
    if not src:
        return None
    
    if src.startswith("data:image"):
        try:
            header, data = src.split(",", 1)
        except ValueError:
            return None
        if ";base64" not in header:
            return None
        try:
            return base64.b64decode(data)
        except Exception:
            return None
    
    return None


def resolve_uploaded_image_path(
    image_path: Optional[str], 
    user_id: str, 
    upload_dir_getter
) -> Optional[Path]:
    """
    Resolve and validate uploaded image path.
    
    Args:
        image_path: Web path to image (e.g., '/cover/uploads/{user_id}/image.png')
        user_id: User identifier
        upload_dir_getter: Callable to get upload directory for user
        
    Returns:
        Resolved file path, or None if no image
        
    Raises:
        HTTPException: If image reference is invalid or file not found
    """
    if not image_path:
        return None
    
    expected_prefix = f"/cover/uploads/{user_id}/"
    if not image_path.startswith(expected_prefix):
        raise HTTPException(
            status_code=400, 
            detail="Invalid image reference for preview generation"
        )
    
    filename = Path(image_path).name
    upload_dir = upload_dir_getter(user_id, create=False)
    image_file = upload_dir / filename
    
    if not image_file.exists():
        raise HTTPException(
            status_code=400, 
            detail="Referenced cover image could not be found"
        )
    
    return image_file
