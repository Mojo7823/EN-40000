#!/bin/bash
cd "$(dirname "$0")"

echo "========================================="
echo "  CRA-Tool Start Script"
echo "========================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print error and exit
fail() {
    echo -e "${RED}✗ Error: $1${NC}"
    exit 1
}

# Function to print success
success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print warning
warn() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Function to check if port is in use
check_port() {
    local PORT=$1
    if lsof -i:$PORT > /dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill port and wait
kill_and_wait_port() {
    local PORT=$1
    local MAX_ATTEMPTS=5
    local ATTEMPT=0
    
    while check_port $PORT && [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
        warn "Port $PORT is in use. Attempting to free it (attempt $((ATTEMPT+1))/$MAX_ATTEMPTS)..."
        PIDS=$(lsof -t -i:$PORT 2>/dev/null)
        if [ -n "$PIDS" ]; then
            kill -9 $PIDS 2>/dev/null
            sleep 1
        fi
        ATTEMPT=$((ATTEMPT+1))
    done
    
    if check_port $PORT; then
        return 1  # Failed to free port
    fi
    return 0  # Port is free
}

echo "[1/6] Validating system requirements..."
# Check Python 3
if ! command -v python3 &> /dev/null; then
    fail "Python 3 is not installed. Please install Python 3.8 or higher."
fi
PYTHON_VERSION=$(python3 --version | awk '{print $2}')
success "Python $PYTHON_VERSION found"

# Check Node.js and npm
if ! command -v node &> /dev/null; then
    fail "Node.js is not installed. Please install Node.js 18 or higher."
fi
NODE_VERSION=$(node --version)
success "Node.js $NODE_VERSION found"

if ! command -v npm &> /dev/null; then
    fail "npm is not installed. Please install npm."
fi
NPM_VERSION=$(npm --version)
success "npm $NPM_VERSION found"

# Check lsof (for port checking)
if ! command -v lsof &> /dev/null; then
    warn "lsof not found. Port checking may not work properly."
fi

echo ""
echo "[2/6] Checking and cleaning ports..."
# Check if ports are in use and try to free them
PORTS_OK=true

for PORT in 8000 3000; do
    if check_port $PORT; then
        warn "Port $PORT is already in use"
        if ! kill_and_wait_port $PORT; then
            fail "Failed to free port $PORT. Please manually stop processes using this port."
        fi
        success "Port $PORT freed"
    else
        success "Port $PORT is available"
    fi
done

echo ""
echo "[3/6] Cleaning up previous processes..."
# Run stop script to ensure clean slate
./stop.sh > /dev/null 2>&1
sleep 1

echo ""
echo "[4/6] Setting up backend environment..."
# Check if .venv exists
if [ ! -d "backend/.venv" ]; then
    echo "  → Creating virtual environment..."
    python3 -m venv backend/.venv || fail "Failed to create virtual environment"
    success "Virtual environment created"
else
    success "Virtual environment exists"
fi

# Verify pip exists
if [ ! -f "backend/.venv/bin/pip" ]; then
    echo "  → Recreating virtual environment (pip not found)..."
    rm -rf backend/.venv
    python3 -m venv backend/.venv || fail "Failed to create virtual environment"
fi

# Check if requirements need to be installed
REQUIREMENTS_FILE="backend/requirements.txt"
VENV_INSTALLED_MARKER="backend/.venv/.requirements_installed"

if [ ! -f "$VENV_INSTALLED_MARKER" ] || [ "$REQUIREMENTS_FILE" -nt "$VENV_INSTALLED_MARKER" ]; then
    echo "  → Installing/updating Python dependencies..."
    ./backend/.venv/bin/pip install --upgrade pip > /dev/null 2>&1
    ./backend/.venv/bin/pip install -r "$REQUIREMENTS_FILE" || fail "Failed to install Python dependencies"
    touch "$VENV_INSTALLED_MARKER"
    success "Python dependencies installed"
else
    success "Python dependencies are up to date"
fi

echo ""
echo "[5/6] Installing frontend dependencies..."
# Check if node_modules exists and package.json hasn't changed
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
    echo "  → Running npm install..."
    npm install || fail "Failed to install npm dependencies"
    success "npm dependencies installed"
else
    success "npm dependencies are up to date"
fi

echo ""
echo "[6/6] Starting services..."
# Start Backend
echo "  → Starting backend server..."
cd backend
nohup ./.venv/bin/uvicorn main:app --reload --port 8000 > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..
echo $BACKEND_PID > backend.pid

# Wait a moment and verify backend started
sleep 2
if ! ps -p $BACKEND_PID > /dev/null 2>&1; then
    fail "Backend failed to start. Check backend.log for details."
fi
success "Backend started (PID: $BACKEND_PID)"

# Start Frontend
echo "  → Starting frontend server..."
nohup npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > frontend.pid

# Wait a moment and verify frontend started
sleep 2
if ! ps -p $FRONTEND_PID > /dev/null 2>&1; then
    fail "Frontend failed to start. Check frontend.log for details."
fi
success "Frontend started (PID: $FRONTEND_PID)"

# Wait for services to be fully ready
echo ""
echo "Waiting for services to be ready..."
sleep 3

# Verify ports are listening
BACKEND_READY=false
FRONTEND_READY=false

for i in {1..10}; do
    check_port 8000 && BACKEND_READY=true
    check_port 3000 && FRONTEND_READY=true
    
    if $BACKEND_READY && $FRONTEND_READY; then
        break
    fi
    sleep 1
done

echo ""
echo "========================================="
echo "  ✓ CRA-Tool is running!"
echo "========================================="
echo ""
if $BACKEND_READY; then
    success "Backend:  http://localhost:8000"
else
    warn "Backend may not be ready yet"
fi

if $FRONTEND_READY; then
    success "Frontend: http://localhost:3000"
else
    warn "Frontend may not be ready yet"
fi

echo ""
echo "Logs:"
echo "  • Backend:  tail -f backend.log"
echo "  • Frontend: tail -f frontend.log"
echo ""
echo "To stop: ./stop.sh"
echo "========================================="
