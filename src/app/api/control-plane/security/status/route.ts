import { readAudit } from "@/control-plane/security/audit";
import { requireSession, jsonError } from "@/control-plane/security/guard";
import { securityStatus } from "@/control-plane/security/config";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    // Public security posture (no secrets) always returned;
    // audit trail requires Viewer+.
    const status = securityStatus();
    let audit: Awaited<ReturnType<typeof readAudit>> = [];
    try {
      await requireSession(req, "audit:read");
      audit = await readAudit(50);
    } catch {
      /* anonymous: status only */
    }
    return Response.json({ security: status, audit });
  } catch (e) {
    return jsonError(e);
  }
}
