import { readSessionFromRequest } from "@/control-plane/security/auth";
import { securityStatus } from "@/control-plane/security/config";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = readSessionFromRequest(req);
  return Response.json({
    authenticated: Boolean(user),
    user: user
      ? { username: user.username, role: user.role, exp: user.exp }
      : null,
    security: securityStatus(),
  });
}
