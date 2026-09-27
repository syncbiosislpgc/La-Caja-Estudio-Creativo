import { clearSessionCookie, readSessionFromRequest } from "@/control-plane/security/auth";
import { appendAudit } from "@/control-plane/security/audit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const user = readSessionFromRequest(req);
  await appendAudit(user, "auth.logout", true);
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": clearSessionCookie(),
    },
  });
}
