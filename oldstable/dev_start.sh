#!/usr/bin/env bash
# Helper to launch the FastAPI backend and Nuxt 3 frontend together.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$ROOT_DIR/server"
WEB_DIR="$ROOT_DIR/web"
RUNTIME_DIR="$ROOT_DIR/.devserver"
BACKEND_PID_FILE="$RUNTIME_DIR/backend.pid"
FRONTEND_PID_FILE="$RUNTIME_DIR/frontend.pid"
BACKEND_REQ_HASH_FILE="$RUNTIME_DIR/backend-req.hash"
FRONTEND_PKG_HASH_FILE="$RUNTIME_DIR/frontend-pkg.hash"

mkdir -p "$RUNTIME_DIR"

hash_file() {
  local file="$1"
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$file" | awk '{print $1}'
  else
    shasum -a 256 "$file" | awk '{print $1}'
  fi
}

ensure_backend_env() {
  if [[ ! -d "$SERVER_DIR/.venv" ]]; then
    echo "Creating backend virtualenv..."
    python3 -m venv "$SERVER_DIR/.venv"
    "$SERVER_DIR/.venv/bin/python" -m pip install --upgrade pip >/dev/null
  fi

  local current_hash
  current_hash="$(hash_file "$SERVER_DIR/requirements.txt")"
  local previous_hash=""
  if [[ -f "$BACKEND_REQ_HASH_FILE" ]]; then
    previous_hash="$(cat "$BACKEND_REQ_HASH_FILE")"
  fi

  if [[ ! -x "$SERVER_DIR/.venv/bin/uvicorn" || "$current_hash" != "$previous_hash" ]]; then
    echo "Installing backend dependencies..."
    "$SERVER_DIR/.venv/bin/python" -m pip install -r "$SERVER_DIR/requirements.txt"
    echo "$current_hash" > "$BACKEND_REQ_HASH_FILE"
  fi
}

ensure_frontend_dependencies() {
  local lock_file
  if [[ -f "$WEB_DIR/package-lock.json" ]]; then
    lock_file="$WEB_DIR/package-lock.json"
  else
    lock_file="$WEB_DIR/package.json"
  fi
  local current_hash
  current_hash="$(hash_file "$lock_file")"
  local previous_hash=""
  if [[ -f "$FRONTEND_PKG_HASH_FILE" ]]; then
    previous_hash="$(cat "$FRONTEND_PKG_HASH_FILE")"
  fi

  if [[ ! -d "$WEB_DIR/node_modules" || "$current_hash" != "$previous_hash" ]]; then
    echo "Installing frontend dependencies..."
    (cd "$WEB_DIR" && npm install --legacy-peer-deps)
    echo "$current_hash" > "$FRONTEND_PKG_HASH_FILE"
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
  wait_for_url "backend" "http://127.0.0.1:8000/health"
}

start_frontend() {
  if [[ -f "$FRONTEND_PID_FILE" ]] && kill -0 "$(cat "$FRONTEND_PID_FILE")" 2>/dev/null; then
    echo "Frontend already running (PID $(cat "$FRONTEND_PID_FILE"))."
    return
  fi

  echo "Starting Nuxt frontend on http://localhost:3000..."
  (
    cd "$WEB_DIR"
    npm run dev
  ) >>"$RUNTIME_DIR/frontend.log" 2>&1 &
  echo $! > "$FRONTEND_PID_FILE"
  wait_for_url "frontend" "http://localhost:3000"
}

wait_for_url() {
  local name="$1"
  local url="$2"
  local attempts=0
  local max_attempts=40
  while (( attempts < max_attempts )); do
    if curl -fsS --max-time 2 "$url" >/dev/null 2>&1; then
      echo "$name is ready ($url)"
      return
    fi
    sleep 0.5
    attempts=$((attempts + 1))
  done
  echo "Warning: $name did not respond at $url after $((max_attempts/2)) seconds." >&2
}

ensure_backend_env
ensure_frontend_dependencies
start_backend
start_frontend

echo "Logs: $RUNTIME_DIR/backend.log and $RUNTIME_DIR/frontend.log"
