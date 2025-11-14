#!/usr/bin/env bash
# Stop the background development servers started via dev_start.sh.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUNTIME_DIR="$ROOT_DIR/.devserver"
BACKEND_PID_FILE="$RUNTIME_DIR/backend.pid"
FRONTEND_PID_FILE="$RUNTIME_DIR/frontend.pid"

stop_process() {
  local name="$1"
  local file="$2"
  if [[ ! -f "$file" ]]; then
    echo "$name not running (no PID file)."
    return
  fi

  local pid
  pid="$(cat "$file")"
  if kill -0 "$pid" 2>/dev/null; then
    echo "Stopping $name (PID $pid)..."
    kill "$pid" >/dev/null 2>&1 || true
    wait "$pid" 2>/dev/null || true
  else
    echo "$name PID file found but process not running."
  fi
  rm -f "$file"
}

stop_process "backend" "$BACKEND_PID_FILE"
stop_process "frontend" "$FRONTEND_PID_FILE"

if [[ -d "$RUNTIME_DIR" ]] && [[ -z "$(ls -A "$RUNTIME_DIR")" ]]; then
  rmdir "$RUNTIME_DIR"
fi
