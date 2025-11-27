---
inclusion: always
---

# CRA Tool Development Guidelines

Cybersecurity Risk Assessment tool for EU Regulation 2024/2847 and EN 40000 compliance documentation.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | Nuxt 4, Vue 3, TypeScript, Nuxt UI v4, TipTap |
| Backend | FastAPI, Python, SQLAlchemy, TinyDB, python-docx |
| Storage | localStorage (frontend), Better-SQLite3 (content) |

## Nuxt UI v4 Component Reference

### Available Components
- `UButton`, `UCard`, `UInput`, `UTextarea`, `UCheckbox`
- `USelectMenu` (for dropdowns), `UBadge`, `UModal`, `UTable`
- `URadioGroup` (NOT `URadio` - it doesn't exist in v4)

### UTable v4 Usage
```typescript
// Column definition - use accessorKey/header format
const columns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'status', header: 'Status' },
  { id: 'actions', header: '' }  // For custom cells
]

// Access row data in templates via row.original
<template #actions-cell="{ row }">
  <UButton @click="edit(row.original)" />
</template>
```

### UTable Row Click to Edit Pattern
For tables where clicking a row should open an edit modal:
```vue
<UTable
  :data="items"
  :columns="columns"
  @select="(e: Event, row: any) => openEditModal(row.original)"
>
  <!-- Add cursor-pointer to cells for visual feedback -->
  <template #name-cell="{ row }">
    <span class="font-medium cursor-pointer">{{ row.original.name || '—' }}</span>
  </template>
  
  <!-- Use @click.stop on delete button to prevent row selection -->
  <template #actions-cell="{ row }">
    <UButton
      icon="i-heroicons-trash"
      color="error"
      variant="ghost"
      size="sm"
      @click.stop="removeItem(row.original.id)"
    />
  </template>
</UTable>
```
Key points:
- Use `@select` event handler on UTable for row click
- Add `cursor-pointer` class to cell content for hover feedback
- Use `@click.stop` on action buttons to prevent triggering row select
- Show `—` for empty values
- Remove separate edit icon when row click opens edit modal

### USelectMenu v4 Usage
```vue
<USelectMenu
  v-model="selectedValue"
  :items="[{ label: 'Option', value: 'opt' }]"
  value-key="value"
  label-key="label"
/>
```

### UModal v4 Usage
```vue
<UModal v-model:open="isOpen">
  <template #content>
    <UCard>...</UCard>
  </template>
</UModal>
```

## Project Structure

```
app/
├── pages/          # Route pages by feature (conformance, document, demo)
├── components/     # Reusable Vue components
├── composables/    # Business logic wrapping services (use* prefix)
├── services/       # Core state management and persistence
├── types/          # TypeScript interfaces
└── constants/      # Static configuration values

backend/app/
├── routes/         # FastAPI endpoint routers
├── models.py       # SQLAlchemy models
├── schemas.py      # Pydantic request/response schemas
├── utils/          # Helper functions
└── docx_builder/   # DOCX generation logic
```

## Critical Patterns

### State Management (MUST follow)
1. Never mutate state directly — always deep clone before updating
2. Use `documentWorkspace.ts` service as central state manager
3. Notify subscribers after every state change
4. Check for browser environment before using localStorage (SSR safety)
5. Use session service for user-specific storage keys

### Preventing Infinite Update Loops
When using workspace subscriptions with watchers, use flags to prevent recursive updates:

```typescript
const hydrating = ref(false)
const saving = ref(false)

function hydrate(state: DocumentWorkspaceState) {
  hydrating.value = true
  // ... update local refs from state
  hydrating.value = false
}

function saveState() {
  if (hydrating.value || saving.value) return
  saving.value = true
  workspace.updateState({ ... })
  saving.value = false
}

onMounted(() => {
  hydrate(workspaceState.value)
  unsubscribe = workspace.subscribe((state) => {
    if (!saving.value) hydrate(state)
  })
})

// AVOID: { flush: 'sync' } on watchers - causes recursive updates
watch(() => form.field, saveState)  // Good
watch(() => form.field, saveState, { flush: 'sync' })  // Bad - causes loops
```

### Vue/TypeScript Conventions
- Use `<script setup>` with explicit TypeScript types
- Use `ref()` for primitives, `reactive()` for objects
- Composables: `useDocumentWorkspace`, `useSession`
- Interfaces: `CoverFormState`, `EvidenceEntry`
- Constants: `STORAGE_KEY_BASE`, `DEFAULT_STATUS`

### Python/FastAPI Conventions
- Thin route handlers — delegate to utility functions
- Pydantic models for all request/response validation
- HTTPException for error handling
- Consistent type hints throughout

### Form State Updates
```typescript
// CORRECT: Partial update with merge
updateCoverState({ title: 'New Title' })

// WRONG: Direct mutation
state.cover.title = 'New Title'
```

## API Configuration
- Frontend: port 3000
- Backend: port 8000
- Proxy via `nitro.devProxy` in nuxt.config.ts

## Domain Rules

### Evidence Entries
- Required fields: `id`, `sectionKey`, `title`, `referenceId`, `descriptionHtml`, `status`
- Status values: `'not_started'` | `'in_progress'` | `'complete'`
- Generate IDs with section-specific prefixes

### Conformance Module
- Use constants from `app/constants/conformance.ts`
- Maintain separate primary and related standards
- Generate unique IDs for all entries

### DOCX Generation
- Backend handles all document generation
- Support HTML → DOCX conversion with images, tables
- Follow EN 40000 document structure

## Common Mistakes to Avoid

| Don't | Do Instead |
|-------|-----------|
| Mutate state directly | Clone, modify, then update |
| Use localStorage directly | Use service layer functions |
| Skip SSR checks | Wrap browser APIs in `if (import.meta.client)` |
| Hardcode user data | Use session service |
| Forget state notifications | Call notify after updates |
| Skip ID generation | Always generate unique IDs for entries |
| Use `URadio` component | Use `UCheckbox` or `URadioGroup` (URadio doesn't exist in v4) |
| Use `{ flush: 'sync' }` on watchers | Use default flush to prevent recursive updates |
| Access UTable row directly | Use `row.original` to access actual data |
| Use `key` in column definitions | Use `accessorKey` for data columns, `id` for custom columns |
| Add edit icon when row is clickable | Use `@select` on UTable for row-click-to-edit pattern |
| Forget `@click.stop` on action buttons | Use `@click.stop` to prevent row select when clicking delete |

## Development Commands
```bash
./start.sh          # Start both frontend and backend
./stop.sh           # Stop all services
npm run dev         # Frontend only (port 3000)
```

## Reference
- Legacy patterns in `oldstable/` — read-only reference
- Maintain backward compatibility with old workspace data

## Page Template Pattern
New pages under `app/pages/` should follow this structure:

```vue
<template>
  <div class="container mx-auto p-6 space-y-6">
    <!-- Header Card -->
    <UCard class="bg-gradient-to-r from-primary-50/80 ...">
      <template #header>
        <div class="flex items-start justify-between">
          <div>
            <p class="text-xs uppercase tracking-wide ...">Section Category</p>
            <h1 class="text-3xl font-bold mt-2">Page Title</h1>
          </div>
          <UButton to="/document/preview" ...>Document Preview</UButton>
        </div>
      </template>
    </UCard>
    <!-- Content Cards -->
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import type { DocumentWorkspaceState } from '~/services/documentWorkspace'

const workspace = useDocumentWorkspace()
const workspaceState = ref<DocumentWorkspaceState>(workspace.loadDocumentWorkspace())
const hydrating = ref(false)
const saving = ref(false)

// ... hydrate, saveState, onMounted pattern
</script>
```

## Adding New Workspace State Sections
1. Add TypeScript interfaces in `documentWorkspace.ts`
2. Add to parent state interface (e.g., `RiskManagementState`)
3. Create update function (e.g., `updateRiskManagementState`)
4. Add clone helper for deep copying
5. Update backend `schemas.py` with Pydantic models
6. Update `preview.vue` with computed status and rendering
7. Update `evidence.vue` to include evidence entries in `buildEvidenceRows()`

### Adding Evidence to Evidence List Page
When adding a new section with evidence entries, update `/document/evidence.vue`:
```typescript
function buildEvidenceRows(state: DocumentWorkspaceState) {
  const rows = []
  
  // ... existing sections ...

  // New Section evidence
  const newSection = state.riskManagement?.newSection
  if (newSection?.evidenceEntries?.length) {
    newSection.evidenceEntries.forEach((entry) => {
      rows.push({
        ...entry,
        sectionLabel: 'Section Name (Section X.X.X)',
        referenceLine: '[Reference: Clause X.X.X]',
        route: '/path/to/section-page',
      })
    })
  }

  return rows
}
```
