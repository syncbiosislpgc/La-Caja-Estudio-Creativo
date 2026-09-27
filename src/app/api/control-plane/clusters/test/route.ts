import { testKubeconfig } from "@/control-plane/application/cluster-service";
import { appendAudit } from "@/control-plane/security/audit";
import {
  enforceRateLimit,
  jsonError,
  requireRealOps,
} from "@/control-plane/security/guard";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    enforceRateLimit(req, "cluster-test", 8, 60_000);
    const user = await requireRealOps(req, "cluster:connect");
    const body = (await req.json()) as {
      kubeconfig?: string;
      context?: string;
    };
    if (!body.kubeconfig) {
      return Response.json({ error: "kubeconfig required" }, { status: 400 });
    }
    const result = await testKubeconfig({
      kubeconfigContent: body.kubeconfig,
      context: body.context,
    });
    await appendAudit(user, "cluster.test", result.ok, {
      version: result.version,
    });
    return Response.json(result);
  } catch (e) {
    return jsonError(e);
  }
}
