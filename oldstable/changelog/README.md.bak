# CCGenTool 2 (Core Toolkit)

This repository now contains only the essential code that powers the Common Criteria Generation Tool:

- **Backend (`server/`)** – FastAPI + SQLAlchemy services for CRUD operations and the DOCX preview engine.
- **Frontend (`web/`)** – Vue 3 + Vite dashboard shell, reusable Rich Text Editor, persistence helpers, and demo pages for every core module.
- **Tooling** – `dev_start.sh` / `dev_stop.sh` scripts to boot both servers without Docker.

## Local development

Docker assets have been removed. Run the API and dashboard directly:

### Backend
```bash
cd server
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
# Configure DATABASE_URL for SQLite or Postgres before starting
python run.py
```

### Frontend
```bash
cd web
cp .env.example .env
npm install
npm run dev
```

The Vue dev server proxies API calls to `http://localhost:8000` via `/api`.

## Demo gallery

Open `http://127.0.0.1:5173` and use the sidebar to explore the examples:

- **Modal** – reusable overlay shell with persistent notes.
- **SFR Table** – quick CRUD-style grid for adding/removing requirements.
- **Rich Text Editor** – TipTap integration with live HTML preview.
- **XML Viewer** – static sample trees rendered with the legacy component (no XML upload required).
- **DOCX Preview** – send arbitrary HTML to `/security/sfr/preview` and render the DOCX response in the browser.
- **Save / Load** – download or import the combined state of the demo pages.

These pages pull their state from `web/src/services/demoStorage.ts`, which mirrors the project save/load behaviour without relying on the former XML importer.
