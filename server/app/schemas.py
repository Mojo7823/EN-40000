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
class CoverIntroductionSection(BaseModel):
    """Document Information fields for the Introduction section."""
    product_name: Optional[str] = None
    product_version: Optional[str] = None
    product_type: Optional[str] = None
    manufacturer: Optional[str] = None
    manufacturer_address: Optional[str] = None
    status: Optional[str] = None
    prepared_by: Optional[str] = None
    reviewed_by: Optional[str] = None
    approved_by: Optional[str] = None


class PurposeScopeSection(BaseModel):
    """Purpose and Scope data for section 1.2."""
    product_name: Optional[str] = None
    scope_selections: List[str] = Field(default_factory=list)
    assessment_start: Optional[str] = None
    assessment_end: Optional[str] = None
    methodology_html: Optional[str] = None


class ProductIdentificationSection(BaseModel):
    """Product Identification data for section 1.3."""
    product_description_html: Optional[str] = None
    key_functions_html: Optional[str] = None
    target_market: Optional[str] = None


class ThirdPartyComponentEntry(BaseModel):
    component_name: Optional[str] = None
    component_type: Optional[str] = None
    version: Optional[str] = None
    supplier: Optional[str] = None
    purpose: Optional[str] = None
    license: Optional[str] = None


class ThirdPartyComponentsSection(BaseModel):
    entries: List[ThirdPartyComponentEntry] = Field(default_factory=list)
    management_approach_html: Optional[str] = None
    evidence_reference_html: Optional[str] = None


class ProductOverviewSection(BaseModel):
    """Product Overview data for section 2."""
    product_description_html: Optional[str] = None
    product_architecture_html: Optional[str] = None
    third_party_components: Optional[ThirdPartyComponentsSection] = None


class ManufacturerInformationSection(BaseModel):
    """Manufacturer Information data for section 1.4."""
    legal_entity: Optional[str] = None
    registration_number: Optional[str] = None
    address: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None


class ConformanceStandardEntrySchema(BaseModel):
    code: Optional[str] = None
    description: Optional[str] = None


class StandardsConformanceSection(BaseModel):
    primary_standard: Optional[ConformanceStandardEntrySchema] = None
    related_standards: List[ConformanceStandardEntrySchema] = Field(default_factory=list)
    include_other: bool = False
    other_notes: Optional[str] = None


class ConformanceClaimSection(BaseModel):
    standards_conformance: Optional[StandardsConformanceSection] = None
    regulatory_conformance_html: Optional[str] = None
    conformance_level_html: Optional[str] = None


class DocumentConventionTerminologyEntry(BaseModel):
    term: Optional[str] = None
    definition: Optional[str] = None
    reference: Optional[str] = None


class DocumentConventionSection(BaseModel):
    """Document Convention data for section 4."""
    terminology_entries: List[DocumentConventionTerminologyEntry] = Field(default_factory=list)
    evidence_notation_html: Optional[str] = None
    requirement_notation_html: Optional[str] = None
    assessment_verdicts_html: Optional[str] = None


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
    introduction: Optional[CoverIntroductionSection] = None
    purpose_scope: Optional[PurposeScopeSection] = None
    product_identification: Optional[ProductIdentificationSection] = None
    product_overview: Optional[ProductOverviewSection] = None
    manufacturer_information: Optional[ManufacturerInformationSection] = None
    conformance_claim: Optional[ConformanceClaimSection] = None
    document_convention: Optional[DocumentConventionSection] = None


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
