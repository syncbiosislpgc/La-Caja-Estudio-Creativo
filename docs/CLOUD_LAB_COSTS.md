# Cloud Lab — Cost Report (target €0/month)

**Last reviewed:** 2026-09-27  
**Budget policy:** No paid resources without explicit approval.

## Provider comparison (Always Free / permanent)

| Provider | Free forever? | Specs | Arch | Card? | K3s fit | Billing risk | Notes |
|----------|---------------|-------|------|-------|---------|--------------|-------|
| **Oracle Cloud Always Free** | Yes (limits change) | **2 OCPU + 12 GB RAM** Ampere total; + 2× AMD micro (1 GB); ~200 GB block; outbound allowance | ARM64 (Ampere) / AMD64 micros | Usually yes (verification) | **Best** | Capacity often “Out of host capacity”; idle reclaim possible; limits cut Jun 2026 (was 4/24) | **Primary choice** |
| **Google Cloud Always Free** | Yes (within monthly caps) | **1× e2-micro** (~1 GB RAM) in us-west1/central1/east1; 30 GB disk; 1 GB egress NA | AMD64 | Yes (billing account) | Tight / fragile for K3s+ops | Easy to leave non-free SKUs running | Fallback only |
| AWS Free Tier | Mostly **12-month** for new accounts | t2/t3.micro class | AMD64 | Yes | Temporary | Confuse trial with forever | **Not recommended** for permanent lab |
| Azure Free | Trial credits + limited forever | Small B-series windows | AMD64 | Yes | Temporary | Trial ≠ forever | Skip for €0 permanent |
| Fly.io | No permanent free for new accounts (2024+) | — | — | — | — | Pay-as-you-go | Skip |
| Railway / Render free | Trial / limited | Sleeping dynos | — | — | Not a K8s lab | — | Skip |

Sources: Oracle Free Tier FAQ / Always Free docs; InfoQ & community confirmation of Ampere limit change (2026-06); Google Cloud Free Program docs.

## Selected architecture cost surface

| Component | Where | Expected cost | Risk if misconfigured |
|-----------|-------|---------------|------------------------|
| Control Plane + LA CAJA | Vercel Hobby/Pro (existing) | €0 incremental for lab | N/A |
| VM Ampere A1 2 OCPU / 12 GB | OCI Always Free | €0 | Shape above free → **bill or terminate** |
| Boot volume ≤200 GB free pool | OCI | €0 | Extra volumes → bill |
| Public IP (primary VNIC) | OCI Always Free | €0 | Extra reserved IPs → bill |
| **No** OCI Load Balancer | — | Avoid | LB may leave Always Free quotas / complexity |
| **No** managed OKE | — | Avoid | OKE is **not** Always Free compute for our purpose |
| Cloudflare Tunnel | Cloudflare Free | €0 | Named tunnel free; do not buy CF paid add-ons |
| Metrics Server | In-cluster | €0 | Prometheus optional — skip if RAM tight |
| Egress | OCI / CF | Stay under free egress | Heavy image pulls / traffic → risk |

## Explicitly forbidden without approval

- Paid load balancers  
- Extra public IPs  
- Disks beyond Always Free pool  
- GPU shapes  
- Managed Kubernetes (OKE/GKE/EKS)  
- Paid CDN / WAF upgrades  
- Multi-region replicas  

## Budget alerts

1. OCI: enable budget alert at **$1** and **$0.01** (early warning). Alerts **do not** hard-stop spend.  
2. Prefer **Always Free-only** tenancy until lab is stable; avoid upgrading to PAYG unless you accept risk.  
3. Weekly checklist: `oci compute instance list` / console → confirm shape **≤ 2 OCPU / 12 GB** total Ampere.

## Recommendation

**Primary:** Oracle Cloud Always Free — single ARM64 VM (2 OCPU / 12 GB) running K3s + `remote-ops` + Cloudflare Tunnel.  
**Fallback:** GCP e2-micro only for a minimal remote-ops smoke test (not a comfortable multi-workload demo).  
**Blocker without you:** OCI account + API keys / Terraform variables (see `CLOUD_LAB_DEPLOYMENT.md`).
