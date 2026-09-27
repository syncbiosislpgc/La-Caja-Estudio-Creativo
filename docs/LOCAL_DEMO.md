# Local Demo — Hybrid Control Plane

> Prefer the commercial walkthrough in `docs/DEMO_GUIDE.md` and readiness matrix in `docs/CONTROL_PLANE_READINESS.md`.

## 0. Start apps (Simulation — safe)

```bash
pnpm install
pnpm dev
```

- LA CAJA: http://localhost:3000/
- Control Plane: http://localhost:3000/control-plane
- Simulation continues with **no** cluster connected.
- Real connect/deploy is **disabled** unless `CONTROL_PLANE_REAL_OPS_ENABLED=true`.

## 1. Kubernetes lab (automated)

```bash
pnpm lab:up
# or: ./scripts/control-plane-lab/up.sh
```

Manual alternative: kind/k3d + export kubeconfig (see script output path
`data/control-plane/lab/lab-k8s.kubeconfig`).

## 2. Enable real ops (lab only)

```bash
export CONTROL_PLANE_REAL_OPS_ENABLED=true
export CONTROL_PLANE_SECRET_KEY="$(openssl rand -hex 32)"
export CONTROL_PLANE_ADMIN_PASSWORD='change-me-strong'
export CONTROL_PLANE_NAMESPACE=control-plane-demo
pnpm dev
```

## 3. Connect from UI

1. Sign in at `/control-plane/login` (admin)
2. Open `/control-plane/clusters` → **Connect Cluster**
3. Name: `lab-k8s`
4. Provider: Kubernetes (or K3s)
5. Paste kubeconfig from `data/control-plane/lab/lab-k8s.kubeconfig`
6. Test → Discover → Confirm

You should see a **REAL** cluster with discovered nodes.

## 4. Deploy a real workload

1. Open the REAL cluster detail
2. Deploy name `traffic-demo`, image `nginx:1.27-alpine`
3. Control Plane scheduler proposes a node → Deployment is created
4. Watch `/control-plane/workloads` for **REAL** status Running
5. Open workload → Restart / Stop / Delete

## 5. Verify simulation still works

1. `/control-plane/simulation` → **Run migration demo**
2. SIMULATED entities still migrate; REAL inventory unchanged

## 6. Tests

```bash
pnpm test
```

Unit tests cover Simulation provider + scheduler + parse helpers.  
Kubernetes integration tests require a live cluster (optional).

## Env notes

No kubeconfig in `.env` is required for Simulation.  
For headless connect you can place files under `data/control-plane/` (gitignored).
