import type {
  SecurityObjectiveEntry,
  SecurityObjectivesSessionData,
  SecurityObjectiveMatrixSessionData,
  SecurityObjectiveRationaleSessionData,
  SpdEntry,
} from '../services/sessionService'

export interface SecurityObjectivesPreviewData {
  toeObjectives?: SecurityObjectiveEntry[]
  oeObjectives?: SecurityObjectiveEntry[]
  assumptions?: SpdEntry[]
  threats?: SpdEntry[]
  osp?: SpdEntry[]
  matrixSelections?: Iterable<string>
  assumptionRationales?: Record<string, string>
  threatRationales?: Record<string, string>
  ospRationales?: Record<string, string>
}

export interface SecurityObjectivesPreviewOptions {
  rootSectionNumber?: number
  includeRootHeading?: boolean
}

function escapeHtml(value: string): string {
  const div = document.createElement('div')
  div.textContent = value
  return div.innerHTML
}

function buildObjectivesTable(entries: SecurityObjectiveEntry[], label: string, tableNumber: string): string {
  if (!entries.length) {
    return ''
  }

  const rows = entries
    .map(entry => {
      const safeTitle = escapeHtml(entry.title || '')
      const description = entry.description || ''
      return `
        <tr>
          <td style="padding: 8px; vertical-align: top;">${safeTitle}</td>
          <td style="padding: 8px; vertical-align: top;">${description}</td>
        </tr>
      `
    })
    .join('')

  return `
    <table border="1" style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr>
          <th style="padding: 8px; text-align: left;">Security Objectives</th>
          <th style="padding: 8px; text-align: left;">Description</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
    <p style="text-align: center; margin-top: 8px;"><em>Table ${tableNumber} ${label}</em></p>
  `
}

type MatrixColumnType = 'assumption' | 'threat' | 'osp'

interface MatrixColumn {
  key: string
  title: string
  type: MatrixColumnType
}

interface MatrixRow {
  key: string
  title: string
  scope: 'toe' | 'oe'
}

function createColumn(type: MatrixColumnType, entry: SpdEntry): MatrixColumn {
  return {
    key: `${type}:${entry.id}`,
    title: entry.title || '',
    type,
  }
}

function createRow(scope: 'toe' | 'oe', entry: SecurityObjectiveEntry): MatrixRow {
  return {
    key: `${scope}:${entry.id}`,
    title: entry.title || '',
    scope,
  }
}

function createCellKey(rowKey: string, columnKey: string): string {
  return `${rowKey}::${columnKey}`
}

function buildMatrixTable(rows: MatrixRow[], columns: MatrixColumn[], selectedCells: Set<string>, tableNumber: string): string {
  if (!rows.length || !columns.length) {
    return `
      <p>There are no objectives or Security Problem Definition entries available to map.</p>
    `
  }

  const headerCells = columns
    .map(column => `<th style="padding: 8px; text-align: center;">${escapeHtml(column.title)}</th>`)
    .join('')

  const bodyRows = rows
    .map(row => {
      const cells = columns
        .map(column => {
          const cellKey = createCellKey(row.key, column.key)
          const marker = selectedCells.has(cellKey) ? 'X' : ''
          return `<td style="padding: 8px; text-align: center;">${marker}</td>`
        })
        .join('')

      return `
        <tr>
          <td style="padding: 8px; vertical-align: top;">${escapeHtml(row.title)}</td>
          ${cells}
        </tr>
      `
    })
    .join('')

  return `
    <table border="1" style="width: 100%; border-collapse: collapse; font-size: 8px;">
      <thead>
        <tr>
          <th style="padding: 8px; text-align: left;">Objectives/Threat & Assumptions</th>
          ${headerCells}
        </tr>
      </thead>
      <tbody>
        ${bodyRows}
      </tbody>
    </table>
    <p style="text-align: center; margin-top: 8px;"><em>Table ${tableNumber} Threats and Assumptions to Security Objectives Mapping</em></p>
  `
}

function buildRationaleTable(
  entries: SpdEntry[],
  rationales: Record<string, string>,
  columnLabel: string,
  captionLabel: string,
  emptyLabel: string,
  tableNumber: string,
): string {
  if (!entries.length) {
    return `<p>There are no ${emptyLabel} defined.</p>`
  }

  const rows = entries
    .map(entry => {
      const key = String(entry.id)
      const rationale = rationales[key] || ''
      return `
        <tr>
          <td style="padding: 8px; vertical-align: top;">${escapeHtml(entry.title || '')}</td>
          <td style="padding: 8px; vertical-align: top;">${rationale}</td>
        </tr>
      `
    })
    .join('')

  return `
    <table border="1" style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr>
          <th style="padding: 8px; text-align: left;">${columnLabel}</th>
          <th style="padding: 8px; text-align: left;">Rationale</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
    <p style="text-align: center; margin-top: 8px;"><em>Table ${tableNumber} ${captionLabel}</em></p>
  `
}

export function buildSecurityObjectivesHtml(
  data: SecurityObjectivesPreviewData,
  options: SecurityObjectivesPreviewOptions = {},
): string {
  const rootSectionNumber = options.rootSectionNumber ?? 4
  const includeRootHeading = options.includeRootHeading ?? true

  const toeObjectives = data.toeObjectives ?? []
  const oeObjectives = data.oeObjectives ?? []
  const assumptions = data.assumptions ?? []
  const threats = data.threats ?? []
  const osp = data.osp ?? []
  const matrixSelections = new Set<string>(data.matrixSelections ? Array.from(data.matrixSelections) : [])
  const assumptionRationales = data.assumptionRationales ?? {}
  const threatRationales = data.threatRationales ?? {}
  const ospRationales = data.ospRationales ?? {}

  const matrixColumns: MatrixColumn[] = [
    ...assumptions.map(entry => createColumn('assumption', entry)),
    ...threats.map(entry => createColumn('threat', entry)),
    ...osp.map(entry => createColumn('osp', entry)),
  ]

  const matrixRows: MatrixRow[] = [
    ...toeObjectives.map(entry => createRow('toe', entry)),
    ...oeObjectives.map(entry => createRow('oe', entry)),
  ]

  let html = ''

  if (includeRootHeading) {
    html += `<h2>${rootSectionNumber}. Security Objectives</h2>`
  }

  html +=
    '<p>The specific conditions listed in the following subsections are assumed to exist in the TOE’s environment. These assumptions include both practical realities in the development of the TOE security requirements and the essential environmental conditions on the use of the TOE.</p>'

  html += `<h3>${rootSectionNumber}.1 Security Objectives for the TOE</h3>`
  html += '<p>The following security objectives are to be satisfied by the TOE:</p>'

  if (toeObjectives.length) {
    html += buildObjectivesTable(toeObjectives, 'Security Objectives for the TOE', `${rootSectionNumber}.1`)
    html += '<p></p>'
  } else {
    html += '<p>There are no security objectives defined for the TOE.</p>'
  }

  html += `<h3>${rootSectionNumber}.2 Security Objectives for the Operational Environment</h3>`
  html += '<p>The following security objectives are to be satisfied by the Operational Environment:</p>'

  if (oeObjectives.length) {
    html += buildObjectivesTable(oeObjectives, 'Security Objectives for the Operational Environment', `${rootSectionNumber}.2`)
    html += '<p></p>'
  } else {
    html += '<p>There are no security objectives defined for the Operational Environment.</p>'
  }

  html += `<h3>${rootSectionNumber}.3 Security Objectives Rationale</h3>`
  html +=
    '<p>This rationale consists of four parts:</p>' +
    '<ul>' +
    '<li>A table mapping all the threats and assumptions against security objectives</li>' +
    '<li>A rationale that the security objectives uphold all assumptions</li>' +
    '<li>A rationale that the security objectives counter all threats</li>' +
    '<li>A rationale that the security objectives enforce the organizational security policies</li>' +
    '</ul>'
  html += '<p></p>'

  html += `<h4>${rootSectionNumber}.3.1 Threats and Assumptions to Security Objectives Mapping</h4>`
  html += buildMatrixTable(matrixRows, matrixColumns, matrixSelections, `${rootSectionNumber}.3.1`)
  html += '<p></p>'

  html += `<h4>${rootSectionNumber}.3.2 Assumptions to security objectives rationale</h4>`
  html += buildRationaleTable(
    assumptions,
    assumptionRationales,
    'Assumption',
    'Assumptions to security objectives rationale',
    'assumptions',
    `${rootSectionNumber}.3.2`,
  )
  html += '<p></p>'

  html += `<h4>${rootSectionNumber}.3.3 Threats to security objectives rationale</h4>`
  html += buildRationaleTable(
    threats,
    threatRationales,
    'Threat',
    'Threats to security objectives rationale',
    'threats',
    `${rootSectionNumber}.3.3`,
  )
  html += '<p></p>'

  html += `<h4>${rootSectionNumber}.3.4 Organizational security policies to security objectives rationale</h4>`
  html += buildRationaleTable(
    osp,
    ospRationales,
    'Organizational Security Policy',
    'Organizational security policies to security objectives rationale',
    'organizational security policies',
    `${rootSectionNumber}.3.4`,
  )

  return html
}

export function hasSecurityObjectiveEntries(data: SecurityObjectivesSessionData | null | undefined): boolean {
  return Array.isArray(data?.items) && data!.items.length > 0
}

export function hasSecurityObjectivesMatrixData(data: SecurityObjectiveMatrixSessionData | null | undefined): boolean {
  return Array.isArray(data?.selectedCells) && data!.selectedCells.length > 0
}

export function hasSecurityObjectivesRationaleData(
  data: SecurityObjectiveRationaleSessionData | null | undefined,
): boolean {
  if (!data) {
    return false
  }
  const hasAssumptionContent = Object.values(data.assumptionRationales || {}).some(value => {
    const temp = document.createElement('div')
    temp.innerHTML = value || ''
    return (temp.textContent || temp.innerText || '').trim().length > 0
  })
  const hasThreatContent = Object.values(data.threatRationales || {}).some(value => {
    const temp = document.createElement('div')
    temp.innerHTML = value || ''
    return (temp.textContent || temp.innerText || '').trim().length > 0
  })
  const hasOspContent = Object.values(data.ospRationales || {}).some(value => {
    const temp = document.createElement('div')
    temp.innerHTML = value || ''
    return (temp.textContent || temp.innerText || '').trim().length > 0
  })
  return hasAssumptionContent || hasThreatContent || hasOspContent
}
