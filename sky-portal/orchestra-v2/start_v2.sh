#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

PORT="${PORT:-8420}"
HOST="${HOST:-127.0.0.1}"

python3 orchestrator_v2.py --host "$HOST" --port "$PORT"
