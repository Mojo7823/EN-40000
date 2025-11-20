"""User ID validation and directory path utilities."""
import re
from pathlib import Path
from fastapi import HTTPException


USER_ID_PATTERN = re.compile(r"^[A-Za-z0-9_-]{1,64}$")


def validate_user_id(user_id: str) -> None:
    """
    Validate user ID format.
    
    Args:
        user_id: The user identifier to validate
        
    Raises:
        HTTPException: If user_id format is invalid
    """
    if not USER_ID_PATTERN.match(user_id):
        raise HTTPException(status_code=400, detail="Invalid user identifier")


def get_user_directory(root: Path, user_id: str, *, create: bool = False) -> Path:
    """
    Get user-specific directory path.
    
    Args:
        root: Root directory path
        user_id: User identifier
        create: Whether to create the directory if it doesn't exist
        
    Returns:
        Path to user directory
        
    Raises:
        HTTPException: If user_id format is invalid
    """
    validate_user_id(user_id)
    
    user_dir = root / user_id
    if create:
        user_dir.mkdir(parents=True, exist_ok=True)
    return user_dir
