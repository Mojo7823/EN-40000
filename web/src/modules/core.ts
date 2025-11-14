import api from '../services/api'
import RichTextEditor from '../components/RichTextEditor.vue'

export { default as apiClient } from '../services/api'
export * from '../services/sessionService'
export { ensureCoverImageUploaded } from '../utils/coverImage'
export * from '../utils/securityPreview'
export * from '../utils/securityObjectivesPreview'
export * from '../utils/spdPreview'
export * from '../utils/dataUrl'
export { RichTextEditor }

export interface HtmlPreviewPayload {
  user_id: string
  html_content: string
}

export interface CoverPreviewPayload {
  user_id: string
  title?: string
  version?: string
  revision?: string
  description?: string
  manufacturer?: string
  date?: string
  image_path?: string
}

export interface FinalPreviewPayload {
  user_id: string
  cover_data?: Record<string, unknown>
  st_reference_html?: string
  toe_reference_html?: string
  toe_overview_html?: string
  toe_description_html?: string
  conformance_claims_html?: string
  spd_html?: string
  security_objectives_html?: string
  tss_html?: string
  sfr_list?: Array<Record<string, unknown>>
  sar_list?: Array<Record<string, unknown>>
  selected_eal?: string
  sfr_preview_html?: string
  sar_preview_html?: string
}

const htmlPreviewEndpoints: Record<string, string> = {
  sfr: '/security/sfr/preview',
  sar: '/security/sar/preview',
  spd: '/spd/preview',
  so: '/so/preview',
  tss: '/tss/preview',
}

export async function generateCoverPreview(payload: CoverPreviewPayload) {
  const response = await api.post('/cover/preview', payload)
  return response.data
}

export async function generateHtmlPreview(section: keyof typeof htmlPreviewEndpoints, payload: HtmlPreviewPayload) {
  const endpoint = htmlPreviewEndpoints[section]
  if (!endpoint) {
    throw new Error(`Unsupported preview section: ${section}`)
  }
  const response = await api.post(endpoint, payload)
  return response.data
}

export async function generateFinalDocx(payload: FinalPreviewPayload) {
  const response = await api.post('/final-preview', payload)
  return response.data
}
