import { createSeedWorld } from "@/control-plane/domain/seed";

export async function GET() {
  return Response.json(createSeedWorld(), {
    headers: {
      "Cache-Control": "no-store",
      "X-Control-Plane-Mode": "SIMULATION",
    },
  });
}
