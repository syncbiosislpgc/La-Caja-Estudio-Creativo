import { getProviderForCluster } from "@/control-plane/application/registry";
import { appendAudit } from "@/control-plane/security/audit";
import {
  enforceRateLimit,
  jsonError,
  requireInfrastructureWrite,
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
      await requireSession(req, "workload:read");
    }
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
  } catch (e) {
    return jsonError(e);
  }
}

export async function DELETE(req: Request, ctx: Ctx) {
  try {
    enforceRateLimit(req, "wl-delete", 15, 60_000);
    const user = await requireInfrastructureWrite(req, "workload:delete");
    const { id } = await ctx.params;
    const url = new URL(req.url);
    const clusterId = url.searchParams.get("cluster") ?? id.split(":")[0];
    const provider = await getProviderForCluster(clusterId);
    if (!provider) {
      return Response.json({ error: "Provider not found" }, { status: 404 });
    }
    await provider.deleteWorkload(clusterId, id);
    await appendAudit(user, "workload.delete", true, { id, clusterId });
    return Response.json({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(req: Request, ctx: Ctx) {
  try {
    enforceRateLimit(req, "wl-mutate", 20, 60_000);
    const user = await requireInfrastructureWrite(req, "workload:mutate");
    const { id } = await ctx.params;
    const url = new URL(req.url);
    const clusterId = url.searchParams.get("cluster") ?? id.split(":")[0];
    const body = (await req.json()) as {
      action?: "restart" | "stop" | "scale";
      replicas?: number;
    };
    const provider = await getProviderForCluster(clusterId);
    if (!provider) {
      return Response.json({ error: "Provider not found" }, { status: 404 });
    }
    if (body.action === "restart") {
      await provider.restartWorkload(clusterId, id);
    } else if (body.action === "stop") {
      await provider.stopWorkload(clusterId, id);
    } else if (body.action === "scale") {
      if (typeof body.replicas !== "number" || !provider.scaleWorkload) {
        return Response.json(
          { error: "scale requires replicas and provider support" },
          { status: 400 },
        );
      }
      await provider.scaleWorkload(clusterId, id, body.replicas);
    } else {
      return Response.json(
        { error: "action must be restart|stop|scale" },
        { status: 400 },
      );
    }
    await appendAudit(user, `workload.${body.action}`, true, {
      id,
      clusterId,
      replicas: body.replicas,
    });
    return Response.json({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}
