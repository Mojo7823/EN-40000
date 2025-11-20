# Database Documentation

## Overview

The CRA Tool uses **SQLite** by default for local development, with support for **PostgreSQL** in production environments. The database is automatically created and initialized when the FastAPI backend starts.

## Database Location

### Default (SQLite)
- **Path**: `server/cratool.db` (relative to the server directory)
- **Type**: SQLite 3
- **Size**: Approximately 512 KB when initialized
- **Auto-created**: Yes, on first application startup

### Configuration

The database connection is configured via the `DATABASE_URL` environment variable:

```bash
# SQLite (default if not set)
DATABASE_URL=sqlite:///./cratool.db

# PostgreSQL (production)
DATABASE_URL=postgresql+psycopg2://user:password@host:5432/dbname
```

To configure the database:

1. Create a `.env` file in the `server/` directory:
   ```bash
   cd server
   nano .env
   ```

2. Add your database URL:
   ```env
   DATABASE_URL=sqlite:///./cratool.db
   ```

3. Restart the backend server

## Database Schema

The CRA Tool database contains **20 tables** organized into three categories:

### 1. General Purpose Table

#### `components`
General-purpose component storage for backward compatibility.

| Column | Type | Description |
|--------|------|-------------|
| `id` | Integer | Primary key (auto-increment) |
| `class_name` | String(100) | Component class name |
| `family` | String(100) | Component family |
| `component` | String(100) | Component identifier |
| `component_name` | Text | Full component name |
| `element` | String(200) | Element identifier |
| `element_item` | Text | Element description |

### 2. Functional Requirements Tables (11 tables)

These tables store security functional requirements organized by family:

- **`fau_db`** - Security audit (FAU)
- **`fco_db`** - Communication (FCO)
- **`fcs_db`** - Cryptographic support (FCS)
- **`fdp_db`** - User data protection (FDP)
- **`fia_db`** - Identification and authentication (FIA)
- **`fmt_db`** - Security management (FMT)
- **`fpr_db`** - Privacy (FPR)
- **`fpt_db`** - Protection of the TSF (FPT)
- **`fru_db`** - Resource utilisation (FRU)
- **`fta_db`** - Product access (FTA)
- **`ftp_db`** - Trusted path/channels (FTP)

**Common Schema** (all functional requirement tables):

| Column | Type | Description |
|--------|------|-------------|
| `id` | Integer | Primary key (auto-increment) |
| `class` | String(255) | Requirement class |
| `family` | String(255) | Requirement family |
| `component` | String(255) | Component identifier |
| `component_name` | Text | Component description |
| `element` | String(255) | Element identifier |
| `element_item` | Text | Element details |

### 3. Assurance Requirements Tables (8 tables)

These tables store security assurance requirements:

- **`aco_db`** - Composition (ACO)
- **`adv_db`** - Development (ADV)
- **`agd_db`** - Guidance documents (AGD)
- **`alc_db`** - Life-cycle support (ALC)
- **`ape_db`** - Protection Profile evaluation (APE)
- **`ase_db`** - CRA Documentation evaluation (ASE)
- **`ate_db`** - Tests (ATE)
- **`ava_db`** - Vulnerability assessment (AVA)

**Common Schema** (same as functional requirements tables above)

### 4. Special Tables

#### `element_list_db`
Stores element lists with color coding for UI rendering.

| Column | Type | Description |
|--------|------|-------------|
| `id` | Integer | Primary key (auto-increment) |
| `element` | String(255) | Element identifier |
| `element_index` | String(255) | Unique element index |
| `item_list` | Text | Comma-separated item list |
| `color` | String(50) | Color code for rendering |

## Database Initialization

The database is automatically initialized using SQLAlchemy ORM when the FastAPI application starts:

```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create all tables if they don't exist
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown (if needed)
```

**What happens:**
1. Application checks if `cratool.db` exists
2. If not, creates the file
3. Creates all 20 tables based on model definitions
4. Ready to accept data

## Switching Databases

### From SQLite to PostgreSQL

1. Install PostgreSQL dependencies:
   ```bash
   cd server
   source .venv/bin/activate
   pip install psycopg2-binary
   ```

2. Set up PostgreSQL database:
   ```sql
   CREATE DATABASE cratool;
   CREATE USER cratool_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE cratool TO cratool_user;
   ```

3. Update `.env`:
   ```env
   DATABASE_URL=postgresql+psycopg2://cratool_user:your_password@localhost:5432/cratool
   ```

4. Restart the backend - tables will be created automatically

### Data Migration

To migrate existing data from SQLite to PostgreSQL:

```bash
# Backup SQLite database
cp server/cratool.db server/cratool.db.backup

# Use a migration tool like pgloader or write a custom script
# Example custom script:
python migrate_db.py --source sqlite:///./cratool.db --target postgresql://user:pass@localhost/cratool
```

## Database Backup

### SQLite Backup

```bash
# Simple file copy
cp server/cratool.db server/cratool_backup_$(date +%Y%m%d).db

# Or use sqlite3 command
sqlite3 server/cratool.db ".backup server/cratool_backup.db"
```

### PostgreSQL Backup

```bash
pg_dump -U cratool_user -d cratool > cratool_backup_$(date +%Y%m%d).sql
```

## Querying the Database

### Using Python

```python
import sqlite3

conn = sqlite3.connect('server/cratool.db')
cursor = conn.cursor()

# List all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
print(cursor.fetchall())

# Query components
cursor.execute("SELECT * FROM components LIMIT 10;")
for row in cursor.fetchall():
    print(row)

conn.close()
```

### Using sqlite3 CLI

```bash
sqlite3 server/cratool.db

# List tables
.tables

# Describe table structure
.schema components

# Query data
SELECT * FROM components LIMIT 10;

# Exit
.quit
```

## Database Health Check

The application provides a `/health` endpoint that checks database connectivity:

```bash
curl http://localhost:8000/health
```

Response:
```json
{
  "status": "ok",
  "latency_ms": 5,
  "database_url": "sqlite:///./cratool.db",
  "timestamp": 1700000000,
  "details": {}
}
```

## Troubleshooting

### Database Locked Error (SQLite)

**Problem**: `database is locked` error

**Solution**:
- Ensure only one process is accessing the database
- Check for zombie processes: `ps aux | grep python`
- Kill stale processes: `kill -9 <PID>`

### Permission Issues

**Problem**: Cannot create/write to database file

**Solution**:
```bash
# Check permissions
ls -la server/cratool.db

# Fix permissions
chmod 664 server/cratool.db
chown $USER:$USER server/cratool.db
```

### Connection Pool Exhausted (PostgreSQL)

**Problem**: Too many connections

**Solution**: Configure connection pooling in `database.py`:
```python
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20
)
```

## Performance Considerations

### SQLite
- ✅ Perfect for development and small deployments
- ✅ Zero configuration
- ❌ Limited concurrent write operations
- ❌ Not suitable for high-traffic production

### PostgreSQL
- ✅ Handles concurrent connections well
- ✅ Better for production environments
- ✅ Advanced features (JSONB, full-text search)
- ❌ Requires separate database server

## Security Best Practices

1. **Never commit `.env` files** with real credentials
2. **Use strong passwords** for PostgreSQL users
3. **Restrict database file permissions** (SQLite): `chmod 600 cratool.db`
4. **Use SSL/TLS** for PostgreSQL connections in production
5. **Regular backups** - automate with cron jobs
6. **Separate credentials** for development and production

## API Endpoints for Database Operations

### Components CRUD

- `GET /components` - List all components (with search)
- `POST /components` - Create new component
- `GET /components/{id}` - Get component by ID
- `PUT /components/{id}` - Update component
- `DELETE /components/{id}` - Delete component

### Health Check

- `GET /health` - Database connectivity and latency

See API documentation at `http://localhost:8000/docs` when the server is running.
