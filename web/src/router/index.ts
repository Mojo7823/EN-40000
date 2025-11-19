import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import ModalDemo from '../views/demo/ModalDemo.vue'
import RequirementsTableDemo from '../views/demo/RequirementsTableDemo.vue'
import EditorDemo from '../views/demo/EditorDemo.vue'
import XmlViewerDemo from '../views/demo/XmlViewerDemo.vue'
import DocxPreviewDemo from '../views/demo/DocxPreviewDemo.vue'
import StorageDemo from '../views/demo/StorageDemo.vue'
import CoverPage from '../views/document/CoverPage.vue'
import DocumentInformation from '../views/document/DocumentInformation.vue'
import PurposeScope from '../views/document/PurposeScope.vue'
import ProductIdentification from '../views/document/ProductIdentification.vue'
import ManufacturerInformation from '../views/document/ManufacturerInformation.vue'
import DocumentPreview from '../views/document/DocumentPreview.vue'
import DocumentStorage from '../views/document/DocumentStorage.vue'
import ProductDescription from '../views/product/ProductDescription.vue'
import ProductArchitectureOverview from '../views/product/ProductArchitectureOverview.vue'
import ThirdPartyComponents from '../views/product/ThirdPartyComponents.vue'
import StandardsConformance from '../views/conformance/StandardsConformance.vue'
import RegulatoryConformance from '../views/conformance/RegulatoryConformance.vue'
import ConformanceLevel from '../views/conformance/ConformanceLevel.vue'
import Terminology from '../views/convention/Terminology.vue'
import EvidenceNotation from '../views/convention/EvidenceNotation.vue'
import RequirementNotation from '../views/convention/RequirementNotation.vue'
import AssessmentVerdicts from '../views/convention/AssessmentVerdicts.vue'

const routes = [
  { path: '/', name: 'dashboard', component: Dashboard },
  { path: '/demo/modal', name: 'demo-modal', component: ModalDemo },
  { path: '/demo/table', name: 'demo-table', component: RequirementsTableDemo },
  { path: '/demo/editor', name: 'demo-editor', component: EditorDemo },
  { path: '/demo/xml-viewer', name: 'demo-xml-viewer', component: XmlViewerDemo },
  { path: '/demo/docx-preview', name: 'demo-docx', component: DocxPreviewDemo },
  { path: '/demo/storage', name: 'demo-storage', component: StorageDemo },
  { path: '/document/cover', name: 'document-cover', component: CoverPage },
  { path: '/document/introduction', name: 'document-introduction', component: DocumentInformation },
  { path: '/document/purpose-scope', name: 'document-purpose-scope', component: PurposeScope },
  {
    path: '/document/product-identification',
    name: 'document-product-identification',
    component: ProductIdentification,
  },
  {
    path: '/document/manufacturer-information',
    name: 'document-manufacturer-information',
    component: ManufacturerInformation,
  },
  {
    path: '/product-overview/description',
    name: 'product-overview-description',
    component: ProductDescription,
  },
  {
    path: '/product-overview/architecture',
    name: 'product-overview-architecture',
    component: ProductArchitectureOverview,
  },
  {
    path: '/product-overview/third-party-components',
    name: 'product-overview-third-party',
    component: ThirdPartyComponents,
  },
  {
    path: '/conformance/standards',
    name: 'conformance-standards',
    component: StandardsConformance,
  },
  {
    path: '/conformance/regulatory',
    name: 'conformance-regulatory',
    component: RegulatoryConformance,
  },
  {
    path: '/conformance/level',
    name: 'conformance-level',
    component: ConformanceLevel,
  },
  {
    path: '/convention/terminology',
    name: 'convention-terminology',
    component: Terminology,
  },
  {
    path: '/convention/evidence-notation',
    name: 'convention-evidence',
    component: EvidenceNotation,
  },
  {
    path: '/convention/requirement-notation',
    name: 'convention-requirement',
    component: RequirementNotation,
  },
  {
    path: '/convention/assessment-verdicts',
    name: 'convention-assessment',
    component: AssessmentVerdicts,
  },
  {
    path: '/convention/notation',
    redirect: '/convention/evidence-notation',
  },
  { path: '/document/preview', name: 'document-preview', component: DocumentPreview },
  { path: '/document/load-save', name: 'document-storage', component: DocumentStorage },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
