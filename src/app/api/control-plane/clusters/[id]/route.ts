import { disconnectCluster } from "@/control-plane/application/cluster-service";
import { getProviderForCluster } from "@/control-plane/application/registry";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const provider = await getProviderForCluster(id);
  if (!provider) {
    return Response.json({ error: "Cluster not found" }, { status: 404 });
  }
  const cluster = await provider.getCluster(id);
  const nodes = await provider.getNodes(id);
  const workloads = await provider.getWorkloads(id);
  const events = await provider.getEvents(id);
  return Response.json({ cluster, nodes, workloads, events });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  if (id.startsWith("cls-")) {
    return Response.json(
      { error: "Cannot disconnect simulation clusters" },
      { status: 400 },
    );
  }
  await disconnectCluster(id);
  return Response.json({ ok: true });
}
