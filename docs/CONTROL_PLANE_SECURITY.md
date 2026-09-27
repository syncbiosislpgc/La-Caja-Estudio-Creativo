# Control Plane — Security Report

## Threat model (current)

The Control Plane shares a Next.js deployment with LA CAJA. A public visitor must not be able to:

- paste kubeconfigs
- deploy/restart/delete workloads
- read stored credentials

## Controls implemented

| Control | Mechanism |
|---------|-----------|
| Real-ops kill switch | `CONTROL_PLANE_REAL_OPS_ENABLED` (default off; off on Vercel) |
| Authentication | HttpOnly signed session cookie (`cp_session`) |
| Authorization | RBAC Admin / Operator / Viewer enforced server-side |
| Rate limiting | In-memory per IP+route |
| Input validation | kubeconfig shape + WorkloadSpec DNS/image/ns |
| Image policy | Blocks `:latest` and reserved names |
| Namespace isolation | Writes only to `CONTROL_PLANE_NAMESPACE` |
| Secret at rest | AES-256-GCM (`CONTROL_PLANE_SECRET_KEY`) |
| Audit | `data/control-plane/audit.jsonl` (redacted) |
| Least privilege (lab) | SA + Role in `up.sh` |

## Explicit non-goals (this phase)

- OIDC / OAuth2 enterprise IdP
- Distributed rate limiting
- Cloud KMS / Secrets Manager
- Full multi-tenant isolation
- Network policies / mTLS mesh

## Public deployment policy

On Vercel (or any host without the lab flag):

- Simulation Mode remains available (read-only snapshot)
- Connect / test / deploy / mutate / delete return `403 REAL_OPS_DISABLED`
- No kubeconfig is accepted or persisted

## Operator checklist (lab)

```bash
export CONTROL_PLANE_REAL_OPS_ENABLED=true
export CONTROL_PLANE_SECRET_KEY="$(openssl rand -hex 32)"
export CONTROL_PLANE_ADMIN_PASSWORD='use-a-strong-password'
export CONTROL_PLANE_NAMESPACE=control-plane-demo
# Never commit these values.
```

## Residual risks

1. Local password auth is demo-grade.
2. Single-node rate limiter.
3. Cluster-wide read still used for discovery (nodes/deployments); writes are namespace-scoped.
4. Soft nodeAffinity may not match recommended node — kube-scheduler remains source of schedule truth.
