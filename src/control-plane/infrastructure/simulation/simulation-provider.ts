import { createSeedWorld } from "@/control-plane/domain/seed";
import type {
  Cluster,
  DeploymentResult,
  DomainEvent,
  Node,
  Workload,
  WorkloadSpec,
  WorkloadStatus,
  WorldSnapshot,
} from "@/control-plane/domain/types";
import type { InfrastructureProvider } from "../provider";

/**
 * Simulation provider — wraps in-memory seed world.
 * Mutations for lab remain in client; this provider is read + deploy-into-sim.
 */
export class SimulationInfrastructureProvider implements InfrastructureProvider {
  readonly id = "provider-simulation";
  readonly name = "Simulation";
  readonly kind = "simulation" as const;

  private world: WorldSnapshot;

  constructor(world?: WorldSnapshot) {
    this.world = world ?? createSeedWorld();
  }

  getWorld() {
    return this.world;
  }

  setWorld(world: WorldSnapshot) {
    this.world = world;
  }

  async getClusters(): Promise<Cluster[]> {
    return this.world.clusters;
  }

  async getCluster(id: string): Promise<Cluster | null> {
    return this.world.clusters.find((c) => c.id === id) ?? null;
  }

  async getNodes(clusterId: string): Promise<Node[]> {
    return this.world.nodes.filter((n) => n.clusterId === clusterId);
  }

  async getNode(clusterId: string, nodeId: string): Promise<Node | null> {
    return (
      this.world.nodes.find(
        (n) => n.clusterId === clusterId && n.id === nodeId,
      ) ?? null
    );
  }

  async getWorkloads(clusterId: string): Promise<Workload[]> {
    return this.world.workloads.filter((w) => w.clusterId === clusterId);
  }

  async getWorkload(
    clusterId: string,
    workloadId: string,
  ): Promise<Workload | null> {
    return (
      this.world.workloads.find(
        (w) => w.clusterId === clusterId && w.id === workloadId,
      ) ?? null
    );
  }

  async deployWorkload(
    clusterId: string,
    spec: WorkloadSpec,
  ): Promise<DeploymentResult> {
    const cluster = await this.getCluster(clusterId);
    if (!cluster) throw new Error(`Cluster ${clusterId} not found`);

    const preferred =
      this.world.nodes.find(
        (n) =>
          n.clusterId === clusterId &&
          n.name === spec.placement?.preferredNodeName,
      ) ?? this.world.nodes.find((n) => n.clusterId === clusterId);

    const id = `wl-sim-${spec.name}`;
    const wl: Workload = {
      id,
      name: spec.name,
      type: spec.type,
      status: "Running",
      source: "simulation",
      image: spec.image,
      clusterId,
      nodeId: preferred?.id,
      namespace: spec.namespace ?? "simulation",
      deploymentName: spec.name,
      cpu: Number.parseFloat(spec.resources.cpu) || 1,
      memoryGi: Number.parseFloat(spec.resources.memory) || 1,
      gpu: spec.resources.gpu ?? 0,
      gpuMemoryGi: 0,
      maxLatencyMs: spec.network?.maxLatencyMs ?? 50,
      minBandwidthMbps: spec.network?.minBandwidthMbps ?? 10,
      region: spec.placement?.region ?? "EU",
      allowedRegions: [spec.placement?.region ?? "EU"],
      availability: 99.9,
      requestsPerSec: 0,
      inferenceLatencyMs: 0,
      networkLatencyMs: preferred?.rttMs ?? 5,
      e2eLatencyMs: preferred?.rttMs ?? 5,
      errorRatePct: 0,
      version: "sim",
    };

    this.world.workloads = [
      wl,
      ...this.world.workloads.filter((w) => w.id !== id),
    ];
    this.world.events = [
      {
        id: `evt-${Date.now()}`,
        type: "WorkloadDeployed",
        message: `Simulated deploy ${spec.name} on ${preferred?.name ?? "n/a"}`,
        severity: "info",
        at: new Date().toISOString(),
      },
      ...this.world.events,
    ];

    return {
      workloadId: id,
      clusterId,
      namespace: wl.namespace!,
      deploymentName: spec.name,
      status: "Running",
      message: "Deployed in simulation",
    };
  }

  async getWorkloadStatus(
    clusterId: string,
    workloadId: string,
  ): Promise<WorkloadStatus> {
    const w = await this.getWorkload(clusterId, workloadId);
    return w?.status ?? "Failed";
  }

  async restartWorkload(clusterId: string, workloadId: string): Promise<void> {
    const w = await this.getWorkload(clusterId, workloadId);
    if (!w) throw new Error("Workload not found");
    w.status = "Running";
    this.push("WorkloadDeployed", `Restarted ${w.name} (simulation)`);
  }

  async stopWorkload(clusterId: string, workloadId: string): Promise<void> {
    const w = await this.getWorkload(clusterId, workloadId);
    if (!w) throw new Error("Workload not found");
    w.status = "Stopped";
    this.push("WorkloadDegraded", `Stopped ${w.name} (simulation)`, "warning");
  }

  async deleteWorkload(clusterId: string, workloadId: string): Promise<void> {
    this.world.workloads = this.world.workloads.filter(
      (w) => !(w.clusterId === clusterId && w.id === workloadId),
    );
    this.push("WorkloadDegraded", `Deleted ${workloadId} (simulation)`, "info");
  }

  async getEvents(clusterId: string): Promise<DomainEvent[]> {
    return this.world.events.filter(
      (e) => !e.entityId || e.entityId.includes(clusterId) || true,
    );
  }

  async testConnection() {
    return { ok: true, message: "Simulation provider ready", version: "sim-1" };
  }

  private push(
    type: string,
    message: string,
    severity: DomainEvent["severity"] = "info",
  ) {
    this.world.events = [
      {
        id: `evt-${Date.now()}`,
        type,
        message,
        severity,
        at: new Date().toISOString(),
      },
      ...this.world.events,
    ].slice(0, 80);
  }
}
