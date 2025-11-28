import {
  buildDefaultPrimaryStandard,
  buildDefaultRelatedStandards,
  buildDefaultRegulatoryEntries,
} from '../../constants/conformance'
import {
  RISK_PRODUCT_CONTEXT_SECTION_KEY,
  RISK_PRODUCT_FUNCTION_SECTION_KEY,
  RISK_OPERATIONAL_ENVIRONMENT_SECTION_KEY,
  RISK_PRODUCT_ARCHITECTURE_SECTION_KEY,
  RISK_PRODUCT_USER_DESCRIPTION_SECTION_KEY,
} from './constants'
import type {
  CoverFormState,
  IntroductionFormState,
  PurposeScopeState,
  ProductIdentificationState,
  ManufacturerInformationState,
  ProductOverviewState,
  ThirdPartyComponentsState,
  StandardsConformanceState,
  RegulatoryConformanceState,
  ConformanceClaimState,
  DocumentConventionState,
  DocumentConventionTerminologyEntry,
  ProductContextState,
  ProductFunctionState,
  ProductOperationalEnvironmentState,
  ProductArchitectureState,
  ProductUserDescriptionState,
  ProductContextAssessmentState,
  RiskManagementState,
  DocumentWorkspaceState,
} from './types'

// ============================================================================
// Cover & Introduction Defaults
// ============================================================================

export const defaultCoverState: CoverFormState = {
  deviceName: '',
  deviceDescription: '',
  versionNumber: '',
  revisionDate: '',
  labName: '',
  labAddress: '',
  imageData: null,
  imageName: null,
  imagePath: null,
}

export const defaultIntroductionState: IntroductionFormState = {
  productName: '',
  productVersion: '',
  productType: '',
  manufacturerName: '',
  manufacturerAddress: '',
  status: '',
  preparedBy: '',
  reviewedBy: '',
  approvedBy: '',
}

// ============================================================================
// Purpose & Scope Defaults
// ============================================================================

export const defaultPurposeScopeState: PurposeScopeState = {
  scopeSelections: [],
  assessmentStart: '',
  assessmentEnd: '',
  methodologyHtml: '',
}

// ============================================================================
// Product Identification & Manufacturer Defaults
// ============================================================================

export const defaultProductIdentificationState: ProductIdentificationState = {
  productDescriptionHtml: '',
  keyFunctionsHtml: '',
  targetMarket: '',
}

export const defaultManufacturerInformationState: ManufacturerInformationState = {
  legalEntity: '',
  registrationNumber: '',
  address: '',
  contactPerson: '',
  phone: '',
}

// ============================================================================
// Product Overview Defaults
// ============================================================================

export const defaultThirdPartyComponentsState: ThirdPartyComponentsState = {
  entries: [],
  managementApproachHtml: '',
  evidenceReferenceHtml: '',
}

export const defaultProductOverviewState: ProductOverviewState = {
  productDescriptionHtml: '',
  productArchitectureHtml: '',
  thirdPartyComponents: { ...defaultThirdPartyComponentsState },
}

// ============================================================================
// Document Convention Defaults
// ============================================================================

export const defaultTerminologyEntries: DocumentConventionTerminologyEntry[] = [
  {
    id: 'term-product',
    term: 'Product with digital elements',
    definition:
      'A product or system that contains digital components or software functions which can process, transmit, or store data.',
    reference: 'Regulation (EU) 2024/2847',
  },
  {
    id: 'term-cybersecurity',
    term: 'Cybersecurity',
    definition:
      'The ability to protect devices, networks, and services from digital attacks that compromise confidentiality, integrity, or availability.',
    reference: 'prEN 40000-1-1',
  },
  {
    id: 'term-vulnerability',
    term: 'Vulnerability',
    definition:
      'A weakness in design, implementation, or operation that an attacker could exploit to compromise the product.',
    reference: 'Regulation (EU) 2024/2847',
  },
  {
    id: 'term-risk',
    term: 'Risk',
    definition:
      'The combination of the likelihood of a cybersecurity event occurring and the severity of its impact.',
    reference: 'prEN 40000-1-1',
  },
  {
    id: 'term-rdps',
    term: 'RDPS',
    definition:
      'Remote Digital Product Support services used to monitor, configure, or update the product post-deployment.',
    reference: 'EN 40000-1-2',
  },
  {
    id: 'term-sbom',
    term: 'SBOM',
    definition: 'Software Bill of Materials describing all software components within the product.',
    reference: 'ENISA SBOM requirements',
  },
  {
    id: 'term-iprfu',
    term: 'IPRFU',
    definition:
      'Installed Product Release and Field Updates covering deployed versions and corrective maintenance.',
    reference: 'Internal engineering procedure',
  },
]

export const defaultDocumentConventionState: DocumentConventionState = {
  terminologyEntries: defaultTerminologyEntries.map((entry) => ({ ...entry })),
  evidenceNotationHtml:
    '<p>Throughout this document, evidence is referenced in green using the following notation:</p><p><span style="color: #0f9d58"><strong>[EVD-XXX]</strong></span> - Evidence document reference</p><p><span style="color: #0f9d58"><strong>[DOC-XXX]</strong></span> - Supporting documentation reference</p><p><span style="color: #0f9d58"><strong>[TEST-XXX]</strong></span> - Test report reference</p><p><span style="color: #0f9d58"><strong>[ARCH-XXX]</strong></span> - Architecture documentation reference</p><p>All evidence documents are listed in <strong>Appendix A: Evidence Register</strong>.</p>',
  requirementNotationHtml:
    '<p>Requirements from EN 40000-1-2-2025 are presented in blue and italicized to distinguish them from descriptive text.</p><p><strong>Example:</strong></p><p><em><span style="color: #3b82f6">Requirement [Clause X.X.X]:</span></em></p><p><em>"The product shall..."</em></p>',
  assessmentVerdictsHtml:
    '<p>Each requirement is assessed using the following verdicts:</p><ul><li><strong><span style="color: #16a34a">PASS</span></strong> - Requirement is fully satisfied with adequate evidence</li><li><strong><span style="color: #dc2626">FAIL</span></strong> - Requirement is not satisfied</li><li><strong><span style="color: #f97316">PARTIAL</span></strong> - Requirement is partially satisfied (details provided)</li><li><strong><span style="color: #6b7280">N/A</span></strong> - Requirement is not applicable to this product</li></ul>',
}

// ============================================================================
// Conformance Claim Defaults
// ============================================================================

export function buildDefaultStandardsConformanceState(): StandardsConformanceState {
  return {
    primaryStandard: buildDefaultPrimaryStandard(),
    relatedStandards: buildDefaultRelatedStandards(),
    includeOther: false,
    otherNotes: '',
  }
}

export function buildDefaultRegulatoryConformanceState(): RegulatoryConformanceState {
  return {
    additionalRegulations: buildDefaultRegulatoryEntries(),
  }
}

export function buildDefaultConformanceClaimState(): ConformanceClaimState {
  return {
    standardsConformance: buildDefaultStandardsConformanceState(),
    regulatoryConformance: buildDefaultRegulatoryConformanceState(),
    conformanceLevel: { statuses: [], justificationHtml: '' },
  }
}

// ============================================================================
// Risk Management Defaults
// ============================================================================

export const defaultProductContextState: ProductContextState = {
  intendedPurposeHtml: '',
  specificIntendedUsesHtml: '',
  foreseeableUseHtml: '',
  evidenceEntries: [
    {
      id: `${RISK_PRODUCT_CONTEXT_SECTION_KEY}-evidence`,
      sectionKey: RISK_PRODUCT_CONTEXT_SECTION_KEY,
      title: 'Product Context Evidence Reference',
      referenceId: '',
      descriptionHtml: '',
      status: 'not_started',
    },
  ],
}

export const defaultProductFunctionState: ProductFunctionState = {
  primaryFunctionsHtml: '',
  securityFunctionsHtml: '',
  evidenceEntries: [
    {
      id: `${RISK_PRODUCT_FUNCTION_SECTION_KEY}-evidence`,
      sectionKey: RISK_PRODUCT_FUNCTION_SECTION_KEY,
      title: 'Product Functions Evidence Reference',
      referenceId: '',
      descriptionHtml: '',
      status: 'not_started',
    },
  ],
}

export const defaultOperationalEnvironmentState: ProductOperationalEnvironmentState = {
  physicalEnvironmentHtml: '',
  networkEnvironmentHtml: '',
  systemEnvironmentHtml: '',
  operationalConstraintsHtml: '',
  rdpsEnvironmentHtml: '',
  evidenceEntries: [
    {
      id: `${RISK_OPERATIONAL_ENVIRONMENT_SECTION_KEY}-evidence`,
      sectionKey: RISK_OPERATIONAL_ENVIRONMENT_SECTION_KEY,
      title: 'Operational Environment Evidence Reference',
      referenceId: '',
      descriptionHtml: '',
      status: 'not_started',
    },
  ],
}

export const defaultProductArchitectureState: ProductArchitectureState = {
  architectureDescriptionHtml: '',
  noHardwareComponents: false,
  hardwareComponents: [],
  softwareComponents: [],
  noRdpsComponents: false,
  rdpsComponents: [],
  componentInterfaces: [],
  architectureDiagramHtml: '',
  evidenceEntries: [
    {
      id: `${RISK_PRODUCT_ARCHITECTURE_SECTION_KEY}-evidence`,
      sectionKey: RISK_PRODUCT_ARCHITECTURE_SECTION_KEY,
      title: 'Product Architecture Evidence Reference',
      referenceId: '',
      descriptionHtml: '',
      status: 'not_started',
    },
  ],
}

export const defaultProductUserDescriptionState: ProductUserDescriptionState = {
  userDescriptionHtml: '',
  noRdps: false,
  rdpsConsiderationsHtml: '',
  evidenceEntries: [
    {
      id: `${RISK_PRODUCT_USER_DESCRIPTION_SECTION_KEY}-evidence`,
      sectionKey: RISK_PRODUCT_USER_DESCRIPTION_SECTION_KEY,
      title: 'Product User Description Evidence Reference',
      referenceId: '',
      descriptionHtml: '',
      status: 'not_started',
    },
  ],
}

export function defaultProductContextAssessmentState(): ProductContextAssessmentState {
  return {
    assessments: [],
    overallVerdict: 'not_assessed',
    summaryOfFindingsHtml: '',
    nonConformities: [],
  }
}

export const defaultRiskManagementState: RiskManagementState = {
  generalApproachHtml: '',
  productContext: {
    ...defaultProductContextState,
    evidenceEntries: defaultProductContextState.evidenceEntries.map((e) => ({ ...e })),
  },
  productFunction: {
    ...defaultProductFunctionState,
    evidenceEntries: defaultProductFunctionState.evidenceEntries.map((e) => ({ ...e })),
  },
  operationalEnvironment: {
    ...defaultOperationalEnvironmentState,
    evidenceEntries: defaultOperationalEnvironmentState.evidenceEntries.map((e) => ({ ...e })),
  },
  productArchitecture: {
    ...defaultProductArchitectureState,
    evidenceEntries: defaultProductArchitectureState.evidenceEntries.map((e) => ({ ...e })),
  },
  productUserDescription: {
    ...defaultProductUserDescriptionState,
    evidenceEntries: defaultProductUserDescriptionState.evidenceEntries.map((e) => ({ ...e })),
  },
  productContextAssessment: defaultProductContextAssessmentState(),
}

// ============================================================================
// Root Default State Builder
// Note: This function is defined in storage.ts to avoid circular dependencies
// with cloners. The buildDefaultState() function uses cloners for deep cloning.
// ============================================================================
