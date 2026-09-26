import { randomUUID } from "crypto";
import { buildHybridSnapshot } from "@/control-plane/application/registry";
import {
  deleteConnection,
  getConnection,
  listConnections,
  saveConnection,
  toPublicConnection,
  updateConnectionMeta,
} from "@/control-plane/persistence/cluster-store";
import { KubernetesInfrastructureProvider } from "@/control-plane/infrastructure/kubernetes/kubernetes-provider";
import { placeWorkload } from "@/control-plane/domain/scheduler";
import type { WorkloadSpec, WorldSnapshot } from "@/control-plane/domain/types";
import { getProviderForCluster } from "@/control-plane/application/registry";
import { cpLog } from "@/control-plane/application/logger";

export async function getSnapshot() {
  return buildHybridSnapshot();
}

export async function listPublicConnections() {
  return (await listConnections()).map(toPublicConnection);
}

export async function testKubeconfig(input: {
  kubeconfigContent: string;
  context?: string;
}) {
  const tmpId = `test-${randomUUID()}`;
  const stored = await saveConnection({
    id: tmpId,
    name: "__test__",
    provider: "kubernetes",
    kubeconfigContent: input.kubeconfigContent,
    context: input.context,
  });
  try {
    const provider = new KubernetesInfrastructureProvider({
      connectionId: stored.id,
      clusterName: stored.name,
      kubeconfigPath: stored.kubeconfigPath,
      context: stored.context,
    });
    return await provider.testConnection();
  } finally {
    await deleteConnection(tmpId);
  }
}

export async function connectCluster(input: {
  name: string;
  provider: "kubernetes" | "k3s" | "kubeedge";
  kubeconfigContent: string;
  context?: string;
  region?: string;
}) {
  if (input.provider !== "kubernetes" && input.provider !== "k3s") {
    // KubeEdge prepared but not implemented as separate client yet —
    // allow kubernetes API for k3s (same client).
    if (input.provider === "kubeedge") {
      throw new Error(
        "KubeEdge adapter is NOT_CONFIGURED yet. Use Kubernetes/K3s for now.",
      );
    }
  }

  const id = `k8s-${input.name.toLowerCase().replace(/[^a-z0-9-]/g, "-")}-${randomUUID().slice(0, 8)}`;
  const stored = await saveConnection({
    id,
    name: input.name,
    provider: input.provider === "k3s" ? "k3s" : "kubernetes",
    kubeconfigContent: input.kubeconfigContent,
    context: input.context,
    region: input.region ?? "lab",
  });

  const provider = new KubernetesInfrastructureProvider({
    connectionId: stored.id,
    clusterName: stored.name,
    kubeconfigPath: stored.kubeconfigPath,
    context: stored.context,
    region: stored.region,
  });

  const test = await provider.testConnection();
  if (!test.ok) {
    await updateConnectionMeta(id, {
      status: "DISCONNECTED",
      error: test.message,
    });
    return { connection: toPublicConnection({ ...stored, status: "DISCONNECTED", error: test.message }), test };
  }

  const cluster = await provider.getCluster(id);
  await updateConnectionMeta(id, {
    status: "CONNECTED",
    version: test.version,
    lastSyncAt: new Date().toISOString(),
    error: undefined,
  });

  cpLog("info", {
    provider: "kubernetes",
    cluster: input.name,
    operation: "connect_cluster",
    nodes: cluster?.nodeIds.length ?? 0,
  });

  return {
    connection: toPublicConnection({
      ...stored,
      status: "CONNECTED",
      version: test.version,
      lastSyncAt: new Date().toISOString(),
    }),
    test,
    cluster,
  };
}

export async function disconnectCluster(id: string) {
  await deleteConnection(id);
  return { ok: true };
}

export async function deployWithScheduler(
  clusterId: string,
  spec: WorkloadSpec,
  options?: { useScheduler?: boolean },
) {
  const provider = await getProviderForCluster(clusterId);
  if (!provider) throw new Error("Provider not found for cluster");

  let preferred = spec.placement?.preferredNodeName;
  let decision = null;

  if (options?.useScheduler !== false) {
    const snap = await buildHybridSnapshot();
    // Temporary workload for scoring
    const phantomId = `phantom-${spec.name}`;
    const phantomWorld: WorldSnapshot = {
      ...snap,
      workloads: [
        {
          id: phantomId,
          name: spec.name,
          type: spec.type,
          status: "Scheduling",
          source: snap.clusters.find((c) => c.id === clusterId)?.source ?? "kubernetes",
          image: spec.image,
          clusterId,
          cpu: Number.parseFloat(spec.resources.cpu) || 1,
          memoryGi: Number.parseFloat(spec.resources.memory) || 1,
          gpu: spec.resources.gpu ?? 0,
          gpuMemoryGi: 0,
          maxLatencyMs: spec.network?.maxLatencyMs ?? 50,
          minBandwidthMbps: spec.network?.minBandwidthMbps ?? 10,
          region: spec.placement?.region ?? "lab",
          allowedRegions: [spec.placement?.region ?? "lab", "EU"],
          availability: 99.9,
          requestsPerSec: 0,
          inferenceLatencyMs: 0,
          networkLatencyMs: 0,
          e2eLatencyMs: 0,
          errorRatePct: 0,
          version: "pending",
        },
        ...snap.workloads,
      ],
      // Only score nodes of target cluster
      nodes: snap.nodes.filter((n) => n.clusterId === clusterId),
    };
    decision = placeWorkload(phantomWorld, phantomId);
    if (decision) {
      preferred = decision.selectedNodeName;
      cpLog("info", {
        provider: provider.kind,
        cluster: clusterId,
        operation: "scheduler_decision",
        node: decision.selectedNodeName,
        score: decision.score,
      });
    }
  }

  const result = await provider.deployWorkload(clusterId, {
    ...spec,
    placement: {
      ...spec.placement,
      preferredNodeName: preferred,
    },
  });

  return { result, decision };
}

export { getConnection };
