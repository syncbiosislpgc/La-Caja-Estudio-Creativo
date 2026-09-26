import {
  connectCluster,
  listPublicConnections,
} from "@/control-plane/application/cluster-service";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ connections: await listPublicConnections() });
}

export async function POST(req: Request) {
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

  try {
    const result = await connectCluster({
      name: body.name,
      provider: body.provider,
      kubeconfigContent: body.kubeconfig,
      context: body.context,
      region: body.region,
    });
    return Response.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "connect failed";
    return Response.json({ error: message }, { status: 400 });
  }
}
