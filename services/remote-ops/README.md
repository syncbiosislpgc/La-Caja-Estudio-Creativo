# remote-ops

Authorized operations backend for the Control Plane cloud lab.

- Listens on `127.0.0.1:8787` by default
- Talks to local K3s via `/etc/rancher/k3s/k3s.yaml`
- Exposed to Vercel **only** through Cloudflare Tunnel (outbound)
- Bearer token auth (`REMOTE_OPS_TOKEN`)

See `docs/CLOUD_LAB_DEPLOYMENT.md`.
