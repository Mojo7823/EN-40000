export interface XmlTreeNode {
  label: string
  data?: string | null
  attributes?: Record<string, string>
  children?: XmlTreeNode[]
}

export interface XmlSample {
  id: string
  title: string
  description: string
  tree: XmlTreeNode
}

const buildChildren = (children: XmlTreeNode[] = []): XmlTreeNode[] =>
  children.map(child => ({
    attributes: {},
    children: [],
    ...child,
  }))

export const xmlSamples: XmlSample[] = [
  {
    id: 'fcs',
    title: 'Cryptographic Support',
    description: 'Snapshot of a Common Criteria FCS class and its nested components.',
    tree: {
      label: 'f-class (FCS)',
      data: 'Cryptographic Support',
      attributes: {},
      children: buildChildren([
        {
          label: 'f-family (FCS_COP)',
          data: 'Cryptographic Operation',
          children: buildChildren([
            {
              label: 'f-component (FCS_COP.1)',
              data: 'Cryptographic operation',
              children: buildChildren([
                { label: 'f-element (FCS_COP.1.1)', data: 'The TSF shall perform [assignment: algorithm].' },
                { label: 'f-element (FCS_COP.1.2)', data: 'The TSF shall comply with [assignment: standards].' },
              ]),
            },
          ]),
        },
      ]),
    },
  },
  {
    id: 'fia',
    title: 'Identification & Authentication',
    description: 'Simplified FIA tree highlighting TOE user authentication elements.',
    tree: {
      label: 'f-class (FIA)',
      data: 'Identification and Authentication',
      attributes: {},
      children: buildChildren([
        {
          label: 'f-family (FIA_UAU)',
          data: 'User authentication',
          children: buildChildren([
            {
              label: 'f-component (FIA_UAU.2)',
              data: 'User authentication before any action',
              children: buildChildren([
                {
                  label: 'f-element (FIA_UAU.2.1)',
                  data: 'The TSF shall require each user to be successfully authenticated before allowing any actions.',
                },
              ]),
            },
          ]),
        },
      ]),
    },
  },
]

export const defaultXmlSampleId = xmlSamples[0]?.id ?? 'fcs'
