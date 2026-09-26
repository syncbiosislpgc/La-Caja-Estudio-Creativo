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

- kubeconfig only on server disk under `data/control-plane/secrets/`
- never logged
- never included in JSON responses
- connect/test APIs accept kubeconfig once over HTTPS POST; not re-exported

## WorkloadSpec → Deployment

Domain `WorkloadSpec` maps to `apps/v1 Deployment` in namespace `control-plane-demo` (created if missing).

Optional `placement.preferredNodeName` sets `spec.template.spec.nodeName` after Control Plane scheduler decision.

## Errors

On API failure, cluster appears as `mode: DISCONNECTED` with `connectionError` — never replaced by simulated data.
