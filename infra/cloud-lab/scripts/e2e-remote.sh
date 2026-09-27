#!/usr/bin/env bash
# E2E against Control Plane (Vercel or local) + remote-ops cloud lab.
# Requires REMOTE_OPS already wired and Control Plane env configured.
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
ADMIN_USER="${CONTROL_PLANE_ADMIN_USER:-admin}"
ADMIN_PASS="${CONTROL_PLANE_ADMIN_PASSWORD:?set CONTROL_PLANE_ADMIN_PASSWORD}"
COOKIE_JAR="$(mktemp)"
WL_NAME="traffic-demo-cloud"
CLUSTER_ID="${CONTROL_PLANE_REMOTE_CLUSTER_ID:-remote-k3s-lab}"

cleanup() { rm -f "${COOKIE_JAR}"; }
trap cleanup EXIT

echo "==> Snapshot must report remoteOpsEnabled"
SNAP=$(curl -fsS "${BASE_URL}/api/control-plane/snapshot")
echo "$SNAP" | jq -e '.remoteOpsEnabled == true' >/dev/null
echo "    remote cluster present: $(echo "$SNAP" | jq -r '[.clusters[]|select(.source=="kubernetes")]|length')"

echo "==> Login"
curl -fsS -c "${COOKIE_JAR}" -X POST "${BASE_URL}/api/control-plane/auth/login" \
  -H 'Content-Type: application/json' \
  -d "{\"username\":\"${ADMIN_USER}\",\"password\":\"${ADMIN_PASS}\"}" >/tmp/cp-login.json

echo "==> Anonymous deploy blocked"
CODE=$(curl -s -o /dev/null -w '%{http_code}' -X POST \
  "${BASE_URL}/api/control-plane/clusters/${CLUSTER_ID}/workloads" \
  -H 'Content-Type: application/json' \
  -d '{"name":"x","image":"nginx:1.27-alpine"}')
[[ "${CODE}" == "401" || "${CODE}" == "403" ]]
echo "    status=${CODE}"

echo "==> Discover cluster"
curl -fsS -b "${COOKIE_JAR}" "${BASE_URL}/api/control-plane/clusters/${CLUSTER_ID}" >/tmp/cp-detail.json
NODES=$(jq '.nodes|length' /tmp/cp-detail.json)
echo "    nodes=${NODES}"
[[ "${NODES}" -ge 1 ]]

echo "==> Deploy"
curl -fsS -b "${COOKIE_JAR}" -X POST \
  "${BASE_URL}/api/control-plane/clusters/${CLUSTER_ID}/workloads" \
  -H 'Content-Type: application/json' \
  -d "{\"name\":\"${WL_NAME}\",\"image\":\"nginx:1.27-alpine\",\"type\":\"container\",\"resources\":{\"cpu\":\"50m\",\"memory\":\"64Mi\"},\"useScheduler\":true}" \
  >/tmp/cp-deploy.json
echo "    decision=$(jq -r '.decision.selectedNodeName // "n/a"' /tmp/cp-deploy.json)"

echo "==> Wait for Running in Control Plane"
WL_ID="${CLUSTER_ID}:control-plane-demo:${WL_NAME}"
ENC=$(python3 -c 'import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1], safe=""))' "${WL_ID}")
for i in $(seq 1 40); do
  ST=$(curl -fsS -b "${COOKIE_JAR}" \
    "${BASE_URL}/api/control-plane/workloads/${ENC}?cluster=${CLUSTER_ID}" | jq -r '.workload.status')
  echo "    status=${ST}"
  [[ "${ST}" == "Running" ]] && break
  sleep 3
done

echo "==> Scale / Restart / Delete"
curl -fsS -b "${COOKIE_JAR}" -X POST \
  "${BASE_URL}/api/control-plane/workloads/${ENC}?cluster=${CLUSTER_ID}" \
  -H 'Content-Type: application/json' \
  -d '{"action":"scale","replicas":2}' >/dev/null
curl -fsS -b "${COOKIE_JAR}" -X POST \
  "${BASE_URL}/api/control-plane/workloads/${ENC}?cluster=${CLUSTER_ID}" \
  -H 'Content-Type: application/json' \
  -d '{"action":"restart"}' >/dev/null
curl -fsS -b "${COOKIE_JAR}" -X DELETE \
  "${BASE_URL}/api/control-plane/workloads/${ENC}?cluster=${CLUSTER_ID}" >/dev/null

echo "==> E2E REMOTE PASSED"
