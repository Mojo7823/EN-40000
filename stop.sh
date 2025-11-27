#!/bin/bash
cd "$(dirname "$0")"

echo "========================================="
echo "  CRA-Tool Stop Script"
echo "========================================="
echo ""

# Function to kill process by port
kill_port() {
    PORT=$1
    PIDS=$(lsof -t -i:$PORT 2>/dev/null)
    if [ -n "$PIDS" ]; then
        echo "  → Killing process on port $PORT (PIDs: $PIDS)..."
        kill -9 $PIDS 2>/dev/null
        sleep 0.5
    fi
}

# Function to kill process tree (parent and all children)
kill_process_tree() {
    local PID=$1
    local DESCRIPTION=$2
    
    if [ -z "$PID" ] || ! ps -p $PID > /dev/null 2>&1; then
        return
    fi
    
    echo "  → Stopping $DESCRIPTION (PID $PID)..."
    
    # Find all child processes
    local CHILDREN=$(pgrep -P $PID 2>/dev/null)
    
    # Kill children first
    if [ -n "$CHILDREN" ]; then
        for CHILD in $CHILDREN; do
            kill -9 $CHILD 2>/dev/null
        done
    fi
    
    # Kill parent
    kill -9 $PID 2>/dev/null
    sleep 0.5
}

echo "[1/5] Stopping processes from PID files..."
# Stop Backend
if [ -f backend.pid ]; then
    PID=$(cat backend.pid)
    kill_process_tree $PID "Backend"
    rm -f backend.pid
fi

# Stop Frontend
if [ -f frontend.pid ]; then
    PID=$(cat frontend.pid)
    kill_process_tree $PID "Frontend"
    rm -f frontend.pid
fi

echo ""
echo "[2/5] Scanning for cra-tool related processes..."
# Find and kill cra-tool related processes - more targeted approach
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CRATOOL_PIDS=$(ps aux | grep -E "$SCRIPT_DIR.*(uvicorn|nuxt|npm run dev)" | grep -v grep | awk '{print $2}')
if [ -n "$CRATOOL_PIDS" ]; then
    echo "  → Found cra-tool processes: $CRATOOL_PIDS"
    for PID in $CRATOOL_PIDS; do
        kill -9 $PID 2>/dev/null
    done
else
    echo "  ✓ No cra-tool processes found"
fi

echo ""
echo "[3/5] Killing specific process patterns..."
# More targeted cleanup - only kill processes in THIS directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Kill uvicorn only if running from this project's backend
pkill -9 -f "uvicorn main:app.*--port 8000" 2>/dev/null && echo "  → Killed uvicorn processes"

# Kill nuxt processes only from this project directory
pgrep -f "nuxi.*$SCRIPT_DIR" | xargs -r kill -9 2>/dev/null && echo "  → Killed nuxi processes"
pgrep -f "nuxt.*$SCRIPT_DIR" | xargs -r kill -9 2>/dev/null && echo "  → Killed nuxt processes"

# Check if any survived in this project
REMAINING=$(ps aux | grep -E "(uvicorn main:app.*8000|$SCRIPT_DIR.*nuxt)" | grep -v grep)
if [ -z "$REMAINING" ]; then
    echo "  ✓ All target processes terminated"
else
    echo "  ⚠ Some processes may still be running"
fi

echo ""
echo "[4/5] Releasing ports..."
# Kill ports
kill_port 8000  # Backend
kill_port 3000  # Frontend
kill_port 3001  # Alternative frontend port
kill_port 3002  # Alternative frontend port
kill_port 24678 # Vite HMR port

# Verify ports are free
echo ""
echo "[5/5] Verifying ports are free..."
for PORT in 8000 3000 3001 3002 24678; do
    if lsof -i:$PORT > /dev/null 2>&1; then
        echo "  ✗ Port $PORT is still in use"
    else
        echo "  ✓ Port $PORT is free"
    fi
done

echo ""
echo "========================================="
echo "  ✓ Cleanup complete"
echo "========================================="
