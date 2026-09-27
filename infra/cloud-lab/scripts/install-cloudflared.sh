#!/usr/bin/env bash
# Expose remote-ops via Cloudflare Tunnel (free). Never expose 6443.
# Requires: cloudflared login + named tunnel token OR TUNNEL_TOKEN env.
set -euo pipefail

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run as root" >&2
  exit 1
fi

ARCH=$(uname -m)
case "$ARCH" in
  aarch64|arm64) CF_ARCH=arm64 ;;
  x86_64|amd64) CF_ARCH=amd64 ;;
  *) echo "Unsupported arch $ARCH" >&2; exit 1 ;;
esac

echo "==> Installing cloudflared (${CF_ARCH})"
curl -fsSL -o /tmp/cloudflared.deb \
  "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-${CF_ARCH}.deb"
dpkg -i /tmp/cloudflared.deb

if [[ -z "${TUNNEL_TOKEN:-}" ]]; then
  cat <<'MSG'
Set TUNNEL_TOKEN from Cloudflare Zero Trust → Networks → Tunnels → Create → Docker/cloudflared token.

Example after creating a public hostname mapping:
  https://cp-lab.example.com → http://127.0.0.1:8787

Then:
  export TUNNEL_TOKEN='eyJ...'
  sudo -E ./install-cloudflared.sh
MSG
  exit 2
fi

cloudflared service install "${TUNNEL_TOKEN}"
systemctl enable --now cloudflared || systemctl restart cloudflared
echo "Tunnel installed. Verify: curl -fsS https://<your-hostname>/healthz"
