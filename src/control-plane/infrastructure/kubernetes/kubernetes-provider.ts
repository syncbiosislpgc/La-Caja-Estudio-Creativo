import * as k8s from "@kubernetes/client-node";
import type {
  Cluster,
  DeploymentResult,
  DomainEvent,
  Node,
  Workload,
  WorkloadSpec,
  WorkloadStatus,
} from "@/control-plane/domain/types";
import type { InfrastructureProvider } from "../provider";
import { cpLog } from "@/control-plane/application/logger";
import { getAllowedNamespace } from "@/control-plane/security/config";
import { assertManagedNamespace } from "@/control-plane/security/policy";

export type KubernetesProviderOptions = {
  connectionId: string;
  clusterName: string;
  /** Decrypted kubeconfig YAML (server-side only — never log) */
  kubeconfigContent: string;
  region?: string;
  context?: string;
};

/**
 * Real Kubernetes adapter.
 * Domain never imports this module — only application/registry does.
 */
export class KubernetesInfrastructureProvider implements InfrastructureProvider {
  readonly id: string;
  readonly name: string;
  readonly kind = "kubernetes" as const;

  private kc = new k8s.KubeConfig();
  private core: k8s.CoreV1Api | null = null;
  private apps: k8s.AppsV1Api | null = null;
  private loaded = false;
  private lastError: string | null = null;
  private lastSyncAt: string | null = null;
  private version = "unknown";

  constructor(private opts: KubernetesProviderOptions) {
    this.id = opts.connectionId;
    this.name = opts.clusterName;
  }

  private ensureClients() {
    if (this.loaded && this.core && this.apps) return;
    this.kc.loadFromString(this.opts.kubeconfigContent);
    if (this.opts.context) {
      this.kc.setCurrentContext(this.opts.context);
    }
    this.core = this.kc.makeApiClient(k8s.CoreV1Api);
    this.apps = this.kc.makeApiClient(k8s.AppsV1Api);
    this.loaded = true;
  }

  private managedNs() {
    return getAllowedNamespace();
  }

  async testConnection() {
    const started = Date.now();
    try {
      this.ensureClients();
      const versionApi = this.kc.makeApiClient(k8s.VersionApi);
      const v = await versionApi.getCode();
      this.version = v.gitVersion ?? "unknown";
      this.lastError = null;
      cpLog("info", {
        provider: "kubernetes",
        cluster: this.name,
        operation: "test_connection",
        durationMs: Date.now() - started,
        version: this.version,
      });
      return {
        ok: true,
        message: `Connected to Kubernetes ${this.version}`,
        version: this.version,
      };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unable to reach Kubernetes API";
      this.lastError = message;
      cpLog("error", {
        provider: "kubernetes",
        cluster: this.name,
        operation: "test_connection",
        durationMs: Date.now() - started,
        error: message,
      });
      return { ok: false, message };
    }
  }

  async getClusters(): Promise<Cluster[]> {
    const c = await this.getCluster(this.id);
    return c ? [c] : [];
  }

  async getCluster(id: string): Promise<Cluster | null> {
    if (id !== this.id) return null;
    const started = Date.now();
    try {
      this.ensureClients();
      const nodes = await this.core!.listNode();
      const apps = await this.apps!.listDeploymentForAllNamespaces();
      const versionApi = this.kc.makeApiClient(k8s.VersionApi);
      try {
        const v = await versionApi.getCode();
        this.version = v.gitVersion ?? this.version;
      } catch {
        /* keep prior */
      }

      let cpu = 0;
      let memGi = 0;
      let gpus = 0;
      for (const n of nodes.items) {
        cpu += parseCpu(n.status?.allocatable?.cpu);
        memGi += parseMemoryGi(n.status?.allocatable?.memory);
        gpus += Number(n.status?.allocatable?.["nvidia.com/gpu"] ?? 0);
      }

      this.lastSyncAt = new Date().toISOString();
      this.lastError = null;

      const ready = nodes.items.every((n) =>
        n.status?.conditions?.some(
          (c) => c.type === "Ready" && c.status === "True",
        ),
      );

      cpLog("info", {
        provider: "kubernetes",
        cluster: this.name,
        operation: "discover_cluster",
        durationMs: Date.now() - started,
        nodes: nodes.items.length,
      });

      return {
        id: this.id,
        name: this.name,
        provider: "kubernetes",
        version: this.version,
        region: this.opts.region ?? "lab",
        country: "—",
        location: "Connected cluster",
        status: ready ? "HEALTHY" : "DEGRADED",
        mode: "CONNECTED",
        source: "kubernetes",
        nodeIds: nodes.items.map((n) => `${this.id}:${n.metadata?.name}`),
        labels: { provider: "kubernetes" },
        capabilities: ["deploy", "scale", "events", ...(gpus ? ["gpu"] : [])],
        latencyMs: 0,
        lastSyncAt: this.lastSyncAt,
        cpuAllocatable: `${cpu} cores`,
        memoryAllocatable: `${memGi.toFixed(0)}Gi`,
        gpuCount: gpus,
        workloadCount: apps.items.length,
      };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Connection failed";
      this.lastError = message;
      cpLog("error", {
        provider: "kubernetes",
        cluster: this.name,
        operation: "discover_cluster",
        error: message,
      });
      return {
        id: this.id,
        name: this.name,
        provider: "kubernetes",
        version: this.version,
        region: this.opts.region ?? "lab",
        country: "—",
        location: "Connected cluster",
        status: "OFFLINE",
        mode: "DISCONNECTED",
        source: "kubernetes",
        nodeIds: [],
        labels: {},
        capabilities: [],
        latencyMs: 0,
        lastSyncAt: this.lastSyncAt ?? undefined,
        connectionError: message,
      };
    }
  }

  async getNodes(clusterId: string): Promise<Node[]> {
    if (clusterId !== this.id) return [];
    const started = Date.now();
    this.ensureClients();
    const res = await this.core!.listNode();
    const pods = await this.core!.listPodForAllNamespaces();
    const podCountByNode = new Map<string, number>();
    for (const p of pods.items) {
      const nn = p.spec?.nodeName;
      if (!nn) continue;
      podCountByNode.set(nn, (podCountByNode.get(nn) ?? 0) + 1);
    }

    cpLog("info", {
      provider: "kubernetes",
      cluster: this.name,
      operation: "discover_nodes",
      durationMs: Date.now() - started,
      nodes: res.items.length,
    });

    return res.items.map((n) => mapNode(this.id, n, podCountByNode));
  }

  async getNode(clusterId: string, nodeId: string): Promise<Node | null> {
    const nodes = await this.getNodes(clusterId);
    return nodes.find((n) => n.id === nodeId || n.name === nodeId) ?? null;
  }

  async getWorkloads(clusterId: string): Promise<Workload[]> {
    if (clusterId !== this.id) return [];
    this.ensureClients();
    const deps = await this.apps!.listDeploymentForAllNamespaces();
    const pods = await this.core!.listPodForAllNamespaces();
    return deps.items.map((d) => mapDeployment(this.id, d, pods.items));
  }

  async getWorkload(clusterId: string, workloadId: string) {
    const list = await this.getWorkloads(clusterId);
    return list.find((w) => w.id === workloadId || w.name === workloadId) ?? null;
  }

  async deployWorkload(
    clusterId: string,
    spec: WorkloadSpec,
  ): Promise<DeploymentResult> {
    if (clusterId !== this.id) throw new Error("Cluster mismatch");
    this.ensureClients();
    const ns = spec.namespace ?? this.managedNs();
    const nsCheck = assertManagedNamespace(ns);
    if (!nsCheck.ok) throw new Error(nsCheck.reason);
    await ensureNamespace(this.core!, ns);

    const preferredNode = spec.placement?.preferredNodeName;
    // Soft preference via nodeAffinity — does not replace kube-scheduler.
    const affinity: k8s.V1Affinity | undefined = preferredNode
      ? {
          nodeAffinity: {
            preferredDuringSchedulingIgnoredDuringExecution: [
              {
                weight: 100,
                preference: {
                  matchExpressions: [
                    {
                      key: "kubernetes.io/hostname",
                      operator: "In",
                      values: [preferredNode],
                    },
                  ],
                },
              },
            ],
          },
        }
      : undefined;

    const body: k8s.V1Deployment = {
      apiVersion: "apps/v1",
      kind: "Deployment",
      metadata: {
        name: spec.name,
        namespace: ns,
        labels: {
          app: spec.name,
          "control-plane.lacaja/managed": "true",
          ...(spec.labels ?? {}),
        },
      },
      spec: {
        replicas: spec.replicas ?? 1,
        selector: { matchLabels: { app: spec.name } },
        template: {
          metadata: {
            labels: {
              app: spec.name,
              "control-plane.lacaja/managed": "true",
            },
          },
          spec: {
            affinity,
            containers: [
              {
                name: spec.name,
                image: spec.image,
                imagePullPolicy: "IfNotPresent",
                securityContext: {
                  allowPrivilegeEscalation: false,
                },
                resources: {
                  requests: {
                    cpu: spec.resources.cpu,
                    memory: spec.resources.memory,
                    ...(spec.resources.gpu
                      ? { "nvidia.com/gpu": String(spec.resources.gpu) }
                      : {}),
                  },
                  limits: {
                    cpu: spec.resources.cpu,
                    memory: spec.resources.memory,
                    ...(spec.resources.gpu
                      ? { "nvidia.com/gpu": String(spec.resources.gpu) }
                      : {}),
                  },
                },
              },
            ],
          },
        },
      },
    };

    const started = Date.now();
    try {
      await this.apps!.createNamespacedDeployment({ namespace: ns, body });
    } catch (e) {
      // update if exists
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("AlreadyExists") || msg.includes("409")) {
        await this.apps!.replaceNamespacedDeployment({
          name: spec.name,
          namespace: ns,
          body,
        });
      } else {
        cpLog("error", {
          provider: "kubernetes",
          cluster: this.name,
          operation: "deploy_workload",
          error: msg,
        });
        throw e;
      }
    }

    cpLog("info", {
      provider: "kubernetes",
      cluster: this.name,
      operation: "deploy_workload",
      durationMs: Date.now() - started,
      workload: spec.name,
      namespace: ns,
    });

    return {
      workloadId: `${this.id}:${ns}:${spec.name}`,
      clusterId: this.id,
      namespace: ns,
      deploymentName: spec.name,
      status: "Deploying",
      message: "Deployment submitted to Kubernetes API",
    };
  }

  async getWorkloadStatus(
    clusterId: string,
    workloadId: string,
  ): Promise<WorkloadStatus> {
    const w = await this.getWorkload(clusterId, workloadId);
    return w?.status ?? "Failed";
  }

  private assertMutable(w: Workload) {
    const nsCheck = assertManagedNamespace(w.namespace);
    if (!nsCheck.ok) throw new Error(nsCheck.reason);
    if (!w.deploymentName) throw new Error("Workload not found");
  }

  async restartWorkload(clusterId: string, workloadId: string): Promise<void> {
    const w = await this.getWorkload(clusterId, workloadId);
    if (!w) throw new Error("Workload not found");
    this.assertMutable(w);
    this.ensureClients();
    const dep = await this.apps!.readNamespacedDeployment({
      name: w.deploymentName!,
      namespace: w.namespace!,
    });
    const annotations = dep.spec?.template?.metadata?.annotations ?? {};
    annotations["control-plane.lacaja/restartedAt"] = new Date().toISOString();
    if (!dep.spec?.template?.metadata) {
      dep.spec!.template!.metadata = { annotations };
    } else {
      dep.spec.template.metadata.annotations = annotations;
    }
    await this.apps!.replaceNamespacedDeployment({
      name: w.deploymentName!,
      namespace: w.namespace!,
      body: dep,
    });
  }

  async stopWorkload(clusterId: string, workloadId: string): Promise<void> {
    await this.scaleWorkload(clusterId, workloadId, 0);
  }

  async scaleWorkload(
    clusterId: string,
    workloadId: string,
    replicas: number,
  ): Promise<void> {
    if (replicas < 0 || replicas > 10) {
      throw new Error("Replicas must be between 0 and 10");
    }
    const w = await this.getWorkload(clusterId, workloadId);
    if (!w) throw new Error("Workload not found");
    this.assertMutable(w);
    this.ensureClients();
    const dep = await this.apps!.readNamespacedDeployment({
      name: w.deploymentName!,
      namespace: w.namespace!,
    });
    if (dep.spec) dep.spec.replicas = replicas;
    await this.apps!.replaceNamespacedDeployment({
      name: w.deploymentName!,
      namespace: w.namespace!,
      body: dep,
    });
    cpLog("info", {
      provider: "kubernetes",
      cluster: this.name,
      operation: "scale_workload",
      workload: w.deploymentName,
      replicas,
    });
  }

  async deleteWorkload(clusterId: string, workloadId: string): Promise<void> {
    const w = await this.getWorkload(clusterId, workloadId);
    if (!w) throw new Error("Workload not found");
    this.assertMutable(w);
    this.ensureClients();
    await this.apps!.deleteNamespacedDeployment({
      name: w.deploymentName!,
      namespace: w.namespace!,
    });
    cpLog("info", {
      provider: "kubernetes",
      cluster: this.name,
      operation: "delete_workload",
      workload: w.deploymentName,
    });
  }

  async getEvents(clusterId: string): Promise<DomainEvent[]> {
    if (clusterId !== this.id) return [];
    this.ensureClients();
    const ev = await this.core!.listEventForAllNamespaces();
    return ev.items
      .slice(-40)
      .reverse()
      .map((e) => {
        const raw =
          e.lastTimestamp ??
          e.eventTime ??
          e.metadata?.creationTimestamp ??
          new Date().toISOString();
        const at = typeof raw === "string" ? raw : new Date(raw).toISOString();
        return {
          id: e.metadata?.uid ?? `k8s-evt-${Math.random()}`,
          type: e.reason ?? "Event",
          message: `${e.involvedObject?.kind}/${e.involvedObject?.name}: ${e.message ?? ""}`,
          severity:
            e.type === "Warning"
              ? ("warning" as const)
              : ("info" as const),
          entityType: e.involvedObject?.kind,
          entityId: e.involvedObject?.name,
          at,
          meta: { source: "kubernetes" },
        };
      });
  }
}

function mapNode(
  clusterId: string,
  n: k8s.V1Node,
  podCountByNode: Map<string, number>,
): Node {
  const name = n.metadata?.name ?? "unknown";
  const ready = n.status?.conditions?.some(
    (c) => c.type === "Ready" && c.status === "True",
  );
  const cpuAlloc = n.status?.allocatable?.cpu;
  const memAlloc = n.status?.allocatable?.memory;
  const cpuCap = n.status?.capacity?.cpu;
  const memCap = n.status?.capacity?.memory;
  const gpu = Number(n.status?.allocatable?.["nvidia.com/gpu"] ?? 0);
  const unschedulable = Boolean(n.spec?.unschedulable);

  // Kubernetes API does not expose live % util without metrics-server —
  // leave 0 and label telemetry source in UI.
  return {
    id: `${clusterId}:${name}`,
    name,
    clusterId,
    siteId: `site-${clusterId}`,
    region: n.metadata?.labels?.["topology.kubernetes.io/region"] ?? "lab",
    status: ready ? (unschedulable ? "WARNING" : "HEALTHY") : "OFFLINE",
    mode: "CONNECTED",
    source: "kubernetes",
    cpuCores: parseCpu(cpuCap),
    cpuUsedPct: 0,
    ramGi: parseMemoryGi(memCap),
    ramUsedPct: 0,
    gpuCount: gpu,
    gpuUsedPct: 0,
    vramGi: 0,
    vramUsedPct: 0,
    storageUsedPct: 0,
    accelerator: gpu ? "nvidia.com/gpu" : undefined,
    rttMs: 0,
    bandwidthGbps: 0,
    packetLossPct: 0,
    powerW: 0,
    temperatureC: 0,
    cordoned: unschedulable,
    drained: unschedulable,
    labels: n.metadata?.labels ?? {},
    taints: (n.spec?.taints ?? []).map((t) => `${t.key}=${t.value ?? ""}:${t.effect}`),
    agentStatus: ready ? "online" : "offline",
    architecture: n.status?.nodeInfo?.architecture,
    osImage: n.status?.nodeInfo?.osImage,
    kubeletVersion: n.status?.nodeInfo?.kubeletVersion,
    podCount: podCountByNode.get(name) ?? 0,
    allocatableCpu: String(cpuAlloc ?? ""),
    allocatableMemory: String(memAlloc ?? ""),
  };
}

function mapDeployment(
  clusterId: string,
  d: k8s.V1Deployment,
  pods: k8s.V1Pod[],
): Workload {
  const name = d.metadata?.name ?? "unknown";
  const ns = d.metadata?.namespace ?? "default";
  const id = `${clusterId}:${ns}:${name}`;
  const desired = d.spec?.replicas ?? 0;
  const ready = d.status?.readyReplicas ?? 0;
  const image =
    d.spec?.template?.spec?.containers?.[0]?.image ?? "unknown";
  const related = pods.filter(
    (p) =>
      p.metadata?.namespace === ns &&
      p.metadata?.labels?.app === (d.spec?.selector?.matchLabels?.app ?? name),
  );
  const pod = related[0];
  const restarts =
    pod?.status?.containerStatuses?.reduce(
      (a, c) => a + (c.restartCount ?? 0),
      0,
    ) ?? 0;

  let status: WorkloadStatus = "Pending";
  if (desired === 0) status = "Stopped";
  else if (ready >= desired && desired > 0) status = "Running";
  else if ((d.status?.unavailableReplicas ?? 0) > 0) status = "Degraded";
  else status = "Deploying";

  const cpuReq =
    d.spec?.template?.spec?.containers?.[0]?.resources?.requests?.cpu ?? "0";
  const memReq =
    d.spec?.template?.spec?.containers?.[0]?.resources?.requests?.memory ?? "0";

  return {
    id,
    name,
    type: "container",
    status,
    source: "kubernetes",
    image,
    clusterId,
    nodeId: pod?.spec?.nodeName
      ? `${clusterId}:${pod.spec.nodeName}`
      : undefined,
    namespace: ns,
    deploymentName: name,
    podName: pod?.metadata?.name,
    restarts,
    cpu: parseCpu(cpuReq),
    memoryGi: parseMemoryGi(memReq),
    gpu: Number(
      d.spec?.template?.spec?.containers?.[0]?.resources?.requests?.[
        "nvidia.com/gpu"
      ] ?? 0,
    ),
    gpuMemoryGi: 0,
    maxLatencyMs: 0,
    minBandwidthMbps: 0,
    region: "lab",
    allowedRegions: ["lab", "EU"],
    availability: 0,
    requestsPerSec: 0,
    inferenceLatencyMs: 0,
    networkLatencyMs: 0,
    e2eLatencyMs: 0,
    errorRatePct: 0,
    version: d.metadata?.labels?.version ?? "—",
  };
}

async function ensureNamespace(core: k8s.CoreV1Api, name: string) {
  try {
    await core.readNamespace({ name });
  } catch {
    await core.createNamespace({
      body: {
        metadata: {
          name,
          labels: { "control-plane.lacaja/managed": "true" },
        },
      },
    });
  }
}

export function parseCpu(v?: string): number {
  if (!v) return 0;
  if (v.endsWith("m")) return Number(v.slice(0, -1)) / 1000;
  return Number(v) || 0;
}

export function parseMemoryGi(v?: string): number {
  if (!v) return 0;
  if (v.endsWith("Ki")) return Number(v.slice(0, -2)) / 1024 / 1024;
  if (v.endsWith("Mi")) return Number(v.slice(0, -2)) / 1024;
  if (v.endsWith("Gi")) return Number(v.slice(0, -2));
  if (v.endsWith("Ti")) return Number(v.slice(0, -2)) * 1024;
  return Number(v) / 1024 ** 3 || 0;
}
