# Glossary - Common Criteria Legacy Terminology

This document explains legacy terminology from Common Criteria (CC) that appears in the codebase. The CRA Tool was originally built for CC evaluation and has been adapted for CRA (Cyber Resilience Act) compliance.

## Overview

The CRA Tool codebase contains references to Common Criteria terminology because it was originally developed as the "Common Criteria Generation Tool" (CCGenTool). While the application has been rebranded and adapted for CRA compliance, many variable names, database tables, and API endpoints retain their original names for backward compatibility.

## Common Criteria → CRA Terminology Mapping

### Core Documents

| Common Criteria Term | Abbreviation | CRA Equivalent | Description |
|---------------------|--------------|----------------|-------------|
| **Security Target** | ST | CRA Documentation | The main security documentation describing the product and its security features |
| **Target of Evaluation** | TOE | Product | The system, product, or component being evaluated for security |
| **Protection Profile** | PP | Security Profile | A reusable set of security requirements for a product type |

### Requirements Categories

| Common Criteria Term | Abbreviation | CRA Equivalent | Description |
|---------------------|--------------|----------------|-------------|
| **Security Functional Requirements** | SFR | Technical Requirements | Requirements that define security functions the product must implement |
| **Security Assurance Requirements** | SAR | Assurance Requirements | Requirements that define how security is verified and validated |
| **Evaluation Assurance Level** | EAL | Assurance Level | A package of assurance requirements (EAL1-EAL7 in CC) |

### Document Sections

| Common Criteria Term | Abbreviation | CRA Equivalent | Description |
|---------------------|--------------|----------------|-------------|
| **TOE Summary Specification** | TSS | Product Summary Specification | Describes how the product meets security requirements |
| **Security Problem Definition** | SPD | Security Problem Definition | Describes threats, assumptions, and organizational policies |
| **ST Introduction** | ST Intro | Documentation Introduction | Opening section identifying the product and documentation |
| **TOE Security Functions** | TSF | Product Security Functions | The security features implemented by the product |

## Where Legacy Terms Appear

### Backend (Python/FastAPI)

#### Models (`server/app/models.py`)
- **Table names**: `fau_db`, `fcs_db`, `fia_db`, etc. - Based on CC functional families
- **Table structure**: `ComponentFamilyBase` - Organized by CC family structure

#### API Endpoints (`server/app/main.py`)
- `/security/sfr/preview` - SFR = Security Functional Requirements
- `/security/sar/preview` - SAR = Security Assurance Requirements  
- `/st-intro/preview` - ST = Security Target
- `/tss/preview` - TSS = TOE Summary Specification

#### Request Models (`server/app/main.py`)
- `STIntroPreviewRequest` - ST = Security Target
- `st_reference_html` - ST Reference section
- `toe_reference_html` - TOE = Target of Evaluation
- `toe_overview_html` - TOE Overview
- `toe_description_html` - TOE Description
- `tss_html` - TSS = TOE Summary Specification
- `sfr_list` - SFR list
- `sar_list` - SAR list
- `selected_eal` - EAL = Evaluation Assurance Level

#### Environment Variables
- `SFR_DOCX_DIR` - SFR document directory
- `SAR_DOCX_DIR` - SAR document directory
- `ST_INTRO_DOCX_DIR` - ST Introduction directory
- `TSS_DOCX_DIR` - TSS directory

### Database Tables

#### Functional Requirements Families (11 tables)

These organize security functional requirements by Common Criteria family:

| Table | Family Code | Description |
|-------|-------------|-------------|
| `fau_db` | FAU | Security audit |
| `fco_db` | FCO | Communication |
| `fcs_db` | FCS | Cryptographic support |
| `fdp_db` | FDP | User data protection |
| `fia_db` | FIA | Identification and authentication |
| `fmt_db` | FMT | Security management |
| `fpr_db` | FPR | Privacy |
| `fpt_db` | FPT | Protection of the TSF (TOE Security Functions) |
| `fru_db` | FRU | Resource utilisation |
| `fta_db` | FTA | TOE access |
| `ftp_db` | FTP | Trusted path/channels |

#### Assurance Requirements Families (8 tables)

These organize security assurance requirements by Common Criteria family:

| Table | Family Code | Description |
|-------|-------------|-------------|
| `aco_db` | ACO | Composition |
| `adv_db` | ADV | Development |
| `agd_db` | AGD | Guidance documents |
| `alc_db` | ALC | Life-cycle support |
| `ape_db` | APE | Protection Profile evaluation |
| `ase_db` | ASE | Security Target evaluation (now: CRA Documentation) |
| `ate_db` | ATE | Tests |
| `ava_db` | AVA | Vulnerability assessment |

### Frontend (Vue/TypeScript)

Legacy references in the frontend are minimal as most have been updated to CRA terminology. Any remaining references are typically in:
- API service calls matching backend endpoints
- Form field names corresponding to backend models
- Storage keys for persisting data

## Common Criteria Background

### What is Common Criteria?

Common Criteria (officially ISO/IEC 15408) is an international standard for computer security certification. It provides:
- A framework for specifying security requirements
- A methodology for evaluating products against those requirements
- Assurance levels (EAL1-EAL7) indicating evaluation rigor

### Why These Terms?

The hierarchical organization (Class → Family → Component → Element) comes from the Common Criteria structure:

```
Security Functional Class (e.g., FCS - Cryptographic Support)
  └─ Family (e.g., FCS_COP - Cryptographic Operation)
      └─ Component (e.g., FCS_COP.1 - Cryptographic operation)
          └─ Elements (e.g., FCS_COP.1.1, FCS_COP.1.2)
```

This structure is retained in the database schema for compatibility with existing CC-based workflows.

## Developer Notes

### Why Not Rename Everything?

1. **Backward Compatibility**: Existing data and integrations depend on these names
2. **Database Migration**: Renaming 20+ tables and all relationships is risky
3. **API Stability**: External systems may call these endpoints
4. **Gradual Transition**: Comments and documentation provide clarity during transition

### How to Interpret Legacy Code

When you see:
- **SFR** → Think "Technical Requirements"
- **SAR** → Think "Assurance Requirements"
- **ST** → Think "CRA Documentation"
- **TOE** → Think "Product"
- **TSS** → Think "Product Summary Specification"
- **EAL** → Think "Assurance Level" (less relevant for CRA)

### Future Work

Consider these improvements for full CRA alignment:
1. Create database views with CRA-friendly names
2. Add API endpoint aliases (keep old ones for compatibility)
3. Gradually update frontend to use new terminology
4. Document migration path for external integrations

## References

- **Common Criteria**: [https://www.commoncriteriaportal.org/](https://www.commoncriteriaportal.org/)
- **ISO/IEC 15408**: The official Common Criteria standard
- **CRA (EU Cyber Resilience Act)**: The new regulation this tool now targets
- **Project History**: See `TRANSFORMATION_COMPLETE.md` for transformation details

## Quick Reference Card

Print this for your desk:

```
╔══════════════════════════════════════════════════════╗
║  Common Criteria → CRA Quick Reference              ║
╠══════════════════════════════════════════════════════╣
║  ST (Security Target)        → CRA Documentation    ║
║  TOE (Target of Evaluation)  → Product              ║
║  SFR (Security Functional)   → Technical Req.       ║
║  SAR (Security Assurance)    → Assurance Req.       ║
║  TSS (TOE Summary Spec)      → Product Summary      ║
║  TSF (TOE Security Functions)→ Product Security     ║
║  EAL (Evaluation Level)      → Assurance Level      ║
╚══════════════════════════════════════════════════════╝
```
