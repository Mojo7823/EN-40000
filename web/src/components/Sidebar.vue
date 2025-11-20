<template>
  <ul class="menu">
    <li>
      <RouterLink to="/" active-class="active">Dashboard</RouterLink>
    </li>
    <li>
      <RouterLink to="/document/cover" active-class="active">Cover</RouterLink>
    </li>
    <li>
      <div class="accordion">
        <div class="accordion-header" @click="introductionOpen = !introductionOpen">
          <span>Introduction</span>
          <span>{{ introductionOpen ? '▾' : '▸' }}</span>
        </div>
        <div v-if="introductionOpen" class="accordion-content">
          <ul class="menu nested">
            <li v-for="link in introductionLinks" :key="link.to">
              <RouterLink :to="link.to" active-class="active">{{ link.label }}</RouterLink>
            </li>
          </ul>
        </div>
      </div>
    </li>
    <li>
      <div class="accordion">
        <div class="accordion-header" @click="productOverviewOpen = !productOverviewOpen">
          <span>Product Overview</span>
          <span>{{ productOverviewOpen ? '▾' : '▸' }}</span>
        </div>
        <div v-if="productOverviewOpen" class="accordion-content">
          <ul class="menu nested">
            <li v-for="link in productOverviewLinks" :key="link.to">
              <RouterLink :to="link.to" active-class="active">{{ link.label }}</RouterLink>
            </li>
          </ul>
        </div>
      </div>
    </li>
    <li>
      <div class="accordion">
        <div class="accordion-header" @click="conformanceOpen = !conformanceOpen">
          <span>Conformance Claim</span>
          <span>{{ conformanceOpen ? '▾' : '▸' }}</span>
        </div>
        <div v-if="conformanceOpen" class="accordion-content">
          <ul class="menu nested">
            <li v-for="link in conformanceLinks" :key="link.to">
              <RouterLink :to="link.to" active-class="active">{{ link.label }}</RouterLink>
            </li>
          </ul>
        </div>
      </div>
    </li>
    <li>
      <div class="accordion">
        <div class="accordion-header" @click="documentConventionOpen = !documentConventionOpen">
          <span>Document Convention</span>
          <span>{{ documentConventionOpen ? '▾' : '▸' }}</span>
        </div>
        <div v-if="documentConventionOpen" class="accordion-content">
          <ul class="menu nested">
            <li v-for="link in documentConventionLinks" :key="link.to">
              <RouterLink :to="link.to" active-class="active">{{ link.label }}</RouterLink>
            </li>
          </ul>
        </div>
      </div>
    </li>

    <li>
      <div class="accordion">
        <div class="accordion-header" @click="riskOpen = !riskOpen">
          <span>Risk Management Elements</span>
          <span>{{ riskOpen ? '▾' : '▸' }}</span>
        </div>
        <div v-if="riskOpen" class="accordion-content">
          <ul class="menu nested">
            <li v-for="link in riskLinks" :key="link.label">
              <!-- Simple link without children -->
              <RouterLink 
                v-if="!link.disabled && !link.children" 
                :to="link.to" 
                active-class="active"
              >
                {{ link.label }}
              </RouterLink>
              
              <!-- Disabled link -->
              <span v-else-if="link.disabled" class="menu-disabled">{{ link.label }}</span>
              
              <!-- Link with nested children -->
              <div v-else class="nested-accordion">
                <div class="nested-accordion-header" @click.stop="toggleNestedSection(link.label)">
                  <RouterLink :to="link.to" active-class="active" @click.stop>
                    {{ link.label }}
                  </RouterLink>
                  <span class="nested-toggle">{{ isNestedOpen(link.label) ? '▾' : '▸' }}</span>
                </div>
                <div v-if="isNestedOpen(link.label)" class="nested-accordion-content">
                  <ul class="menu nested-deep">
                    <li v-for="child in link.children" :key="child.label">
                      <RouterLink v-if="!child.disabled" :to="child.to" active-class="active">
                        {{ child.label }}
                      </RouterLink>
                      <span v-else class="menu-disabled">{{ child.label }}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </li>

    <li>
      <div class="accordion">
        <div class="accordion-header" @click="documentOpen = !documentOpen">
          <span>Document Management</span>
          <span>{{ documentOpen ? '▾' : '▸' }}</span>
        </div>
        <div v-if="documentOpen" class="accordion-content">
          <ul class="menu nested">
            <li v-for="link in documentLinks" :key="link.to">
              <RouterLink :to="link.to" active-class="active">{{ link.label }}</RouterLink>
            </li>
          </ul>
        </div>
      </div>
    </li>
    <li>
      <div class="accordion">
        <div class="accordion-header" @click="demoOpen = !demoOpen">
          <span>Demo</span>
          <span>{{ demoOpen ? '▾' : '▸' }}</span>
        </div>
        <div v-if="demoOpen" class="accordion-content">
          <ul class="menu nested">
            <li v-for="link in demoLinks" :key="link.to">
              <RouterLink :to="link.to" active-class="active">{{ link.label }}</RouterLink>
            </li>
          </ul>
        </div>
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const introductionOpen = ref(true)
const productOverviewOpen = ref(true)
const conformanceOpen = ref(true)
const documentOpen = ref(true)
const demoOpen = ref(false)
const documentConventionOpen = ref(true)
const riskOpen = ref(true)

// Track which nested sections are open
const nestedSectionsOpen = ref<Record<string, boolean>>({
  'General Approach to Risk Management': true,
})

function toggleNestedSection(label: string) {
  nestedSectionsOpen.value[label] = !nestedSectionsOpen.value[label]
}

function isNestedOpen(label: string) {
  return nestedSectionsOpen.value[label] ?? false
}

const introductionLinks = [
  { label: 'Document Information', to: '/document/introduction' },
  { label: 'Purpose and Scope', to: '/document/purpose-scope' },
  { label: 'Product Identification', to: '/document/product-identification' },
  { label: 'Manufacturer Information', to: '/document/manufacturer-information' },
]
const productOverviewLinks = [
  { label: 'Product Description', to: '/product-overview/description' },
  { label: 'Product Architecture Overview', to: '/product-overview/architecture' },
  { label: 'Third-Party Components', to: '/product-overview/third-party-components' },
]
const conformanceLinks = [
  { label: 'Standards Conformance', to: '/conformance/standards' },
  { label: 'Regulatory Conformance', to: '/conformance/regulatory' },
  { label: 'Conformance Level', to: '/conformance/level' },
]
const riskLinks = [
  { 
    label: 'General Approach to Risk Management', 
    to: '/risk/general-approach', 
    disabled: false,
    children: [
      { label: 'Product Context', to: '/pcontext/intended-purpose', disabled: false },
    ]
  },
  { label: 'Risk Acceptance Criteria and Risk Management', to: '', disabled: true },
  { label: 'Risk Assessment', to: '', disabled: true },
  { label: 'Risk Treatment', to: '', disabled: true },
  { label: 'Risk Communication', to: '', disabled: true },
  { label: 'Risk Monitoring and Review', to: '', disabled: true },
]
const documentConventionLinks = [
  { label: 'Terminology', to: '/convention/terminology' },
  { label: 'Notation', to: '/convention/notation' },
]
const documentLinks = [
  { label: 'Document Preview', to: '/document/preview' },
  { label: 'Load & Save', to: '/document/load-save' },
  { label: 'Evidence List', to: '/document/evidence' },
]
const demoLinks = [
  { label: 'Modal', to: '/demo/modal' },
  { label: 'Requirements Table', to: '/demo/table' },
  { label: 'Rich Text Editor', to: '/demo/editor' },
  { label: 'XML Viewer', to: '/demo/xml-viewer' },
  { label: 'Docx Preview', to: '/demo/docx-preview' },
  { label: 'Save / Load', to: '/demo/storage' },
]
</script>

<style scoped src="./Sidebar.css"></style>
