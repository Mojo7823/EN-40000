/**
 * Section status evaluation utilities for document preview
 */
import { stripHtml } from './textHelpers'

export type SectionStatus = 'done' | 'partial' | 'missing'

export interface CompletionResult {
  state: SectionStatus
  filled: number
  total: number
}

export interface SectionStatusItem {
  key: string
  title: string
  description: string
  status: SectionStatus
  summary: string
  to: string
  filled: number
  total: number
}

export interface SectionGroup {
  key: string
  title: string
  description: string
  state: string
  stateLabel: string
  items: SectionStatusItem[]
}

export interface EvidenceSummary {
  total: number
  completed: number
  state: 'completed' | 'partial' | 'missing'
}

/**
 * Evaluate completion state from an array of values
 */
export function evaluateCompletion(values: Array<string | undefined | null>): CompletionResult {
  const normalized = values.map((value) => {
    if (typeof value === 'string') {
      return stripHtml(value.trim())
    }
    if (value === null || value === undefined) {
      return ''
    }
    return String(value).trim()
  })
  const total = normalized.length
  const filled = normalized.filter((value) => value.length > 0).length
  if (total === 0 || filled === 0) {
    return { state: 'missing', filled, total }
  }
  if (filled === total) {
    return { state: 'done', filled, total }
  }
  return { state: 'partial', filled, total }
}

/**
 * Create a section status object
 */
export function createSectionStatus(
  key: string,
  title: string,
  description: string,
  values: Array<string | undefined | null>,
  to: string,
  summaryOverride?: string
): SectionStatusItem {
  const completion = evaluateCompletion(values)
  const status = completion.state
  const summary =
    summaryOverride ||
    (completion.total
      ? `${completion.filled} of ${completion.total} fields completed`
      : 'No data yet')
  return {
    key,
    title,
    description,
    status,
    summary,
    to,
    filled: completion.filled,
    total: completion.total,
  }
}

/**
 * Summarize evidence entries status
 */
export function summarizeEvidenceEntries(entries: Array<{ status?: string }>): EvidenceSummary {
  if (!entries.length) {
    return { total: 0, completed: 0, state: 'missing' }
  }
  const completed = entries.filter((entry) => entry.status === 'complete').length
  const inProgress = entries.filter((entry) => entry.status === 'in_progress').length
  const state =
    completed === entries.length
      ? 'completed'
      : completed > 0 || inProgress > 0
        ? 'partial'
        : 'missing'
  return { total: entries.length, completed, state }
}

/**
 * Get badge color for status
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'done':
    case 'completed':
      return 'success'
    case 'partial':
      return 'warning'
    case 'missing':
      return 'error'
    default:
      return 'neutral'
  }
}

/**
 * Get border/background classes for section cards
 */
export function getSectionBorderClasses(status: string): string {
  switch (status) {
    case 'done':
    case 'completed':
      return 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950'
    case 'partial':
      return 'border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-950'
    case 'missing':
      return 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950'
    default:
      return 'border-gray-300 dark:border-gray-700'
  }
}

/**
 * Get human-readable status label
 */
export function getStatusLabel(status: string): string {
  if (status === 'done' || status === 'completed') return 'Completed'
  if (status === 'partial') return 'Partial'
  return 'Missing'
}
