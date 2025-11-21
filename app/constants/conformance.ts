import type {
  ConformanceLevelStatus,
  ConformanceStandardEntry,
  RegulatoryReferenceEntry,
} from '../types/conformance'

export interface StandardDefinition {
  code: string
  description: string
}

export const PRIMARY_STANDARD_DEFINITION: StandardDefinition = {
  code: 'EN 40000-1-2-2025',
  description: 'Cybersecurity requirements for products with digital elements - Part 1-2: Principles for cyber resilience',
}

export const RELATED_STANDARD_DEFINITIONS: StandardDefinition[] = [
  { code: 'prEN 40000-1-1', description: 'Vocabulary' },
  { code: 'JT013090:2026', description: 'Vulnerability Handling' },
  { code: 'JT013091:2026', description: 'Generic Security Requirements' },
]

let idCounter = 0
let regulationCounter = 0

export interface RegulatoryDefinition {
  regulation: string
  description: string
}

export const REGULATORY_PRIMARY_REFERENCES: string[] = [
  'Regulation (EU) 2024/2847 - Cyber Resilience Act (CRA)',
  'Annex I Part I (1) - General design, development, and production requirements',
  'Annex I Part I (2) - Specific cybersecurity requirements',
  'Annex I Part II - Vulnerability handling requirements',
]

export const REGULATORY_REFERENCE_DEFINITIONS: RegulatoryDefinition[] = [
  { regulation: 'GDPR', description: 'General Data Protection Regulation' },
  { regulation: 'Directive (EU) 2019/882', description: 'European Accessibility Act' },
  { regulation: 'Other', description: 'List any other applicable regulations' },
]

export interface ConformanceLevelOption {
  value: ConformanceLevelStatus
  label: string
}

export const CONFORMANCE_LEVEL_OPTIONS: ConformanceLevelOption[] = [
  { value: 'full', label: 'Full Conformance' },
  { value: 'partial', label: 'Partial Conformance' },
  { value: 'non', label: 'Non-Conformance' },
]

export function generateStandardEntryId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  idCounter += 1
  return `standard-${Date.now()}-${idCounter}`
}

export function generateRegulationEntryId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  regulationCounter += 1
  return `regulation-${Date.now()}-${regulationCounter}`
}

export function createEntryFromDefinition(
  definition: StandardDefinition,
  source: 'default' | 'custom' = 'default'
): ConformanceStandardEntry {
  return {
    id: generateStandardEntryId(),
    code: definition.code,
    description: definition.description,
    source,
  }
}

export function buildDefaultPrimaryStandard(): ConformanceStandardEntry {
  return createEntryFromDefinition(PRIMARY_STANDARD_DEFINITION)
}

export function buildDefaultRelatedStandards(): ConformanceStandardEntry[] {
  return RELATED_STANDARD_DEFINITIONS.map((definition) => createEntryFromDefinition(definition))
}

export function createRegulationEntry(
  definition: RegulatoryDefinition,
  source: 'default' | 'custom' = 'default'
): RegulatoryReferenceEntry {
  return {
    id: generateRegulationEntryId(),
    regulation: definition.regulation,
    description: definition.description,
    source,
  }
}

export function buildDefaultRegulatoryEntries(): RegulatoryReferenceEntry[] {
  return REGULATORY_REFERENCE_DEFINITIONS.map((definition) => createRegulationEntry(definition))
}
