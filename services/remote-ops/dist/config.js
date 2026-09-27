export function env(name, fallback) {
    const v = process.env[name] ?? fallback;
    if (v === undefined || v === "") {
        throw new Error(`Missing required env ${name}`);
    }
    return v;
}
export function getConfig() {
    const token = process.env.REMOTE_OPS_TOKEN;
    if (!token || token.length < 32) {
        throw new Error("REMOTE_OPS_TOKEN required (min 32 chars)");
    }
    return {
        port: Number(process.env.REMOTE_OPS_PORT ?? "8787"),
        bind: process.env.REMOTE_OPS_BIND ?? "127.0.0.1",
        token,
        namespace: process.env.CONTROL_PLANE_NAMESPACE ?? "control-plane-demo",
        clusterId: process.env.REMOTE_CLUSTER_ID ?? "remote-k3s-lab",
        clusterName: process.env.REMOTE_CLUSTER_NAME ?? "cloud-lab-k3s",
        region: process.env.REMOTE_CLUSTER_REGION ?? "oci-free",
        kubeconfigPath: process.env.KUBECONFIG ?? "/etc/rancher/k3s/k3s.yaml",
        maxReplicas: Number(process.env.REMOTE_OPS_MAX_REPLICAS ?? "3"),
        allowedImagePrefixes: (process.env.REMOTE_OPS_ALLOWED_IMAGES ??
            "nginx:,nginxinc/,public.ecr.aws/,ghcr.io/nginxinc/")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
    };
}
