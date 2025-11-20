#!/bin/bash
cd "$(dirname "$0")"

echo "--- Stopping Servers ---"

# Function to kill process by port
kill_port() {
    PORT=$1
    PIDS=$(lsof -t -i:$PORT)
    if [ -n "$PIDS" ]; then
        echo "Killing process on port $PORT (PIDs: $PIDS)..."
        kill -9 $PIDS 2>/dev/null
    fi
}

# Stop Backend
if [ -f backend.pid ]; then
    PID=$(cat backend.pid)
    echo "Stopping Backend (PID $PID)..."
    kill -9 $PID 2>/dev/null
    rm backend.pid
fi

# Stop Frontend
if [ -f frontend.pid ]; then
    PID=$(cat frontend.pid)
    echo "Stopping Frontend (PID $PID)..."
    kill -9 $PID 2>/dev/null
    rm frontend.pid
fi

# Aggressive Cleanup
echo "Scanning for remaining processes..."
pkill -9 -f "uvicorn backend.main:app"
pkill -9 -f "nuxi dev"
pkill -9 -f "nuxt dev"

# Kill ports just in case
kill_port 8000
kill_port 3000
kill_port 3001
kill_port 3002

echo "Servers stopped."
