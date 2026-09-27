import {
  authenticateLocal,
  buildSessionCookie,
  createSessionToken,
} from "@/control-plane/security/auth";
import { appendAudit } from "@/control-plane/security/audit";
import { enforceRateLimit, jsonError } from "@/control-plane/security/guard";
import { securityStatus } from "@/control-plane/security/config";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    enforceRateLimit(req, "login", 10, 60_000);
    const body = (await req.json()) as { username?: string; password?: string };
    if (!body.username || !body.password) {
      return Response.json({ error: "username and password required" }, { status: 400 });
    }
    const user = authenticateLocal(body.username, body.password);
    if (!user) {
      await appendAudit(null, "auth.login", false, { username: body.username });
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }
    const token = createSessionToken({
      username: user.username,
      role: user.role,
    });
    await appendAudit(user, "auth.login", true);
    return new Response(
      JSON.stringify({
        user: { username: user.username, role: user.role },
        security: securityStatus(),
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": buildSessionCookie(token),
        },
      },
    );
  } catch (e) {
    return jsonError(e);
  }
}
