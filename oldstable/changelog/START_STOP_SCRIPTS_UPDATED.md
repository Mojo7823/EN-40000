# ✅ Start/Stop Scripts Updated for Nuxt

## Changes Made

### 1. dev_start.sh

**Updated to use Nuxt frontend instead of Vite:**

- **Directory changed:** `web/` → `web-nuxt/`
- **Port changed:** `5173` → `3000`
- **Command updated:** Removed `--host` and `--port` flags (Nuxt handles this)
- **URL changed:** `http://127.0.0.1:5173` → `http://localhost:3000`
- **Comment updated:** "Vite frontend" → "Nuxt 3 frontend"

**Key changes:**
```bash
# Before
WEB_DIR="$ROOT_DIR/web"
npm run dev -- --host 127.0.0.1 --port 5173
wait_for_url "frontend" "http://127.0.0.1:5173"

# After
WEB_DIR="$ROOT_DIR/web-nuxt"
npm run dev
wait_for_url "frontend" "http://localhost:3000"
```

### 2. dev_stop.sh

**Updated to kill Nuxt processes instead of Vite:**

- **Process detection changed:** `node_modules/.bin/vite` → `nuxt dev`
- **Port monitoring changed:** `8000, 5173, 5174` → `8000, 3000`
- **Messages updated:** "vite" → "Nuxt"

**Key changes:**
```bash
# Before
FRONTEND_PIDS=$(pgrep -f "node_modules/.bin/vite" 2>/dev/null || true)
for port in 8000 5173 5174; do

# After
FRONTEND_PIDS=$(pgrep -f "nuxt dev" 2>/dev/null || true)
for port in 8000 3000; do
```

## Usage

### Start Servers
```bash
./dev_start.sh
```

**Output:**
```
Installing frontend dependencies... (if needed)
Starting backend on http://127.0.0.1:8000...
backend is ready (http://127.0.0.1:8000/health)
Starting Nuxt frontend on http://localhost:3000...
frontend is ready (http://localhost:3000)
Logs: /path/to/.devserver/backend.log and /path/to/.devserver/frontend.log
```

### Stop Servers
```bash
./dev_stop.sh
```

**Output:**
```
🛑 Stopping CRA Tool development servers...
  🔄 Stopping backend (PID xxx and children)...
  ✅ backend stopped.
  🔄 Stopping frontend (PID xxx and children)...
  ✅ frontend stopped.

🔍 Searching for zombie backend processes...
  ✅ No zombie uvicorn processes found.

🔍 Searching for zombie frontend processes...
  ✅ No zombie Nuxt processes found.

🔍 Checking ports 8000 and 3000...
  ✅ Port 8000 is free.
  ✅ Port 3000 is free.

✅ All development servers stopped successfully!
```

## Features

### Smart Dependency Management
- Automatically installs backend dependencies if `requirements.txt` changes
- Automatically installs frontend dependencies if `package.json` changes (using `--legacy-peer-deps`)
- Caches hash files to avoid unnecessary reinstalls

### Robust Process Management
- Tracks PIDs in `.devserver/` directory
- Terminates entire process tree (parent + children)
- Checks for zombie processes by name pattern
- Checks for processes by port as fallback
- Multiple kill strategies (graceful → SIGKILL if needed)

### Health Checks
- Waits for backend to respond at `/health` endpoint
- Waits for frontend to respond at root
- Timeout after 20 seconds with warning
- Logs all output to `.devserver/*.log` files

## URLs

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:3000 |
| **Backend API** | http://127.0.0.1:8000 |
| **API Docs** | http://127.0.0.1:8000/docs |

## Log Files

```bash
# View backend logs
tail -f .devserver/backend.log

# View frontend logs
tail -f .devserver/frontend.log
```

## Troubleshooting

### Ports Already in Use
The stop script automatically checks and clears:
- Port 8000 (backend)
- Port 3000 (frontend)

### Zombie Processes
The stop script searches for:
- `uvicorn.*app.main:app` (backend)
- `nuxt dev` (frontend)

### Manual Cleanup
```bash
# Kill by port
lsof -ti:3000 | xargs kill -9
lsof -ti:8000 | xargs kill -9

# Kill by process name
pkill -f "nuxt dev"
pkill -f "uvicorn.*app.main"
```

## Testing

✅ **Tested and working:**
- Backend starts on port 8000
- Nuxt frontend starts on port 3000
- All 26 pages accessible (HTTP 200)
- Stop script kills all processes cleanly
- Restart works without issues

## Backward Compatibility

The old Vue/Vite frontend in `web/` is still available but no longer used by default. To use it:

1. Manually change `WEB_DIR="$ROOT_DIR/web"` in dev_start.sh
2. Update port to 5173
3. Change command back to `npm run dev -- --host 127.0.0.1 --port 5173`

However, **the Nuxt frontend is now the primary version** and fully functional.

## Related Scripts

For reference, the standalone Nuxt scripts also exist:
- `nuxt_dev_start.sh` - Starts both servers with Nuxt
- `nuxt_dev_stop.sh` - Stops both servers

The main `dev_start.sh` and `dev_stop.sh` scripts now point to the Nuxt version by default.
