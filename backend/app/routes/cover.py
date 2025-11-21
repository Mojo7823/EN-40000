"""Cover page upload and preview endpoints."""
import shutil
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse

from app.config import COVER_UPLOAD_ROOT, COVER_DOCX_ROOT
from app.utils.validators import get_user_directory
from app.utils.image_handler import resolve_uploaded_image_path
from app.docx_builder.cover_builder import build_cover_document
from app.schemas import CoverPreviewRequest


router = APIRouter()


@router.post("/upload")
async def upload_cover_image(
    user_id: str,
    file: UploadFile = File(...),
):
    """
    Upload a cover image for a user.
    
    Args:
        user_id: User identifier
        file: Uploaded image file
        
    Returns:
        Upload status and file path
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")
    
    upload_dir = get_user_directory(COVER_UPLOAD_ROOT, user_id, create=True)
    
    # Clear old images
    for existing in upload_dir.glob("*"):
        existing.unlink(missing_ok=True)
    
    # Save new image
    filename = file.filename or "cover_image"
    file_path = upload_dir / filename
    
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return {
        "status": "uploaded",
        "filename": filename,
        "path": f"/cover/uploads/{user_id}/{filename}",
    }


@router.post("/preview")
async def generate_cover_preview(payload: CoverPreviewRequest):
    """
    Generate cover page preview DOCX.
    
    Args:
        payload: Cover page data
        
    Returns:
        Preview file information
    """
    def get_upload_dir(uid, create=False):
        return get_user_directory(COVER_UPLOAD_ROOT, uid, create=create)
    
    image_file = resolve_uploaded_image_path(
        payload.image_path, 
        payload.user_id,
        get_upload_dir
    )
    
    output_dir = get_user_directory(COVER_DOCX_ROOT, payload.user_id, create=True)
    output_path = build_cover_document(payload, image_file, output_dir)
    
    return {
        "status": "ready",
        "filename": output_path.name,
        "path": f"/cover/preview/{payload.user_id}/{output_path.name}",
    }


@router.delete("/upload/{user_id}")
async def cleanup_cover_images(user_id: str):
    """
    Delete all uploaded cover images for a user.
    
    Args:
        user_id: User identifier
        
    Returns:
        Cleanup status
    """
    upload_dir = get_user_directory(COVER_UPLOAD_ROOT, user_id, create=False)
    
    if upload_dir.exists():
        shutil.rmtree(upload_dir, ignore_errors=True)
    
    return {"status": "deleted"}


@router.delete("/preview/{user_id}")
async def cleanup_cover_preview(user_id: str):
    """
    Delete all cover preview documents for a user.
    
    Args:
        user_id: User identifier
        
    Returns:
        Cleanup status
    """
    docx_dir = get_user_directory(COVER_DOCX_ROOT, user_id, create=False)
    
    if docx_dir.exists():
        shutil.rmtree(docx_dir, ignore_errors=True)
    
    return {"status": "deleted"}


@router.get("/preview/{user_id}/{filename}")
async def download_cover_preview(user_id: str, filename: str):
    """
    Download a cover preview document.
    
    Args:
        user_id: User identifier
        filename: Document filename
        
    Returns:
        DOCX file
        
    Raises:
        HTTPException: If file not found
    """
    docx_dir = get_user_directory(COVER_DOCX_ROOT, user_id, create=False)
    file_path = docx_dir / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Preview file not found")
    
    return FileResponse(
        path=str(file_path),
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename=f"cover_preview_{user_id}.docx",
    )
