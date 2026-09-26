import { createSeedWorld } from "@/control-plane/domain/seed";
import type {
  Cluster,
  DomainEvent,
  Node,
  Workload,
  WorldSnapshot,
} from "@/control-plane/domain/types";
import type { InfrastructureProvider } from "@/control-plane/infrastructure/provider";
import { KubernetesInfrastructureProvider } from "@/control-plane/infrastructure/kubernetes/kubernetes-provider";
import { SimulationInfrastructureProvider } from "@/control-plane/infrastructure/simulation/simulation-provider";
import {
  listConnections,
  toPublicConnection,
  type StoredConnection,
} from "@/control-plane/persistence/cluster-store";
import { cpLog } from "@/control-plane/application/logger";

let simProvider = new SimulationInfrastructureProvider();

function makeK8sProvider(c: StoredConnection) {
  return new KubernetesInfrastructureProvider({
    connectionId: c.id,
    clusterName: c.name,
    kubeconfigPath: c.kubeconfigPath,
    context: c.context,
    region: c.region,
  });
}

export async function getProviders(): Promise<InfrastructureProvider[]> {
  const conns = await listConnections();
  const real = conns.map(makeK8sProvider);
  return [simProvider, ...real];
}

export function getSimulationProvider() {
  return simProvider;
}

export function resetSimulationProvider() {
  simProvider = new SimulationInfrastructureProvider();
  return simProvider;
}

export async function buildHybridSnapshot(): Promise<
  WorldSnapshot & {
    connections: ReturnType<typeof toPublicConnection>[];
    telemetryNote: string;
  }
> {
  const simWorld = createSeedWorld();
  // Keep sim provider world aligned for API deploy-into-sim if needed
  simProvider.setWorld(structuredClone(simWorld));

  const conns = await listConnections();
  const realClusters: Cluster[] = [];
  const realNodes: Node[] = [];
  const realWorkloads: Workload[] = [];
  const realEvents: DomainEvent[] = [];

  for (const c of conns) {
    const provider = makeK8sProvider(c);
    try {
      const cluster = await provider.getCluster(c.id);
      if (cluster) realClusters.push(cluster);
      if (cluster?.mode === "CONNECTED") {
        realNodes.push(...(await provider.getNodes(c.id)));
        realWorkloads.push(...(await provider.getWorkloads(c.id)));
        realEvents.push(...(await provider.getEvents(c.id)));
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "sync failed";
      cpLog("error", {
        provider: "kubernetes",
        cluster: c.name,
        operation: "hybrid_snapshot",
        error: message,
      });
      realClusters.push({
        id: c.id,
        name: c.name,
        provider: "kubernetes",
        version: c.version ?? "unknown",
        region: c.region ?? "lab",
        country: "—",
        location: "Connected cluster",
        status: "OFFLINE",
        mode: "DISCONNECTED",
        source: "kubernetes",
        nodeIds: [],
        labels: {},
        capabilities: [],
        latencyMs: 0,
        connectionError: message,
        lastSyncAt: c.lastSyncAt,
      });
    }
  }

  const merged: WorldSnapshot = {
    ...simWorld,
    clusters: [...simWorld.clusters, ...realClusters],
    nodes: [...simWorld.nodes, ...realNodes],
    workloads: [...simWorld.workloads, ...realWorkloads],
    events: [...realEvents, ...simWorld.events].slice(0, 100),
    sites: [
      ...simWorld.sites,
      ...realClusters.map((c) => ({
        id: `site-${c.id}`,
        name: `${c.name} (real)`,
        region: c.region,
        country: c.country,
        status: c.status,
        clusterIds: [c.id],
      })),
    ],
    metrics: {
      ...simWorld.metrics,
      // Keep sim metrics for demo; real util often 0 without metrics-server
    },
  };

  return {
    ...merged,
    connections: conns.map(toPublicConnection),
    telemetryNote:
      realClusters.length > 0
        ? "REAL clusters: telemetry from Kubernetes API (no invented %). Advanced metrics: Not configured (Prometheus)."
        : "No REAL clusters connected — showing SIMULATION only.",
  };
}

export async function getProviderForCluster(
  clusterId: string,
): Promise<InfrastructureProvider | null> {
  if (clusterId.startsWith("cls-") || clusterId === "provider-simulation") {
    return simProvider;
  }
  const conns = await listConnections();
  const c = conns.find((x) => x.id === clusterId);
  if (!c) {
    // maybe simulation cluster id
    const sim = await simProvider.getCluster(clusterId);
    return sim ? simProvider : null;
  }
  return makeK8sProvider(c);
}
