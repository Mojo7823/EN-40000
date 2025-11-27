<template>
  <div class="container mx-auto p-6 space-y-6">
    <!-- Header Card -->
    <UCard
      class="border-primary-200 dark:border-primary-800 bg-gradient-to-r from-primary-50/80 via-white to-white dark:from-primary-950 dark:via-gray-950 dark:to-gray-900"
    >
      <template #header>
        <div class="flex items-start justify-between">
          <div>
            <p class="text-xs uppercase tracking-wide text-primary-700 dark:text-primary-300 font-semibold">Risk Management Elements</p>
            <h1 class="text-3xl font-bold mt-2 text-gray-900 dark:text-white">Product Architecture Overview</h1>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Describe the architecture of {{ productName }}, including hardware, software, and RDPS components.
            </p>
          </div>
          <UButton to="/document/preview" color="primary" variant="soft" icon="i-heroicons-arrow-right" trailing>
            Document Preview
          </UButton>
        </div>
      </template>
    </UCard>

    <!-- Section Header Card -->
    <UCard>
      <template #header>
        <div>
          <p class="text-xs uppercase tracking-wide text-primary-700 dark:text-primary-300 font-semibold">Section 5.2.4</p>
          <h2 class="text-xl font-bold mt-2 text-gray-900 dark:text-white">Product Architecture Overview</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">[Reference: Clause 6.2.3 - Product architecture]</p>
        </div>
      </template>

      <div class="prose dark:prose-invert max-w-none">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          The product architecture describes the hardware, software, and RDPS components that make up the product, along with their interfaces and security functions.
        </p>
      </div>
    </UCard>

    <!-- Architecture Description Card -->
    <UCard>
      <template #header>
        <div>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">Architecture Description</h2>
        </div>
      </template>

      <div class="mb-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Provide a high-level description of the product architecture.
        </p>
      </div>

      <RichTextEditor v-model="form.architectureDescriptionHtml" min-height="180px" placeholder="Describe the product architecture..." />
    </UCard>

    <!-- Hardware Components Card -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">Hardware Components</h2>
          <UCheckbox v-model="form.noHardwareComponents" label="This product does not have any hardware component" />
        </div>
      </template>

      <div v-if="!form.noHardwareComponents">
        <div class="mb-4">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            List all hardware components of the product.
          </p>
        </div>

        <div class="mb-4">
          <UButton color="primary" variant="soft" icon="i-heroicons-plus" @click="openHardwareModal()">
            Add Hardware Component
          </UButton>
        </div>

        <UTable v-if="hardwareComponents.length > 0" :data="hardwareComponents" :columns="hardwareColumns" @select="(e: Event, row: any) => openHardwareModal(row.original)">
          <template #componentName-cell="{ row }">
            <span class="font-medium cursor-pointer">{{ (row.original as HardwareComponentEntry).componentName || '—' }}</span>
          </template>
          <template #function-cell="{ row }">
            <span class="cursor-pointer">{{ (row.original as HardwareComponentEntry).function || '—' }}</span>
          </template>
          <template #interfaces-cell="{ row }">
            <span class="cursor-pointer">{{ (row.original as HardwareComponentEntry).interfaces || '—' }}</span>
          </template>
          <template #securityFunctions-cell="{ row }">
            <span class="cursor-pointer">{{ (row.original as HardwareComponentEntry).securityFunctions || '—' }}</span>
          </template>
          <template #actions-cell="{ row }">
            <UButton size="xs" color="error" variant="ghost" icon="i-heroicons-trash" @click.stop="removeHardwareComponent((row.original as HardwareComponentEntry).id)" />
          </template>
        </UTable>

        <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No hardware components added yet</p>
        </div>
      </div>

      <div v-else class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p class="text-sm text-gray-600 dark:text-gray-400 italic">
          This product does not have any hardware component.
        </p>
      </div>
    </UCard>

    <!-- Software Components Card -->
    <UCard>
      <template #header>
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">Software Components</h2>
      </template>

      <div class="mb-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          List all software components of the product.
        </p>
      </div>

      <div class="mb-4">
        <UButton color="primary" variant="soft" icon="i-heroicons-plus" @click="openSoftwareModal()">
          Add Software Component
        </UButton>
      </div>

      <UTable v-if="softwareComponents.length > 0" :data="softwareComponents" :columns="softwareColumns" @select="(e: Event, row: any) => openSoftwareModal(row.original)">
        <template #type-cell="{ row }">
          <span class="font-medium cursor-pointer">{{ (row.original as SoftwareComponentEntry).type || '—' }}</span>
        </template>
        <template #function-cell="{ row }">
          <span class="cursor-pointer">{{ (row.original as SoftwareComponentEntry).function || '—' }}</span>
        </template>
        <template #thirdParty-cell="{ row }">
          <UBadge class="cursor-pointer" :color="(row.original as SoftwareComponentEntry).thirdParty ? 'warning' : 'success'" variant="subtle">
            {{ (row.original as SoftwareComponentEntry).thirdParty ? 'Yes' : 'No' }}
          </UBadge>
        </template>
        <template #interfaces-cell="{ row }">
          <span class="cursor-pointer">{{ (row.original as SoftwareComponentEntry).interfaces || '—' }}</span>
        </template>
        <template #securityFunctions-cell="{ row }">
          <span class="cursor-pointer">{{ (row.original as SoftwareComponentEntry).securityFunctions || '—' }}</span>
        </template>
        <template #actions-cell="{ row }">
          <UButton size="xs" color="error" variant="ghost" icon="i-heroicons-trash" @click.stop="removeSoftwareComponent((row.original as SoftwareComponentEntry).id)" />
        </template>
      </UTable>

      <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>No software components added yet</p>
      </div>
    </UCard>

    <!-- RDPS Components Card -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">RDPS Components (if applicable)</h2>
          <UCheckbox v-model="form.noRdpsComponents" label="This product does not rely on any RDPS" />
        </div>
      </template>

      <div v-if="!form.noRdpsComponents">
        <div class="mb-4 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p class="text-sm text-blue-700 dark:text-blue-300">
            <strong>Requirement [Clause 6.2.3]:</strong> "Where a product function relies on an RDPS, the manufacturer shall include the RDPS in the product context determination. The product including its RDPS, third-party or not, shall be treated as a single system."
          </p>
        </div>

        <div class="mb-4">
          <UButton color="primary" variant="soft" icon="i-heroicons-plus" @click="openRdpsModal()">
            Add RDPS Component
          </UButton>
        </div>

        <UTable v-if="rdpsComponents.length > 0" :data="rdpsComponents" :columns="rdpsColumns" @select="(e: Event, row: any) => openRdpsModal(row.original)">
          <template #component-cell="{ row }">
            <span class="font-medium cursor-pointer">{{ (row.original as RdpsComponentEntry).component || '—' }}</span>
          </template>
          <template #provider-cell="{ row }">
            <span class="cursor-pointer">{{ (row.original as RdpsComponentEntry).provider || '—' }}</span>
          </template>
          <template #function-cell="{ row }">
            <span class="cursor-pointer">{{ (row.original as RdpsComponentEntry).function || '—' }}</span>
          </template>
          <template #location-cell="{ row }">
            <span class="cursor-pointer">{{ (row.original as RdpsComponentEntry).location || '—' }}</span>
          </template>
          <template #developmentResponsibility-cell="{ row }">
            <span class="cursor-pointer">{{ (row.original as RdpsComponentEntry).developmentResponsibility || '—' }}</span>
          </template>
          <template #operationResponsibility-cell="{ row }">
            <span class="cursor-pointer">{{ (row.original as RdpsComponentEntry).operationResponsibility || '—' }}</span>
          </template>
          <template #actions-cell="{ row }">
            <UButton size="xs" color="error" variant="ghost" icon="i-heroicons-trash" @click.stop="removeRdpsComponent((row.original as RdpsComponentEntry).id)" />
          </template>
        </UTable>

        <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No RDPS components added yet</p>
        </div>
      </div>

      <div v-else class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p class="text-sm text-gray-600 dark:text-gray-400 italic">
          This product does not rely on any RDPS.
        </p>
      </div>
    </UCard>

    <!-- Component Interfaces Card -->
    <UCard>
      <template #header>
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">Component Interfaces</h2>
      </template>

      <div class="mb-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Document the interfaces between components.
        </p>
      </div>

      <div class="mb-4">
        <UButton color="primary" variant="soft" icon="i-heroicons-plus" @click="openInterfaceModal()">
          Add Interface
        </UButton>
      </div>

      <UTable v-if="componentInterfaces.length > 0" :data="componentInterfaces" :columns="interfaceColumns" @select="(e: Event, row: any) => openInterfaceModal(row.original)">
        <template #interface-cell="{ row }">
          <span class="font-medium cursor-pointer">{{ (row.original as ComponentInterfaceEntry).interface || '—' }}</span>
        </template>
        <template #componentA-cell="{ row }">
          <span class="cursor-pointer">{{ (row.original as ComponentInterfaceEntry).componentA || '—' }}</span>
        </template>
        <template #componentB-cell="{ row }">
          <span class="cursor-pointer">{{ (row.original as ComponentInterfaceEntry).componentB || '—' }}</span>
        </template>
        <template #protocol-cell="{ row }">
          <span class="cursor-pointer">{{ (row.original as ComponentInterfaceEntry).protocol || '—' }}</span>
        </template>
        <template #authentication-cell="{ row }">
          <span class="cursor-pointer">{{ (row.original as ComponentInterfaceEntry).authentication || '—' }}</span>
        </template>
        <template #dataExchanged-cell="{ row }">
          <span class="cursor-pointer">{{ (row.original as ComponentInterfaceEntry).dataExchanged || '—' }}</span>
        </template>
        <template #actions-cell="{ row }">
          <UButton size="xs" color="error" variant="ghost" icon="i-heroicons-trash" @click.stop="removeInterface((row.original as ComponentInterfaceEntry).id)" />
        </template>
      </UTable>

      <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>No interfaces added yet</p>
      </div>
    </UCard>

    <!-- Architecture Diagram Card -->
    <UCard>
      <template #header>
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">Architecture Diagram</h2>
      </template>

      <div class="mb-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Provide an architecture diagram or description of the system layout.
        </p>
      </div>

      <RichTextEditor v-model="form.architectureDiagramHtml" min-height="200px" placeholder="Insert or describe the architecture diagram..." />
    </UCard>

    <!-- Evidence Reference Card -->
    <UCard>
      <template #header>
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">Evidence Reference</h2>
      </template>

      <div class="mb-4">
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Track evidence references that support the product architecture claims.
        </p>
      </div>

      <div class="space-y-4">
        <UCard v-for="(entry, index) in evidenceEntries" :key="entry.id">
          <template #header>
            <div class="flex justify-between items-start">
              <div>
                <h4 class="font-semibold text-gray-900 dark:text-white">
                  {{ entry.title || `Evidence ${index + 1}` }}
                </h4>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Product Architecture (Clause 6.2.3)</p>
              </div>
              <UBadge
                :color="entry.status === 'complete' ? 'success' : entry.status === 'in_progress' ? 'info' : 'neutral'"
                variant="subtle"
              >
                {{ entry.status === 'complete' ? 'Complete' : entry.status === 'in_progress' ? 'In Progress' : 'Not Started' }}
              </UBadge>
            </div>
          </template>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Evidence Title</label>
              <UInput v-model="entry.title" placeholder="Product Architecture Evidence" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reference ID</label>
              <UInput v-model="entry.referenceId" placeholder="EVD-ARCH-001" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <USelectMenu
                v-model="entry.status"
                :items="[
                  { label: 'Not Started', value: 'not_started' },
                  { label: 'In Progress', value: 'in_progress' },
                  { label: 'Complete', value: 'complete' }
                ]"
                value-key="value"
                label-key="label"
                color="neutral"
                variant="outline"
                class="w-full"
              />
            </div>
          </div>

          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes / Link</label>
            <UTextarea v-model="entry.descriptionHtml" :rows="2" placeholder="Link to evidence or notes" class="w-full" autoresize />
          </div>
        </UCard>
      </div>
    </UCard>

    <!-- Hardware Component Modal -->
    <UModal v-model:open="hardwareModalOpen">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">{{ editingHardware ? 'Edit' : 'Add' }} Hardware Component</h3>
          </template>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Component Name</label>
              <UInput v-model="hardwareForm.componentName" placeholder="e.g., Main Controller Board" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Function</label>
              <UInput v-model="hardwareForm.function" placeholder="e.g., Central processing unit" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Interfaces</label>
              <UInput v-model="hardwareForm.interfaces" placeholder="e.g., USB, Ethernet, GPIO" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Security Functions</label>
              <UInput v-model="hardwareForm.securityFunctions" placeholder="e.g., Secure boot, TPM" class="w-full" />
            </div>
          </div>

          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton color="neutral" variant="ghost" @click="hardwareModalOpen = false">Cancel</UButton>
              <UButton color="primary" @click="saveHardwareComponent">Save</UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>

    <!-- Software Component Modal -->
    <UModal v-model:open="softwareModalOpen">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">{{ editingSoftware ? 'Edit' : 'Add' }} Software Component</h3>
          </template>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
              <UInput v-model="softwareForm.type" placeholder="e.g., Firmware, Application, Library" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Function</label>
              <UInput v-model="softwareForm.function" placeholder="e.g., Device management" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Third-Party</label>
              <UCheckbox v-model="softwareForm.thirdParty" label="This is a third-party component" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Interfaces</label>
              <UInput v-model="softwareForm.interfaces" placeholder="e.g., REST API, MQTT" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Security Functions</label>
              <UInput v-model="softwareForm.securityFunctions" placeholder="e.g., Authentication, Encryption" class="w-full" />
            </div>
          </div>

          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton color="neutral" variant="ghost" @click="softwareModalOpen = false">Cancel</UButton>
              <UButton color="primary" @click="saveSoftwareComponent">Save</UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>

    <!-- RDPS Component Modal -->
    <UModal v-model:open="rdpsModalOpen">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">{{ editingRdps ? 'Edit' : 'Add' }} RDPS Component</h3>
          </template>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">RDPS Component</label>
              <UInput v-model="rdpsForm.component" placeholder="e.g., Cloud Management Service" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Provider</label>
              <UInput v-model="rdpsForm.provider" placeholder="e.g., AWS, Azure, Internal" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Function</label>
              <UInput v-model="rdpsForm.function" placeholder="e.g., Remote monitoring" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
              <UInput v-model="rdpsForm.location" placeholder="e.g., EU Region, US East" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Development Responsibility</label>
              <UInput v-model="rdpsForm.developmentResponsibility" placeholder="e.g., Manufacturer, Third-party" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Operation Responsibility</label>
              <UInput v-model="rdpsForm.operationResponsibility" placeholder="e.g., Manufacturer, Cloud provider" class="w-full" />
            </div>
          </div>

          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton color="neutral" variant="ghost" @click="rdpsModalOpen = false">Cancel</UButton>
              <UButton color="primary" @click="saveRdpsComponent">Save</UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>

    <!-- Interface Modal -->
    <UModal v-model:open="interfaceModalOpen">
      <template #content>
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">{{ editingInterface ? 'Edit' : 'Add' }} Component Interface</h3>
          </template>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Interface</label>
              <UInput v-model="interfaceForm.interface" placeholder="e.g., API Gateway" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Component A</label>
              <UInput v-model="interfaceForm.componentA" placeholder="e.g., Device Firmware" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Component B</label>
              <UInput v-model="interfaceForm.componentB" placeholder="e.g., Cloud Service" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Protocol</label>
              <UInput v-model="interfaceForm.protocol" placeholder="e.g., HTTPS, MQTT, CoAP" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Authentication</label>
              <UInput v-model="interfaceForm.authentication" placeholder="e.g., mTLS, OAuth2, API Key" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data Exchanged</label>
              <UInput v-model="interfaceForm.dataExchanged" placeholder="e.g., Telemetry, Commands, Firmware updates" class="w-full" />
            </div>
          </div>

          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton color="neutral" variant="ghost" @click="interfaceModalOpen = false">Cancel</UButton>
              <UButton color="primary" @click="saveInterface">Save</UButton>
            </div>
          </template>
        </UCard>
      </template>
    </UModal>
  </div>
</template>


<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import type {
  DocumentWorkspaceState,
  RiskEvidenceEntry,
  RiskEvidenceStatus,
  HardwareComponentEntry,
  SoftwareComponentEntry,
  RdpsComponentEntry,
  ComponentInterfaceEntry,
} from '~/services/documentWorkspace'
import { RISK_PRODUCT_ARCHITECTURE_SECTION_KEY } from '~/services/documentWorkspace'

const workspace = useDocumentWorkspace()

const workspaceState = ref<DocumentWorkspaceState>(workspace.loadDocumentWorkspace())
const hydrating = ref(false)
const saving = ref(false)

const form = reactive({
  architectureDescriptionHtml: '',
  noHardwareComponents: false,
  noRdpsComponents: false,
  architectureDiagramHtml: '',
})

const hardwareComponents = ref<HardwareComponentEntry[]>([])
const softwareComponents = ref<SoftwareComponentEntry[]>([])
const rdpsComponents = ref<RdpsComponentEntry[]>([])
const componentInterfaces = ref<ComponentInterfaceEntry[]>([])
const evidenceEntries = ref<RiskEvidenceEntry[]>([])

let unsubscribe: (() => void) | null = null

const productName = computed(() => {
  return workspaceState.value.introduction?.productName || workspaceState.value.cover?.deviceName || '[Product Name]'
})

// Table columns
const hardwareColumns = [
  { accessorKey: 'componentName', header: 'Component Name' },
  { accessorKey: 'function', header: 'Function' },
  { accessorKey: 'interfaces', header: 'Interfaces' },
  { accessorKey: 'securityFunctions', header: 'Security Functions' },
  { id: 'actions', header: '' },
]

const softwareColumns = [
  { accessorKey: 'type', header: 'Type' },
  { accessorKey: 'function', header: 'Function' },
  { id: 'thirdParty', header: 'Third-Party' },
  { accessorKey: 'interfaces', header: 'Interfaces' },
  { accessorKey: 'securityFunctions', header: 'Security Functions' },
  { id: 'actions', header: '' },
]

const rdpsColumns = [
  { accessorKey: 'component', header: 'RDPS Component' },
  { accessorKey: 'provider', header: 'Provider' },
  { accessorKey: 'function', header: 'Function' },
  { accessorKey: 'location', header: 'Location' },
  { accessorKey: 'developmentResponsibility', header: 'Dev Responsibility' },
  { accessorKey: 'operationResponsibility', header: 'Op Responsibility' },
  { id: 'actions', header: '' },
]

const interfaceColumns = [
  { accessorKey: 'interface', header: 'Interface' },
  { accessorKey: 'componentA', header: 'Component A' },
  { accessorKey: 'componentB', header: 'Component B' },
  { accessorKey: 'protocol', header: 'Protocol' },
  { accessorKey: 'authentication', header: 'Authentication' },
  { accessorKey: 'dataExchanged', header: 'Data Exchanged' },
  { id: 'actions', header: '' },
]

// Modal states
const hardwareModalOpen = ref(false)
const softwareModalOpen = ref(false)
const rdpsModalOpen = ref(false)
const interfaceModalOpen = ref(false)

const editingHardware = ref<HardwareComponentEntry | null>(null)
const editingSoftware = ref<SoftwareComponentEntry | null>(null)
const editingRdps = ref<RdpsComponentEntry | null>(null)
const editingInterface = ref<ComponentInterfaceEntry | null>(null)

// Form states for modals
const hardwareForm = reactive({
  componentName: '',
  function: '',
  interfaces: '',
  securityFunctions: '',
})

const softwareForm = reactive({
  type: '',
  function: '',
  thirdParty: false,
  interfaces: '',
  securityFunctions: '',
})

const rdpsForm = reactive({
  component: '',
  provider: '',
  function: '',
  location: '',
  developmentResponsibility: '',
  operationResponsibility: '',
})

const interfaceForm = reactive({
  interface: '',
  componentA: '',
  componentB: '',
  protocol: '',
  authentication: '',
  dataExchanged: '',
})

function generateId(prefix: string) {
  const random = Math.random().toString(36).slice(2, 8)
  const timestamp = Date.now().toString(36)
  return `${prefix}-${timestamp}-${random}`
}

function hydrate(state: DocumentWorkspaceState) {
  hydrating.value = true
  const arch = state.riskManagement?.productArchitecture

  form.architectureDescriptionHtml = arch?.architectureDescriptionHtml || ''
  form.noHardwareComponents = arch?.noHardwareComponents || false
  form.noRdpsComponents = arch?.noRdpsComponents || false
  form.architectureDiagramHtml = arch?.architectureDiagramHtml || ''

  hardwareComponents.value = (arch?.hardwareComponents || []).map((c) => ({ ...c }))
  softwareComponents.value = (arch?.softwareComponents || []).map((c) => ({ ...c }))
  rdpsComponents.value = (arch?.rdpsComponents || []).map((c) => ({ ...c }))
  componentInterfaces.value = (arch?.componentInterfaces || []).map((c) => ({ ...c }))
  evidenceEntries.value = normalizeEvidenceEntries(arch?.evidenceEntries)

  hydrating.value = false
}

function normalizeEvidenceEntries(entries?: RiskEvidenceEntry[]): RiskEvidenceEntry[] {
  if (entries && entries.length) return entries.map((e) => ({ ...e }))
  return [{
    id: `${RISK_PRODUCT_ARCHITECTURE_SECTION_KEY}-evidence`,
    sectionKey: RISK_PRODUCT_ARCHITECTURE_SECTION_KEY,
    title: 'Product Architecture Evidence Reference',
    referenceId: '',
    descriptionHtml: '',
    status: 'not_started' as RiskEvidenceStatus,
  }]
}

function saveState() {
  if (hydrating.value || saving.value) return
  saving.value = true
  workspace.updateRiskManagementState({
    productArchitecture: {
      architectureDescriptionHtml: form.architectureDescriptionHtml,
      noHardwareComponents: form.noHardwareComponents,
      hardwareComponents: hardwareComponents.value.map((c) => ({ ...c })),
      softwareComponents: softwareComponents.value.map((c) => ({ ...c })),
      noRdpsComponents: form.noRdpsComponents,
      rdpsComponents: rdpsComponents.value.map((c) => ({ ...c })),
      componentInterfaces: componentInterfaces.value.map((c) => ({ ...c })),
      architectureDiagramHtml: form.architectureDiagramHtml,
      evidenceEntries: normalizeEvidenceEntries(evidenceEntries.value),
    }
  })
  saving.value = false
}

// Hardware component functions
function openHardwareModal(entry?: HardwareComponentEntry | Record<string, unknown>) {
  if (entry && 'id' in entry) {
    const hw = entry as HardwareComponentEntry
    editingHardware.value = hw
    hardwareForm.componentName = hw.componentName || ''
    hardwareForm.function = hw.function || ''
    hardwareForm.interfaces = hw.interfaces || ''
    hardwareForm.securityFunctions = hw.securityFunctions || ''
  } else {
    editingHardware.value = null
    hardwareForm.componentName = ''
    hardwareForm.function = ''
    hardwareForm.interfaces = ''
    hardwareForm.securityFunctions = ''
  }
  hardwareModalOpen.value = true
}

function saveHardwareComponent() {
  if (editingHardware.value) {
    const index = hardwareComponents.value.findIndex((c) => c.id === editingHardware.value!.id)
    if (index !== -1) {
      hardwareComponents.value[index] = {
        ...editingHardware.value,
        componentName: hardwareForm.componentName,
        function: hardwareForm.function,
        interfaces: hardwareForm.interfaces,
        securityFunctions: hardwareForm.securityFunctions,
      }
    }
  } else {
    hardwareComponents.value.push({
      id: generateId('hw'),
      componentName: hardwareForm.componentName,
      function: hardwareForm.function,
      interfaces: hardwareForm.interfaces,
      securityFunctions: hardwareForm.securityFunctions,
    })
  }
  hardwareModalOpen.value = false
  saveState()
}

function removeHardwareComponent(id: string) {
  hardwareComponents.value = hardwareComponents.value.filter((c) => c.id !== id)
  saveState()
}

// Software component functions
function openSoftwareModal(entry?: SoftwareComponentEntry | Record<string, unknown>) {
  if (entry && 'id' in entry) {
    const sw = entry as SoftwareComponentEntry
    editingSoftware.value = sw
    softwareForm.type = sw.type || ''
    softwareForm.function = sw.function || ''
    softwareForm.thirdParty = sw.thirdParty || false
    softwareForm.interfaces = sw.interfaces || ''
    softwareForm.securityFunctions = sw.securityFunctions || ''
  } else {
    editingSoftware.value = null
    softwareForm.type = ''
    softwareForm.function = ''
    softwareForm.thirdParty = false
    softwareForm.interfaces = ''
    softwareForm.securityFunctions = ''
  }
  softwareModalOpen.value = true
}

function saveSoftwareComponent() {
  if (editingSoftware.value) {
    const index = softwareComponents.value.findIndex((c) => c.id === editingSoftware.value!.id)
    if (index !== -1) {
      softwareComponents.value[index] = {
        ...editingSoftware.value,
        type: softwareForm.type,
        function: softwareForm.function,
        thirdParty: softwareForm.thirdParty,
        interfaces: softwareForm.interfaces,
        securityFunctions: softwareForm.securityFunctions,
      }
    }
  } else {
    softwareComponents.value.push({
      id: generateId('sw'),
      type: softwareForm.type,
      function: softwareForm.function,
      thirdParty: softwareForm.thirdParty,
      interfaces: softwareForm.interfaces,
      securityFunctions: softwareForm.securityFunctions,
    })
  }
  softwareModalOpen.value = false
  saveState()
}

function removeSoftwareComponent(id: string) {
  softwareComponents.value = softwareComponents.value.filter((c) => c.id !== id)
  saveState()
}

// RDPS component functions
function openRdpsModal(entry?: RdpsComponentEntry | Record<string, unknown>) {
  if (entry && 'id' in entry) {
    const rdps = entry as RdpsComponentEntry
    editingRdps.value = rdps
    rdpsForm.component = rdps.component || ''
    rdpsForm.provider = rdps.provider || ''
    rdpsForm.function = rdps.function || ''
    rdpsForm.location = rdps.location || ''
    rdpsForm.developmentResponsibility = rdps.developmentResponsibility || ''
    rdpsForm.operationResponsibility = rdps.operationResponsibility || ''
  } else {
    editingRdps.value = null
    rdpsForm.component = ''
    rdpsForm.provider = ''
    rdpsForm.function = ''
    rdpsForm.location = ''
    rdpsForm.developmentResponsibility = ''
    rdpsForm.operationResponsibility = ''
  }
  rdpsModalOpen.value = true
}

function saveRdpsComponent() {
  if (editingRdps.value) {
    const index = rdpsComponents.value.findIndex((c) => c.id === editingRdps.value!.id)
    if (index !== -1) {
      rdpsComponents.value[index] = {
        ...editingRdps.value,
        component: rdpsForm.component,
        provider: rdpsForm.provider,
        function: rdpsForm.function,
        location: rdpsForm.location,
        developmentResponsibility: rdpsForm.developmentResponsibility,
        operationResponsibility: rdpsForm.operationResponsibility,
      }
    }
  } else {
    rdpsComponents.value.push({
      id: generateId('rdps'),
      component: rdpsForm.component,
      provider: rdpsForm.provider,
      function: rdpsForm.function,
      location: rdpsForm.location,
      developmentResponsibility: rdpsForm.developmentResponsibility,
      operationResponsibility: rdpsForm.operationResponsibility,
    })
  }
  rdpsModalOpen.value = false
  saveState()
}

function removeRdpsComponent(id: string) {
  rdpsComponents.value = rdpsComponents.value.filter((c) => c.id !== id)
  saveState()
}

// Interface functions
function openInterfaceModal(entry?: ComponentInterfaceEntry | Record<string, unknown>) {
  if (entry && 'id' in entry) {
    const iface = entry as ComponentInterfaceEntry
    editingInterface.value = iface
    interfaceForm.interface = iface.interface || ''
    interfaceForm.componentA = iface.componentA || ''
    interfaceForm.componentB = iface.componentB || ''
    interfaceForm.protocol = iface.protocol || ''
    interfaceForm.authentication = iface.authentication || ''
    interfaceForm.dataExchanged = iface.dataExchanged || ''
  } else {
    editingInterface.value = null
    interfaceForm.interface = ''
    interfaceForm.componentA = ''
    interfaceForm.componentB = ''
    interfaceForm.protocol = ''
    interfaceForm.authentication = ''
    interfaceForm.dataExchanged = ''
  }
  interfaceModalOpen.value = true
}

function saveInterface() {
  if (editingInterface.value) {
    const index = componentInterfaces.value.findIndex((c) => c.id === editingInterface.value!.id)
    if (index !== -1) {
      componentInterfaces.value[index] = {
        ...editingInterface.value,
        interface: interfaceForm.interface,
        componentA: interfaceForm.componentA,
        componentB: interfaceForm.componentB,
        protocol: interfaceForm.protocol,
        authentication: interfaceForm.authentication,
        dataExchanged: interfaceForm.dataExchanged,
      }
    }
  } else {
    componentInterfaces.value.push({
      id: generateId('iface'),
      interface: interfaceForm.interface,
      componentA: interfaceForm.componentA,
      componentB: interfaceForm.componentB,
      protocol: interfaceForm.protocol,
      authentication: interfaceForm.authentication,
      dataExchanged: interfaceForm.dataExchanged,
    })
  }
  interfaceModalOpen.value = false
  saveState()
}

function removeInterface(id: string) {
  componentInterfaces.value = componentInterfaces.value.filter((c) => c.id !== id)
  saveState()
}

onMounted(() => {
  hydrate(workspaceState.value)
  unsubscribe = workspace.subscribeDocumentWorkspace((state) => {
    // Only hydrate if not currently saving to prevent recursive updates
    if (!saving.value) {
      workspaceState.value = state
      hydrate(state)
    }
  })
})

onUnmounted(() => unsubscribe?.())

// Watchers for form fields - use debounced saves to prevent recursive updates
watch(() => form.architectureDescriptionHtml, saveState)
watch(() => form.noHardwareComponents, saveState)
watch(() => form.noRdpsComponents, saveState)
watch(() => form.architectureDiagramHtml, saveState)
watch(evidenceEntries, saveState, { deep: true })
</script>
