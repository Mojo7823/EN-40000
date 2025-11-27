/**
 * Text and HTML utility functions for document processing
 */

/**
 * Strip HTML tags from a string
 */
export function stripHtml(value?: string | null): string {
  if (!value) return ''
  if (typeof window === 'undefined') {
    return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  }
  const div = document.createElement('div')
  div.innerHTML = value
  return div.textContent?.trim() ?? ''
}

/**
 * Normalize HTML - returns undefined if empty or whitespace-only
 */
export function normalizeHtml(value?: string | null): string | undefined {
  if (!value) return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  return stripHtml(trimmed) ? trimmed : undefined
}

/**
 * Normalize plain text - returns undefined if empty
 */
export function normalizePlainText(value?: string | null): string | undefined {
  if (!value) return undefined
  const trimmed = value.trim()
  return trimmed.length ? trimmed : undefined
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(value?: string | null): string {
  if (!value) return ''
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
