import { deployWithScheduler } from "@/control-plane/application/cluster-service";
import type { WorkloadSpec } from "@/control-plane/domain/types";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = (await req.json()) as WorkloadSpec & { useScheduler?: boolean };
  if (!body.name || !body.image) {
    return Response.json({ error: "name and image required" }, { status: 400 });
  }
  try {
    const out = await deployWithScheduler(
      id,
      {
        name: body.name,
        type: body.type ?? "container",
        image: body.image,
        namespace: body.namespace,
        replicas: body.replicas,
        resources: body.resources ?? { cpu: "100m", memory: "128Mi" },
        network: body.network,
        placement: body.placement,
        labels: body.labels,
      },
      { useScheduler: body.useScheduler },
    );
    return Response.json(out);
  } catch (e) {
    const message = e instanceof Error ? e.message : "deploy failed";
    return Response.json({ error: message }, { status: 400 });
  }
}
