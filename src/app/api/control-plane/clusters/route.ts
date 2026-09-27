import {
  connectCluster,
  listPublicConnections,
} from "@/control-plane/application/cluster-service";
import { appendAudit } from "@/control-plane/security/audit";
import {
  enforceRateLimit,
  jsonError,
  requireRealOps,
  requireSession,
} from "@/control-plane/security/guard";
import { realOpsEnabled } from "@/control-plane/security/config";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    if (realOpsEnabled()) {
      await requireSession(req, "cluster:read");
    }
    return Response.json({
      connections: await listPublicConnections(),
      realOpsEnabled: realOpsEnabled(),
    });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(req: Request) {
  try {
    enforceRateLimit(req, "cluster-connect", 5, 60_000);
    const user = await requireRealOps(req, "cluster:connect");
    const body = (await req.json()) as {
      name?: string;
      provider?: "kubernetes" | "k3s" | "kubeedge";
      kubeconfig?: string;
      context?: string;
      region?: string;
    };

    if (!body.name || !body.kubeconfig || !body.provider) {
      return Response.json(
        { error: "name, provider and kubeconfig are required" },
        { status: 400 },
      );
    }

    const result = await connectCluster({
      name: body.name,
      provider: body.provider,
      kubeconfigContent: body.kubeconfig,
      context: body.context,
      region: body.region,
    });
    await appendAudit(user, "cluster.connect", true, {
      name: body.name,
      provider: body.provider,
    });
    return Response.json(result);
  } catch (e) {
    return jsonError(e);
  }
}
