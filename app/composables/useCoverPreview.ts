/**
 * Composable for building cover preview payload and handling image uploads
 */
import { sessionService } from '~/services/sessionService'
import { dataUrlToFile } from '~/utils/dataUrl'
import { normalizeHtml, normalizePlainText, stripHtml } from '~/utils/textHelpers'
import { buildRegulatoryHtml, buildConformanceLevelHtml, buildRiskManagementPayload } from '~/utils/previewPayload'
import type { DocumentWorkspaceState } from '~/services/documentWorkspace'

const userId = sessionService.getUserToken()

/**
 * Sanitize image path to ensure it belongs to current user
 */
export function sanitizeImagePath(path?: string | null): string | undefined {
  if (!path) return undefined
  const expectedPrefix = `/cover/uploads/${userId}/`
  if (!path.startsWith(expectedPrefix)) {
    return undefined
  }
  return path
}

/**
 * Upload cover image if needed
 */
export async function uploadCoverImageIfNeeded(
  cover: DocumentWorkspaceState['cover'],
  updateCoverState: (state: Partial<DocumentWorkspaceState['cover']>) => DocumentWorkspaceState,
  force = false
): Promise<string | undefined> {
  if (!cover.imageData) {
    return sanitizeImagePath(cover.imagePath)
  }
  if (!force && cover.imagePath) {
    return sanitizeImagePath(cover.imagePath)
  }

  const file = dataUrlToFile(cover.imageData, 'cover-image')
  if (!file) {
    return sanitizeImagePath(cover.imagePath)
  }

  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await $fetch('http://localhost:8000/api/cover/upload', {
      method: 'POST',
      body: formData,
      params: { user_id: userId }
    })
    const newPath: string | null = (response as any)?.path ?? null
    if (newPath) {
      updateCoverState({ imagePath: newPath })
    }
    return sanitizeImagePath(newPath) ?? undefined
  } catch (uploadError) {
    console.error('Cover upload failed', uploadError)
    return sanitizeImagePath(cover.imagePath)
  }
}

/**
 * Build the full cover preview payload for API
 */
export function buildCoverPreviewPayload(
  workspace: DocumentWorkspaceState,
  imagePath?: string | null
): Record<string, unknown> {
  const { cover, introduction, purposeScope, productIdentification, productOverview, manufacturerInformation, conformanceClaim, documentConvention, riskManagement } = workspace
  
  const productTitle = introduction.productName?.trim() || cover.deviceName?.trim() || 'CRA Documentation'
  const normalize = normalizePlainText
  const standardsState = conformanceClaim.standardsConformance

  const introductionPayload = {
    product_name: normalize(introduction.productName),
    product_version: normalize(introduction.productVersion),
    product_type: normalize(introduction.productType),
    manufacturer: normalize(introduction.manufacturerName),
    manufacturer_address: normalize(introduction.manufacturerAddress),
    status: normalize(introduction.status),
    prepared_by: normalize(introduction.preparedBy),
    reviewed_by: normalize(introduction.reviewedBy),
    approved_by: normalize(introduction.approvedBy),
  }

  const methodologyHtml = purposeScope.methodologyHtml?.trim()
  const purposeScopePayload = {
    product_name: productTitle,
    scope_selections: [...purposeScope.scopeSelections],
    assessment_start: normalize(purposeScope.assessmentStart),
    assessment_end: normalize(purposeScope.assessmentEnd),
    methodology_html: methodologyHtml && stripHtml(methodologyHtml) ? methodologyHtml : undefined,
  }

  const productIdentificationPayload = {
    product_description_html: normalizeHtml(productIdentification.productDescriptionHtml),
    key_functions_html: normalizeHtml(productIdentification.keyFunctionsHtml),
    target_market: normalize(productIdentification.targetMarket),
  }

  const thirdPartyState = productOverview.thirdPartyComponents
  const thirdPartyComponentsPayload = {
    entries: thirdPartyState.entries
      .map((entry) => ({
        component_name: normalize(entry.componentName),
        component_type: normalize(entry.componentType),
        version: normalize(entry.version),
        supplier: normalize(entry.supplier),
        purpose: normalize(entry.purpose),
        license: normalize(entry.license),
      }))
      .filter((entry) => Object.values(entry).some((value) => !!value)),
    management_approach_html: normalizeHtml(thirdPartyState.managementApproachHtml),
    evidence_reference_html: normalizeHtml(thirdPartyState.evidenceReferenceHtml),
  }

  const productOverviewPayload = {
    product_description_html: normalizeHtml(productOverview.productDescriptionHtml),
    product_architecture_html: normalizeHtml(productOverview.productArchitectureHtml),
    third_party_components: thirdPartyComponentsPayload,
  }

  const manufacturerInformationPayload = {
    legal_entity: normalize(manufacturerInformation.legalEntity),
    registration_number: normalize(manufacturerInformation.registrationNumber),
    address: normalize(manufacturerInformation.address),
    contact_person: normalize(manufacturerInformation.contactPerson),
    phone: normalize(manufacturerInformation.phone),
  }

  const normalizeStandardEntry = (
    entry?: { code?: string | null; description?: string | null } | null
  ) => {
    if (!entry) return undefined
    const codeValue = normalize(entry.code)
    const descriptionValue = normalize(entry.description)
    if (!codeValue && !descriptionValue) {
      return undefined
    }
    return {
      ...(codeValue ? { code: codeValue } : {}),
      ...(descriptionValue ? { description: descriptionValue } : {}),
    }
  }

  const normalizedPrimaryStandard = normalizeStandardEntry(standardsState.primaryStandard)
  const normalizedRelatedStandards = standardsState.relatedStandards
    .map((entry) => normalizeStandardEntry(entry))
    .filter((entry): entry is { code?: string; description?: string } => !!entry)
  const normalizedOtherNotes = normalize(standardsState.otherNotes)
  const includeOtherFlag = Boolean(standardsState.includeOther && normalizedOtherNotes)
  const standardsConformancePayload =
    normalizedPrimaryStandard || normalizedRelatedStandards.length || includeOtherFlag
      ? {
          ...(normalizedPrimaryStandard ? { primary_standard: normalizedPrimaryStandard } : {}),
          related_standards: normalizedRelatedStandards,
          include_other: includeOtherFlag,
          other_notes: includeOtherFlag ? normalizedOtherNotes : undefined,
        }
      : undefined

  const regulatoryState = conformanceClaim.regulatoryConformance
  const regulatoryHtml = normalizeHtml(buildRegulatoryHtml(regulatoryState))
  const conformanceLevelHtml = normalizeHtml(buildConformanceLevelHtml(conformanceClaim.conformanceLevel))
  const conformanceClaimPayload =
    standardsConformancePayload || regulatoryHtml || conformanceLevelHtml
      ? {
          standards_conformance: standardsConformancePayload,
          regulatory_conformance_html: regulatoryHtml,
          conformance_level_html: conformanceLevelHtml,
        }
      : undefined

  const documentConventionPayload = {
    terminology_entries: documentConvention.terminologyEntries
      .map((entry) => ({
        term: normalize(entry.term),
        definition: normalize(entry.definition),
        reference: normalize(entry.reference),
      }))
      .filter((entry) => entry.term || entry.definition || entry.reference),
    evidence_notation_html: normalizeHtml(documentConvention.evidenceNotationHtml),
    requirement_notation_html: normalizeHtml(documentConvention.requirementNotationHtml),
    assessment_verdicts_html: normalizeHtml(documentConvention.assessmentVerdictsHtml),
  }

  const riskManagementSection = buildRiskManagementPayload(riskManagement)

  const manufacturerBlock = [normalize(cover.labName), normalize(cover.labAddress)]
    .filter(Boolean)
    .join('\n')
  const safeImagePath = sanitizeImagePath(imagePath ?? cover.imagePath)

  const payload: Record<string, unknown> = {
    user_id: userId,
    title: productTitle,
    description: cover.deviceDescription,
    version: cover.versionNumber,
    revision: cover.revisionDate,
    manufacturer: manufacturerBlock || undefined,
    date: cover.revisionDate,
    image_path: safeImagePath,
    introduction: introductionPayload,
    purpose_scope: purposeScopePayload,
    product_identification: productIdentificationPayload,
    product_overview: productOverviewPayload,
    manufacturer_information: manufacturerInformationPayload,
    conformance_claim: conformanceClaimPayload,
    document_convention: documentConventionPayload,
  }

  if (riskManagementSection) {
    payload.risk_management = riskManagementSection
  }

  return payload
}
