import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import ModalDemo from '../views/demo/ModalDemo.vue'
import RequirementsTableDemo from '../views/demo/RequirementsTableDemo.vue'
import EditorDemo from '../views/demo/EditorDemo.vue'
import XmlViewerDemo from '../views/demo/XmlViewerDemo.vue'
import DocxPreviewDemo from '../views/demo/DocxPreviewDemo.vue'
import StorageDemo from '../views/demo/StorageDemo.vue'
import CoverPage from '../views/document/CoverPage.vue'
import DocumentPreview from '../views/document/DocumentPreview.vue'
import DocumentStorage from '../views/document/DocumentStorage.vue'

const routes = [
  { path: '/', name: 'dashboard', component: Dashboard },
  { path: '/demo/modal', name: 'demo-modal', component: ModalDemo },
  { path: '/demo/table', name: 'demo-table', component: RequirementsTableDemo },
  { path: '/demo/editor', name: 'demo-editor', component: EditorDemo },
  { path: '/demo/xml-viewer', name: 'demo-xml-viewer', component: XmlViewerDemo },
  { path: '/demo/docx-preview', name: 'demo-docx', component: DocxPreviewDemo },
  { path: '/demo/storage', name: 'demo-storage', component: StorageDemo },
  { path: '/document/cover', name: 'document-cover', component: CoverPage },
  { path: '/document/preview', name: 'document-preview', component: DocumentPreview },
  { path: '/document/load-save', name: 'document-storage', component: DocumentStorage },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
