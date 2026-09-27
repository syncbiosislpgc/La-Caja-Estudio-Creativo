import { deployWithScheduler } from "@/control-plane/application/cluster-service";
import type { WorkloadSpec } from "@/control-plane/domain/types";
import { appendAudit } from "@/control-plane/security/audit";
import { getAllowedNamespace } from "@/control-plane/security/config";
import {
  enforceRateLimit,
  jsonError,
  requireRealOps,
} from "@/control-plane/security/guard";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
  try {
    enforceRateLimit(req, "deploy", 10, 60_000);
    const user = await requireRealOps(req, "workload:deploy");
    const { id } = await ctx.params;
    const body = (await req.json()) as WorkloadSpec & { useScheduler?: boolean };
    if (!body.name || !body.image) {
      return Response.json({ error: "name and image required" }, { status: 400 });
    }
    const out = await deployWithScheduler(
      id,
      {
        name: body.name,
        type: body.type ?? "container",
        image: body.image,
        namespace: body.namespace ?? getAllowedNamespace(),
        replicas: body.replicas,
        resources: body.resources ?? { cpu: "100m", memory: "128Mi" },
        network: body.network,
        placement: body.placement,
        labels: body.labels,
      },
      { useScheduler: body.useScheduler },
    );
    await appendAudit(user, "workload.deploy", true, {
      cluster: id,
      name: body.name,
      image: body.image,
      node: out.decision?.selectedNodeName,
    });
    return Response.json(out);
  } catch (e) {
    return jsonError(e);
  }
}
