"""Component CRUD endpoints."""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Component
from app.schemas import ComponentCreate, ComponentOut, ComponentUpdate


router = APIRouter()


@router.get("/components", response_model=List[ComponentOut])
def list_components(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    class_name: Optional[str] = Query(None),
    family: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """
    List components with optional filtering and pagination.
    
    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        class_name: Filter by class name
        family: Filter by family
        db: Database session
        
    Returns:
        List of components
    """
    query = db.query(Component)
    
    if class_name:
        query = query.filter(Component.class_name.ilike(f"%{class_name}%"))
    if family:
        query = query.filter(Component.family.ilike(f"%{family}%"))
    
    components = query.offset(skip).limit(limit).all()
    return components


@router.post("/components", response_model=ComponentOut, status_code=201)
def create_component(payload: ComponentCreate, db: Session = Depends(get_db)):
    """
    Create a new component.
    
    Args:
        payload: Component data
        db: Database session
        
    Returns:
        Created component
    """
    component = Component(**payload.model_dump())
    db.add(component)
    db.commit()
    db.refresh(component)
    return component


@router.get("/components/{item_id}", response_model=ComponentOut)
def get_component(item_id: int, db: Session = Depends(get_db)):
    """
    Get a specific component by ID.
    
    Args:
        item_id: Component ID
        db: Database session
        
    Returns:
        Component data
        
    Raises:
        HTTPException: If component not found
    """
    component = db.query(Component).filter(Component.id == item_id).first()
    if not component:
        raise HTTPException(status_code=404, detail="Component not found")
    return component


@router.put("/components/{item_id}", response_model=ComponentOut)
def update_component(
    item_id: int, 
    payload: ComponentUpdate, 
    db: Session = Depends(get_db)
):
    """
    Update an existing component.
    
    Args:
        item_id: Component ID
        payload: Updated component data
        db: Database session
        
    Returns:
        Updated component
        
    Raises:
        HTTPException: If component not found
    """
    component = db.query(Component).filter(Component.id == item_id).first()
    if not component:
        raise HTTPException(status_code=404, detail="Component not found")
    
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(component, key, value)
    
    db.commit()
    db.refresh(component)
    return component


@router.delete("/components/{item_id}", status_code=204)
def delete_component(item_id: int, db: Session = Depends(get_db)):
    """
    Delete a component.
    
    Args:
        item_id: Component ID
        db: Database session
        
    Raises:
        HTTPException: If component not found
    """
    component = db.query(Component).filter(Component.id == item_id).first()
    if not component:
        raise HTTPException(status_code=404, detail="Component not found")
    
    db.delete(component)
    db.commit()
