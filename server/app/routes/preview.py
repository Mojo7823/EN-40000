"""Document preview generation endpoints."""
import shutil
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from ..config import (
    SFR_DOCX_ROOT, SAR_DOCX_ROOT, SPD_DOCX_ROOT, SO_DOCX_ROOT,
    TSS_DOCX_ROOT, ST_INTRO_DOCX_ROOT, FINAL_DOCX_ROOT, COVER_UPLOAD_ROOT
)
from ..utils.validators import get_user_directory
from ..utils.image_handler import resolve_uploaded_image_path
from ..docx_builder.section_builders import build_html_preview_document, build_tss_preview_document
from ..docx_builder.st_intro_builder import build_st_intro_combined_document
from ..docx_builder.final_builder import build_final_combined_document
from ..schemas import HtmlPreviewRequest, STIntroPreviewRequest, FinalPreviewRequest


router = APIRouter()


# Helper function for image resolution
def get_upload_dir(user_id: str, create: bool = False):
    """Get user upload directory."""
    return get_user_directory(COVER_UPLOAD_ROOT, user_id, create=create)


# SFR Preview Endpoints
@router.post("/security/sfr/preview")
async def generate_sfr_preview(payload: HtmlPreviewRequest):
    """Generate Security Functional Requirements preview."""
    output_dir = get_user_directory(SFR_DOCX_ROOT, payload.user_id, create=True)
    output_path = build_html_preview_document(
        payload.html_content, 
        payload.user_id, 
        output_dir
    )
    return {
        "status": "ready",
        "filename": output_path.name,
        "path": f"/security/sfr/preview/{payload.user_id}/{output_path.name}",
    }


@router.get("/security/sfr/preview/{user_id}/{filename}")
async def download_sfr_preview(user_id: str, filename: str):
    """Download SFR preview document."""
    docx_dir = get_user_directory(SFR_DOCX_ROOT, user_id, create=False)
    file_path = docx_dir / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Preview file not found")
    
    return FileResponse(
        path=str(file_path),
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename=f"sfr_preview_{user_id}.docx",
    )


@router.delete("/security/sfr/preview/{user_id}")
async def cleanup_sfr_preview(user_id: str):
    """Delete SFR preview documents."""
    docx_dir = get_user_directory(SFR_DOCX_ROOT, user_id, create=False)
    if docx_dir.exists():
        shutil.rmtree(docx_dir, ignore_errors=True)
    return {"status": "deleted"}


# SAR Preview Endpoints
@router.post("/security/sar/preview")
async def generate_sar_preview(payload: HtmlPreviewRequest):
    """Generate Security Assurance Requirements preview."""
    output_dir = get_user_directory(SAR_DOCX_ROOT, payload.user_id, create=True)
    output_path = build_html_preview_document(
        payload.html_content, 
        payload.user_id, 
        output_dir
    )
    return {
        "status": "ready",
        "filename": output_path.name,
        "path": f"/security/sar/preview/{payload.user_id}/{output_path.name}",
    }


@router.get("/security/sar/preview/{user_id}/{filename}")
async def download_sar_preview(user_id: str, filename: str):
    """Download SAR preview document."""
    docx_dir = get_user_directory(SAR_DOCX_ROOT, user_id, create=False)
    file_path = docx_dir / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Preview file not found")
    
    return FileResponse(
        path=str(file_path),
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename=f"sar_preview_{user_id}.docx",
    )


@router.delete("/security/sar/preview/{user_id}")
async def cleanup_sar_preview(user_id: str):
    """Delete SAR preview documents."""
    docx_dir = get_user_directory(SAR_DOCX_ROOT, user_id, create=False)
    if docx_dir.exists():
        shutil.rmtree(docx_dir, ignore_errors=True)
    return {"status": "deleted"}


# SPD Preview Endpoints
@router.post("/spd/preview")
async def generate_spd_preview(payload: HtmlPreviewRequest):
    """Generate Security Problem Definition preview."""
    output_dir = get_user_directory(SPD_DOCX_ROOT, payload.user_id, create=True)
    output_path = build_html_preview_document(
        payload.html_content, 
        payload.user_id, 
        output_dir
    )
    return {
        "status": "ready",
        "filename": output_path.name,
        "path": f"/spd/preview/{payload.user_id}/{output_path.name}",
    }


@router.get("/spd/preview/{user_id}/{filename}")
async def download_spd_preview(user_id: str, filename: str):
    """Download SPD preview document."""
    docx_dir = get_user_directory(SPD_DOCX_ROOT, user_id, create=False)
    file_path = docx_dir / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Preview file not found")
    
    return FileResponse(
        path=str(file_path),
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename=f"spd_preview_{user_id}.docx",
    )


@router.delete("/spd/preview/{user_id}")
async def cleanup_spd_preview(user_id: str):
    """Delete SPD preview documents."""
    docx_dir = get_user_directory(SPD_DOCX_ROOT, user_id, create=False)
    if docx_dir.exists():
        shutil.rmtree(docx_dir, ignore_errors=True)
    return {"status": "deleted"}


# Security Objectives Preview Endpoints
@router.post("/so/preview")
async def generate_security_objectives_preview(payload: HtmlPreviewRequest):
    """Generate Security Objectives preview."""
    output_dir = get_user_directory(SO_DOCX_ROOT, payload.user_id, create=True)
    output_path = build_html_preview_document(
        payload.html_content, 
        payload.user_id, 
        output_dir
    )
    return {
        "status": "ready",
        "filename": output_path.name,
        "path": f"/so/preview/{payload.user_id}/{output_path.name}",
    }


@router.get("/so/preview/{user_id}/{filename}")
async def download_so_preview(user_id: str, filename: str):
    """Download Security Objectives preview document."""
    docx_dir = get_user_directory(SO_DOCX_ROOT, user_id, create=False)
    file_path = docx_dir / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Preview file not found")
    
    return FileResponse(
        path=str(file_path),
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename=f"so_preview_{user_id}.docx",
    )


@router.delete("/so/preview/{user_id}")
async def cleanup_security_objectives_preview(user_id: str):
    """Delete Security Objectives preview documents."""
    docx_dir = get_user_directory(SO_DOCX_ROOT, user_id, create=False)
    if docx_dir.exists():
        shutil.rmtree(docx_dir, ignore_errors=True)
    return {"status": "deleted"}


# TSS Preview Endpoints
@router.post("/tss/preview")
async def generate_tss_preview(payload: HtmlPreviewRequest):
    """Generate Product Summary Specification (TSS) preview."""
    output_dir = get_user_directory(TSS_DOCX_ROOT, payload.user_id, create=True)
    output_path = build_tss_preview_document(
        payload.html_content, 
        payload.user_id, 
        output_dir
    )
    return {
        "status": "ready",
        "filename": output_path.name,
        "path": f"/tss/preview/{payload.user_id}/{output_path.name}",
    }


@router.get("/tss/preview/{user_id}/{filename}")
async def download_tss_preview(user_id: str, filename: str):
    """Download TSS preview document."""
    docx_dir = get_user_directory(TSS_DOCX_ROOT, user_id, create=False)
    file_path = docx_dir / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Preview file not found")
    
    return FileResponse(
        path=str(file_path),
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename=f"tss_preview_{user_id}.docx",
    )


@router.delete("/tss/preview/{user_id}")
async def cleanup_tss_preview(user_id: str):
    """Delete TSS preview documents."""
    docx_dir = get_user_directory(TSS_DOCX_ROOT, user_id, create=False)
    if docx_dir.exists():
        shutil.rmtree(docx_dir, ignore_errors=True)
    return {"status": "deleted"}


# ST Introduction Preview Endpoints
@router.post("/st-intro/preview")
async def generate_st_intro_preview(payload: STIntroPreviewRequest):
    """Generate CRA Documentation Introduction preview."""
    image_file = None
    if payload.cover_data and payload.cover_data.get("image_path"):
        try:
            image_file = resolve_uploaded_image_path(
                payload.cover_data["image_path"],
                payload.user_id,
                get_upload_dir
            )
        except Exception:
            pass  # Continue without image
    
    output_dir = get_user_directory(ST_INTRO_DOCX_ROOT, payload.user_id, create=True)
    output_path = build_st_intro_combined_document(payload, image_file, output_dir)
    
    return {
        "status": "ready",
        "filename": output_path.name,
        "path": f"/st-intro/preview/{payload.user_id}/{output_path.name}",
    }


@router.get("/st-intro/preview/{user_id}/{filename}")
async def download_st_intro_preview(user_id: str, filename: str):
    """Download ST Introduction preview document."""
    docx_dir = get_user_directory(ST_INTRO_DOCX_ROOT, user_id, create=False)
    file_path = docx_dir / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Preview file not found")
    
    return FileResponse(
        path=str(file_path),
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename=f"st_intro_preview_{user_id}.docx",
    )


@router.delete("/st-intro/preview/{user_id}")
async def cleanup_st_intro_preview(user_id: str):
    """Delete ST Introduction preview documents."""
    docx_dir = get_user_directory(ST_INTRO_DOCX_ROOT, user_id, create=False)
    if docx_dir.exists():
        shutil.rmtree(docx_dir, ignore_errors=True)
    return {"status": "deleted"}


# Final Preview Endpoints
@router.post("/final-preview")
async def generate_final_preview(payload: FinalPreviewRequest):
    """Generate complete final CRA Documentation."""
    image_file = None
    if payload.cover_data and payload.cover_data.get("image_path"):
        try:
            image_file = resolve_uploaded_image_path(
                payload.cover_data["image_path"],
                payload.user_id,
                get_upload_dir
            )
        except Exception:
            pass  # Continue without image
    
    output_dir = get_user_directory(FINAL_DOCX_ROOT, payload.user_id, create=True)
    output_path = build_final_combined_document(payload, image_file, output_dir)
    
    return {
        "status": "ready",
        "filename": output_path.name,
        "path": f"/final-preview/download/{payload.user_id}/{output_path.name}",
    }


@router.delete("/final-preview/{user_id}")
async def cleanup_final_preview(user_id: str):
    """Delete final preview documents."""
    docx_dir = get_user_directory(FINAL_DOCX_ROOT, user_id, create=False)
    if docx_dir.exists():
        shutil.rmtree(docx_dir, ignore_errors=True)
    return {"status": "deleted"}


@router.get("/final-preview/download/{user_id}/{filename}")
async def download_final_preview(user_id: str, filename: str):
    """Download final preview document."""
    docx_dir = get_user_directory(FINAL_DOCX_ROOT, user_id, create=False)
    file_path = docx_dir / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Preview file not found")
    
    return FileResponse(
        path=str(file_path),
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename=f"cra_documentation_{user_id}.docx",
    )
