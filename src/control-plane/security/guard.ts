import { appendAudit } from "./audit";
import { readSessionFromRequest, type SessionUser } from "./auth";
import {
  getRemoteOpsConfig,
  realInfrastructureAvailable,
  realOpsEnabled,
  securityStatus,
} from "./config";
import { can, type Permission } from "./rbac";
import { clientKey, rateLimit } from "./rate-limit";

export class GuardError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string,
  ) {
    super(message);
  }
}

export async function requireSession(
  req: Request,
  permission: Permission,
): Promise<SessionUser> {
  const user = readSessionFromRequest(req);
  if (!user) {
    throw new GuardError("Authentication required", 401, "AUTH_REQUIRED");
  }
  if (!can(user.role, permission)) {
    await appendAudit(user, `deny:${permission}`, false);
    throw new GuardError("Forbidden for role", 403, "FORBIDDEN");
  }
  return user;
}

export async function requireRealOps(
  req: Request,
  permission: Permission,
): Promise<SessionUser> {
  // Local kubeconfig path only (never on public Vercel by default).
  if (!realOpsEnabled()) {
    throw new GuardError(
      "Local kubeconfig real-ops are disabled on this host. Use the cloud lab (REMOTE_OPS) or enable CONTROL_PLANE_REAL_OPS_ENABLED locally.",
      403,
      "REAL_OPS_DISABLED",
    );
  }
  return requireSession(req, permission);
}

/** Mutations against real infrastructure (local kubeconfig OR remote-ops cloud lab). */
export async function requireInfrastructureWrite(
  req: Request,
  permission: Permission,
): Promise<SessionUser> {
  if (!realInfrastructureAvailable()) {
    throw new GuardError(
      "No real infrastructure backend available. Simulation Mode only. Configure CONTROL_PLANE_REMOTE_OPS_* for the cloud lab, or local REAL_OPS for kind.",
      403,
      "REAL_OPS_DISABLED",
    );
  }
  if (remoteOnlyMisconfigured()) {
    throw new GuardError(
      "REMOTE_OPS_ENABLED but URL/token missing or invalid (token min 32 chars).",
      503,
      "REMOTE_OPS_MISCONFIGURED",
    );
  }
  return requireSession(req, permission);
}

function remoteOnlyMisconfigured() {
  const { remoteOpsEnabled } = securityStatus();
  return remoteOpsEnabled && !getRemoteOpsConfig() && !realOpsEnabled();
}

export function enforceRateLimit(req: Request, suffix: string, limit: number, windowMs: number) {
  const result = rateLimit(clientKey(req, suffix), limit, windowMs);
  if (!result.ok) {
    throw new GuardError(
      `Rate limit exceeded. Retry in ${Math.ceil(result.retryAfterMs / 1000)}s`,
      429,
      "RATE_LIMITED",
    );
  }
  return result;
}

export function jsonError(e: unknown) {
  if (e instanceof GuardError) {
    return Response.json(
      {
        error: e.message,
        code: e.code,
        security: e.code === "REAL_OPS_DISABLED" ? securityStatus() : undefined,
      },
      { status: e.status },
    );
  }
  const message = e instanceof Error ? e.message : "Request failed";
  return Response.json({ error: message }, { status: 400 });
}

export { securityStatus };
