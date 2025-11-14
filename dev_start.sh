#!/usr/bin/env bash
# Helper to launch the FastAPI backend and Vite frontend together.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$ROOT_DIR/server"
WEB_DIR="$ROOT_DIR/web"
RUNTIME_DIR="$ROOT_DIR/.devserver"
BACKEND_PID_FILE="$RUNTIME_DIR/backend.pid"
FRONTEND_PID_FILE="$RUNTIME_DIR/frontend.pid"

mkdir -p "$RUNTIME_DIR"

ensure_backend_env() {
  if [[ ! -d "$SERVER_DIR/.venv" ]]; then
    echo "Creating backend virtualenv..."
    python3 -m venv "$SERVER_DIR/.venv"
  fi

  if [[ ! -x "$SERVER_DIR/.venv/bin/uvicorn" ]]; then
    echo "Installing backend dependencies..."
    "$SERVER_DIR/.venv/bin/pip" install -r "$SERVER_DIR/requirements.txt"
  fi
}

ensure_frontend_dependencies() {
  if [[ ! -d "$WEB_DIR/node_modules" ]]; then
    echo "Installing frontend dependencies..."
    (cd "$WEB_DIR" && npm install)
  fi
}

start_backend() {
  if [[ -f "$BACKEND_PID_FILE" ]] && kill -0 "$(cat "$BACKEND_PID_FILE")" 2>/dev/null; then
    echo "Backend already running (PID $(cat "$BACKEND_PID_FILE"))."
    return
  fi

  echo "Starting backend on http://127.0.0.1:8000..."
  (
    # shellcheck disable=SC1091
    source "$SERVER_DIR/.venv/bin/activate"
    cd "$SERVER_DIR"
    uvicorn app.main:app --host 127.0.0.1 --port 8000
  ) >>"$RUNTIME_DIR/backend.log" 2>&1 &
  echo $! > "$BACKEND_PID_FILE"
}

start_frontend() {
  if [[ -f "$FRONTEND_PID_FILE" ]] && kill -0 "$(cat "$FRONTEND_PID_FILE")" 2>/dev/null; then
    echo "Frontend already running (PID $(cat "$FRONTEND_PID_FILE"))."
    return
  fi

  echo "Starting frontend on http://127.0.0.1:5173..."
  (
    cd "$WEB_DIR"
    npm run dev -- --host 127.0.0.1 --port 5173
  ) >>"$RUNTIME_DIR/frontend.log" 2>&1 &
  echo $! > "$FRONTEND_PID_FILE"
}

ensure_backend_env
ensure_frontend_dependencies
start_backend
start_frontend

echo "Logs: $RUNTIME_DIR/backend.log and $RUNTIME_DIR/frontend.log"
