/**
 * Control Plane security & runtime gates.
 *
 * Real Kubernetes write operations are OFF by default on public/Vercel hosts.
 * Enable only in a trusted lab with:
 *   CONTROL_PLANE_REAL_OPS_ENABLED=true
 *   CONTROL_PLANE_SECRET_KEY=<32+ char secret>
 *   CONTROL_PLANE_ADMIN_PASSWORD=<strong password>
 */

export type CpRole = "Admin" | "Operator" | "Viewer";

export function isVercelRuntime() {
  return process.env.VERCEL === "1" || Boolean(process.env.VERCEL_ENV);
}

export function realOpsEnabled(): boolean {
  if (process.env.CONTROL_PLANE_REAL_OPS_ENABLED === "true") {
    // Still refuse on Vercel unless explicitly forced — ephemeral FS + public surface.
    if (isVercelRuntime() && process.env.CONTROL_PLANE_ALLOW_VERCEL_REAL_OPS !== "true") {
      return false;
    }
    return true;
  }
  return false;
}

export function getAllowedNamespace(): string {
  return process.env.CONTROL_PLANE_NAMESPACE ?? "control-plane-demo";
}

export function getSecretKey(): string | null {
  const key = process.env.CONTROL_PLANE_SECRET_KEY;
  if (!key || key.length < 32) return null;
  return key;
}

export function getSessionSecret(): string {
  return (
    process.env.CONTROL_PLANE_SESSION_SECRET ||
    process.env.CONTROL_PLANE_SECRET_KEY ||
    "dev-only-insecure-session-secret-change-me"
  );
}

export function getAdminPassword(): string | null {
  return process.env.CONTROL_PLANE_ADMIN_PASSWORD ?? null;
}

/** Demo local defaults — NEVER use these in production. */
export function getDemoCredentials(): {
  users: Array<{ username: string; password: string; role: CpRole }>;
} {
  const adminPass = getAdminPassword() ?? "cp-admin-lab-change-me";
  return {
    users: [
      { username: "admin", password: adminPass, role: "Admin" },
      {
        username: "operator",
        password: process.env.CONTROL_PLANE_OPERATOR_PASSWORD ?? "cp-operator-lab",
        role: "Operator",
      },
      {
        username: "viewer",
        password: process.env.CONTROL_PLANE_VIEWER_PASSWORD ?? "cp-viewer-lab",
        role: "Viewer",
      },
    ],
  };
}

/**
 * Remote cloud lab path (Vercel → remote-ops over HTTPS Tunnel).
 * Independent from local kubeconfig REAL_OPS (which stays off on Vercel).
 */
export type RemoteOpsClientConfig = {
  baseUrl: string;
  token: string;
  clusterId: string;
  clusterName: string;
  region: string;
};

export function remoteOpsEnabled(): boolean {
  return process.env.CONTROL_PLANE_REMOTE_OPS_ENABLED === "true";
}

export function getRemoteOpsConfig(): RemoteOpsClientConfig | null {
  if (!remoteOpsEnabled()) return null;
  const baseUrl = process.env.CONTROL_PLANE_REMOTE_OPS_URL?.replace(/\/$/, "");
  const token = process.env.CONTROL_PLANE_REMOTE_OPS_TOKEN;
  if (!baseUrl || !token || token.length < 32) return null;
  return {
    baseUrl,
    token,
    clusterId: process.env.CONTROL_PLANE_REMOTE_CLUSTER_ID ?? "remote-k3s-lab",
    clusterName: process.env.CONTROL_PLANE_REMOTE_CLUSTER_NAME ?? "cloud-lab-k3s",
    region: process.env.CONTROL_PLANE_REMOTE_CLUSTER_REGION ?? "oci-free",
  };
}

export function realInfrastructureAvailable(): boolean {
  return realOpsEnabled() || Boolean(getRemoteOpsConfig());
}

export function securityStatus() {
  const remote = getRemoteOpsConfig();
  return {
    realOpsEnabled: realOpsEnabled(),
    remoteOpsEnabled: remoteOpsEnabled(),
    remoteOpsConfigured: Boolean(remote),
    vercel: isVercelRuntime(),
    secretKeyConfigured: Boolean(getSecretKey()),
    adminPasswordConfigured: Boolean(getAdminPassword()),
    allowedNamespace: getAllowedNamespace(),
    authMode: "local-session" as const,
    note: remote
      ? "Remote cloud lab enabled (Vercel → remote-ops → K3s). Local kubeconfig paste still gated."
      : realOpsEnabled()
        ? "Local Kubernetes ops enabled (lab kubeconfig)."
        : "Real Kubernetes ops DISABLED. Simulation-only. Enable REMOTE_OPS (cloud lab) or REAL_OPS (local kind).",
  };
}
