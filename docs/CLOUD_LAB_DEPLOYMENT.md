# Cloud Lab Deployment — K3s on Oracle Always Free + remote-ops

## Goal

Demonstrate **real** Kubernetes from the Vercel Control Plane **without** keeping a laptop on, at **€0/month**, without exposing kube-apiserver (`6443`) to the Internet.

```
Browser → Vercel (/control-plane, auth)
              │  HTTPS + Bearer REMOTE_OPS_TOKEN
              ▼
        Cloudflare Tunnel (free)
              │  outbound from VM
              ▼
        remote-ops :8787 (127.0.0.1 only)
              │
              ▼
        K3s API (127.0.0.1:6443)
```

Simulation Mode stays available. Local kubeconfig paste (`REAL_OPS`) stays **disabled** on Vercel.

## Provider decision

See `CLOUD_LAB_COSTS.md`. **Primary: Oracle Cloud Always Free Ampere A1 (2 OCPU / 12 GB ARM64).**  
GCP e2-micro is a fallback only (1 GB RAM — too tight for a comfortable demo).

## What you must do (human gate)

This Cloud Agent has **no OCI credentials** (`~/.oci` missing). Nothing was provisioned in Oracle.

### Step A — Create OCI Always Free account

1. Sign up: https://www.oracle.com/cloud/free/  
2. Expect card verification (temporary hold). Prefer staying on Always Free resources only.  
3. Pick a home region carefully (cannot change). Try `eu-frankfurt-1` / `eu-madrid-1` / `us-ashburn-1` if capacity errors appear.  
4. Create API key: Profile → User settings → API Keys → download PEM + fingerprint.  
5. Note tenancy OCID, user OCID, compartment OCID, region.

### Step B — Terraform VM

```bash
cd infra/cloud-lab/terraform/oci
cp terraform.tfvars.example terraform.tfvars
# edit tfvars — set ssh_cidr to YOUR_IP/32
terraform init
terraform plan   # confirm shape 2 OCPU / 12 GB, no LB
terraform apply
```

If `Out of host capacity`: retry other ADs/regions or wait; **do not** upgrade to paid shapes without approval.

### Step C — Bootstrap K3s + remote-ops

```bash
ssh ubuntu@<public_ip>
sudo git clone https://github.com/syncbiosislpgc/La-Caja-Estudio-Creativo.git /opt/cp-repo
cd /opt/cp-repo
# use the branch that contains cloud-lab if not yet on main
sudo git checkout cursor/cloud-lab-remote-ops-5755 || true
export REMOTE_OPS_TOKEN="$(openssl rand -hex 32)"
echo "SAVE TOKEN: $REMOTE_OPS_TOKEN"
sudo -E ./infra/cloud-lab/scripts/bootstrap-lab.sh
```

### Step D — Cloudflare Tunnel (free)

1. Cloudflare Zero Trust → Networks → Tunnels → Create.  
2. Public hostname → `http://127.0.0.1:8787`.  
3. Copy install token:

```bash
export TUNNEL_TOKEN='...'
sudo -E ./infra/cloud-lab/scripts/install-cloudflared.sh
curl -fsS https://<hostname>/healthz
```

### Step E — Vercel env

In the Vercel project (same deploy as LA CAJA):

| Variable | Value |
|----------|-------|
| `CONTROL_PLANE_REMOTE_OPS_ENABLED` | `true` |
| `CONTROL_PLANE_REMOTE_OPS_URL` | `https://<hostname>` |
| `CONTROL_PLANE_REMOTE_OPS_TOKEN` | same as VM |
| `CONTROL_PLANE_ADMIN_PASSWORD` | strong secret |
| `CONTROL_PLANE_SESSION_SECRET` | random ≥32 |
| `CONTROL_PLANE_REMOTE_CLUSTER_ID` | `remote-k3s-lab` (optional) |

**Do not set** `CONTROL_PLANE_REAL_OPS_ENABLED` or `CONTROL_PLANE_ALLOW_VERCEL_REAL_OPS` on Vercel.

Redeploy. Open `/control-plane` → green “Cloud lab connected path” banner → Sign in → Clusters filter REAL.

### Step F — E2E

```bash
export BASE_URL=https://<your-vercel-url>
export CONTROL_PLANE_ADMIN_PASSWORD=...
./infra/cloud-lab/scripts/e2e-remote.sh
```

On the VM (truth):

```bash
sudo kubectl -n control-plane-demo get deploy,pods -o wide
```

## Recovery

| Failure | Action |
|---------|--------|
| Demo dirty | `REMOTE_OPS_TOKEN=... REMOTE_OPS_URL=http://127.0.0.1:8787 ./infra/cloud-lab/scripts/reset-lab.sh` |
| remote-ops down | `sudo systemctl restart control-plane-remote-ops` |
| Tunnel down | `sudo systemctl restart cloudflared` |
| K3s down | `sudo systemctl restart k3s` |
| VM terminated (idle reclaim) | Re-`terraform apply` + bootstrap |
| Capacity errors | Change region/AD; keep 2/12 shape |

## Security checklist

- [ ] 6443 denied on firewall / security list  
- [ ] remote-ops bound to `127.0.0.1`  
- [ ] Tunnel hostname only  
- [ ] Bearer token ≥32 chars, rotated if leaked  
- [ ] Control Plane RBAC required for deploy  
- [ ] Image allowlist + ResourceQuota on namespace  
- [ ] No kubeconfig in Vercel env  

## Multi-node

Always Free Ampere total is **2 OCPU / 12 GB**. A second worker would require splitting (e.g. 1+1 OCPU) and more capacity luck. Default lab is **single-node real** + simulated Digital Twin for scale storytelling. Do not label containers as separate physical servers.
