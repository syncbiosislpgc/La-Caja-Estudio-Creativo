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
import { RemoteOpsInfrastructureProvider } from "@/control-plane/infrastructure/remote-ops/remote-ops-provider";
import { SimulationInfrastructureProvider } from "@/control-plane/infrastructure/simulation/simulation-provider";
import {
  listConnections,
  readKubeconfigContent,
  toPublicConnection,
  type StoredConnection,
} from "@/control-plane/persistence/cluster-store";
import { cpLog } from "@/control-plane/application/logger";
import {
  getRemoteOpsConfig,
  realOpsEnabled,
  remoteOpsEnabled,
} from "@/control-plane/security/config";

let simProvider = new SimulationInfrastructureProvider();

async function makeK8sProvider(c: StoredConnection) {
  const kubeconfigContent = await readKubeconfigContent(c);
  return new KubernetesInfrastructureProvider({
    connectionId: c.id,
    clusterName: c.name,
    kubeconfigContent,
    context: c.context,
    region: c.region,
  });
}

function makeRemoteProvider() {
  const cfg = getRemoteOpsConfig();
  if (!cfg) return null;
  return new RemoteOpsInfrastructureProvider(cfg);
}

export async function getProviders(): Promise<InfrastructureProvider[]> {
  const providers: InfrastructureProvider[] = [simProvider];
  const remote = makeRemoteProvider();
  if (remote) providers.push(remote);
  if (realOpsEnabled()) {
    const conns = await listConnections();
    providers.push(...(await Promise.all(conns.map((c) => makeK8sProvider(c)))));
  }
  return providers;
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
    realOpsEnabled: boolean;
    remoteOpsEnabled: boolean;
  }
> {
  const simWorld = createSeedWorld();
  simProvider.setWorld(structuredClone(simWorld));

  const realClusters: Cluster[] = [];
  const realNodes: Node[] = [];
  const realWorkloads: Workload[] = [];
  const realEvents: DomainEvent[] = [];
  let conns: StoredConnection[] = [];

  const remote = makeRemoteProvider();
  if (remote) {
    try {
      const cluster = await remote.getCluster(remote.id);
      if (cluster) realClusters.push(cluster);
      if (cluster?.mode === "CONNECTED") {
        realNodes.push(...(await remote.getNodes(remote.id)));
        realWorkloads.push(...(await remote.getWorkloads(remote.id)));
        realEvents.push(...(await remote.getEvents(remote.id)));
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "remote sync failed";
      cpLog("error", {
        provider: "remote-ops",
        cluster: remote.name,
        operation: "hybrid_snapshot",
        error: message,
      });
      realClusters.push({
        id: remote.id,
        name: remote.name,
        provider: "k3s",
        version: "unknown",
        region: getRemoteOpsConfig()?.region ?? "oci-free",
        country: "—",
        location: "Cloud lab (remote-ops)",
        status: "OFFLINE",
        mode: "DISCONNECTED",
        source: "kubernetes",
        nodeIds: [],
        labels: {},
        capabilities: [],
        latencyMs: 0,
        connectionError: message,
      });
    }
  }

  if (realOpsEnabled()) {
    conns = await listConnections();
    for (const c of conns) {
      try {
        const provider = await makeK8sProvider(c);
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
    },
  };

  const remoteCfg = getRemoteOpsConfig();
  return {
    ...merged,
    connections: conns.map(toPublicConnection),
    realOpsEnabled: realOpsEnabled(),
    remoteOpsEnabled: Boolean(remoteCfg),
    telemetryNote: remoteCfg
      ? "REAL cloud lab via remote-ops (Kubernetes API). Live CPU%: Not configured unless Metrics Server installed on lab."
      : realOpsEnabled()
        ? realClusters.length > 0
          ? "REAL clusters: telemetry from Kubernetes API (no invented %). Advanced metrics: Not configured."
          : "No REAL clusters connected — showing SIMULATION only."
        : "Real Kubernetes ops DISABLED. Simulation-only. Configure REMOTE_OPS for cloud lab.",
  };
}

export async function getProviderForCluster(
  clusterId: string,
): Promise<InfrastructureProvider | null> {
  if (clusterId.startsWith("cls-") || clusterId === "provider-simulation") {
    return simProvider;
  }
  const remote = makeRemoteProvider();
  if (remote && (clusterId === remote.id || clusterId.startsWith("remote-"))) {
    return remote;
  }
  if (!realOpsEnabled()) {
    const sim = await simProvider.getCluster(clusterId);
    return sim ? simProvider : remote && clusterId === remote.id ? remote : null;
  }
  const conns = await listConnections();
  const c = conns.find((x) => x.id === clusterId);
  if (!c) {
    const sim = await simProvider.getCluster(clusterId);
    return sim ? simProvider : null;
  }
  return makeK8sProvider(c);
}

export { remoteOpsEnabled };
