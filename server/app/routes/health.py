"""Health check endpoint."""
import time
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from ..database import get_db


router = APIRouter()


@router.get("/health")
def health(db: Session = Depends(get_db)):
    """
    Health check endpoint.
    
    Returns database connectivity status and latency.
    """
    start = time.time()
    try:
        db.execute(text("SELECT 1"))
        db_status = "ok"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    latency_ms = int((time.time() - start) * 1000)
    
    return {
        "status": db_status,
        "latency_ms": latency_ms,
        "database_url": "unset",
        "timestamp": int(time.time()),
        "details": {},
    }
