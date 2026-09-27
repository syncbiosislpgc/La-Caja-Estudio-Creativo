# Kubernetes Adapter

## Role

`KubernetesInfrastructureProvider` implements `InfrastructureProvider` using the Kubernetes API.

Path: `src/control-plane/infrastructure/kubernetes/kubernetes-provider.ts`

## Capabilities (P0)

| Operation | Status |
|-----------|--------|
| testConnection | REAL |
| getClusters / getCluster | REAL |
| getNodes | REAL |
| getWorkloads (Deployments) | REAL |
| deployWorkload (Deployment) | REAL |
| restart / stop / delete | REAL |
| getEvents | REAL |
| Live CPU/Mem % | Not configured (needs metrics-server) |
| GPU discovery | via `nvidia.com/gpu` allocatable if present |

## Security

- Real ops require `CONTROL_PLANE_REAL_OPS_ENABLED=true` + authenticated Admin/Operator
- Disabled by default on public/Vercel hosts (`REAL_OPS_DISABLED`)
- kubeconfig encrypted at rest (AES-256-GCM) under `data/control-plane/secrets/*.kubeconfig.enc`
- never logged; never included in JSON responses
- writes limited to `CONTROL_PLANE_NAMESPACE` (default `control-plane-demo`)
- images `:latest` blocked; see `docs/CONTROL_PLANE_SECURITY.md`

## WorkloadSpec → Deployment

Domain `WorkloadSpec` maps to `apps/v1 Deployment` in namespace `control-plane-demo` (created if missing).

Optional `placement.preferredNodeName` sets `spec.template.spec.nodeName` after Control Plane scheduler decision.

## Errors

On API failure, cluster appears as `mode: DISCONNECTED` with `connectionError` — never replaced by simulated data.
