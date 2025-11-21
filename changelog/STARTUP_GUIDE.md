# CRA-Tool Startup Guide

## Quick Start

### Starting the Application
```bash
./start.sh
```

### Stopping the Application
```bash
./stop.sh
```

## What the Scripts Do

### start.sh - Comprehensive Startup Script

The start script performs the following steps:

1. **System Requirements Validation**
   - Checks for Python 3.8+ installation
   - Checks for Node.js 18+ installation
   - Checks for npm installation
   - Verifies required tools (lsof) are available

2. **Port Availability Check**
   - Checks if ports 8000 (backend) and 3000 (frontend) are free
   - Attempts to automatically kill processes using these ports
   - Fails with clear error if ports cannot be freed

3. **Process Cleanup**
   - Runs stop.sh to ensure no previous instances are running
   - Ensures clean slate before starting

4. **Backend Environment Setup**
   - Creates Python virtual environment if it doesn't exist
   - Installs/updates Python dependencies from `requirements.txt`
   - Uses marker file to avoid redundant installations
   - Only reinstalls when requirements.txt is modified

5. **Frontend Dependencies**
   - Checks if node_modules exists
   - Runs `npm install` only when needed (package.json changed)
   - Skips installation if dependencies are up to date

6. **Service Startup**
   - Starts backend (uvicorn) on port 8000
   - Starts frontend (nuxt) on port 3000
   - Verifies both services started successfully
   - Waits for services to be ready
   - Confirms ports are listening

### stop.sh - Thorough Cleanup Script

The stop script performs comprehensive cleanup:

1. **PID-based Termination**
   - Stops processes using stored PID files
   - Kills entire process tree (parent + children)
   - Removes PID files

2. **Pattern-based Process Search**
   - Searches for all cra-tool related processes
   - Kills any uvicorn, nuxt, npm, or node processes in cra-tool directory

3. **Aggressive Process Cleanup**
   - Kills processes by name pattern:
     - uvicorn backend.main:app
     - nuxi dev
     - nuxt dev
     - @nuxt/cli
     - esbuild services

4. **Port Release**
   - Forces kill processes on ports: 8000, 3000, 3001, 3002, 24678
   - Verifies each port is freed

5. **Verification**
   - Confirms all target processes are terminated
   - Reports status of each port

## System Requirements

### Required Software
- **Python 3.8+** - For backend FastAPI server
- **Node.js 18+** - For frontend Nuxt application
- **npm** - Node package manager
- **lsof** - For port checking (optional but recommended)

### Required Ports
- **8000** - Backend API server
- **3000** - Frontend development server
- **24678** - Vite HMR (Hot Module Replacement)

## Usage Examples

### Normal Startup
```bash
cd cra-tool
./start.sh
```

### Check Logs
```bash
# Backend logs
tail -f cra-tool/backend.log

# Frontend logs
tail -f cra-tool/frontend.log
```

### Access Applications
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Backend Docs: http://localhost:8000/docs

### Stop Services
```bash
cd cra-tool
./stop.sh
```

## Troubleshooting

### Port Already in Use
If you see "Port X is already in use":
1. The script will attempt to free the port automatically
2. If it fails, manually identify and stop the process:
   ```bash
   lsof -i:8000  # or :3000
   kill -9 <PID>
   ```

### Backend Won't Start
Check backend.log for errors:
```bash
tail -50 cra-tool/backend.log
```

Common issues:
- Python dependencies not installed
- Port 8000 in use
- Python virtual environment corrupted

### Frontend Won't Start
Check frontend.log for errors:
```bash
tail -50 cra-tool/frontend.log
```

Common issues:
- Node modules not installed
- Port 3000 in use
- Package.json corruption

### Services Not Stopping
Run stop script twice:
```bash
./stop.sh
sleep 2
./stop.sh
```

Or manually kill all processes:
```bash
pkill -9 -f "cra-tool"
```

## For Vendors

When deploying to other environments:

1. **Install Prerequisites**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install python3 python3-venv nodejs npm lsof
   
   # CentOS/RHEL
   sudo yum install python3 nodejs npm lsof
   ```

2. **Clone/Copy CRA-Tool**
   ```bash
   cd /path/to/installation
   ```

3. **Run Start Script**
   ```bash
   ./start.sh
   ```

The start script will automatically:
- Create virtual environment
- Install all Python dependencies
- Install all Node.js dependencies
- Start both services

No manual dependency installation required!

## File Structure

```
cra-tool/
├── start.sh              # Start script
├── stop.sh               # Stop script
├── backend.pid           # Backend process ID (created at runtime)
├── frontend.pid          # Frontend process ID (created at runtime)
├── backend.log           # Backend logs
├── frontend.log          # Frontend logs
├── backend/
│   ├── venv/            # Python virtual environment
│   ├── requirements.txt # Python dependencies
│   └── main.py          # Backend entry point
├── package.json          # Node.js dependencies
└── node_modules/        # Node.js packages
```

## Development Workflow

1. Start services: `./start.sh`
2. Make code changes
3. Services auto-reload (hot-reload enabled)
4. View logs if needed
5. Stop services: `./stop.sh`

## Notes

- Both backend and frontend have **hot-reload enabled**
- Changes to code are automatically detected and reloaded
- No need to restart services during development
- Logs are continuously written to .log files
- PID files track running processes
