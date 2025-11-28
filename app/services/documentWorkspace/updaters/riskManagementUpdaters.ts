import type {
  DocumentWorkspaceState,
  RiskManagementState,
  ProductContextState,
  ProductFunctionState,
  ProductOperationalEnvironmentState,
  ProductArchitectureState,
  ProductUserDescriptionState,
  ProductContextAssessmentState,
  RiskAssessmentMethodologyState,
} from '../types'
import {
  RISK_PRODUCT_CONTEXT_SECTION_KEY,
  RISK_PRODUCT_FUNCTION_SECTION_KEY,
  RISK_OPERATIONAL_ENVIRONMENT_SECTION_KEY,
  RISK_PRODUCT_ARCHITECTURE_SECTION_KEY,
  RISK_PRODUCT_USER_DESCRIPTION_SECTION_KEY,
  RISK_ASSESSMENT_METHODOLOGY_SECTION_KEY,
} from '../constants'
import {
  defaultProductContextState,
  defaultProductFunctionState,
  defaultOperationalEnvironmentState,
  defaultProductArchitectureState,
  defaultProductUserDescriptionState,
  defaultProductContextAssessmentState,
  defaultRiskAssessmentMethodologyState,
} from '../defaults'
import {
  getInMemoryState,
  persistState,
} from '../storage'
import {
  cloneEvidenceEntries,
  cloneProductContextState,
  cloneProductFunctionState,
  cloneOperationalEnvironmentState,
  cloneProductArchitectureState,
  cloneProductUserDescriptionState,
  cloneProductContextAssessmentState,
  cloneRiskAssessmentMethodologyState,
} from '../cloners'

// ============================================================================
// Risk Management State Updater
// ============================================================================

export function updateRiskManagementState(
  patch: Partial<RiskManagementState>
): DocumentWorkspaceState {
  const inMemoryState = getInMemoryState()
  const current = inMemoryState.riskManagement
  const currentProductContext = current.productContext || cloneProductContextState()
  const currentProductFunction = current.productFunction || cloneProductFunctionState()
  const currentOperationalEnvironment = current.operationalEnvironment || cloneOperationalEnvironmentState()

  // Product Context
  let nextProductContext: ProductContextState
  if (patch.productContext) {
    const productContextPatch = patch.productContext
    const patchedEvidence =
      productContextPatch.evidenceEntries !== undefined
        ? productContextPatch.evidenceEntries.length
          ? cloneEvidenceEntries(productContextPatch.evidenceEntries, RISK_PRODUCT_CONTEXT_SECTION_KEY)
          : cloneEvidenceEntries(defaultProductContextState.evidenceEntries, RISK_PRODUCT_CONTEXT_SECTION_KEY)
        : cloneEvidenceEntries(currentProductContext.evidenceEntries, RISK_PRODUCT_CONTEXT_SECTION_KEY)

    nextProductContext = {
      intendedPurposeHtml:
        productContextPatch.intendedPurposeHtml ?? currentProductContext.intendedPurposeHtml,
      specificIntendedUsesHtml:
        productContextPatch.specificIntendedUsesHtml ?? currentProductContext.specificIntendedUsesHtml,
      foreseeableUseHtml:
        productContextPatch.foreseeableUseHtml ?? currentProductContext.foreseeableUseHtml,
      evidenceEntries: patchedEvidence,
    }
  } else {
    nextProductContext = cloneProductContextState(currentProductContext)
  }

  if (!nextProductContext.evidenceEntries.length) {
    nextProductContext.evidenceEntries = cloneEvidenceEntries(
      defaultProductContextState.evidenceEntries,
      RISK_PRODUCT_CONTEXT_SECTION_KEY
    )
  }

  // Product Function
  let nextProductFunction: ProductFunctionState
  if (patch.productFunction) {
    const productFunctionPatch = patch.productFunction
    const patchedEvidence =
      productFunctionPatch.evidenceEntries !== undefined
        ? productFunctionPatch.evidenceEntries.length
          ? cloneEvidenceEntries(productFunctionPatch.evidenceEntries, RISK_PRODUCT_FUNCTION_SECTION_KEY)
          : cloneEvidenceEntries(defaultProductFunctionState.evidenceEntries, RISK_PRODUCT_FUNCTION_SECTION_KEY)
        : cloneEvidenceEntries(currentProductFunction.evidenceEntries, RISK_PRODUCT_FUNCTION_SECTION_KEY)

    nextProductFunction = {
      primaryFunctionsHtml:
        productFunctionPatch.primaryFunctionsHtml ?? currentProductFunction.primaryFunctionsHtml,
      securityFunctionsHtml:
        productFunctionPatch.securityFunctionsHtml ?? currentProductFunction.securityFunctionsHtml,
      evidenceEntries: patchedEvidence,
    }
  } else {
    nextProductFunction = cloneProductFunctionState(currentProductFunction)
  }

  if (!nextProductFunction.evidenceEntries.length) {
    nextProductFunction.evidenceEntries = cloneEvidenceEntries(
      defaultProductFunctionState.evidenceEntries,
      RISK_PRODUCT_FUNCTION_SECTION_KEY
    )
  }

  // Operational Environment
  let nextOperationalEnvironment: ProductOperationalEnvironmentState
  if (patch.operationalEnvironment) {
    const opEnvPatch = patch.operationalEnvironment
    const patchedEvidence =
      opEnvPatch.evidenceEntries !== undefined
        ? opEnvPatch.evidenceEntries.length
          ? cloneEvidenceEntries(opEnvPatch.evidenceEntries, RISK_OPERATIONAL_ENVIRONMENT_SECTION_KEY)
          : cloneEvidenceEntries(defaultOperationalEnvironmentState.evidenceEntries, RISK_OPERATIONAL_ENVIRONMENT_SECTION_KEY)
        : cloneEvidenceEntries(currentOperationalEnvironment.evidenceEntries, RISK_OPERATIONAL_ENVIRONMENT_SECTION_KEY)

    nextOperationalEnvironment = {
      physicalEnvironmentHtml: opEnvPatch.physicalEnvironmentHtml ?? currentOperationalEnvironment.physicalEnvironmentHtml,
      networkEnvironmentHtml: opEnvPatch.networkEnvironmentHtml ?? currentOperationalEnvironment.networkEnvironmentHtml,
      systemEnvironmentHtml: opEnvPatch.systemEnvironmentHtml ?? currentOperationalEnvironment.systemEnvironmentHtml,
      operationalConstraintsHtml: opEnvPatch.operationalConstraintsHtml ?? currentOperationalEnvironment.operationalConstraintsHtml,
      rdpsEnvironmentHtml: opEnvPatch.rdpsEnvironmentHtml ?? currentOperationalEnvironment.rdpsEnvironmentHtml,
      evidenceEntries: patchedEvidence,
    }
  } else {
    nextOperationalEnvironment = cloneOperationalEnvironmentState(currentOperationalEnvironment)
  }

  if (!nextOperationalEnvironment.evidenceEntries.length) {
    nextOperationalEnvironment.evidenceEntries = cloneEvidenceEntries(
      defaultOperationalEnvironmentState.evidenceEntries,
      RISK_OPERATIONAL_ENVIRONMENT_SECTION_KEY
    )
  }

  // Product Architecture
  const currentProductArchitecture = current.productArchitecture || cloneProductArchitectureState()
  let nextProductArchitecture: ProductArchitectureState
  if (patch.productArchitecture) {
    const archPatch = patch.productArchitecture
    const patchedEvidence =
      archPatch.evidenceEntries !== undefined
        ? archPatch.evidenceEntries.length
          ? cloneEvidenceEntries(archPatch.evidenceEntries, RISK_PRODUCT_ARCHITECTURE_SECTION_KEY)
          : cloneEvidenceEntries(defaultProductArchitectureState.evidenceEntries, RISK_PRODUCT_ARCHITECTURE_SECTION_KEY)
        : cloneEvidenceEntries(currentProductArchitecture.evidenceEntries, RISK_PRODUCT_ARCHITECTURE_SECTION_KEY)

    nextProductArchitecture = {
      architectureDescriptionHtml: archPatch.architectureDescriptionHtml ?? currentProductArchitecture.architectureDescriptionHtml,
      noHardwareComponents: archPatch.noHardwareComponents ?? currentProductArchitecture.noHardwareComponents,
      hardwareComponents: archPatch.hardwareComponents !== undefined
        ? archPatch.hardwareComponents.map((c) => ({ ...c }))
        : currentProductArchitecture.hardwareComponents.map((c) => ({ ...c })),
      softwareComponents: archPatch.softwareComponents !== undefined
        ? archPatch.softwareComponents.map((c) => ({ ...c }))
        : currentProductArchitecture.softwareComponents.map((c) => ({ ...c })),
      noRdpsComponents: archPatch.noRdpsComponents ?? currentProductArchitecture.noRdpsComponents,
      rdpsComponents: archPatch.rdpsComponents !== undefined
        ? archPatch.rdpsComponents.map((c) => ({ ...c }))
        : currentProductArchitecture.rdpsComponents.map((c) => ({ ...c })),
      componentInterfaces: archPatch.componentInterfaces !== undefined
        ? archPatch.componentInterfaces.map((c) => ({ ...c }))
        : currentProductArchitecture.componentInterfaces.map((c) => ({ ...c })),
      architectureDiagramHtml: archPatch.architectureDiagramHtml ?? currentProductArchitecture.architectureDiagramHtml,
      evidenceEntries: patchedEvidence,
    }
  } else {
    nextProductArchitecture = cloneProductArchitectureState(currentProductArchitecture)
  }

  if (!nextProductArchitecture.evidenceEntries.length) {
    nextProductArchitecture.evidenceEntries = cloneEvidenceEntries(
      defaultProductArchitectureState.evidenceEntries,
      RISK_PRODUCT_ARCHITECTURE_SECTION_KEY
    )
  }

  // Product User Description
  const currentProductUserDescription = current.productUserDescription || cloneProductUserDescriptionState()
  let nextProductUserDescription: ProductUserDescriptionState
  if (patch.productUserDescription) {
    const userDescPatch = patch.productUserDescription
    const patchedEvidence =
      userDescPatch.evidenceEntries !== undefined
        ? userDescPatch.evidenceEntries.length
          ? cloneEvidenceEntries(userDescPatch.evidenceEntries, RISK_PRODUCT_USER_DESCRIPTION_SECTION_KEY)
          : cloneEvidenceEntries(defaultProductUserDescriptionState.evidenceEntries, RISK_PRODUCT_USER_DESCRIPTION_SECTION_KEY)
        : cloneEvidenceEntries(currentProductUserDescription.evidenceEntries, RISK_PRODUCT_USER_DESCRIPTION_SECTION_KEY)

    nextProductUserDescription = {
      userDescriptionHtml: userDescPatch.userDescriptionHtml ?? currentProductUserDescription.userDescriptionHtml,
      noRdps: userDescPatch.noRdps ?? currentProductUserDescription.noRdps,
      rdpsConsiderationsHtml: userDescPatch.rdpsConsiderationsHtml ?? currentProductUserDescription.rdpsConsiderationsHtml,
      evidenceEntries: patchedEvidence,
    }
  } else {
    nextProductUserDescription = cloneProductUserDescriptionState(currentProductUserDescription)
  }

  if (!nextProductUserDescription.evidenceEntries.length) {
    nextProductUserDescription.evidenceEntries = cloneEvidenceEntries(
      defaultProductUserDescriptionState.evidenceEntries,
      RISK_PRODUCT_USER_DESCRIPTION_SECTION_KEY
    )
  }

  // Product Context Assessment
  const currentProductContextAssessment = current.productContextAssessment || cloneProductContextAssessmentState()
  let nextProductContextAssessment: ProductContextAssessmentState
  if (patch.productContextAssessment) {
    const assessmentPatch = patch.productContextAssessment
    nextProductContextAssessment = {
      assessments: assessmentPatch.assessments !== undefined
        ? assessmentPatch.assessments.map((a) => ({ ...a }))
        : currentProductContextAssessment.assessments.map((a) => ({ ...a })),
      overallVerdict: assessmentPatch.overallVerdict ?? currentProductContextAssessment.overallVerdict,
      summaryOfFindingsHtml: assessmentPatch.summaryOfFindingsHtml ?? currentProductContextAssessment.summaryOfFindingsHtml,
      nonConformities: assessmentPatch.nonConformities !== undefined
        ? assessmentPatch.nonConformities.map((nc) => ({ ...nc }))
        : currentProductContextAssessment.nonConformities.map((nc) => ({ ...nc })),
    }
  } else {
    nextProductContextAssessment = cloneProductContextAssessmentState(currentProductContextAssessment)
  }

  // Risk Assessment Methodology
  const currentRiskAssessmentMethodology = current.riskAssessmentMethodology || cloneRiskAssessmentMethodologyState()
  let nextRiskAssessmentMethodology: RiskAssessmentMethodologyState
  if (patch.riskAssessmentMethodology) {
    const methodologyPatch = patch.riskAssessmentMethodology
    const patchedEvidence =
      methodologyPatch.evidenceEntries !== undefined
        ? methodologyPatch.evidenceEntries.length
          ? cloneEvidenceEntries(methodologyPatch.evidenceEntries, RISK_ASSESSMENT_METHODOLOGY_SECTION_KEY)
          : cloneEvidenceEntries(defaultRiskAssessmentMethodologyState.evidenceEntries, RISK_ASSESSMENT_METHODOLOGY_SECTION_KEY)
        : cloneEvidenceEntries(currentRiskAssessmentMethodology.evidenceEntries, RISK_ASSESSMENT_METHODOLOGY_SECTION_KEY)

    nextRiskAssessmentMethodology = {
      methodologyDescriptionHtml: methodologyPatch.methodologyDescriptionHtml ?? currentRiskAssessmentMethodology.methodologyDescriptionHtml,
      justificationHtml: methodologyPatch.justificationHtml ?? currentRiskAssessmentMethodology.justificationHtml,
      consistentApplicationHtml: methodologyPatch.consistentApplicationHtml ?? currentRiskAssessmentMethodology.consistentApplicationHtml,
      individualAggregateRiskHtml: methodologyPatch.individualAggregateRiskHtml ?? currentRiskAssessmentMethodology.individualAggregateRiskHtml,
      evidenceEntries: patchedEvidence,
    }
  } else {
    nextRiskAssessmentMethodology = cloneRiskAssessmentMethodologyState(currentRiskAssessmentMethodology)
  }

  if (!nextRiskAssessmentMethodology.evidenceEntries.length) {
    nextRiskAssessmentMethodology.evidenceEntries = cloneEvidenceEntries(
      defaultRiskAssessmentMethodologyState.evidenceEntries,
      RISK_ASSESSMENT_METHODOLOGY_SECTION_KEY
    )
  }

  // Combine all
  const nextRiskManagement: RiskManagementState = {
    generalApproachHtml: patch.generalApproachHtml ?? current.generalApproachHtml,
    productContext: nextProductContext,
    productFunction: nextProductFunction,
    operationalEnvironment: nextOperationalEnvironment,
    productArchitecture: nextProductArchitecture,
    productUserDescription: nextProductUserDescription,
    productContextAssessment: nextProductContextAssessment,
    riskAssessmentMethodology: nextRiskAssessmentMethodology,
  }

  const next: DocumentWorkspaceState = {
    ...inMemoryState,
    riskManagement: nextRiskManagement,
    lastUpdated: new Date().toISOString(),
  }

  persistState(next)
  return { ...next }
}
