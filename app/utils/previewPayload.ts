/**
 * Payload builders for document preview generation
 */
import { normalizeHtml, normalizePlainText, escapeHtml } from './textHelpers'
import { CONFORMANCE_LEVEL_OPTIONS, REGULATORY_PRIMARY_REFERENCES } from '~/constants/conformance'
import type { DocumentWorkspaceState } from '~/services/documentWorkspace'

/**
 * Summarize regulatory entries for display
 */
export function summarizeRegulatoryEntries(state?: { additionalRegulations?: Array<{ regulation?: string; description?: string }> }): string {
  if (!state || !Array.isArray(state.additionalRegulations)) return ''
  return state.additionalRegulations
    .map((entry) => entry.regulation || entry.description)
    .map((value) => value?.trim() ?? '')
    .filter((value) => value.length > 0)
    .slice(0, 3)
    .join(', ')
}

/**
 * Build regulatory conformance HTML
 */
export function buildRegulatoryHtml(state?: { additionalRegulations?: Array<{ regulation?: string; description?: string }> }): string {
  const baseList = REGULATORY_PRIMARY_REFERENCES.map((item) => `<li>${escapeHtml(item)}</li>`).join('')
  const otherEntries = (state?.additionalRegulations ?? [])
    .map((entry) => {
      const regulation = entry.regulation?.trim() ?? ''
      const description = entry.description?.trim() ?? ''
      if (!regulation && !description) return ''
      const label = regulation ? `<strong>${escapeHtml(regulation)}</strong>` : ''
      const detail = description ? `${regulation ? ' — ' : ''}${escapeHtml(description)}` : ''
      const content = label ? `${label}${detail}` : detail || '—'
      return `<li>${content}</li>`
    })
    .filter(Boolean)
    .join('')
  const otherSection = otherEntries ? `<p>Other Applicable Regulations:</p><ul>${otherEntries}</ul>` : ''

  return `<p>[Reference: Annex C - Relationship with CRA]</p>
<p>This product is intended to conform to the essential cybersecurity requirements of:</p>
<ul>${baseList}</ul>
${otherSection}`
}

/**
 * Build conformance level HTML
 */
export function buildConformanceLevelHtml(state?: { statuses?: string[]; justificationHtml?: string }): string {
  const statuses = state?.statuses ?? []
  const statusLine = CONFORMANCE_LEVEL_OPTIONS.map((option) => {
    const symbol = statuses.includes(option.value) ? '☑' : '☐'
    return `${symbol} ${option.label}`
  }).join(' ')
  const justificationHtml =
    state?.justificationHtml && state.justificationHtml.trim() ? state.justificationHtml : ''
  const justificationBlock =
    justificationHtml || '<p>[Explain which requirements are not met and why]</p>'

  return `<p><strong>Overall Conformance Status:</strong></p>
<p>${statusLine}</p>
<p><strong>Justification for Partial Conformance (if applicable):</strong></p>
${justificationBlock}`
}

/**
 * Normalize evidence entries for API payload
 */
export function normalizeEvidencePayload(entries?: Array<{
  sectionKey?: string
  referenceId?: string
  title?: string
  status?: string
  descriptionHtml?: string
}>): Array<{
  section_key: string
  reference_id?: string
  title?: string
  status?: string
  notes_html?: string
}> {
  if (!entries) return []
  return entries
    .map((entry) => {
      const reference = normalizePlainText(entry.referenceId)
      const title = normalizePlainText(entry.title)
      const notesHtml = normalizeHtml(entry.descriptionHtml)
      if (!reference && !title && !notesHtml) {
        return null
      }
      return {
        section_key: entry.sectionKey || 'risk-product-context',
        reference_id: reference,
        title,
        status: entry.status,
        notes_html: notesHtml,
      }
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
}

/**
 * Check if product context assessment has content
 */
export function productContextAssessmentHasContent(state?: DocumentWorkspaceState['riskManagement']['productContextAssessment']): boolean {
  if (!state) return false
  
  // Check if any assessments have been filled in
  const hasAssessments = state.assessments?.some(
    (a) => a.status !== 'not_assessed' || a.evidenceId || a.commentsHtml
  )
  
  // Check if verdict is set
  const hasVerdict = state.overallVerdict && state.overallVerdict !== 'not_assessed'
  
  // Check if summary has content
  const hasSummary = normalizeHtml(state.summaryOfFindingsHtml)
  
  // Check if there are non-conformities
  const hasNonConformities = state.nonConformities?.length > 0
  
  return Boolean(hasAssessments || hasVerdict || hasSummary || hasNonConformities)
}

/**
 * Check if risk acceptance criteria assessment has content
 */
export function riskAcceptanceCriteriaAssessmentHasContent(state?: DocumentWorkspaceState['riskManagement']['riskAcceptanceCriteriaAssessment']): boolean {
  if (!state) return false
  
  // Check if any assessments have been filled in
  const hasAssessments = state.assessments?.some(
    (a) => a.status !== 'not_assessed' || a.evidenceId || a.commentsHtml
  )
  
  // Check if verdict is set
  const hasVerdict = state.overallVerdict && state.overallVerdict !== 'not_assessed'
  
  // Check if summary has content
  const hasSummary = normalizeHtml(state.summaryOfFindingsHtml)
  
  // Check if there are non-conformities
  const hasNonConformities = state.nonConformities?.length > 0
  
  return Boolean(hasAssessments || hasVerdict || hasSummary || hasNonConformities)
}

/**
 * Normalize assessment entries for API payload
 */
export function normalizeAssessmentEntries(entries?: Array<{
  id?: string
  evidenceId?: string
  evidenceRefId?: string
  status?: string
  commentsHtml?: string
}>): Array<{
  id: string
  evidence_id: string
  evidence_ref_id: string
  status: string
  comments_html: string
}> {
  if (!entries) return []
  return entries.map((entry) => ({
    id: entry.id || '',
    evidence_id: entry.evidenceId || '',
    evidence_ref_id: entry.evidenceRefId || '',
    status: entry.status || 'not_assessed',
    comments_html: normalizeHtml(entry.commentsHtml) || '',
  }))
}

/**
 * Normalize non-conformity entries for API payload
 */
export function normalizeNonConformityEntries(entries?: Array<{
  id?: string
  requirementId?: string
  description?: string
  severity?: string
  correctiveAction?: string
}>): Array<{
  id: string
  requirement_id: string
  description: string
  severity: string
  corrective_action: string
}> {
  if (!entries) return []
  return entries
    .filter((entry) => entry.id || entry.requirementId || entry.description)
    .map((entry) => ({
      id: entry.id || '',
      requirement_id: entry.requirementId || '',
      description: normalizePlainText(entry.description) || '',
      severity: entry.severity || 'minor',
      corrective_action: normalizePlainText(entry.correctiveAction) || '',
    }))
}

/**
 * Build risk management section payload
 */
export function buildRiskManagementPayload(state?: DocumentWorkspaceState['riskManagement']) {
  if (!state) return undefined
  const generalHtml = normalizeHtml(state.generalApproachHtml)
  
  // Product Context
  const productContext = state.productContext
  const intendedPurposeHtml = normalizeHtml(productContext?.intendedPurposeHtml)
  const specificUsesHtml = normalizeHtml(productContext?.specificIntendedUsesHtml)
  const foreseeableUseHtml = normalizeHtml(productContext?.foreseeableUseHtml)
  const contextEvidenceEntries = normalizeEvidencePayload(productContext?.evidenceEntries)
  const hasProductContext = intendedPurposeHtml || specificUsesHtml || foreseeableUseHtml || contextEvidenceEntries.length

  // Product Function
  const productFunction = state.productFunction
  const primaryFunctionsHtml = normalizeHtml(productFunction?.primaryFunctionsHtml)
  const securityFunctionsHtml = normalizeHtml(productFunction?.securityFunctionsHtml)
  const functionEvidenceEntries = normalizeEvidencePayload(productFunction?.evidenceEntries)
  const hasProductFunction = primaryFunctionsHtml || securityFunctionsHtml || functionEvidenceEntries.length

  // Operational Environment
  const operationalEnvironment = state.operationalEnvironment
  const physicalEnvHtml = normalizeHtml(operationalEnvironment?.physicalEnvironmentHtml)
  const networkEnvHtml = normalizeHtml(operationalEnvironment?.networkEnvironmentHtml)
  const systemEnvHtml = normalizeHtml(operationalEnvironment?.systemEnvironmentHtml)
  const constraintsHtml = normalizeHtml(operationalEnvironment?.operationalConstraintsHtml)
  const rdpsEnvHtml = normalizeHtml(operationalEnvironment?.rdpsEnvironmentHtml)
  const opEnvEvidenceEntries = normalizeEvidencePayload(operationalEnvironment?.evidenceEntries)
  const hasOperationalEnvironment = physicalEnvHtml || networkEnvHtml || systemEnvHtml || constraintsHtml || rdpsEnvHtml || opEnvEvidenceEntries.length

  // Product Architecture
  const productArchitecture = state.productArchitecture
  const archDescHtml = normalizeHtml(productArchitecture?.architectureDescriptionHtml)
  const archDiagramHtml = normalizeHtml(productArchitecture?.architectureDiagramHtml)
  const hwComponents = productArchitecture?.hardwareComponents || []
  const swComponents = productArchitecture?.softwareComponents || []
  const rdpsComponents = productArchitecture?.rdpsComponents || []
  const compInterfaces = productArchitecture?.componentInterfaces || []
  const archEvidenceEntries = normalizeEvidencePayload(productArchitecture?.evidenceEntries)
  const hasProductArchitecture = archDescHtml || archDiagramHtml || hwComponents.length || swComponents.length || rdpsComponents.length || compInterfaces.length || archEvidenceEntries.length

  // Product User Description
  const productUserDescription = state.productUserDescription
  const userDescHtml = normalizeHtml(productUserDescription?.userDescriptionHtml)
  const noRdps = productUserDescription?.noRdps || false
  const rdpsConsiderationsHtml = normalizeHtml(productUserDescription?.rdpsConsiderationsHtml)
  const userDescEvidenceEntries = normalizeEvidencePayload(productUserDescription?.evidenceEntries)
  const hasProductUserDescription = userDescHtml || noRdps || rdpsConsiderationsHtml || userDescEvidenceEntries.length

  // Product Context Assessment
  const productContextAssessment = state.productContextAssessment
  const hasProductContextAssessment = productContextAssessmentHasContent(productContextAssessment)

  // Risk Assessment Methodology (early check for empty payload)
  const riskAssessmentMethodologyEarly = state.riskAssessmentMethodology
  const hasRiskAssessmentMethodologyEarly = normalizeHtml(riskAssessmentMethodologyEarly?.methodologyDescriptionHtml) ||
    normalizeHtml(riskAssessmentMethodologyEarly?.justificationHtml) ||
    normalizeHtml(riskAssessmentMethodologyEarly?.consistentApplicationHtml) ||
    normalizeHtml(riskAssessmentMethodologyEarly?.individualAggregateRiskHtml) ||
    normalizeEvidencePayload(riskAssessmentMethodologyEarly?.evidenceEntries).length

  // Risk Acceptance Criteria (early check for empty payload)
  const riskAcceptanceCriteriaEarly = state.riskAcceptanceCriteria
  const hasRiskAcceptanceCriteriaEarly = normalizeHtml(riskAcceptanceCriteriaEarly?.riskAcceptanceCriteriaHtml) ||
    normalizeHtml(riskAcceptanceCriteriaEarly?.regulatoryFactorsHtml) ||
    normalizeHtml(riskAcceptanceCriteriaEarly?.contractualFactorsHtml) ||
    normalizeHtml(riskAcceptanceCriteriaEarly?.natureOfKnownRisksHtml) ||
    normalizeHtml(riskAcceptanceCriteriaEarly?.natureOfUsersHtml) ||
    normalizeHtml(riskAcceptanceCriteriaEarly?.natureOfProductHtml) ||
    normalizeHtml(riskAcceptanceCriteriaEarly?.stateOfTheArtHtml) ||
    normalizeEvidencePayload(riskAcceptanceCriteriaEarly?.evidenceEntries).length

  if (!generalHtml && !hasProductContext && !hasProductFunction && !hasOperationalEnvironment && !hasProductArchitecture && !hasProductUserDescription && !hasProductContextAssessment && !hasRiskAssessmentMethodologyEarly && !hasRiskAcceptanceCriteriaEarly) {
    return undefined
  }

  const payload: Record<string, unknown> = {}

  if (generalHtml) {
    payload.general_approach_html = generalHtml
  }

  if (hasProductContext) {
    payload.product_context = {
      intended_purpose_html: intendedPurposeHtml,
      specific_intended_uses_html: specificUsesHtml,
      foreseeable_use_html: foreseeableUseHtml,
      evidence_entries: contextEvidenceEntries,
    }
  }

  if (hasProductFunction) {
    payload.product_function = {
      primary_functions_html: primaryFunctionsHtml,
      security_functions_html: securityFunctionsHtml,
      evidence_entries: functionEvidenceEntries,
    }
  }

  if (hasOperationalEnvironment) {
    payload.operational_environment = {
      physical_environment_html: physicalEnvHtml,
      network_environment_html: networkEnvHtml,
      system_environment_html: systemEnvHtml,
      operational_constraints_html: constraintsHtml,
      rdps_environment_html: rdpsEnvHtml,
      evidence_entries: opEnvEvidenceEntries,
    }
  }

  if (hasProductArchitecture) {
    payload.product_architecture = {
      architecture_description_html: archDescHtml,
      no_hardware_components: productArchitecture?.noHardwareComponents || false,
      hardware_components: hwComponents.map((c: any) => ({
        component_name: c.componentName,
        function: c.function,
        interfaces: c.interfaces,
        security_functions: c.securityFunctions,
      })),
      software_components: swComponents.map((c: any) => ({
        type: c.type,
        function: c.function,
        third_party: c.thirdParty,
        interfaces: c.interfaces,
        security_functions: c.securityFunctions,
      })),
      no_rdps_components: productArchitecture?.noRdpsComponents || false,
      rdps_components: rdpsComponents.map((c: any) => ({
        component: c.component,
        provider: c.provider,
        function: c.function,
        location: c.location,
        development_responsibility: c.developmentResponsibility,
        operation_responsibility: c.operationResponsibility,
      })),
      component_interfaces: compInterfaces.map((c: any) => ({
        interface: c.interface,
        component_a: c.componentA,
        component_b: c.componentB,
        protocol: c.protocol,
        authentication: c.authentication,
        data_exchanged: c.dataExchanged,
      })),
      architecture_diagram_html: archDiagramHtml,
      evidence_entries: archEvidenceEntries,
    }
  }

  if (hasProductUserDescription) {
    payload.product_user_description = {
      user_description_html: userDescHtml,
      no_rdps: noRdps,
      rdps_considerations_html: rdpsConsiderationsHtml,
      evidence_entries: userDescEvidenceEntries,
    }
  }

  if (hasProductContextAssessment && productContextAssessment) {
    payload.product_context_assessment = {
      assessments: normalizeAssessmentEntries(productContextAssessment.assessments),
      overall_verdict: productContextAssessment.overallVerdict || 'not_assessed',
      summary_of_findings_html: normalizeHtml(productContextAssessment.summaryOfFindingsHtml) || '',
      non_conformities: normalizeNonConformityEntries(productContextAssessment.nonConformities),
    }
  }

  // Risk Assessment Methodology
  const riskAssessmentMethodology = state.riskAssessmentMethodology
  const methodologyDescHtml = normalizeHtml(riskAssessmentMethodology?.methodologyDescriptionHtml)
  const justificationHtml = normalizeHtml(riskAssessmentMethodology?.justificationHtml)
  const consistentAppHtml = normalizeHtml(riskAssessmentMethodology?.consistentApplicationHtml)
  const individualAggregateHtml = normalizeHtml(riskAssessmentMethodology?.individualAggregateRiskHtml)
  const methodologyEvidenceEntries = normalizeEvidencePayload(riskAssessmentMethodology?.evidenceEntries)
  const hasRiskAssessmentMethodology = methodologyDescHtml || justificationHtml || consistentAppHtml || individualAggregateHtml || methodologyEvidenceEntries.length

  if (hasRiskAssessmentMethodology) {
    payload.risk_assessment_methodology = {
      methodology_description_html: methodologyDescHtml,
      justification_html: justificationHtml,
      consistent_application_html: consistentAppHtml,
      individual_aggregate_risk_html: individualAggregateHtml,
      evidence_entries: methodologyEvidenceEntries,
    }
  }

  // Risk Acceptance Criteria
  const riskAcceptanceCriteria = state.riskAcceptanceCriteria
  const riskAcceptanceCriteriaHtml = normalizeHtml(riskAcceptanceCriteria?.riskAcceptanceCriteriaHtml)
  const regulatoryFactorsHtml = normalizeHtml(riskAcceptanceCriteria?.regulatoryFactorsHtml)
  const contractualFactorsHtml = normalizeHtml(riskAcceptanceCriteria?.contractualFactorsHtml)
  const natureOfKnownRisksHtml = normalizeHtml(riskAcceptanceCriteria?.natureOfKnownRisksHtml)
  const natureOfUsersHtml = normalizeHtml(riskAcceptanceCriteria?.natureOfUsersHtml)
  const natureOfProductHtml = normalizeHtml(riskAcceptanceCriteria?.natureOfProductHtml)
  const stateOfTheArtHtml = normalizeHtml(riskAcceptanceCriteria?.stateOfTheArtHtml)
  const acceptanceCriteriaEvidenceEntries = normalizeEvidencePayload(riskAcceptanceCriteria?.evidenceEntries)
  const hasRiskAcceptanceCriteria = riskAcceptanceCriteriaHtml || regulatoryFactorsHtml || contractualFactorsHtml || natureOfKnownRisksHtml || natureOfUsersHtml || natureOfProductHtml || stateOfTheArtHtml || acceptanceCriteriaEvidenceEntries.length

  if (hasRiskAcceptanceCriteria) {
    payload.risk_acceptance_criteria = {
      risk_acceptance_criteria_html: riskAcceptanceCriteriaHtml,
      regulatory_factors_html: regulatoryFactorsHtml,
      contractual_factors_html: contractualFactorsHtml,
      nature_of_known_risks_html: natureOfKnownRisksHtml,
      nature_of_users_html: natureOfUsersHtml,
      nature_of_product_html: natureOfProductHtml,
      state_of_the_art_html: stateOfTheArtHtml,
      evidence_entries: acceptanceCriteriaEvidenceEntries,
    }
  }

  // Risk Acceptance Criteria Assessment
  const riskAcceptanceCriteriaAssessment = state.riskAcceptanceCriteriaAssessment
  const hasRiskAcceptanceCriteriaAssessment = riskAcceptanceCriteriaAssessmentHasContent(riskAcceptanceCriteriaAssessment)

  if (hasRiskAcceptanceCriteriaAssessment && riskAcceptanceCriteriaAssessment) {
    payload.risk_acceptance_criteria_assessment = {
      assessments: normalizeAssessmentEntries(riskAcceptanceCriteriaAssessment.assessments),
      overall_verdict: riskAcceptanceCriteriaAssessment.overallVerdict || 'not_assessed',
      summary_of_findings_html: normalizeHtml(riskAcceptanceCriteriaAssessment.summaryOfFindingsHtml) || '',
      non_conformities: normalizeNonConformityEntries(riskAcceptanceCriteriaAssessment.nonConformities),
    }
  }

  return payload
}
