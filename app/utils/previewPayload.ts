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

  if (!generalHtml && !hasProductContext && !hasProductFunction && !hasOperationalEnvironment && !hasProductArchitecture && !hasProductUserDescription) {
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

  return payload
}
