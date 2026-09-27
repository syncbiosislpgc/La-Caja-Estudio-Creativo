#!/usr/bin/env bash
# Restore demo namespace to a clean state (keeps seed-nginx).
set -euo pipefail

TOKEN="${REMOTE_OPS_TOKEN:?set REMOTE_OPS_TOKEN}"
BASE="${REMOTE_OPS_URL:-http://127.0.0.1:8787}"

curl -fsS -X POST "${BASE}/v1/lab/reset" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json"
echo
echo "Lab reset requested."
