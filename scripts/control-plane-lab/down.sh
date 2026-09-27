#!/usr/bin/env bash
# Destroy the local kind lab created by up.sh
set -euo pipefail

CLUSTER_NAME="${CP_LAB_CLUSTER:-lab-k8s}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT_DIR="${ROOT}/data/control-plane/lab"

if ! command -v kind >/dev/null; then
  echo "kind not found — nothing to delete via kind" >&2
  exit 0
fi

if kind get clusters 2>/dev/null | grep -qx "${CLUSTER_NAME}"; then
  echo "==> Deleting kind cluster ${CLUSTER_NAME}"
  kind delete cluster --name "${CLUSTER_NAME}"
else
  echo "Cluster ${CLUSTER_NAME} not found"
fi

rm -f "${OUT_DIR}/lab-k8s.kubeconfig" "${OUT_DIR}/kind-config.yaml" 2>/dev/null || true
echo "Lab torn down."
