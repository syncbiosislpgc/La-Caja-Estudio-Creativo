#!/usr/bin/env bash
# Install single-node K3s on Ubuntu ARM64/AMD64. Does NOT expose 6443 publicly.
set -euo pipefail

NAMESPACE="${CONTROL_PLANE_NAMESPACE:-control-plane-demo}"
export INSTALL_K3S_EXEC="server --write-kubeconfig-mode 644 --disable traefik --tls-san 127.0.0.1"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Run as root (sudo)" >&2
  exit 1
fi

echo "==> Installing K3s (API bind defaults; firewall should block 6443 from WAN)"
curl -sfL https://get.k3s.io | sh -

echo "==> Waiting for node Ready"
until kubectl get nodes 2>/dev/null | grep -q Ready; do sleep 2; done

echo "==> Applying lab manifests"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
kubectl apply -f "${ROOT}/k8s/00-namespace.yaml"
kubectl apply -f "${ROOT}/k8s/10-network-policy.yaml" || true
kubectl apply -f "${ROOT}/k8s/20-seed-workload.yaml"

echo "==> Metrics Server (best-effort)"
if kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml; then
  kubectl -n kube-system patch deployment metrics-server --type='json' \
    -p='[{"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--kubelet-insecure-tls"}]' || true
fi

# Ensure API not advertised carelessly — document iptables
if command -v ufw >/dev/null; then
  ufw allow OpenSSH || true
  ufw deny 6443/tcp || true
  ufw --force enable || true
fi

echo "K3s ready. Kubeconfig: /etc/rancher/k3s/k3s.yaml"
kubectl get nodes -o wide
kubectl -n "${NAMESPACE}" get deploy
