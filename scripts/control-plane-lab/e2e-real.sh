#!/usr/bin/env bash
# End-to-end REAL demo against a running Control Plane + kind lab.
# Prerequisites:
#   - scripts/control-plane-lab/up.sh completed
#   - CONTROL_PLANE_REAL_OPS_ENABLED=true and secrets set
#   - pnpm dev listening on BASE_URL (default http://localhost:3000)
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
KUBECONFIG_FILE="${ROOT}/data/control-plane/lab/lab-k8s.kubeconfig"
COOKIE_JAR="$(mktemp)"
NS="${CONTROL_PLANE_NAMESPACE:-control-plane-demo}"
ADMIN_USER="${CONTROL_PLANE_ADMIN_USER:-admin}"
ADMIN_PASS="${CONTROL_PLANE_ADMIN_PASSWORD:-cp-admin-lab-change-me}"
WL_NAME="traffic-demo-e2e"

cleanup() { rm -f "${COOKIE_JAR}"; }
trap cleanup EXIT

if [[ ! -f "${KUBECONFIG_FILE}" ]]; then
  echo "Missing ${KUBECONFIG_FILE}. Run up.sh first." >&2
  exit 1
fi

echo "==> 1) Login as admin"
curl -fsS -c "${COOKIE_JAR}" -X POST "${BASE_URL}/api/control-plane/auth/login" \
  -H 'Content-Type: application/json' \
  -d "{\"username\":\"${ADMIN_USER}\",\"password\":\"${ADMIN_PASS}\"}" >/tmp/cp-login.json
echo "    ok: $(jq -r .user.role /tmp/cp-login.json)"

echo "==> 2) Reject anonymous deploy (expect 401/403)"
CODE=$(curl -s -o /tmp/cp-anon.json -w '%{http_code}' -X POST \
  "${BASE_URL}/api/control-plane/clusters/fake/workloads" \
  -H 'Content-Type: application/json' \
  -d '{"name":"x","image":"nginx:1.27-alpine"}')
echo "    status=${CODE}"
[[ "${CODE}" == "401" || "${CODE}" == "403" ]]

echo "==> 3) Test connection"
KC=$(python3 -c 'import json,sys; print(json.dumps(open(sys.argv[1]).read()))' "${KUBECONFIG_FILE}")
curl -fsS -b "${COOKIE_JAR}" -X POST "${BASE_URL}/api/control-plane/clusters/test" \
  -H 'Content-Type: application/json' \
  -d "{\"kubeconfig\": ${KC}}" >/tmp/cp-test.json
jq -e '.ok == true' /tmp/cp-test.json >/dev/null
echo "    $(jq -r .message /tmp/cp-test.json)"

echo "==> 4) Connect cluster"
curl -fsS -b "${COOKIE_JAR}" -X POST "${BASE_URL}/api/control-plane/clusters" \
  -H 'Content-Type: application/json' \
  -d "{\"name\":\"lab-k8s\",\"provider\":\"kubernetes\",\"kubeconfig\": ${KC},\"region\":\"lab\"}" \
  >/tmp/cp-connect.json
CLUSTER_ID=$(jq -r '.connection.id' /tmp/cp-connect.json)
echo "    cluster=${CLUSTER_ID}"

echo "==> 5) Discover nodes via API"
curl -fsS -b "${COOKIE_JAR}" "${BASE_URL}/api/control-plane/clusters/${CLUSTER_ID}" >/tmp/cp-detail.json
NODES=$(jq '.nodes | length' /tmp/cp-detail.json)
echo "    nodes=${NODES}"
[[ "${NODES}" -ge 1 ]]

echo "==> 6) Deploy workload via Control Plane"
curl -fsS -b "${COOKIE_JAR}" -X POST \
  "${BASE_URL}/api/control-plane/clusters/${CLUSTER_ID}/workloads" \
  -H 'Content-Type: application/json' \
  -d "{\"name\":\"${WL_NAME}\",\"type\":\"container\",\"image\":\"nginx:1.27-alpine\",\"namespace\":\"${NS}\",\"resources\":{\"cpu\":\"100m\",\"memory\":\"128Mi\"},\"useScheduler\":true}" \
  >/tmp/cp-deploy.json
echo "    decision=$(jq -r '.decision.selectedNodeName // "none"' /tmp/cp-deploy.json)"

echo "==> 7) Verify Deployment in Kubernetes"
export KUBECONFIG="${KUBECONFIG_FILE}"
for i in $(seq 1 30); do
  READY=$(kubectl -n "${NS}" get deploy "${WL_NAME}" -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo 0)
  if [[ "${READY}" == "1" ]]; then break; fi
  sleep 2
done
kubectl -n "${NS}" get deploy "${WL_NAME}"
kubectl -n "${NS}" get pods -l "app=${WL_NAME}" -o wide

echo "==> 8) Restart"
WL_ID="${CLUSTER_ID}:${NS}:${WL_NAME}"
curl -fsS -b "${COOKIE_JAR}" -X POST \
  "${BASE_URL}/api/control-plane/workloads/$(python3 -c 'import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1], safe=""))' "${WL_ID}")?cluster=${CLUSTER_ID}" \
  -H 'Content-Type: application/json' \
  -d '{"action":"restart"}' >/tmp/cp-restart.json

echo "==> 9) Scale to 2"
curl -fsS -b "${COOKIE_JAR}" -X POST \
  "${BASE_URL}/api/control-plane/workloads/$(python3 -c 'import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1], safe=""))' "${WL_ID}")?cluster=${CLUSTER_ID}" \
  -H 'Content-Type: application/json' \
  -d '{"action":"scale","replicas":2}' >/tmp/cp-scale.json
sleep 5
kubectl -n "${NS}" get deploy "${WL_NAME}"

echo "==> 10) Delete via Control Plane"
curl -fsS -b "${COOKIE_JAR}" -X DELETE \
  "${BASE_URL}/api/control-plane/workloads/$(python3 -c 'import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1], safe=""))' "${WL_ID}")?cluster=${CLUSTER_ID}" \
  >/tmp/cp-del.json
sleep 3
if kubectl -n "${NS}" get deploy "${WL_NAME}" >/dev/null 2>&1; then
  echo "ERROR: Deployment still present" >&2
  exit 1
fi

echo "==> E2E REAL PASSED"
