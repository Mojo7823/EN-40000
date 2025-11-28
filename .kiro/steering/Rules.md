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

## Project Structure

```
app/
├── pages/           # Route pages
├── components/      # Reusable Vue components
├── composables/     # Business logic (use* prefix)
├── services/        # State management (see documentWorkspace/ below)
├── utils/           # Helpers (previewPayload.ts for API payloads)
├── types/           # TypeScript interfaces
└── constants/       # Static configuration

backend/app/
├── routes/          # FastAPI routers
├── schemas.py       # Pydantic models
├── utils/           # Helper functions
└── docx_builder/    # DOCX generation
```

## Document Workspace Module

The `documentWorkspace` module is the central state manager. It's modularized for maintainability:

```
app/services/documentWorkspace/
├── index.ts          # Public API — all imports come from here
├── types.ts          # TypeScript interfaces for all state shapes
├── constants.ts      # Section keys, ID prefixes, generators
├── defaults.ts       # Default values for each section
├── storage.ts        # localStorage persistence & listeners
├── cloners/          # Deep clone helpers (one per domain)
│   ├── baseCloners.ts
│   ├── conformanceCloners.ts
│   ├── riskManagementCloners.ts
│   └── documentConventionCloners.ts
└── updaters/         # State update functions (one per domain)
    ├── baseUpdaters.ts
    ├── conformanceUpdaters.ts
    └── riskManagementUpdaters.ts
```

**Import from the main module only:**
```typescript
import { 
  loadDocumentWorkspace, 
  updateCoverState,
  type CoverFormState 
} from '~/services/documentWorkspace'
```

**Do NOT import from submodules directly** — use the public API in `index.ts`.

## Nuxt UI v4 Quick Reference

```typescript
// UTable columns
const columns = [
  { accessorKey: 'name', header: 'Name' },
  { id: 'actions', header: '' }  // Custom cells
]
// Access data: row.original

// USelectMenu
<USelectMenu v-model="value" :items="items" value-key="value" label-key="label" />

// UModal
<UModal v-model:open="isOpen"><template #content>...</template></UModal>

// UTable row click
<UTable @select="(e, row) => edit(row.original)">
  <template #actions-cell="{ row }">
    <UButton @click.stop="delete(row.original.id)" />  <!-- .stop prevents row select -->
  </template>
</UTable>
```

**Note:** Use `URadioGroup` not `URadio` (doesn't exist in v4)

## Critical Patterns

### State Management
1. Never mutate state directly — use update functions from `documentWorkspace`
2. Import from `~/services/documentWorkspace` (not submodules)
3. Wrap browser APIs in `if (import.meta.client)` for SSR safety
4. Use cloners when you need a deep copy of state

### Preventing Infinite Loops
```typescript
const hydrating = ref(false)
function hydrate(state) { hydrating.value = true; /* update */ hydrating.value = false }
watch(() => form.field, () => { if (!hydrating.value) saveState() })
// AVOID: { flush: 'sync' } on watchers
```

## Adding New Risk Management Sections (Checklist)

When adding a new section (e.g., `productUserDescription`), update ALL of these:

| # | File | What to Add |
|---|------|-------------|
| 1 | `app/services/documentWorkspace/types.ts` | Interface for the new section state |
| 2 | `app/services/documentWorkspace/constants.ts` | Section key constant (e.g., `RISK_NEW_SECTION_KEY`) |
| 3 | `app/services/documentWorkspace/defaults.ts` | Default state value |
| 4 | `app/services/documentWorkspace/cloners/riskManagementCloners.ts` | Clone function for the section |
| 5 | `app/services/documentWorkspace/updaters/riskManagementUpdaters.ts` | Update `updateRiskManagementState()` to handle the new section |
| 6 | `app/services/documentWorkspace/index.ts` | Export new types/constants if needed |
| 7 | `app/composables/usePreviewSections.ts` | Section status in `sectionList`, add to `SECTION_GROUP_DEFINITIONS` |
| 8 | `app/utils/previewPayload.ts` | **Add to `buildRiskManagementPayload()`** — extracts data for API |
| 9 | `app/pages/document/evidence.vue` | Add evidence entries in `buildEvidenceRows()` |
| 10 | `backend/app/schemas.py` | Pydantic model for the section |
| 11 | `backend/app/docx_builder/risk_management_builder.py` | `_has_content()` check and `_append_section()` function |

**Common mistake:** Forgetting step 8 (`previewPayload.ts`) — the section won't appear in DOCX even if backend is ready.

## API Payload Flow

```
Page (form data) 
  → documentWorkspace.ts (state storage)
  → useCoverPreview.ts (buildCoverPreviewPayload)
  → previewPayload.ts (buildRiskManagementPayload) ← Don't forget this!
  → Backend API
  → docx_builder (DOCX generation)
```

## Common Mistakes

| Don't | Do Instead |
|-------|-----------|
| Mutate state directly | Clone, modify, update |
| Use localStorage directly | Use service layer |
| Skip payload builder update | Update `previewPayload.ts` for new sections |
| Use `{ flush: 'sync' }` | Use default flush |
| Access `row` directly in UTable | Use `row.original` |
| Use `key` in columns | Use `accessorKey` or `id` |

## Development Commands
```bash
./start.sh    # Start frontend + backend
./stop.sh     # Stop all services
```
