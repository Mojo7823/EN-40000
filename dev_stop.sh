#!/usr/bin/env bash
# Stop the background development servers started via dev_start.sh.
# This script ensures ALL backend and frontend processes are terminated.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUNTIME_DIR="$ROOT_DIR/.devserver"
BACKEND_PID_FILE="$RUNTIME_DIR/backend.pid"
FRONTEND_PID_FILE="$RUNTIME_DIR/frontend.pid"

echo "🛑 Stopping CRA Tool development servers..."

terminate_tree() {
  local pid="$1"
  if [[ -z "$pid" ]]; then
    return
  fi
  if ! kill -0 "$pid" 2>/dev/null; then
    return
  fi

  local children
  children="$(pgrep -P "$pid" 2>/dev/null || true)"
  if [[ -n "$children" ]]; then
    for child in $children; do
      terminate_tree "$child"
    done
  fi

  kill "$pid" 2>/dev/null || true
  local waited=0
  while kill -0 "$pid" 2>/dev/null && [[ "$waited" -lt 10 ]]; do
    sleep 0.2
    waited=$((waited + 1))
  done
  if kill -0 "$pid" 2>/dev/null; then
    kill -9 "$pid" 2>/dev/null || true
  fi
}

stop_process() {
  local name="$1"
  local file="$2"
  if [[ ! -f "$file" ]]; then
    echo "  ℹ️  $name not running (no PID file)."
    return
  fi

  local pid
  pid="$(cat "$file")"
  if kill -0 "$pid" 2>/dev/null; then
    echo "  🔄 Stopping $name (PID $pid and children)..."
    terminate_tree "$pid"
    echo "  ✅ $name stopped."
  else
    echo "  ⚠️  $name PID file found but process not running."
  fi
  rm -f "$file"
}

# Stop processes tracked by PID files
stop_process "backend" "$BACKEND_PID_FILE"
stop_process "frontend" "$FRONTEND_PID_FILE"

# Kill any remaining uvicorn processes (backend)
echo ""
echo "🔍 Searching for zombie backend processes..."
BACKEND_PIDS=$(pgrep -f "uvicorn.*app.main:app" 2>/dev/null || true)
if [[ -n "$BACKEND_PIDS" ]]; then
  echo "  ⚠️  Found zombie uvicorn processes: $BACKEND_PIDS"
  for pid in $BACKEND_PIDS; do
    echo "  🔄 Killing uvicorn process $pid..."
    kill -9 "$pid" 2>/dev/null || true
  done
  echo "  ✅ All uvicorn processes terminated."
else
  echo "  ✅ No zombie uvicorn processes found."
fi

# Kill any remaining Nuxt processes (frontend)
echo ""
echo "🔍 Searching for zombie frontend processes..."
FRONTEND_PIDS=$(pgrep -f "nuxt dev" 2>/dev/null || true)
if [[ -n "$FRONTEND_PIDS" ]]; then
  FRONTEND_COUNT=$(echo "$FRONTEND_PIDS" | wc -w)
  echo "  ⚠️  Found $FRONTEND_COUNT zombie Nuxt processes!"
  for pid in $FRONTEND_PIDS; do
    echo "  🔄 Killing Nuxt process $pid..."
    kill -9 "$pid" 2>/dev/null || true
  done
  echo "  ✅ All Nuxt processes terminated."
else
  echo "  ✅ No zombie Nuxt processes found."
fi

# Kill processes by port (belt and suspenders approach)
echo ""
echo "🔍 Checking ports 8000 and 3000..."
for port in 8000 3000; do
  PORT_PIDS=$(lsof -ti :$port 2>/dev/null || true)
  if [[ -n "$PORT_PIDS" ]]; then
    echo "  ⚠️  Found processes on port $port: $PORT_PIDS"
    for pid in $PORT_PIDS; do
      echo "  🔄 Killing process $pid on port $port..."
      kill -9 "$pid" 2>/dev/null || true
    done
    echo "  ✅ Port $port cleared."
  else
    echo "  ✅ Port $port is free."
  fi
done

# Clean up runtime directory
if [[ -d "$RUNTIME_DIR" ]]; then
  rm -f "$RUNTIME_DIR"/*.pid 2>/dev/null || true
  if [[ -z "$(ls -A "$RUNTIME_DIR" 2>/dev/null)" ]]; then
    rmdir "$RUNTIME_DIR" 2>/dev/null || true
  fi
fi

echo ""
echo "✅ All development servers stopped successfully!"
echo ""
