export interface ConformanceStandardEntry {
  id: string
  code: string
  description: string
  source?: 'default' | 'custom'
}

export interface RegulatoryReferenceEntry {
  id: string
  regulation: string
  description: string
  source?: 'default' | 'custom'
}

export type ConformanceLevelStatus = 'full' | 'partial' | 'non'

export interface ConformanceLevelState {
  statuses: ConformanceLevelStatus[]
  justificationHtml: string
}
