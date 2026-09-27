import { disconnectCluster } from "@/control-plane/application/cluster-service";
import { getProviderForCluster } from "@/control-plane/application/registry";
import { appendAudit } from "@/control-plane/security/audit";
import {
  jsonError,
  requireRealOps,
  requireSession,
} from "@/control-plane/security/guard";
import {
  realInfrastructureAvailable,
  realOpsEnabled,
} from "@/control-plane/security/config";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, ctx: Ctx) {
  try {
    if (realInfrastructureAvailable()) {
      await requireSession(req, "cluster:read");
    }
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
  } catch (e) {
    return jsonError(e);
  }
}

export async function DELETE(req: Request, ctx: Ctx) {
  try {
    const user = await requireRealOps(req, "cluster:disconnect");
    const { id } = await ctx.params;
    if (id.startsWith("cls-")) {
      return Response.json(
        { error: "Cannot disconnect simulation clusters" },
        { status: 400 },
      );
    }
    await disconnectCluster(id);
    await appendAudit(user, "cluster.disconnect", true, { id });
    return Response.json({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}
