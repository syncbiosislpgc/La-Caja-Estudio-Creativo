import { getSnapshot } from "@/control-plane/application/cluster-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const snap = await getSnapshot();
  return Response.json(snap, {
    headers: {
      "Cache-Control": "no-store",
      "X-Control-Plane-Mode": "HYBRID",
    },
  });
}
