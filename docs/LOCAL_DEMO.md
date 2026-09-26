# Local Demo — Hybrid Control Plane

## 0. Start apps

```bash
pnpm install
pnpm dev
```

- LA CAJA: http://localhost:3000/
- Control Plane: http://localhost:3000/control-plane
- Simulation continues to work with **no** cluster connected.

## 1. Kubernetes / K3s local

### Option A — kind

```bash
kind create cluster --name lab-k8s
kubectl cluster-info
kubectl get nodes
```

### Option B — k3d / k3s

```bash
k3d cluster create lab-k8s
kubectl get nodes
```

## 2. Export kubeconfig

```bash
kubectl config view --minify --raw > /tmp/lab-k8s.kubeconfig
```

## 3. Connect from UI

1. Open `/control-plane/clusters`
2. **Connect Cluster**
3. Name: `lab-k8s`
4. Provider: Kubernetes (or K3s)
5. Paste kubeconfig
6. Test connection → Discover → Confirm

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
