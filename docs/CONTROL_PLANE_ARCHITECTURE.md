# Control Plane Architecture (Hybrid)

## Routes (unchanged product split)

| Path | Product |
|------|---------|
| `/` | LA CAJA — **do not modify** |
| `/control-plane/*` | AI-Native Edge & Network Control Plane |
| `/api/control-plane/*` | Control Plane APIs |

## Abstraction

```
Domain / Application
        ↓
InfrastructureProvider
   ├── SimulationInfrastructureProvider
   ├── KubernetesInfrastructureProvider   ← REAL
   ├── K3s (same client, provider label)
   └── KubeEdge (NOT_CONFIGURED stub)
```

Domain code **never** imports `@kubernetes/client-node`.

## Sources

Every cluster/node/workload has:

- `source: simulation | kubernetes | k3s | kubeedge`
- `mode: SIMULATION | CONNECTED | DISCONNECTED | NOT_CONFIGURED`

UI badges: **REAL** / **SIMULATED**. Never mix silently.

## Persistence

Server-only:

- `data/control-plane/connections.json` — metadata
- `data/control-plane/secrets/<id>.kubeconfig` — kubeconfig (gitignored, mode 0600)

Kubeconfig is **never** returned by APIs or sent to the browser after connect.

## Snapshot

`GET /api/control-plane/snapshot` merges simulation seed + discovered real inventory.

## Scheduler

Control Plane scheduler scores nodes (explainable) then Kubernetes Adapter deploys with optional `nodeName`. It does **not** replace the in-cluster kube-scheduler long-term; it is a placement intelligence layer.

## Telemetry honesty

REAL nodes: capacity/allocatable/pods from Kubernetes API.  
Live CPU/memory %: **Not configured** until Prometheus/metrics-server.

## Docs

- `docs/KUBERNETES_ADAPTER.md`
- `docs/LOCAL_DEMO.md`
- `docs/CONTROL_PLANE_HYBRID_PLAN.md`
