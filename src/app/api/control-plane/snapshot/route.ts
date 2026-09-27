import { getSnapshot } from "@/control-plane/application/cluster-service";
import { securityStatus } from "@/control-plane/security/config";

export const dynamic = "force-dynamic";

/**
 * Snapshot remains readable without auth so Simulation Mode demos work publicly.
 * Real connections are never included unless REAL_OPS is enabled server-side.
 */
export async function GET() {
  const snap = await getSnapshot();
  return Response.json(
    {
      ...snap,
      security: securityStatus(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
        "X-Control-Plane-Mode": snap.realOpsEnabled ? "HYBRID" : "SIMULATION",
        "X-Control-Plane-Real-Ops": snap.realOpsEnabled ? "1" : "0",
      },
    },
  );
}
