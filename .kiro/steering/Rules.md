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

## Development Commands
```bash
./start.sh          # Start both frontend and backend
./stop.sh           # Stop all services
npm run dev         # Frontend only (port 3000)
```

## Reference
- Legacy patterns in `oldstable/` — read-only reference
- Maintain backward compatibility with old workspace data
