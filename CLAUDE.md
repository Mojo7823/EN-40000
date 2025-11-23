# CLAUDE.md - AI Assistant Guide for CRA-Tool

## Project Overview

**CRA-Tool** is a Clinical Risk Assessment documentation tool that helps generate comprehensive technical documentation for medical devices and regulatory compliance.

### Tech Stack

**Frontend:**
- Nuxt 4.2.1 (Vue 3.5 + TypeScript)
- @nuxt/ui (UI component library)
- TipTap 3.11 (Rich text editor)
- @nuxt/content (Content management)
- @nuxt/image (Image optimization)

**Backend:**
- Python FastAPI (REST API)
- Uvicorn (ASGI server)
- TinyDB (JSON database for items)
- SQLite via better-sqlite3 (Main database)
- python-docx (Document generation)

**Development Tools:**
- TypeScript 5.9
- ESLint with Nuxt config
- Playwright (E2E testing)
- Git for version control

## Repository Structure

```
/home/user/EN-40000/
├── app/                          # Nuxt application source (srcDir)
│   ├── components/               # Vue components
│   │   ├── dashboard/           # Dashboard-specific components
│   │   ├── RichTextEditor.vue   # TipTap rich text editor
│   │   └── EvidenceTracker.vue  # Evidence tracking component
│   ├── composables/             # Vue composables
│   │   └── useDocumentWorkspace.ts
│   ├── constants/               # Constant definitions
│   │   └── conformance.ts
│   ├── layouts/                 # Nuxt layouts
│   │   └── default.vue
│   ├── pages/                   # File-based routing
│   │   ├── conformance/         # Conformance-related pages
│   │   ├── document/            # Document management pages
│   │   ├── demo/                # Demo pages (including dashboard)
│   │   └── index.vue            # Landing page
│   ├── services/                # Business logic services
│   │   ├── documentWorkspace.ts # Main document state management
│   │   └── sessionService.ts    # Session/storage management
│   ├── types/                   # TypeScript type definitions
│   │   └── conformance.ts
│   ├── app.vue                  # Root application component
│   └── app.css                  # Global styles
│
├── backend/                     # Python FastAPI backend
│   ├── app/
│   │   ├── docx_builder/       # DOCX document generation modules
│   │   │   ├── cover_builder.py
│   │   │   ├── introduction_sections.py
│   │   │   ├── conformance_claim_builder.py
│   │   │   ├── product_overview_builder.py
│   │   │   ├── risk_management_builder.py
│   │   │   ├── document_convention_builder.py
│   │   │   ├── html_converter.py
│   │   │   └── final_builder.py
│   │   ├── routes/             # API route handlers
│   │   │   ├── health.py
│   │   │   ├── preview.py
│   │   │   ├── cover.py
│   │   │   └── components.py
│   │   ├── models.py           # Data models
│   │   ├── database.py         # Database configuration
│   │   └── config.py           # Application config
│   ├── main.py                 # FastAPI application entry point
│   ├── requirements.txt        # Python dependencies
│   └── cratool.db              # SQLite database file
│
├── oldstable/                  # Legacy codebase (reference only)
├── public/                     # Static assets
├── .data/                      # Runtime data directory
├── .github/workflows/          # CI/CD workflows
│   └── playwright.yml          # Playwright test workflow
├── nuxt.config.ts              # Nuxt configuration
├── package.json                # Node.js dependencies
├── tsconfig.json               # TypeScript configuration
├── eslint.config.mjs           # ESLint configuration
├── start.sh                    # Application startup script
└── stop.sh                     # Application shutdown script
```

## Development Workflow

### Initial Setup

```bash
# Install frontend dependencies
npm install

# Backend setup (automatic via start.sh)
# Creates virtual environment at backend/.venv
# Installs requirements from backend/requirements.txt
```

### Running the Application

**Recommended Method:**
```bash
./start.sh
```

This script:
1. Validates system requirements (Python 3, Node.js, npm)
2. Checks and frees ports 8000 and 3000 if needed
3. Creates Python virtual environment if missing
4. Installs/updates Python dependencies
5. Installs/updates npm dependencies
6. Starts backend on port 8000
7. Starts frontend on port 3000
8. Logs to `backend.log` and `frontend.log`

**Manual Method:**
```bash
# Terminal 1 - Backend
cd backend
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
uvicorn main:app --reload --port 8000

# Terminal 2 - Frontend
npm run dev
```

### Stopping the Application

```bash
./stop.sh
```

This kills processes on ports 8000 and 3000, and cleans up PID files.

### Available Commands

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run generate   # Generate static site
npm run preview    # Preview production build
npm run postinstall # Nuxt preparation (runs automatically)
```

### Port Configuration

- **Frontend:** `http://localhost:3000`
- **Backend:** `http://localhost:8000`
- **Backend API:** All `/api/*` routes proxy to backend

## Code Conventions

### File Naming

- **Components:** PascalCase (e.g., `RichTextEditor.vue`, `EvidenceTracker.vue`)
- **Pages:** kebab-case (e.g., `load-save.vue`, `standards.vue`)
- **Services:** camelCase (e.g., `documentWorkspace.ts`, `sessionService.ts`)
- **Types:** camelCase with `.ts` extension
- **Python files:** snake_case (e.g., `cover_builder.py`, `html_converter.py`)

### Code Style

**TypeScript/Vue:**
- Use TypeScript for all new code
- Define interfaces for all data structures
- Use composables for shared logic
- Prefer `const` over `let`
- Use arrow functions for callbacks
- Single quotes for strings (ESLint enforced)

**Python:**
- Follow PEP 8 style guide
- Type hints for function parameters and returns
- Use Pydantic models for API data validation
- FastAPI router organization by feature

### Component Organization

```vue
<script setup lang="ts">
// 1. Imports
// 2. Props/Emits
// 3. Composables
// 4. Reactive state
// 5. Computed properties
// 6. Methods
// 7. Lifecycle hooks
</script>

<template>
  <!-- Template content -->
</template>

<style scoped>
/* Component-specific styles */
</style>
```

## State Management

### Document Workspace Pattern

The application uses a custom state management pattern via `services/documentWorkspace.ts`:

1. **State is stored in localStorage** via `sessionService.ts`
2. **Reactive updates** through subscription pattern
3. **Type-safe** state updates with dedicated update functions
4. **SSR-compatible** with client-side hydration

Example usage:
```typescript
import { useDocumentWorkspace } from '~/composables/useDocumentWorkspace'

const {
  updateCoverState,
  loadDocumentWorkspace,
  subscribeDocumentWorkspace
} = useDocumentWorkspace()

// Update state
updateCoverState({
  deviceName: 'New Device',
  versionNumber: '1.0'
})

// Subscribe to changes
subscribeDocumentWorkspace((state) => {
  console.log('State updated:', state)
})
```

### Key State Interfaces

See `app/services/documentWorkspace.ts` for full definitions:
- `CoverFormState` - Cover page information
- `IntroductionFormState` - Introduction section
- `ConformanceClaimState` - Standards and regulatory conformance
- `ProductOverviewState` - Product details and architecture
- `RiskManagementState` - Risk assessment data

## API Integration

### Frontend to Backend Communication

All API routes are proxied through Nuxt's route rules:

```typescript
// nuxt.config.ts
routeRules: {
  '/api/items/**': { proxy: { to: 'http://localhost:8000/api/items/**' } },
  '/api/hello': { proxy: { to: 'http://localhost:8000/api/hello' } },
  '/api/health': { proxy: { to: 'http://localhost:8000/api/health' } }
}
```

Use `$fetch` for API calls:
```typescript
// GET request
const data = await $fetch('/api/items')

// POST request
const newItem = await $fetch('/api/items', {
  method: 'POST',
  body: { name: 'Item', price: 100 }
})
```

### Backend API Structure

Routes are organized by feature in `backend/app/routes/`:
- `health.py` - Health check endpoints
- `preview.py` - Document preview generation
- `cover.py` - Cover page endpoints
- `components.py` - Component-related endpoints

## Database

### Backend Database (SQLite)

Located at: `backend/cratool.db`

Uses SQLAlchemy for ORM. Database models defined in `backend/app/models.py`.

### Frontend Storage (localStorage)

Document workspace state persisted via `sessionService.ts`:
- Key: `cratool_document_workspace`
- Format: JSON
- Auto-saves on state updates

## Document Generation

The application generates DOCX documents using python-docx library.

### Builder Pattern

Located in `backend/app/docx_builder/`:
- Each section has a dedicated builder module
- `html_converter.py` handles HTML to DOCX conversion
- `final_builder.py` orchestrates the complete document assembly

### Process Flow

1. User fills out forms in Vue frontend
2. State saved to localStorage
3. On preview/export, data sent to backend
4. Backend builders generate DOCX sections
5. Final document assembled and returned

## Testing

### E2E Testing (Playwright)

```bash
# Install Playwright
npx playwright install --with-deps

# Run tests
npx playwright test

# Run tests in UI mode
npx playwright test --ui
```

Tests run on GitHub Actions for main/master branch pushes and PRs.

Configuration: `.github/workflows/playwright.yml`

## Git Workflow

### Branch Strategy

- `main` - Production-ready code
- `claude/claude-md-*` - Claude AI development branches
- Feature branches should be descriptive

### Commit Message Convention

Based on commit history, the project uses informal commit messages. However, for AI assistants:

**Recommended format:**
```
<type>: <description>

[optional body]
```

Types: feat, fix, refactor, docs, test, chore

### Current Development State

Recent commits indicate:
- Migration to Nuxt 4 completed
- Some errors still being resolved ("Many errors" commit)
- Active development on conformance and risk management features

## Important Notes for AI Assistants

### Critical Files - Handle with Care

1. **State Management:**
   - `app/services/documentWorkspace.ts` - Core state management
   - `app/services/sessionService.ts` - Storage layer
   - Changes here affect entire application

2. **Configuration:**
   - `nuxt.config.ts` - Nuxt configuration
   - `backend/main.py` - Backend entry point
   - `start.sh` / `stop.sh` - Deployment scripts

3. **Type Definitions:**
   - `app/types/conformance.ts` - Core data structures
   - Changes require updates across multiple files

### Common Patterns

1. **Adding a new page:**
   ```bash
   # Create in app/pages/
   # File name becomes route (e.g., foo.vue → /foo)
   ```

2. **Adding a new API endpoint:**
   ```python
   # 1. Create route in backend/app/routes/
   # 2. Register in backend/main.py
   # 3. Update nuxt.config.ts routeRules if needed
   ```

3. **Adding new document section:**
   ```python
   # 1. Create builder in backend/app/docx_builder/
   # 2. Add state interface in app/services/documentWorkspace.ts
   # 3. Create update function and export from composable
   # 4. Create Vue component/page for editing
   ```

### Migration Notes

The `oldstable/` directory contains the previous version:
- Reference for understanding legacy features
- Do NOT modify files in this directory
- Compare when migrating missing features

### ESR/SSR Considerations

- `useDocumentWorkspace` composable is SSR-safe
- localStorage only accessed on client side
- Use `process.client` checks when needed

### Rich Text Editor (TipTap)

Configuration in `app/components/RichTextEditor.vue`:
- Custom toolbar with extensive formatting options
- Image resize support via `tiptap-extension-resize-image`
- Tables, task lists, typography extensions enabled
- Outputs HTML that's converted to DOCX by backend

### Styling

- Uses @nuxt/ui for components (built on Tailwind CSS)
- Dark mode support
- Global styles in `app/app.css`
- Component styles should be scoped

## Troubleshooting

### Port Already in Use

```bash
# Check what's using the port
lsof -i:3000
lsof -i:8000

# Kill process
kill -9 <PID>

# Or use stop.sh
./stop.sh
```

### Virtual Environment Issues

```bash
# Remove and recreate
rm -rf backend/.venv
python3 -m venv backend/.venv
source backend/.venv/bin/activate
pip install -r backend/requirements.txt
```

### Nuxt Build Issues

```bash
# Clear Nuxt cache
rm -rf .nuxt

# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Database Issues

```bash
# Backup current database
cp backend/cratool.db backend/cratool.db.backup

# If corruption occurs, may need to recreate
# (Ensure you have data backed up first)
```

## Development Tips

1. **Hot Reload:** Both frontend and backend support hot reload in dev mode
2. **Logging:** Check `backend.log` and `frontend.log` for debugging
3. **Type Safety:** Run TypeScript check before committing major changes
4. **State Inspection:** Use Vue DevTools to inspect document workspace state
5. **API Testing:** Backend API docs at `http://localhost:8000/docs` (FastAPI auto-generated)

## Security Considerations

1. **CORS:** Currently set to allow all origins (`allow_origins=["*"]`) - restrict in production
2. **Input Validation:** Use Pydantic models on backend for all API inputs
3. **File Uploads:** Image uploads should be validated for type and size
4. **Environment Variables:** Use `.env` files for sensitive configuration (not committed to git)
5. **SQL Injection:** Using SQLAlchemy ORM helps prevent this, but always use parameterized queries

## Performance Considerations

1. **Bundle Size:** Monitor with `npm run build` - TipTap and extensions add significant size
2. **State Updates:** Document workspace updates are debounced in most components
3. **Database Queries:** Index frequently queried fields in SQLite
4. **Image Optimization:** Use @nuxt/image for automatic optimization
5. **Code Splitting:** Nuxt auto-splits routes - keep page components focused

## Resources

- [Nuxt 4 Documentation](https://nuxt.com/docs)
- [Vue 3 Documentation](https://vuejs.org/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [TipTap Documentation](https://tiptap.dev/)
- [Nuxt UI Documentation](https://ui.nuxt.com/)

---

**Last Updated:** 2025-11-23 (Based on Nuxt 4 migration with ongoing fixes)

**Project Status:** Active development - Nuxt 4 migration complete, fixing remaining errors

**For Questions:** Refer to commit history and existing code patterns before making significant architectural changes.
