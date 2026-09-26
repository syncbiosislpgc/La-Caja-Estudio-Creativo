import { getProviderForCluster } from "@/control-plane/application/registry";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** id format for real: clusterId:namespace:name  OR just name with ?cluster= */
export async function GET(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const url = new URL(req.url);
  const clusterId = url.searchParams.get("cluster") ?? id.split(":")[0];
  const provider = await getProviderForCluster(clusterId);
  if (!provider) {
    return Response.json({ error: "Provider not found" }, { status: 404 });
  }
  const workload = await provider.getWorkload(clusterId, id);
  if (!workload) {
    return Response.json({ error: "Workload not found" }, { status: 404 });
  }
  return Response.json({ workload });
}

export async function DELETE(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const url = new URL(req.url);
  const clusterId = url.searchParams.get("cluster") ?? id.split(":")[0];
  const provider = await getProviderForCluster(clusterId);
  if (!provider) {
    return Response.json({ error: "Provider not found" }, { status: 404 });
  }
  await provider.deleteWorkload(clusterId, id);
  return Response.json({ ok: true });
}

export async function POST(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const url = new URL(req.url);
  const clusterId = url.searchParams.get("cluster") ?? id.split(":")[0];
  const body = (await req.json()) as { action?: "restart" | "stop" };
  const provider = await getProviderForCluster(clusterId);
  if (!provider) {
    return Response.json({ error: "Provider not found" }, { status: 404 });
  }
  if (body.action === "restart") {
    await provider.restartWorkload(clusterId, id);
  } else if (body.action === "stop") {
    await provider.stopWorkload(clusterId, id);
  } else {
    return Response.json({ error: "action must be restart|stop" }, { status: 400 });
  }
  return Response.json({ ok: true });
}
