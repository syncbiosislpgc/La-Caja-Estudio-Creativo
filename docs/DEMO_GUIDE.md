# Demo Guide — Hybrid Control Plane (Commercial)

## Before you start

- Prefer the **cloud lab** (`docs/CLOUD_LAB_DEPLOYMENT.md`) so demos do not need your laptop.
- Do **not** enable local kubeconfig `REAL_OPS` on a public Vercel URL.
- Keep LA CAJA at `/` untouched; demo lives under `/control-plane`.

## Escenario A — Simulación (siempre)

1. `pnpm install && pnpm dev`
2. Abrir http://localhost:3000/control-plane
3. Verificar badge **SIMULATION** y métricas del lab virtual.
4. Pulsar **Run migration demo**.
5. Mostrar Topology, Workloads (badges **SIMULATED**), Scheduler explainability.
6. En Clusters usar filtro **SIMULATION**.

Mensaje clave: *“Esto demuestra orquestación a escala y Digital Twin sin depender de un cluster físico.”*

## Escenario B — Kubernetes real (lab)

### 1. Laboratorio

```bash
chmod +x scripts/control-plane-lab/*.sh
./scripts/control-plane-lab/up.sh
```

### 2. Arrancar Control Plane con real ops

```bash
export CONTROL_PLANE_REAL_OPS_ENABLED=true
export CONTROL_PLANE_SECRET_KEY="$(openssl rand -hex 32)"
export CONTROL_PLANE_ADMIN_PASSWORD='demo-admin-strong'
export CONTROL_PLANE_NAMESPACE=control-plane-demo
pnpm dev
```

### 3. UI

1. Sign in → `admin` / password del env
2. Clusters → **Connect Cluster**
3. Name `lab-k8s`, provider Kubernetes
4. Pegar `data/control-plane/lab/lab-k8s.kubeconfig`
5. Test → Discover → Confirm
6. Nodes: badges **REAL**, capacidad CPU/RAM/arch
7. Cluster detail → Deploy `traffic-demo` / `nginx:1.27-alpine`
8. Mostrar decisión del scheduler (score + nodo)
9. Verificar con:

```bash
export KUBECONFIG=$PWD/data/control-plane/lab/lab-k8s.kubeconfig
kubectl -n control-plane-demo get deploy,pods -o wide
kubectl -n control-plane-demo get events --sort-by=.lastTimestamp | tail
```

10. Restart / Scale / Delete desde la UI y re-verificar con kubectl.

### 4. Script E2E automático

```bash
# con pnpm dev ya corriendo y env REAL_OPS activo
./scripts/control-plane-lab/e2e-real.sh
```

### 5. Cleanup

```bash
./scripts/control-plane-lab/down.sh
```

## Talking points

| Tema | Qué decir |
|------|-----------|
| Hybrid | Misma UI: SIMULATED + REAL etiquetados |
| Scheduler | Capa de intelligence; no reemplaza kube-scheduler |
| Seguridad | Público = sim only; lab = auth + cifrado + namespace |
| Telemetría | Sin inventar %; Metrics Server opcional |
| Roadmap | OIDC, agente saliente, Prometheus, KubeEdge |

## Arquitectura remota (piloto)

```
Browser → Control Plane (cloud)
                │
                ▼
         Outbound Edge Agent (cliente)
                │
                ▼
         Private Kubernetes API
```

No abrir el API server a Internet ni subir kubeconfigs a Vercel.
