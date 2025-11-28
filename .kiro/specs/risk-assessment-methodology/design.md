# Design Document: Risk Assessment and Treatment Methodology

## Overview

This feature adds a new page for documenting the Risk Assessment and Treatment Methodology (Section 5.3.1) in the CRA Tool. The page follows the established patterns in the codebase for risk management sections, including WYSIWYG editors, table-based data entry, evidence tracking, and DOCX generation.

The page will be located under a new sidebar folder "Risk Acceptance Criteria and Risk Management Methodology" which sits after "Product Context Assessment" in the Risk Management Elements section.

## Architecture

The feature follows the existing modular architecture:

```
┌─────────────────────────────────────────────────────────────────┐
│                        Vue Page Component                        │
│              app/pages/risk/assessment-methodology.vue           │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Document Workspace Module                     │
│                  app/services/documentWorkspace/                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────────┐ │
│  │   types.ts  │ │ constants.ts│ │ defaults.ts │ │  index.ts  │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └────────────┘ │
│  ┌─────────────────────────┐ ┌─────────────────────────────────┐ │
│  │ cloners/riskMgmt...     │ │ updaters/riskMgmt...            │ │
│  └─────────────────────────┘ └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Preview Payload Builder                     │
│                    app/utils/previewPayload.ts                   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Backend API                               │
│  ┌─────────────────────────┐ ┌─────────────────────────────────┐ │
│  │ backend/app/schemas.py  │ │ backend/app/docx_builder/       │ │
│  └─────────────────────────┘ └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Frontend Components

#### Page Component: `assessment-methodology.vue`

The main page component with the following sections:

1. **Header Card** - Title, reference clause, and navigation button
2. **Risk Methodology Description Card** - WYSIWYG editor with template button
3. **Likelihood Scale Card** - Table with add/edit/delete functionality
4. **Justification Card** - WYSIWYG editor with template button
5. **Consistent Application Card** - WYSIWYG editor with template button
6. **Individual and Aggregate Risk Card** - WYSIWYG editor with template button
7. **Evidence Reference Card** - Evidence tracker component

#### Reused Components

- `RichTextEditor.vue` - TipTap-based WYSIWYG editor
- `EvidenceTracker.vue` - Evidence entry management
- `UCard`, `UTable`, `UButton`, `UModal`, `UInput` - Nuxt UI components

### State Management Interface

```typescript
// New type in types.ts
interface LikelihoodLevelEntry {
  id: string
  level: string        // e.g., "Very Low", "Low", "Medium", "High", "Very High"
  numericValue: string // e.g., "1", "2", "3", "4", "5"
  definition: string   // Description of what this level means
}

interface RiskAssessmentMethodologyState {
  methodologyDescriptionHtml: string
  likelihoodLevels: LikelihoodLevelEntry[]
  likelihoodFactorsHtml: string
  justificationHtml: string
  consistentApplicationHtml: string
  individualAggregateRiskHtml: string
  evidenceEntries: RiskEvidenceEntry[]
}
```

### Backend Schema

```python
# New schema in schemas.py
class LikelihoodLevelEntry(BaseModel):
    level: Optional[str] = None
    numeric_value: Optional[str] = None
    definition: Optional[str] = None

class RiskAssessmentMethodologySection(BaseModel):
    methodology_description_html: Optional[str] = None
    likelihood_levels: List[LikelihoodLevelEntry] = Field(default_factory=list)
    likelihood_factors_html: Optional[str] = None
    justification_html: Optional[str] = None
    consistent_application_html: Optional[str] = None
    individual_aggregate_risk_html: Optional[str] = None
    evidence_entries: List[RiskEvidenceEntry] = Field(default_factory=list)
```

## Data Models

### Likelihood Level Entry

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier (generated) |
| level | string | Level name (e.g., "Very Low") |
| numericValue | string | Numeric representation (e.g., "1") |
| definition | string | Definition of the level |

### Risk Assessment Methodology State

| Field | Type | Description |
|-------|------|-------------|
| methodologyDescriptionHtml | string | Rich text description of methodology |
| likelihoodLevels | LikelihoodLevelEntry[] | Array of likelihood scale entries |
| likelihoodFactorsHtml | string | Rich text for likelihood factors considered |
| justificationHtml | string | Rich text justification for methodology |
| consistentApplicationHtml | string | Rich text for consistent application description |
| individualAggregateRiskHtml | string | Rich text for individual/aggregate risk handling |
| evidenceEntries | RiskEvidenceEntry[] | Array of evidence references |

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: State persistence round-trip

*For any* valid RiskAssessmentMethodologyState, saving to localStorage and then loading should produce an equivalent state object.

**Validates: Requirements 1.4**

### Property 2: Likelihood scale add increases count

*For any* likelihood scale array and any valid LikelihoodLevelEntry, adding the entry should result in the array length increasing by exactly one.

**Validates: Requirements 2.2**

### Property 3: Likelihood scale edit preserves count and updates data

*For any* non-empty likelihood scale array and any valid edit to an existing entry, the array length should remain unchanged and the edited entry should contain the new values.

**Validates: Requirements 2.3**

### Property 4: Likelihood scale delete decreases count

*For any* non-empty likelihood scale array, deleting an entry should result in the array length decreasing by exactly one and the deleted entry should not be present.

**Validates: Requirements 2.4**

### Property 5: Evidence add creates complete record

*For any* valid evidence data (title, referenceId, description, status), adding an evidence entry should create a record containing all provided fields with the correct section key.

**Validates: Requirements 3.2**

### Property 6: Evidence entries appear in evidence list with correct section

*For any* non-empty evidence entries in the risk assessment methodology state, querying the evidence list should return entries with section key `risk-assessment-methodology`.

**Validates: Requirements 3.4**

### Property 7: Payload builder includes likelihood scale as array

*For any* non-empty likelihood scale, the buildRiskManagementPayload function should include the likelihood_levels array in the output with all entries.

**Validates: Requirements 4.3**

## Error Handling

### Frontend Error Handling

1. **localStorage Errors**: Wrap localStorage operations in try-catch, log errors, and continue with in-memory state
2. **Invalid State Migration**: If loaded state is missing new fields, merge with defaults
3. **Empty Table Operations**: Disable delete button when table is empty
4. **Form Validation**: Prevent adding likelihood levels with empty required fields

### Backend Error Handling

1. **Missing Optional Fields**: All fields are optional with sensible defaults
2. **Invalid HTML Content**: Sanitize HTML before rendering in DOCX
3. **Empty Sections**: Skip section in DOCX output if no content exists

## Testing Strategy

### Dual Testing Approach

This feature uses both unit tests and property-based tests for comprehensive coverage:

- **Unit tests** verify specific examples, edge cases, and integration points
- **Property-based tests** verify universal properties that should hold across all inputs

### Property-Based Testing

**Library**: Vitest with `fast-check` for property-based testing

**Configuration**: Each property test runs a minimum of 100 iterations.

**Test File Location**: `app/services/documentWorkspace/__tests__/riskAssessmentMethodology.test.ts`

**Property Test Format**:
```typescript
// **Feature: risk-assessment-methodology, Property 1: State persistence round-trip**
test.prop([riskAssessmentMethodologyStateArb], { numRuns: 100 })(
  'state round-trip preserves data',
  (state) => {
    // Test implementation
  }
)
```

### Unit Tests

Unit tests cover:
- Page component rendering with all sections
- Template insertion functionality
- Modal open/close behavior
- Navigation integration
- DOCX builder section output

### Test Coverage Requirements

1. All correctness properties must have corresponding property-based tests
2. Each property test must be tagged with the format: `**Feature: risk-assessment-methodology, Property {number}: {property_text}**`
3. Property tests must run minimum 100 iterations
