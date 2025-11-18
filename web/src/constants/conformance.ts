import type { ConformanceStandardEntry } from '../types/conformance'

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

export function generateStandardEntryId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  idCounter += 1
  return `standard-${Date.now()}-${idCounter}`
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

