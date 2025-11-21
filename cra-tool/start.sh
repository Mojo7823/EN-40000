#!/bin/bash
cd "$(dirname "$0")"

# 0. Clean Start
echo "--- Cleaning up previous processes ---"
./stop.sh

# 1. Backend Setup
echo "--- Setting up Backend ---"
if [ ! -d "backend/venv" ]; then
    echo "Creating virtual environment in backend/venv..."
    python3 -m venv backend/venv
fi

# source backend/venv/bin/activate # No need to activate if we use direct paths
echo "Installing dependencies..."
./backend/venv/bin/pip install -r backend/requirements.txt

# 2. Start Backend
echo "--- Starting Backend ---"
# Run uvicorn in background, log to backend.log
nohup ./backend/venv/bin/uvicorn backend.main:app --reload --port 8000 > backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > backend.pid
echo "Backend started with PID $BACKEND_PID (Logs: backend.log)"

# 3. Start Frontend
echo "--- Starting Frontend ---"
# Run npm run dev in background, log to frontend.log
nohup npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > frontend.pid
echo "Frontend started with PID $FRONTEND_PID (Logs: frontend.log)"

echo ""
echo "Development environment is running."
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:8000"
echo "Run './stop.sh' to stop the servers."
