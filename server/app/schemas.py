"""Pydantic schemas for API request/response validation."""
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict


# Component schemas
class ComponentBase(BaseModel):
    class_name: str
    family: Optional[str] = None
    component: Optional[str] = None
    component_name: Optional[str] = None
    element: Optional[str] = None
    element_item: Optional[str] = None


class ComponentCreate(ComponentBase):
    pass


class ComponentUpdate(BaseModel):
    class_name: Optional[str] = None
    family: Optional[str] = None
    component: Optional[str] = None
    component_name: Optional[str] = None
    element: Optional[str] = None
    element_item: Optional[str] = None


class ComponentOut(ComponentBase):
    id: int
    
    model_config = ConfigDict(from_attributes=True)


# Preview request schemas
class CoverPreviewRequest(BaseModel):
    """Cover page preview request."""
    model_config = ConfigDict(populate_by_name=True)
    
    user_id: str = Field(..., alias="user_id")
    title: Optional[str] = None
    version: Optional[str] = None
    revision: Optional[str] = None
    description: Optional[str] = None
    manufacturer: Optional[str] = None
    date: Optional[str] = None
    image_path: Optional[str] = Field(None, alias="image_path")


class HtmlPreviewRequest(BaseModel):
    """Simple HTML preview request."""
    model_config = ConfigDict(populate_by_name=True)
    
    user_id: str = Field(..., alias="user_id")
    html_content: str = Field(..., alias="html_content")


class STIntroPreviewRequest(BaseModel):
    """
    Request model for CRA Documentation Introduction preview.
    
    Legacy Field Names (from Common Criteria):
    - st_reference_html: "ST" = Security Target (now: CRA Documentation Reference)
    - toe_reference_html: "TOE" = Target of Evaluation (now: Product Reference)
    - toe_overview_html: Product Overview
    - toe_description_html: Product Description
    """
    model_config = ConfigDict(populate_by_name=True)
    
    user_id: str = Field(..., alias="user_id")
    cover_data: Optional[dict] = None
    st_reference_html: Optional[str] = None  # Legacy: ST Reference (Security Target)
    toe_reference_html: Optional[str] = None  # Legacy: TOE Reference (Target of Evaluation)
    toe_overview_html: Optional[str] = None  # Product Overview
    toe_description_html: Optional[str] = None  # Product Description


class FinalPreviewRequest(BaseModel):
    """
    Request model for complete final CRA Documentation preview.
    
    Legacy Field Names (from Common Criteria):
    - st_reference_html: "ST" = Security Target (now: CRA Documentation Reference)
    - toe_reference_html: "TOE" = Target of Evaluation (now: Product Reference)
    - spd_html: Security Problem Definition
    - tss_html: "TSS" = TOE Summary Specification (now: Product Summary Specification)
    - sfr_list: "SFR" = Security Functional Requirements (now: Technical Requirements)
    - sar_list: "SAR" = Security Assurance Requirements (now: Assurance Requirements)
    - selected_eal: "EAL" = Evaluation Assurance Level (Common Criteria concept)
    """
    model_config = ConfigDict(populate_by_name=True)
    
    user_id: str = Field(..., alias="user_id")
    cover_data: Optional[dict] = None
    st_reference_html: Optional[str] = None  # Legacy: ST Reference (Security Target)
    toe_reference_html: Optional[str] = None  # Legacy: TOE Reference (Target of Evaluation)
    toe_overview_html: Optional[str] = None  # Product Overview
    toe_description_html: Optional[str] = None  # Product Description
    conformance_claims_html: Optional[str] = None
    spd_html: Optional[str] = None  # Security Problem Definition
    security_objectives_html: Optional[str] = None
    tss_html: Optional[str] = None  # Legacy: TSS (TOE Summary Specification)
    sfr_list: List[dict] = Field(default_factory=list)  # Legacy: SFR (Security Functional Requirements)
    sar_list: List[dict] = Field(default_factory=list)  # Legacy: SAR (Security Assurance Requirements)
    selected_eal: Optional[str] = None  # Legacy: EAL (Evaluation Assurance Level - Common Criteria)
    sfr_preview_html: Optional[str] = None
    sar_preview_html: Optional[str] = None
