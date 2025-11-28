/**
 * Composable for building section status list for document preview
 */
import { computed, type ComputedRef } from 'vue'
import type { DocumentWorkspaceState } from '~/services/documentWorkspace'
import { stripHtml } from '~/utils/textHelpers'
import {
  createSectionStatus,
  summarizeEvidenceEntries,
  type SectionStatusItem,
  type SectionGroup
} from '~/utils/previewStatus'
import { summarizeRegulatoryEntries } from '~/utils/previewPayload'

export const SECTION_GROUP_DEFINITIONS = [
  {
    key: 'cover-intro',
    title: 'Cover & Introduction',
    description: 'Cover metadata, document info, and purpose/scope.',
    children: ['cover', 'document-info', 'purpose-scope', 'product-identification', 'manufacturer-information'],
  },
  {
    key: 'product-overview',
    title: 'Product Overview',
    description: 'Description, architecture, and third-party components.',
    children: ['product-overview-description', 'product-overview-architecture', 'third-party-components'],
  },
  {
    key: 'conformance',
    title: 'Conformance Claim',
    description: 'Standards, regulatory references, and conformance level.',
    children: ['conformance-standards', 'conformance-regulatory', 'conformance-level'],
  },
  {
    key: 'document-convention',
    title: 'Document Convention',
    description: 'Terminology and notation settings.',
    children: ['terminology', 'notation'],
  },
  {
    key: 'evidence-management',
    title: 'Evidence Tracking',
    description: 'Supporting documentation readiness.',
    children: ['evidence-tracker'],
  },
  {
    key: 'risk-management',
    title: 'Risk Management Elements',
    description: 'Clause 6 risk management approach and methodology.',
    children: ['risk-general', 'risk-product-context', 'risk-product-function', 'risk-operational-environment', 'risk-product-architecture', 'risk-product-user-description', 'risk-product-context-assessment'],
  },
]

export function usePreviewSections(workspace: ComputedRef<DocumentWorkspaceState>) {
  const cover = computed(() => workspace.value.cover)
  const introduction = computed(() => workspace.value.introduction)
  const purposeScope = computed(() => workspace.value.purposeScope)
  const productIdentification = computed(() => workspace.value.productIdentification)
  const manufacturerInformation = computed(() => workspace.value.manufacturerInformation)
  const productOverview = computed(() => workspace.value.productOverview)
  const conformanceClaim = computed(() => workspace.value.conformanceClaim)
  const documentConvention = computed(() => workspace.value.documentConvention)
  const riskManagement = computed(() => workspace.value.riskManagement)

  const productContextState = computed(() => riskManagement.value.productContext)
  const productFunctionState = computed(() => riskManagement.value.productFunction)
  const operationalEnvironmentState = computed(() => riskManagement.value.operationalEnvironment)
  const productArchitectureState = computed(() => riskManagement.value.productArchitecture)
  const productUserDescriptionState = computed(() => riskManagement.value.productUserDescription)
  const productContextAssessmentState = computed(() => riskManagement.value.productContextAssessment)

  const evidenceSummary = computed(() => summarizeEvidenceEntries(productContextState.value?.evidenceEntries ?? []))
  const productFunctionEvidenceSummary = computed(() => summarizeEvidenceEntries(productFunctionState.value?.evidenceEntries ?? []))
  const operationalEnvEvidenceSummary = computed(() => summarizeEvidenceEntries(operationalEnvironmentState.value?.evidenceEntries ?? []))
  const productArchitectureEvidenceSummary = computed(() => summarizeEvidenceEntries(productArchitectureState.value?.evidenceEntries ?? []))
  const productUserDescriptionEvidenceSummary = computed(() => summarizeEvidenceEntries(productUserDescriptionState.value?.evidenceEntries ?? []))

  const sectionList = computed<SectionStatusItem[]>(() => {
    const introductionState = introduction.value
    const purposeScopeState = purposeScope.value
    const productIdentificationState = productIdentification.value
    const manufacturerInformationState = manufacturerInformation.value
    const productOverviewState = productOverview.value
    const conformanceClaimState = conformanceClaim.value
    const documentConventionState = documentConvention.value

    return [
      createSectionStatus(
        'cover',
        'Cover',
        'Device metadata, versioning, and lab details.',
        [
          cover.value.deviceName,
          cover.value.deviceDescription,
          cover.value.versionNumber,
          cover.value.labName,
          cover.value.labAddress,
        ],
        '/document/cover'
      ),
      createSectionStatus(
        'document-info',
        'Document Information',
        'Product identification, manufacturer, and responsible parties.',
        [
          introductionState.productName,
          introductionState.productVersion,
          introductionState.productType,
          introductionState.manufacturerName,
          introductionState.manufacturerAddress,
          introductionState.status,
          introductionState.preparedBy,
          introductionState.reviewedBy,
          introductionState.approvedBy,
        ],
        '/document/introduction'
      ),
      createSectionStatus(
        'purpose-scope',
        'Purpose & Scope',
        'Lifecycle phases, assessment period, and methodology.',
        [
          purposeScopeState.scopeSelections.length > 0 ? 'yes' : '',
          purposeScopeState.assessmentStart,
          purposeScopeState.assessmentEnd,
          stripHtml(purposeScopeState.methodologyHtml),
        ],
        '/document/purpose-scope'
      ),
      createSectionStatus(
        'product-identification',
        'Product Identification',
        'Product description, key functions, and target market.',
        [
          introductionState.productName,
          introductionState.productVersion,
          introductionState.productType,
          stripHtml(productIdentificationState.productDescriptionHtml),
          stripHtml(productIdentificationState.keyFunctionsHtml),
          productIdentificationState.targetMarket,
        ],
        '/document/product-identification'
      ),
      createSectionStatus(
        'manufacturer-information',
        'Manufacturer Information',
        'Legal entity details and primary contact information.',
        [
          manufacturerInformationState.legalEntity,
          manufacturerInformationState.registrationNumber,
          manufacturerInformationState.address,
          manufacturerInformationState.contactPerson,
          manufacturerInformationState.phone,
        ],
        '/document/manufacturer-information'
      ),
      createSectionStatus(
        'product-overview-description',
        'Product Description',
        'Narrative covering physical, software, and data-processing characteristics.',
        [stripHtml(productOverviewState.productDescriptionHtml)],
        '/product-overview/description'
      ),
      createSectionStatus(
        'product-overview-architecture',
        'Product Architecture Overview',
        'High-level components, interfaces, and remote services.',
        [stripHtml(productOverviewState.productArchitectureHtml)],
        '/product-overview/architecture'
      ),
      createSectionStatus(
        'third-party-components',
        'Third-Party Components',
        'Component inventory, management approach, and evidence.',
        [
          productOverviewState.thirdPartyComponents.entries.length ? 'entries' : '',
          stripHtml(productOverviewState.thirdPartyComponents.managementApproachHtml),
          stripHtml(productOverviewState.thirdPartyComponents.evidenceReferenceHtml),
        ],
        '/product-overview/third-party-components'
      ),
      createSectionStatus(
        'conformance-standards',
        'Standards Conformance',
        'Primary standard plus related standards applied.',
        [
          [
            conformanceClaimState.standardsConformance.primaryStandard.code,
            conformanceClaimState.standardsConformance.primaryStandard.description,
          ]
            .filter((value) => !!value && value.trim().length)
            .join(' '),
          conformanceClaimState.standardsConformance.relatedStandards.length
            ? 'related'
            : conformanceClaimState.standardsConformance.includeOther &&
                conformanceClaimState.standardsConformance.otherNotes
              ? conformanceClaimState.standardsConformance.otherNotes
              : '',
        ],
        '/conformance/standards'
      ),
      createSectionStatus(
        'conformance-regulatory',
        'Regulatory Conformance',
        'CRA clauses plus other applicable regulations.',
        [summarizeRegulatoryEntries(conformanceClaimState.regulatoryConformance)],
        '/conformance/regulatory'
      ),
      createSectionStatus(
        'conformance-level',
        'Conformance Level',
        'Claimed assurance tier and supporting evidence.',
        [
          conformanceClaimState.conformanceLevel.statuses.length ? 'status' : '',
          stripHtml(conformanceClaimState.conformanceLevel.justificationHtml),
        ],
        '/conformance/level',
        conformanceClaimState.conformanceLevel.statuses.length
          ? `Status: ${conformanceClaimState.conformanceLevel.statuses.join(', ')}`
          : 'No conformance level declared'
      ),
      createSectionStatus(
        'terminology',
        'Terminology',
        'Terms and definitions used throughout the document.',
        [
          documentConventionState.terminologyEntries.length
            ? String(documentConventionState.terminologyEntries.length)
            : '',
        ],
        '/convention/terminology'
      ),
      createSectionStatus(
        'notation',
        'Notation',
        'Evidence, requirement, and assessment verdict guidance.',
        [
          stripHtml(documentConventionState.evidenceNotationHtml),
          stripHtml(documentConventionState.requirementNotationHtml),
          stripHtml(documentConventionState.assessmentVerdictsHtml),
        ],
        '/convention/notation'
      ),
      createSectionStatus(
        'risk-general',
        'General Approach to Risk Management',
        'Lifecycle risk management narrative and references.',
        [stripHtml(riskManagement.value.generalApproachHtml)],
        '/risk/general-approach'
      ),
      createSectionStatus(
        'risk-product-context',
        'Product Context (Section 5.2.1)',
        'Intended purpose, foreseeable use, and supporting evidence.',
        [
          stripHtml(productContextState.value?.intendedPurposeHtml || ''),
          stripHtml(productContextState.value?.specificIntendedUsesHtml || ''),
          stripHtml(productContextState.value?.foreseeableUseHtml || ''),
          evidenceSummary.value.total
            ? evidenceSummary.value.state === 'completed'
              ? 'complete'
              : evidenceSummary.value.state === 'partial'
                ? 'progress'
                : ''
            : '',
        ],
        '/pcontext/intended-purpose',
        evidenceSummary.value.total
          ? `${evidenceSummary.value.completed}/${evidenceSummary.value.total} evidence items ready`
          : 'No evidence captured yet'
      ),
      createSectionStatus(
        'risk-product-function',
        'Product Functions (Section 5.2.2)',
        'Primary and security functions of the product.',
        [
          stripHtml(productFunctionState.value?.primaryFunctionsHtml || ''),
          stripHtml(productFunctionState.value?.securityFunctionsHtml || ''),
          productFunctionEvidenceSummary.value.total
            ? productFunctionEvidenceSummary.value.state === 'completed'
              ? 'complete'
              : productFunctionEvidenceSummary.value.state === 'partial'
                ? 'progress'
                : ''
            : '',
        ],
        '/pcontext/product-function',
        productFunctionEvidenceSummary.value.total
          ? `${productFunctionEvidenceSummary.value.completed}/${productFunctionEvidenceSummary.value.total} evidence items ready`
          : 'No evidence captured yet'
      ),
      createSectionStatus(
        'risk-operational-environment',
        'Operational Environment (Section 5.2.3)',
        'Physical, network, system environments and RDPS dependencies.',
        [
          stripHtml(operationalEnvironmentState.value?.physicalEnvironmentHtml || ''),
          stripHtml(operationalEnvironmentState.value?.networkEnvironmentHtml || ''),
          stripHtml(operationalEnvironmentState.value?.systemEnvironmentHtml || ''),
          stripHtml(operationalEnvironmentState.value?.operationalConstraintsHtml || ''),
          stripHtml(operationalEnvironmentState.value?.rdpsEnvironmentHtml || ''),
          operationalEnvEvidenceSummary.value.total
            ? operationalEnvEvidenceSummary.value.state === 'completed'
              ? 'complete'
              : operationalEnvEvidenceSummary.value.state === 'partial'
                ? 'progress'
                : ''
            : '',
        ],
        '/pcontext/operational-environment',
        operationalEnvEvidenceSummary.value.total
          ? `${operationalEnvEvidenceSummary.value.completed}/${operationalEnvEvidenceSummary.value.total} evidence items ready`
          : 'No evidence captured yet'
      ),
      createSectionStatus(
        'risk-product-architecture',
        'Product Architecture (Section 5.2.4)',
        'Hardware, software, RDPS components and interfaces.',
        [
          stripHtml(productArchitectureState.value?.architectureDescriptionHtml || ''),
          productArchitectureState.value?.hardwareComponents?.length ? 'hw' : '',
          productArchitectureState.value?.softwareComponents?.length ? 'sw' : '',
          productArchitectureState.value?.rdpsComponents?.length ? 'rdps' : '',
          productArchitectureState.value?.componentInterfaces?.length ? 'iface' : '',
          stripHtml(productArchitectureState.value?.architectureDiagramHtml || ''),
          productArchitectureEvidenceSummary.value.total
            ? productArchitectureEvidenceSummary.value.state === 'completed'
              ? 'complete'
              : productArchitectureEvidenceSummary.value.state === 'partial'
                ? 'progress'
                : ''
            : '',
        ],
        '/pcontext/product-architecture',
        productArchitectureEvidenceSummary.value.total
          ? `${productArchitectureEvidenceSummary.value.completed}/${productArchitectureEvidenceSummary.value.total} evidence items ready`
          : 'No evidence captured yet'
      ),
      createSectionStatus(
        'risk-product-user-description',
        'Product User Description (Section 5.2.5)',
        'Intended users and RDPS considerations.',
        [
          stripHtml(productUserDescriptionState.value?.userDescriptionHtml || ''),
          productUserDescriptionState.value?.noRdps ? 'no-rdps' : stripHtml(productUserDescriptionState.value?.rdpsConsiderationsHtml || ''),
          productUserDescriptionEvidenceSummary.value.total
            ? productUserDescriptionEvidenceSummary.value.state === 'completed'
              ? 'complete'
              : productUserDescriptionEvidenceSummary.value.state === 'partial'
                ? 'progress'
                : ''
            : '',
        ],
        '/pcontext/user-description',
        productUserDescriptionEvidenceSummary.value.total
          ? `${productUserDescriptionEvidenceSummary.value.completed}/${productUserDescriptionEvidenceSummary.value.total} evidence items ready`
          : 'No evidence captured yet'
      ),
      createSectionStatus(
        'risk-product-context-assessment',
        'Product Context Assessment (Section 5.3)',
        'Clause 6.2 conformance assessment summary.',
        [
          productContextAssessmentState.value?.overallVerdict && productContextAssessmentState.value.overallVerdict !== 'not_assessed' ? productContextAssessmentState.value.overallVerdict : '',
          stripHtml(productContextAssessmentState.value?.summaryOfFindingsHtml || ''),
          productContextAssessmentState.value?.assessments?.filter(a => a.status !== 'not_assessed').length ? 'assessments' : '',
          productContextAssessmentState.value?.nonConformities?.length ? 'nc' : '',
        ],
        '/risk/product-context-assessment',
        productContextAssessmentState.value?.overallVerdict && productContextAssessmentState.value.overallVerdict !== 'not_assessed'
          ? `Verdict: ${productContextAssessmentState.value.overallVerdict.toUpperCase()}`
          : 'Assessment not started'
      ),
      createSectionStatus(
        'evidence-tracker',
        'Evidence List',
        'Central record of supporting documentation.',
        [
          evidenceSummary.value.total ? String(evidenceSummary.value.total) : '',
          evidenceSummary.value.state === 'completed'
            ? 'complete'
            : evidenceSummary.value.state === 'partial'
              ? 'progress'
              : '',
        ],
        '/document/evidence',
        evidenceSummary.value.total
          ? `${evidenceSummary.value.total} evidence items (${evidenceSummary.value.state})`
          : 'No evidence items added'
      ),
    ]
  })

  const sectionGroups = computed<SectionGroup[]>(() => {
    return SECTION_GROUP_DEFINITIONS.map((definition) => {
      const items = definition.children
        .map((childKey) => sectionList.value.find((status) => status.key === childKey))
        .filter((item): item is SectionStatusItem => Boolean(item))
      if (!items.length) {
        return null
      }
      const totals = items.reduce(
        (acc, item) => {
          if (item.status === 'done') acc.done += 1
          else if (item.status === 'partial') acc.partial += 1
          else acc.missing += 1
          return acc
        },
        { done: 0, partial: 0, missing: 0 }
      )
      const state = totals.done === items.length ? 'done' : totals.done > 0 || totals.partial > 0 ? 'partial' : 'missing'
      const stateLabel = state === 'done' ? 'Completed' : state === 'partial' ? 'Partial' : 'Missing'
      return {
        key: definition.key,
        title: definition.title,
        description: definition.description,
        state,
        stateLabel,
        items,
      }
    }).filter((group): group is SectionGroup => Boolean(group))
  })

  const allMissing = computed(() => sectionList.value.every((section) => section.status === 'missing'))

  const completionPercentage = computed(() => {
    const totals = sectionList.value.reduce(
      (acc, section) => {
        acc.filled += section.filled ?? 0
        acc.total += section.total ?? 0
        return acc
      },
      { filled: 0, total: 0 }
    )
    return totals.total > 0 ? Math.round((totals.filled / totals.total) * 100) : 0
  })

  return {
    sectionList,
    sectionGroups,
    allMissing,
    completionPercentage,
    evidenceSummary
  }
}
