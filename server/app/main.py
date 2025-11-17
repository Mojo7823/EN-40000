"""
CRA Tool API - Main application entry point.

This file has been refactored into smaller, more maintainable modules.
See the following directories for implementation:
- app/routes/ - API endpoint handlers
- app/docx_builder/ - Document generation logic
- app/utils/ - Utility functions
"""
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .database import Base, engine
from .config import CORS_ORIGINS, CORS_ORIGIN_REGEX

# Import routers
from .routes.health import router as health_router
from .routes.components import router as components_router
from .routes.cover import router as cover_router
from .routes.preview import router as preview_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager - handles startup and shutdown."""
    # Startup: Create database tables
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown (if needed in future)


# Initialize FastAPI application
app = FastAPI(
    title="CRA Tool API",
    description="API for CRA (Cyber Resilience Act) Documentation Tool",
    version="1.0.0",
    lifespan=lifespan
)


# Configure CORS
cors_kwargs = dict(
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if CORS_ORIGIN_REGEX:
    app.add_middleware(
        CORSMiddleware,
        allow_origin_regex=CORS_ORIGIN_REGEX,
        **cors_kwargs,
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=CORS_ORIGINS,
        **cors_kwargs,
    )


# Include routers
app.include_router(health_router, tags=["Health"])
app.include_router(components_router, tags=["Components"])
app.include_router(cover_router, prefix="/cover", tags=["Cover"])
app.include_router(preview_router, tags=["Preview"])


# Mount static files if directory exists
if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static"), name="static")


# Root endpoint
@app.get("/")
def root():
    """
    Root endpoint - API information.
    
    Returns:
        API metadata
    """
    return {
        "message": "CRA Tool API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
    }
