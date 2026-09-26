import { testKubeconfig } from "@/control-plane/application/cluster-service";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    kubeconfig?: string;
    context?: string;
  };
  if (!body.kubeconfig) {
    return Response.json({ error: "kubeconfig required" }, { status: 400 });
  }
  try {
    const result = await testKubeconfig({
      kubeconfigContent: body.kubeconfig,
      context: body.context,
    });
    return Response.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "test failed";
    return Response.json({ ok: false, message }, { status: 400 });
  }
}
