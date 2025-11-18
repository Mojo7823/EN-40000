# CRA Tool (EN-40000)

A comprehensive web application for creating and managing **Cyber Resilience Act (CRA)** compliance documentation. This tool provides an intuitive interface for building security documentation with rich text editing, DOCX generation, and structured data management.

## 🎯 Purpose

The CRA Tool helps organizations create professional security documentation for CRA compliance by providing:
- **Document Generation** - Create formatted DOCX documents from HTML content
- **Requirements Management** - Organize and track technical and assurance requirements
- **Rich Content Editing** - Full-featured WYSIWYG editor with tables, images, and formatting
- **Data Persistence** - Save and restore your work with import/export functionality
- **Visual Data Representation** - XML tree viewer for structured security data

## 🏗️ Architecture

### Backend (`server/`)
- **Framework**: FastAPI with async support
- **Database**: SQLAlchemy ORM (SQLite default, PostgreSQL supported)
- **Document Engine**: python-docx for DOCX generation
- **API Documentation**: Auto-generated OpenAPI/Swagger docs

### Frontend (`web/`)
- **Framework**: Vue 3 with Composition API
- **Build Tool**: Vite for fast development and optimized builds
- **Editor**: TipTap (ProseMirror-based) rich text editor
- **Routing**: Vue Router 4
- **State Management**: Pinia stores + local storage
- **UI Components**: Custom component library with theme support

## 🚀 Quick Start

### Prerequisites
- **Python 3.8+**
- **Node.js 16+** and npm
- **Git**

### One-Command Startup

```bash
# Clone the repository
git clone <repository-url>
cd EN-40000

# Start both backend and frontend servers
./dev_start.sh
```

This script will:
1. Create Python virtual environment (if needed)
2. Install backend dependencies
3. Install frontend dependencies  
4. Start FastAPI backend on `http://127.0.0.1:8000`
5. Start Vite dev server on `http://127.0.0.1:5173`

Open `http://127.0.0.1:5173` in your browser to access the application.

### Manual Setup

If you prefer to run servers individually:

#### Backend
```bash
cd server
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

Backend will be available at `http://127.0.0.1:8000`
- API Documentation: `http://127.0.0.1:8000/docs`
- Health Check: `http://127.0.0.1:8000/health`

#### Frontend
```bash
cd web
npm install
npm run dev
```

Frontend will be available at `http://127.0.0.1:5173`

### Stopping the Servers

```bash
./dev_stop.sh
```

## ✨ Features

### 1. **Modal Framework**
Reusable overlay component system for multi-step workflows and confirmations.
- Persistent state across sessions
- Keyboard navigation (ESC to close)
- Customizable content areas

### 2. **Requirements Table**
CRUD interface for managing technical requirements with:
- Add, edit, and delete operations
- Search and filter capabilities
- Quick data entry
- Export functionality

### 3. **Rich Text Editor**
Professional WYSIWYG editor powered by TipTap with:
- **Text Formatting**: Bold, italic, underline, strikethrough
- **Headings**: H1-H4 support
- **Lists**: Bullet lists, numbered lists, task lists
- **Text Styling**: Colors, highlighting, alignment
- **Advanced Features**: Superscript, subscript, tables, images
- **Live Preview**: See HTML output in real-time

### 4. **XML Tree Viewer**
Interactive hierarchical visualization for structured security data:
- Expandable/collapsible tree nodes
- Color-coded components by type
- Sample datasets for cryptographic and authentication classes
- No XML upload required - works with predefined samples

### 5. **Document Management Suite**
End-to-end CRA documentation workspace with dedicated pages for each section.
- **Cover Page** – Device/lab metadata plus drag-and-drop logo upload
- **Document Information** – Product name, version, type, manufacturer, status, and responsible parties
- **Product Identification** – Synced metadata + rich-text editors for descriptions and key functions + target-market capture
- **Manufacturer Information** – Legal entity, registration number, address, contact person, and phone fields
- **Purpose & Scope** – Lifecycle coverage toggle list, assessment period, and TipTap-based methodology editor
- **Product Architecture Overview** – Clause 6.2.1.5 narrative with prompts for Key Components, Interactions, Interfaces, RDPS, and Evidence references. Shares state via `documentWorkspace.productOverview.productArchitectureHtml` so section 2.2 renders in previews/DOCX.
- **Third-Party Components** – SBOM-style table with add/edit/delete workflows (row click to edit, trash icon, bulk delete with confirmation) plus WYSIWYG sections for management approach and evidence references. Data flows through the shared workspace into the DOCX builder for section 2.3.
- **Document Preview** – Dedicated scrollable viewport with zoom/page controls, active-page highlighting, and clickable Section Status links back to each editor
- **Load & Save** – JSON export/import/clear tools backed by the shared workspace service

## 📄 Document Management Workflow

- **Cover Page** – Capture device metadata, revisions, and lab information plus a drag-and-drop image uploader. Automatically syncs the image path to the backend before previews are generated.
- **Document Information** – Dedicated Introduction form for product details, manufacturer info, and workflow status (including a Custom Status modal). Data is stored in `documentWorkspace.introduction` for reuse.
- **Product Identification** – Shares Product Name/Version/Type fields with the Introduction form and adds two TipTap-powered editors (Product Description + Key Product Functions) plus a large Target Market textarea. Data persists via `documentWorkspace.productIdentification`.
- **Manufacturer Information** – Captures legal entity, registration number, address, contact person, and phone using standard inputs tied to `documentWorkspace.manufacturerInformation`.
- **Purpose & Scope** – Provides scope narrative placeholders, lifecycle phase selectors, assessment period dates, and a TipTap methodology editor.
- **Third-Party Components** – Maintains the Clause 7.11 inventory with clickable table rows, keyboard focus, multi-select deletion, and two TipTap editors (Management Approach + Evidence Reference). Data is persisted in `documentWorkspace.productOverview.thirdPartyComponents` and feeds the DOCX builder for section 2.3. (Earlier iterations used placeholder text and a transparent modal overlay; both issues were fixed by storing blank defaults and adopting the shared modal styling.)
- **Document Preview** – Aggregates the workspace state (cover, introduction, purpose & scope, product identification). Section Status entries act as router links so you can jump to the relevant page when a section is incomplete. The preview payload now includes `product_identification` so section 1.3 renders in the DOCX output.
- **Load & Save** – Export/import the entire workspace as JSON, refresh from storage, or clear everything for a clean slate.

All of these views share the same persistence layer defined in `web/src/services/documentWorkspace.ts`, ensuring hot module reloads and page refreshes keep state in sync.

### 6. **DOCX Preview Engine**
Server-side document generation with:
- HTML to DOCX conversion
- Styled output with proper formatting
- In-browser preview using docx-preview library
- Support for images, tables, and complex layouts
- Download generated documents

### 7. **Workspace Persistence**
Save and load your entire workspace:
- Export all data as JSON
- Import previous sessions
- Persistent storage using localStorage
- Cross-page state management for Cover, Introduction, Product Identification, Purpose & Scope, and Preview

### 8. **Theme Support**
- Light and dark mode
- Theme persistence across sessions
- Smooth transitions
- Accessible contrast ratios

### 9. **Database Integration**
- SQLite for development (zero configuration)
- PostgreSQL support for production
- Automatic schema creation
- Health monitoring dashboard

## 📁 Project Structure

```
EN-40000/
├── server/                 # Backend application
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py        # FastAPI application & routes
│   │   ├── database.py    # Database configuration
│   │   ├── models.py      # SQLAlchemy models
│   │   └── schemas.py     # Pydantic schemas
│   ├── requirements.txt   # Python dependencies
│   ├── run.py            # Server entry point
│   └── cratool.db        # SQLite database (auto-created)
│
├── web/                   # Frontend application
│   ├── src/
│   │   ├── components/   # Vue components
│   │   ├── views/        # Page components
│   │   ├── router/       # Vue Router config
│   │   ├── services/     # API and storage services
│   │   ├── utils/        # Helper functions
│   │   ├── data/         # Sample data
│   │   └── App.vue       # Root component
│   ├── package.json
│   └── vite.config.ts
│
├── dev_start.sh          # Start both servers
├── dev_stop.sh           # Stop both servers
├── README.md             # This file
└── DATABASE.md           # Database documentation
```

## 🎨 Demo Gallery

Access the demo gallery at `http://127.0.0.1:5173` to explore all features:

| Demo | Description | Key Features |
|------|-------------|--------------|
| **Dashboard** | Overview of all modules | Quick navigation, feature cards |
| **Modal Demo** | Interactive overlay examples | Persistent notes, multi-step forms |
| **Requirements Table** | Data management interface | CRUD operations, search, filter |
| **Rich Text Editor** | Content creation workspace | Full formatting, live preview |
| **XML Viewer** | Structured data visualization | Tree navigation, sample datasets |
| **DOCX Preview** | Document generation | HTML to DOCX, download option |
| **Save/Load** | Workspace persistence | Export/import state, version management |

## 🗄️ Database

The CRA Tool uses a flexible database system:

- **Default**: SQLite (`server/cratool.db`) - perfect for development
- **Production**: PostgreSQL support via `DATABASE_URL` environment variable
- **Schema**: 20 tables for requirements, components, and metadata
- **Auto-initialization**: Tables created automatically on first run

For detailed database documentation, see [DATABASE.md](./changelog/DATABASE.md)

### Quick Database Config

Create `server/.env`:
```env
# SQLite (default)
DATABASE_URL=sqlite:///./cratool.db

# Or PostgreSQL
DATABASE_URL=postgresql+psycopg2://user:password@localhost:5432/cratool
```

## 🔌 API Endpoints

The backend provides a RESTful API. Access interactive documentation at:
- **Swagger UI**: `http://127.0.0.1:8000/docs`
- **ReDoc**: `http://127.0.0.1:8000/redoc`

### Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Database health and connectivity |
| `/components` | GET | List all components |
| `/components` | POST | Create new component |
| `/components/{id}` | GET | Get specific component |
| `/components/{id}` | PUT | Update component |
| `/components/{id}` | DELETE | Delete component |
| `/cover/preview` | POST | Generate cover page DOCX |
| `/security/sfr/preview` | POST | Generate requirements preview |
| `/tss/preview` | POST | Generate specification preview |

## 🧪 Testing

### Frontend Tests
```bash
cd web
npm run test:e2e
```

Playwright tests are configured in `web/playwright.config.ts`

### Backend Tests
```bash
cd server
source .venv/bin/activate
pytest
```

## 📦 Building for Production

### Frontend Build
```bash
cd web
npm run build
# Output: web/dist/
```

### Deployment
The built frontend can be served via:
- Nginx
- Apache
- Static hosting services (Vercel, Netlify, etc.)

Backend should be deployed with:
- Gunicorn/Uvicorn workers
- Reverse proxy (Nginx)
- PostgreSQL database
- SSL/TLS certificates

## 🛠️ Development

### Frontend Hot Reload
Changes to Vue components are automatically reflected thanks to Vite HMR.

### Backend Auto-reload
Uvicorn automatically restarts when Python files change.

### Adding New Features
1. **Backend**: Add routes in `server/app/main.py`
2. **Frontend**: Create components in `web/src/components/`
3. **Database**: Update models in `server/app/models.py`

## 📝 Configuration

### Frontend Environment Variables
Copy `web/.env.example` to `web/.env`:
```env
VITE_API_BASE_URL=http://localhost:8000
```

### Backend Environment Variables  
Create `server/.env`:
```env
DATABASE_URL=sqlite:///./cratool.db
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process using port 8000
lsof -i :8000
kill -9 <PID>

# Or use dev_stop.sh
./dev_stop.sh
```

### Database Locked (SQLite)
```bash
# Check for zombie processes
ps aux | grep python
kill -9 <PID>
```

### Frontend Build Errors
```bash
cd web
rm -rf node_modules package-lock.json
npm install
```

## 📚 Additional Resources

- [AGENTS.md](./AGENTS.md) – Full knowledge base for agents working on the CRA Tool (architecture, workflows, changelog pointers)
- [DATABASE.md](./changelog/DATABASE.md) – Comprehensive database documentation
- [TRANSFORMATION_COMPLETE.md](./changelog/TRANSFORMATION_COMPLETE.md) – Project history
- [VERIFICATION_CHECKLIST.md](./changelog/VERIFICATION_CHECKLIST.md) – Testing checklist
- [CLEANUP_SUMMARY.md](./changelog/CLEANUP_SUMMARY.md) – Recent cleanup work summary

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

[Add your license information here]

## 🆘 Support

For issues and questions:
- Check the documentation in this README
- Review [DATABASE.md](./changelog/DATABASE.md) for database issues
- Check logs: `.devserver/backend.log` and `.devserver/frontend.log`
