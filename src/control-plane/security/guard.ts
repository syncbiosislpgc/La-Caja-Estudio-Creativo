import { appendAudit } from "./audit";
import { readSessionFromRequest, type SessionUser } from "./auth";
import { realOpsEnabled, securityStatus } from "./config";
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
  if (!realOpsEnabled()) {
    throw new GuardError(
      "Real Kubernetes operations are disabled on this host. Run the Control Plane locally with CONTROL_PLANE_REAL_OPS_ENABLED=true. Simulation Mode remains available.",
      403,
      "REAL_OPS_DISABLED",
    );
  }
  return requireSession(req, permission);
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
