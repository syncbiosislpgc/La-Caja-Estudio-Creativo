import type {
  Cluster,
  DeploymentResult,
  DomainEvent,
  Node,
  Workload,
  WorkloadSpec,
  WorkloadStatus,
} from "@/control-plane/domain/types";

/**
 * Infrastructure abstraction — domain never imports @kubernetes/client-node.
 */
export interface InfrastructureProvider {
  readonly id: string;
  readonly name: string;
  readonly kind: "simulation" | "kubernetes" | "k3s" | "kubeedge";

  getClusters(): Promise<Cluster[]>;
  getCluster(id: string): Promise<Cluster | null>;
  getNodes(clusterId: string): Promise<Node[]>;
  getNode(clusterId: string, nodeId: string): Promise<Node | null>;
  getWorkloads(clusterId: string): Promise<Workload[]>;
  getWorkload(
    clusterId: string,
    workloadId: string,
  ): Promise<Workload | null>;
  deployWorkload(
    clusterId: string,
    spec: WorkloadSpec,
  ): Promise<DeploymentResult>;
  getWorkloadStatus(
    clusterId: string,
    workloadId: string,
  ): Promise<WorkloadStatus>;
  restartWorkload(clusterId: string, workloadId: string): Promise<void>;
  stopWorkload(clusterId: string, workloadId: string): Promise<void>;
  deleteWorkload(clusterId: string, workloadId: string): Promise<void>;
  getEvents(clusterId: string): Promise<DomainEvent[]>;
  testConnection?(): Promise<{ ok: boolean; message: string; version?: string }>;
}
