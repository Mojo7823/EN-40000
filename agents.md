# CRA Tool Agent Notes

## Project layout

- `server/`: FastAPI backend (SQLite by default) that exposes CRUD for `components` plus the entire DOCX generation pipeline (cover/Technical Requirement/Assurance Requirement/SPD/SO/TSS/final). Virtualenv lives in `server/.venv` when `dev_start.sh` runs.
- `web/`: Vue 3 + Vite single-page app. Core modules live under `src/modules`, demo pages under `src/views/demo`, and shared state helpers in `src/services`.
- `dev_start.sh` / `dev_stop.sh`: helper scripts that install deps (if needed) and run `uvicorn` + `npm run dev` concurrently, persisting logs/PIDs inside `.devserver/`.
- `README.md`: concise overview of the current simplified product plus “Demo Gallery” links.

## Backend quick facts

- Entry point: `server/app/main.py`. Database configured via `server/app/database.py` (defaults to SQLite file `cratool.db`).
- Primary endpoints: `/health`, `/components` CRUD, `/cover/upload`, `/cover/preview`, `/security/sfr|sar/preview`, `/spd/preview`, `/so/preview`, `/tss/preview`, `/st-intro/preview`, `/final-preview`, and matching cleanup/download routes.
- DOCX generation lives in helper functions (`_build_cover_document`, `_build_html_preview_document`, `_build_final_combined_document`, etc.) and writes into `/tmp/cratool_*` directories keyed by `user_id`.
- No XML importer or family-table endpoints remain; the demo XML viewer uses static data.

### Dev loop

```bash
./dev_start.sh    # spins up backend + frontend
# work…
./dev_stop.sh
```

## Frontend overview

- Router (`src/router/index.ts`) exposes:
  - `/` – dashboard landing card that links to every demo
  - `/demo/modal`
  - `/demo/table`
  - `/demo/editor`
  - `/demo/xml-viewer`
  - `/demo/docx-preview`
  - `/demo/storage`
- Sidebar (`src/components/Sidebar.vue`) mirrors the original accordion design: Dashboard plus a collapsible “Demo” section with the six entries above.
- Styling: `src/style.css` (top-level) plus scoped styles per demo card. Cards follow a consistent layout (hero card with title/action buttons, then one or more content cards).

## Demo pages

| Route | Component | Purpose & layout |
|-------|-----------|------------------|
| `/demo/modal` | `src/views/demo/ModalDemo.vue` | Shows reusable modal shell; hero card, note textarea, and overlay preview. Uses `demoStorage` to persist the note. |
| `/demo/table` | `src/views/demo/SfrTableDemo.vue` | Recreates Technical Requirement CRUD table. Top card with title/button, table card listing entries, modal for add/edit. Persists to `demoStorage` (`sfrTable` list). |
| `/demo/editor` | `src/views/demo/EditorDemo.vue` | TipTap editor with 2-column card (Compose + Live HTML preview). Tracks `lastUpdated`. |
| `/demo/xml-viewer` | `src/views/demo/XmlViewerDemo.vue` | Uses legacy `XMLTreeNode` to display curated samples (`src/data/xmlSamples.ts`). Dropdown switches sample and persists `xmlSampleId`. |
| `/demo/docx-preview` | `src/views/demo/DocxPreviewDemo.vue` | Card layout described in requirements: hero card (text + “Generate / Download” buttons), content card for WYSIWYG input, result card with docx-preview shell replicating former MS Word-style view. Stores HTML in `demoStorage`. |
| `/demo/storage` | `src/views/demo/StorageDemo.vue` | Workspace export/import. Buttons now form a tidy row, snapshot JSON is inside a padded card, and `<pre>` uses `pre-wrap` so text doesn’t extend past viewport. |

## Shared utilities

- `src/services/demoStorage.ts`: central place for demo state. Shape:
  ```ts
  interface DemoState {
    modalNote: string
    editorHtml: string
    docxHtml: string
    xmlSampleId: string
    sfrTable: DemoSfrEntry[]
    lastUpdated: string
  }
  ```
  Provides `loadDemoState`, `updateDemoState`, `clearDemoState`, `exportDemoState`, `importDemoState`.
- `src/data/xmlSamples.ts`: static CC-like trees for the XML viewer.
- `src/services/api.ts`: Axios client (uses Vite proxy in dev).
- `src/services/sessionService.ts`: legacy per-user storage (still used for backend preview features to generate consistent `user_id` tokens).
- `src/modules/index.ts`: re-export of `apiClient`, `sessionService`, `RichTextEditor`, preview builders, etc.

## Building / testing

- Frontend: `cd web && npm run build` (Vite). Expect a chunk-size warning due to docx-preview bundle; no unit tests.
- Backend: no automated tests, but you can run `python server/app/main.py` or `./dev_start.sh` + curl `/health`. DOCX endpoints require Python dependencies (already installed via `dev_start.sh`).

## Hand-off tips

- When adding a new demo, update:
  1. `src/views/demo/*.vue`
  2. `src/router/index.ts`
  3. `src/components/Sidebar.vue`
  4. `src/views/Dashboard.vue`
  5. `README.md` (if the feature is user-facing)
- Keep the card layout consistent (`hero-card`, `content-card` CSS utilities). Reference `DocxPreviewDemo.vue` for the latest styling pattern.
- DOCX previews rely on server endpoints—ensure `sessionService.getUserToken()` supplies a deterministic token, otherwise the backend will refuse file generation because of the user-id validation regex.
- If you need the old XML importer data, reintroduce `oldparser/` + `xml_parser_service` from history; currently, the repo intentionally omits them.
***
