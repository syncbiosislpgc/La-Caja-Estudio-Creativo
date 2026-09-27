#!/usr/bin/env bash
# Full lab bootstrap on an Ubuntu VM (run as root after clone).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "${ROOT}"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run with sudo" >&2
  exit 1
fi

if [[ -z "${REMOTE_OPS_TOKEN:-}" ]]; then
  REMOTE_OPS_TOKEN="$(openssl rand -hex 32)"
  echo "Generated REMOTE_OPS_TOKEN (save this): ${REMOTE_OPS_TOKEN}"
  export REMOTE_OPS_TOKEN
fi

export CONTROL_PLANE_NAMESPACE="${CONTROL_PLANE_NAMESPACE:-control-plane-demo}"

bash infra/cloud-lab/scripts/install-k3s.sh
bash infra/cloud-lab/scripts/install-remote-ops.sh "${ROOT}"

if [[ -n "${TUNNEL_TOKEN:-}" ]]; then
  bash infra/cloud-lab/scripts/install-cloudflared.sh
else
  echo "SKIP cloudflared — set TUNNEL_TOKEN and re-run install-cloudflared.sh"
fi

cat <<EOF

=== Bootstrap complete ===
remote-ops: http://127.0.0.1:8787/healthz
token: (see REMOTE_OPS_TOKEN above — store in a password manager)

Vercel env to set AFTER tunnel hostname works:
  CONTROL_PLANE_REMOTE_OPS_ENABLED=true
  CONTROL_PLANE_REMOTE_OPS_URL=https://<your-tunnel-hostname>
  CONTROL_PLANE_REMOTE_OPS_TOKEN=<same token>
  CONTROL_PLANE_ADMIN_PASSWORD=<strong>
  CONTROL_PLANE_SESSION_SECRET=<random 32+>

Do NOT set CONTROL_PLANE_REAL_OPS_ENABLED on Vercel.
Do NOT open port 6443.
EOF
