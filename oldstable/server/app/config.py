"""Application configuration and constants."""
import os
import tempfile
from pathlib import Path


# Directory paths for file uploads and document generation
# Legacy naming conventions from Common Criteria:
# SFR = Security Functional Requirements (now: Technical Requirements)
# SAR = Security Assurance Requirements (now: Assurance Requirements)  
# ST = Security Target (now: CRA Documentation)
# TSS = TOE Summary Specification (now: Product Summary Specification)

COVER_UPLOAD_ROOT = Path(
    os.getenv("COVER_UPLOAD_DIR", Path(tempfile.gettempdir()) / "cratool_cover_uploads")
)
COVER_UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)

COVER_DOCX_ROOT = Path(
    os.getenv("COVER_DOCX_DIR", Path(tempfile.gettempdir()) / "cratool_cover_docx")
)
COVER_DOCX_ROOT.mkdir(parents=True, exist_ok=True)

SFR_DOCX_ROOT = Path(
    os.getenv("SFR_DOCX_DIR", Path(tempfile.gettempdir()) / "cratool_sfr_docx")
)
SFR_DOCX_ROOT.mkdir(parents=True, exist_ok=True)

SAR_DOCX_ROOT = Path(
    os.getenv("SAR_DOCX_DIR", Path(tempfile.gettempdir()) / "cratool_sar_docx")
)
SAR_DOCX_ROOT.mkdir(parents=True, exist_ok=True)

ST_INTRO_DOCX_ROOT = Path(
    os.getenv("ST_INTRO_DOCX_DIR", Path(tempfile.gettempdir()) / "cratool_stintro_docx")
)
ST_INTRO_DOCX_ROOT.mkdir(parents=True, exist_ok=True)

SPD_DOCX_ROOT = Path(
    os.getenv("SPD_DOCX_DIR", Path(tempfile.gettempdir()) / "cratool_spd_docx")
)
SPD_DOCX_ROOT.mkdir(parents=True, exist_ok=True)

SO_DOCX_ROOT = Path(
    os.getenv("SO_DOCX_DIR", Path(tempfile.gettempdir()) / "cratool_so_docx")
)
SO_DOCX_ROOT.mkdir(parents=True, exist_ok=True)

TSS_DOCX_ROOT = Path(
    os.getenv("TSS_DOCX_DIR", Path(tempfile.gettempdir()) / "cratool_tss_docx")
)
TSS_DOCX_ROOT.mkdir(parents=True, exist_ok=True)

FINAL_DOCX_ROOT = Path(
    os.getenv("FINAL_DOCX_DIR", Path(tempfile.gettempdir()) / "cratool_final_docx")
)
FINAL_DOCX_ROOT.mkdir(parents=True, exist_ok=True)


# CORS configuration
CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS", 
    "http://localhost:5173,http://127.0.0.1:5173"
).split(",")

CORS_ORIGIN_REGEX = os.getenv("CORS_ORIGIN_REGEX", None)
