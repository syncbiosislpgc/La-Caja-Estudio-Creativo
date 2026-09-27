#!/usr/bin/env bash
# Create a local kind lab for Control Plane REAL demos.
# Requires: docker, kind, kubectl
set -euo pipefail

CLUSTER_NAME="${CP_LAB_CLUSTER:-lab-k8s}"
NAMESPACE="${CONTROL_PLANE_NAMESPACE:-control-plane-demo}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT_DIR="${ROOT}/data/control-plane/lab"
mkdir -p "${OUT_DIR}"

if ! command -v docker >/dev/null; then
  echo "ERROR: docker is required" >&2
  exit 1
fi
if ! command -v kind >/dev/null; then
  echo "ERROR: kind is required (https://kind.sigs.k8s.io)" >&2
  exit 1
fi
if ! command -v kubectl >/dev/null; then
  echo "ERROR: kubectl is required" >&2
  exit 1
fi

echo "==> Creating kind cluster ${CLUSTER_NAME} (1 control-plane + 2 workers if possible)"
cat >"${OUT_DIR}/kind-config.yaml" <<EOF
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
  - role: worker
  - role: worker
EOF

if kind get clusters | grep -qx "${CLUSTER_NAME}"; then
  echo "Cluster already exists — reusing"
else
  kind create cluster --name "${CLUSTER_NAME}" --config "${OUT_DIR}/kind-config.yaml"
fi

kubectl config use-context "kind-${CLUSTER_NAME}"

echo "==> Namespace ${NAMESPACE}"
kubectl create namespace "${NAMESPACE}" --dry-run=client -o yaml | kubectl apply -f -
kubectl label namespace "${NAMESPACE}" control-plane.lacaja/managed=true --overwrite

echo "==> Minimal ServiceAccount + Role (namespace-scoped)"
kubectl apply -f - <<EOF
apiVersion: v1
kind: ServiceAccount
metadata:
  name: control-plane-operator
  namespace: ${NAMESPACE}
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: control-plane-operator
  namespace: ${NAMESPACE}
rules:
  - apiGroups: ["apps"]
    resources: ["deployments"]
    verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
  - apiGroups: [""]
    resources: ["pods", "events", "services"]
    verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: control-plane-operator
  namespace: ${NAMESPACE}
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: control-plane-operator
subjects:
  - kind: ServiceAccount
    name: control-plane-operator
    namespace: ${NAMESPACE}
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: control-plane-readonly-nodes
rules:
  - apiGroups: [""]
    resources: ["nodes"]
    verbs: ["get", "list", "watch"]
  - apiGroups: [""]
    resources: ["namespaces"]
    verbs: ["get", "list", "create"]
  - apiGroups: ["apps"]
    resources: ["deployments"]
    verbs: ["get", "list", "watch"]
  - apiGroups: [""]
    resources: ["pods", "events"]
    verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: control-plane-readonly-nodes
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: control-plane-readonly-nodes
subjects:
  - kind: ServiceAccount
    name: control-plane-operator
    namespace: ${NAMESPACE}
EOF

echo "==> Seed demo Deployment (optional baseline)"
kubectl apply -n "${NAMESPACE}" -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: seed-nginx
  labels:
    app: seed-nginx
    control-plane.lacaja/managed: "true"
spec:
  replicas: 1
  selector:
    matchLabels:
      app: seed-nginx
  template:
    metadata:
      labels:
        app: seed-nginx
        control-plane.lacaja/managed: "true"
    spec:
      containers:
        - name: nginx
          image: nginx:1.27-alpine
          ports:
            - containerPort: 80
          securityContext:
            allowPrivilegeEscalation: false
          resources:
            requests:
              cpu: 50m
              memory: 64Mi
            limits:
              cpu: 100m
              memory: 128Mi
EOF

echo "==> Metrics Server (best-effort)"
if kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml 2>/dev/null; then
  kubectl -n kube-system patch deployment metrics-server --type='json' \
    -p='[{"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--kubelet-insecure-tls"}]' 2>/dev/null || true
  echo "Metrics Server applied (may need a minute)."
else
  echo "WARN: Metrics Server not installed — CPU% live will remain Not configured."
fi

kubectl config view --minify --raw >"${OUT_DIR}/lab-k8s.kubeconfig"
chmod 600 "${OUT_DIR}/lab-k8s.kubeconfig"

echo ""
echo "Lab ready."
echo "  context: kind-${CLUSTER_NAME}"
echo "  kubeconfig: ${OUT_DIR}/lab-k8s.kubeconfig"
echo "  namespace: ${NAMESPACE}"
echo ""
echo "Next:"
echo "  export CONTROL_PLANE_REAL_OPS_ENABLED=true"
echo "  export CONTROL_PLANE_SECRET_KEY=\$(openssl rand -hex 32)"
echo "  export CONTROL_PLANE_ADMIN_PASSWORD='change-me-strong'"
echo "  export CONTROL_PLANE_NAMESPACE=${NAMESPACE}"
echo "  pnpm dev"
echo "  Sign in → Connect Cluster → paste ${OUT_DIR}/lab-k8s.kubeconfig"
