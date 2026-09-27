#!/usr/bin/env bash
# Build ~/.oci/config + API key from environment secrets (never commit outputs).
set -euo pipefail

mkdir -p "${HOME}/.oci"
chmod 700 "${HOME}/.oci"

: "${OCI_TENANCY_OCID:?}"
: "${OCI_USER_OCID:?}"
: "${OCI_FINGERPRINT:?}"
: "${OCI_REGION:?}"
: "${OCI_PRIVATE_KEY_PEM:?}"

KEY_PATH="${HOME}/.oci/oci_api_key.pem"
printf '%s\n' "${OCI_PRIVATE_KEY_PEM}" >"${KEY_PATH}"
# Support keys that were stored with literal \n
if grep -q '\\n' "${KEY_PATH}"; then
  python3 - <<'PY'
from pathlib import Path
p = Path.home() / ".oci" / "oci_api_key.pem"
p.write_text(p.read_text().encode().decode("unicode_escape"))
PY
fi
chmod 600 "${KEY_PATH}"

cat >"${HOME}/.oci/config" <<EOF
[DEFAULT]
user=${OCI_USER_OCID}
fingerprint=${OCI_FINGERPRINT}
tenancy=${OCI_TENANCY_OCID}
region=${OCI_REGION}
key_file=${KEY_PATH}
EOF
chmod 600 "${HOME}/.oci/config"

echo "OCI config written for region ${OCI_REGION}"
oci iam region list --query 'data[0].name' --raw-output 2>/dev/null || \
  oci iam availability-domain list --compartment-id "${OCI_TENANCY_OCID}" --query 'data[0].name' --raw-output
