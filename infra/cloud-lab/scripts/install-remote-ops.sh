#!/usr/bin/env bash
# Install remote-ops systemd service on the lab VM (listens on 127.0.0.1 only).
set -euo pipefail

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run as root" >&2
  exit 1
fi

if [[ -z "${REMOTE_OPS_TOKEN:-}" || ${#REMOTE_OPS_TOKEN} -lt 32 ]]; then
  echo "Set REMOTE_OPS_TOKEN (min 32 chars) before install" >&2
  exit 1
fi

APP_DIR=/opt/control-plane-remote-ops
REPO_DIR="${1:-}"
if [[ -z "${REPO_DIR}" || ! -d "${REPO_DIR}/services/remote-ops" ]]; then
  echo "Usage: $0 /path/to/repo" >&2
  exit 1
fi

apt-get update -y
apt-get install -y curl ca-certificates
if ! command -v node >/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi

mkdir -p "${APP_DIR}"
rsync -a --delete "${REPO_DIR}/services/remote-ops/" "${APP_DIR}/"
cd "${APP_DIR}"
npm install --omit=dev=false
npm run build

cat >/etc/control-plane-remote-ops.env <<EOF
REMOTE_OPS_TOKEN=${REMOTE_OPS_TOKEN}
REMOTE_OPS_BIND=127.0.0.1
REMOTE_OPS_PORT=8787
CONTROL_PLANE_NAMESPACE=${CONTROL_PLANE_NAMESPACE:-control-plane-demo}
REMOTE_CLUSTER_ID=${REMOTE_CLUSTER_ID:-remote-k3s-lab}
REMOTE_CLUSTER_NAME=${REMOTE_CLUSTER_NAME:-cloud-lab-k3s}
REMOTE_CLUSTER_REGION=${REMOTE_CLUSTER_REGION:-oci-free}
KUBECONFIG=/etc/rancher/k3s/k3s.yaml
EOF
chmod 600 /etc/control-plane-remote-ops.env

cat >/etc/systemd/system/control-plane-remote-ops.service <<'EOF'
[Unit]
Description=Control Plane remote-ops (K3s adapter)
After=network.target k3s.service
Wants=k3s.service

[Service]
Type=simple
EnvironmentFile=/etc/control-plane-remote-ops.env
WorkingDirectory=/opt/control-plane-remote-ops
ExecStart=/usr/bin/node /opt/control-plane-remote-ops/dist/server.js
Restart=always
RestartSec=3
User=root
NoNewPrivileges=true

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now control-plane-remote-ops.service
sleep 2
curl -fsS http://127.0.0.1:8787/healthz | head -c 200 || true
echo
echo "remote-ops listening on 127.0.0.1:8787 — expose only via Cloudflare Tunnel"
