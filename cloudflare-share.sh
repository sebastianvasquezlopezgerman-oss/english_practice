#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

PYTHON_BIN="${PYTHON_BIN:-$ROOT_DIR/.venv/bin/python}"
BACKEND_PORT="${BACKEND_PORT:-8000}"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"

BACKEND_LOG_FILE="${BACKEND_LOG_FILE:-/tmp/english-practice-backend.log}"
FRONTEND_LOG_FILE="${FRONTEND_LOG_FILE:-/tmp/english-practice-frontend.log}"
CF_FRONTEND_LOG_FILE="${CF_FRONTEND_LOG_FILE:-/tmp/english-practice-cloudflared-frontend.log}"

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "Missing command: $1"
    exit 1
  }
}

cleanup() {
  echo ""
  echo "Stopping processes..."
  [[ -n "${BACKEND_PID:-}" ]] && kill "$BACKEND_PID" 2>/dev/null || true
  [[ -n "${FRONTEND_PID:-}" ]] && kill "$FRONTEND_PID" 2>/dev/null || true
  [[ -n "${CF_FRONTEND_PID:-}" ]] && kill "$CF_FRONTEND_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

require_cmd cloudflared
require_cmd npm
require_cmd "$PYTHON_BIN"

echo "Starting backend on port $BACKEND_PORT..."
(
  cd "$BACKEND_DIR"
  PYTHONPATH="$ROOT_DIR" \
  "$PYTHON_BIN" -m uvicorn backend.main:app --host 0.0.0.0 --port "$BACKEND_PORT"
) >"$BACKEND_LOG_FILE" 2>&1 &
BACKEND_PID=$!

sleep 2
if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
  echo "Backend failed to start. Check: $BACKEND_LOG_FILE"
  exit 1
fi

get_tunnel_url() {
  local log_file="$1"
  local retries=40
  local sleep_secs=1

  for _ in $(seq 1 "$retries"); do
    url="$("$PYTHON_BIN" -c '
import pathlib
import re
import sys

path = pathlib.Path(sys.argv[1])
if not path.exists():
    print("")
    raise SystemExit

text = path.read_text(errors="ignore")
matches = re.findall(r"https://[a-zA-Z0-9-]+\.trycloudflare\.com", text)
print(matches[-1] if matches else "")
' "$log_file")"
    if [[ -n "${url:-}" ]]; then
      echo "$url"
      return 0
    fi
    sleep "$sleep_secs"
  done

  return 1
}

echo "Starting frontend on port $FRONTEND_PORT..."
(
  cd "$FRONTEND_DIR"
  npm run dev -- --host 0.0.0.0 --port "$FRONTEND_PORT"
) >"$FRONTEND_LOG_FILE" 2>&1 &
FRONTEND_PID=$!

sleep 2
if ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
  echo "Frontend failed to start. Check: $FRONTEND_LOG_FILE"
  exit 1
fi

echo "Opening frontend Cloudflare tunnel..."
cloudflared tunnel --url "http://127.0.0.1:$FRONTEND_PORT" >"$CF_FRONTEND_LOG_FILE" 2>&1 &
CF_FRONTEND_PID=$!

FRONTEND_PUBLIC_URL="$(get_tunnel_url "$CF_FRONTEND_LOG_FILE")" || {
  echo "Could not get frontend tunnel URL. Check: $CF_FRONTEND_LOG_FILE"
  exit 1
}

echo ""
echo "Share this URL:"
echo "  $FRONTEND_PUBLIC_URL"
echo ""
echo "Log files:"
echo "  Backend:            $BACKEND_LOG_FILE"
echo "  Frontend:           $FRONTEND_LOG_FILE"
echo "  Cloudflare frontend:$CF_FRONTEND_LOG_FILE"
echo ""
echo "Architecture:"
echo "  browser -> frontend tunnel -> Vite (/api proxy) -> local backend"
echo ""
echo "Press Ctrl+C to stop everything."

wait
