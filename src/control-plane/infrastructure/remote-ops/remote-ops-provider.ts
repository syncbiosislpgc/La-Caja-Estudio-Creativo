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
import {
  getRemoteOpsConfig,
  type RemoteOpsClientConfig,
} from "@/control-plane/security/config";

/**
 * Talks to the external remote-ops service (never to kube-apiserver directly).
 * Browser → Control Plane (Vercel) → remote-ops (lab VM via Tunnel) → K3s.
 */
export class RemoteOpsInfrastructureProvider implements InfrastructureProvider {
  readonly id: string;
  readonly name: string;
  readonly kind = "k3s" as const;

  private cfg: RemoteOpsClientConfig;
  private lastError: string | null = null;
  private lastSyncAt: string | null = null;
  private version = "unknown";

  constructor(cfg?: RemoteOpsClientConfig) {
    const c = cfg ?? getRemoteOpsConfig();
    if (!c) throw new Error("Remote ops not configured");
    this.cfg = c;
    this.id = c.clusterId;
    this.name = c.clusterName;
  }

  private async api<T>(
    path: string,
    init?: RequestInit & { timeoutMs?: number },
  ): Promise<T> {
    const timeoutMs = init?.timeoutMs ?? 15_000;
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(`${this.cfg.baseUrl}${path}`, {
        ...init,
        signal: ctrl.signal,
        headers: {
          Authorization: `Bearer ${this.cfg.token}`,
          "Content-Type": "application/json",
          ...(init?.headers ?? {}),
        },
      });
      const data = (await res.json()) as T & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || `remote-ops HTTP ${res.status}`);
      }
      return data;
    } finally {
      clearTimeout(t);
    }
  }

  async testConnection() {
    const started = Date.now();
    try {
      const h = await this.api<{
        ok: boolean;
        version?: string;
        error?: string;
      }>("/healthz", { timeoutMs: 10_000 });
      this.version = h.version ?? "unknown";
      this.lastError = null;
      cpLog("info", {
        provider: "remote-ops",
        cluster: this.name,
        operation: "test_connection",
        durationMs: Date.now() - started,
        version: this.version,
      });
      return {
        ok: Boolean(h.ok),
        message: h.ok
          ? `Connected to remote lab ${this.version}`
          : h.error || "Remote unhealthy",
        version: this.version,
      };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unable to reach remote-ops";
      this.lastError = message;
      cpLog("error", {
        provider: "remote-ops",
        cluster: this.name,
        operation: "test_connection",
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
    try {
      const data = await this.api<{
        cluster: {
          id: string;
          name: string;
          region: string;
          version: string;
          status: string;
          nodeCount: number;
          namespace: string;
        };
      }>("/v1/cluster");
      this.version = data.cluster.version;
      this.lastSyncAt = new Date().toISOString();
      this.lastError = null;
      const nodes = await this.getNodes(id);
      return {
        id: this.id,
        name: data.cluster.name,
        provider: "k3s",
        version: data.cluster.version,
        region: data.cluster.region,
        country: "—",
        location: "Cloud lab (remote-ops)",
        status: this.lastError ? "OFFLINE" : "HEALTHY",
        mode: "CONNECTED",
        source: "kubernetes",
        nodeIds: nodes.map((n) => n.id),
        labels: { "control-plane.lacaja/remote": "true" },
        capabilities: ["deploy", "scale", "events", "remote-ops"],
        latencyMs: 0,
        lastSyncAt: this.lastSyncAt,
        workloadCount: undefined,
        cpuAllocatable: nodes.reduce((a, n) => a + n.cpuCores, 0)
          ? String(nodes.reduce((a, n) => a + n.cpuCores, 0))
          : undefined,
      };
    } catch (e) {
      this.lastError = e instanceof Error ? e.message : "sync failed";
      return {
        id: this.id,
        name: this.name,
        provider: "k3s",
        version: this.version,
        region: this.cfg.region,
        country: "—",
        location: "Cloud lab (remote-ops)",
        status: "OFFLINE",
        mode: "DISCONNECTED",
        source: "kubernetes",
        nodeIds: [],
        labels: {},
        capabilities: [],
        latencyMs: 0,
        connectionError: this.lastError,
        lastSyncAt: this.lastSyncAt ?? undefined,
      };
    }
  }

  async getNodes(clusterId: string): Promise<Node[]> {
    if (clusterId !== this.id) return [];
    const data = await this.api<{
      nodes: Array<{
        name: string;
        ready: boolean;
        arch?: string;
        osImage?: string;
        kubeletVersion?: string;
        cpuCapacity?: string;
        memoryCapacity?: string;
        cpuAllocatable?: string;
        memoryAllocatable?: string;
        labels: Record<string, string>;
        taints: string[];
        podCount: number;
      }>;
    }>("/v1/nodes");
    return data.nodes.map((n) => ({
      id: `${this.id}:${n.name}`,
      name: n.name,
      clusterId: this.id,
      siteId: `site-${this.id}`,
      region: this.cfg.region,
      status: n.ready ? "HEALTHY" : "OFFLINE",
      mode: "CONNECTED" as const,
      source: "kubernetes" as const,
      cpuCores: parseCpu(n.cpuCapacity),
      cpuUsedPct: 0,
      ramGi: parseMemoryGi(n.memoryCapacity),
      ramUsedPct: 0,
      gpuCount: 0,
      gpuUsedPct: 0,
      vramGi: 0,
      vramUsedPct: 0,
      storageUsedPct: 0,
      rttMs: 0,
      bandwidthGbps: 0,
      packetLossPct: 0,
      powerW: 0,
      temperatureC: 0,
      cordoned: false,
      drained: false,
      labels: n.labels,
      taints: n.taints,
      agentStatus: n.ready ? ("online" as const) : ("offline" as const),
      architecture: n.arch,
      osImage: n.osImage,
      kubeletVersion: n.kubeletVersion,
      podCount: n.podCount,
      allocatableCpu: n.cpuAllocatable,
      allocatableMemory: n.memoryAllocatable,
    }));
  }

  async getNode(clusterId: string, nodeId: string) {
    const nodes = await this.getNodes(clusterId);
    return nodes.find((n) => n.id === nodeId || n.name === nodeId) ?? null;
  }

  async getWorkloads(clusterId: string): Promise<Workload[]> {
    if (clusterId !== this.id) return [];
    const data = await this.api<{
      workloads: Array<{
        id: string;
        name: string;
        namespace: string;
        image: string;
        status: string;
        nodeName?: string;
        podName?: string;
        restarts: number;
      }>;
    }>("/v1/workloads");
    return data.workloads.map((w) => ({
      id: w.id,
      name: w.name,
      type: "container" as const,
      status: (w.status as WorkloadStatus) ?? "Pending",
      source: "kubernetes" as const,
      image: w.image,
      clusterId: this.id,
      nodeId: w.nodeName ? `${this.id}:${w.nodeName}` : undefined,
      namespace: w.namespace,
      deploymentName: w.name,
      podName: w.podName,
      restarts: w.restarts,
      cpu: 0.1,
      memoryGi: 0.128,
      gpu: 0,
      gpuMemoryGi: 0,
      maxLatencyMs: 0,
      minBandwidthMbps: 0,
      region: this.cfg.region,
      allowedRegions: [this.cfg.region, "lab", "EU"],
      availability: 0,
      requestsPerSec: 0,
      inferenceLatencyMs: 0,
      networkLatencyMs: 0,
      e2eLatencyMs: 0,
      errorRatePct: 0,
      version: "—",
    }));
  }

  async getWorkload(clusterId: string, workloadId: string) {
    const list = await this.getWorkloads(clusterId);
    return (
      list.find((w) => w.id === workloadId || w.name === workloadId) ?? null
    );
  }

  async deployWorkload(
    clusterId: string,
    spec: WorkloadSpec,
  ): Promise<DeploymentResult> {
    if (clusterId !== this.id) throw new Error("Cluster mismatch");
    const data = await this.api<{
      result: {
        workloadId: string;
        namespace: string;
        name: string;
        status: string;
      };
    }>("/v1/workloads", {
      method: "POST",
      body: JSON.stringify({
        name: spec.name,
        image: spec.image,
        namespace: spec.namespace,
        replicas: spec.replicas ?? 1,
        cpu: spec.resources.cpu,
        memory: spec.resources.memory,
        preferredNodeName: spec.placement?.preferredNodeName,
      }),
    });
    cpLog("info", {
      provider: "remote-ops",
      cluster: this.name,
      operation: "deploy_workload",
      workload: spec.name,
    });
    return {
      workloadId: data.result.workloadId,
      clusterId: this.id,
      namespace: data.result.namespace,
      deploymentName: data.result.name,
      status: "Deploying",
      message: "Deployment submitted via remote-ops",
    };
  }

  async getWorkloadStatus(clusterId: string, workloadId: string) {
    const w = await this.getWorkload(clusterId, workloadId);
    return w?.status ?? "Failed";
  }

  async restartWorkload(clusterId: string, workloadId: string) {
    const w = await this.getWorkload(clusterId, workloadId);
    if (!w?.deploymentName) throw new Error("Workload not found");
    await this.api(`/v1/workloads/${encodeURIComponent(w.deploymentName)}`, {
      method: "POST",
      body: JSON.stringify({ action: "restart" }),
    });
  }

  async stopWorkload(clusterId: string, workloadId: string) {
    const w = await this.getWorkload(clusterId, workloadId);
    if (!w?.deploymentName) throw new Error("Workload not found");
    await this.api(`/v1/workloads/${encodeURIComponent(w.deploymentName)}`, {
      method: "POST",
      body: JSON.stringify({ action: "stop" }),
    });
  }

  async scaleWorkload(clusterId: string, workloadId: string, replicas: number) {
    const w = await this.getWorkload(clusterId, workloadId);
    if (!w?.deploymentName) throw new Error("Workload not found");
    await this.api(`/v1/workloads/${encodeURIComponent(w.deploymentName)}`, {
      method: "POST",
      body: JSON.stringify({ action: "scale", replicas }),
    });
  }

  async deleteWorkload(clusterId: string, workloadId: string) {
    const w = await this.getWorkload(clusterId, workloadId);
    if (!w?.deploymentName) throw new Error("Workload not found");
    await this.api(`/v1/workloads/${encodeURIComponent(w.deploymentName)}`, {
      method: "DELETE",
    });
  }

  async getEvents(clusterId: string): Promise<DomainEvent[]> {
    if (clusterId !== this.id) return [];
    const data = await this.api<{
      events: Array<{
        id: string;
        type: string;
        message: string;
        severity: string;
        at: string;
      }>;
    }>("/v1/events");
    return data.events.map((e) => ({
      id: e.id,
      type: e.type,
      message: e.message,
      severity: e.severity === "warning" ? ("warning" as const) : ("info" as const),
      at: e.at,
      meta: { source: "kubernetes", via: "remote-ops" },
    }));
  }
}

function parseCpu(v?: string): number {
  if (!v) return 0;
  if (v.endsWith("m")) return Number(v.slice(0, -1)) / 1000;
  return Number(v) || 0;
}

function parseMemoryGi(v?: string): number {
  if (!v) return 0;
  if (v.endsWith("Ki")) return Number(v.slice(0, -2)) / 1024 / 1024;
  if (v.endsWith("Mi")) return Number(v.slice(0, -2)) / 1024;
  if (v.endsWith("Gi")) return Number(v.slice(0, -2));
  if (v.endsWith("Ti")) return Number(v.slice(0, -2)) * 1024;
  return Number(v) / 1024 ** 3 || 0;
}
