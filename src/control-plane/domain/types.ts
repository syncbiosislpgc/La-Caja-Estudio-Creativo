/** Domain types — AI-Native Edge & Network Control Plane */

export type Health = "HEALTHY" | "DEGRADED" | "WARNING" | "OFFLINE";
export type Mode = "SIMULATION" | "CONNECTED" | "NOT_CONFIGURED" | "DISCONNECTED";

/** Provenance — never mix silently */
export type InfraSource = "simulation" | "kubernetes" | "k3s" | "kubeedge";

export type ClusterType = "kubernetes" | "k3s" | "kubeedge" | "simulation";

export type WorkloadType =
  | "container"
  | "ai-inference"
  | "edge-application"
  | "network-function"
  | "service"
  | "batch";

export type WorkloadStatus =
  | "Pending"
  | "Scheduling"
  | "Scheduled"
  | "Deploying"
  | "Running"
  | "Degraded"
  | "Migrating"
  | "Stopped"
  | "Failed";

export type ScoreFactor = {
  label: string;
  points: number;
  detail: string;
};

export type PlacementDecision = {
  id: string;
  workloadId: string;
  workloadName: string;
  selectedNodeId: string;
  selectedNodeName: string;
  score: number;
  factors: ScoreFactor[];
  rejected: { nodeId: string; nodeName: string; reason: string }[];
  createdAt: string;
  reasonSummary: string;
};

export type DomainEvent = {
  id: string;
  type: string;
  message: string;
  severity: "info" | "warning" | "critical";
  entityType?: string;
  entityId?: string;
  at: string;
  meta?: Record<string, string | number | boolean>;
};

export type Cluster = {
  id: string;
  name: string;
  provider: ClusterType;
  version: string;
  region: string;
  country: string;
  location: string;
  status: Health;
  mode: Mode;
  source: InfraSource;
  nodeIds: string[];
  labels: Record<string, string>;
  capabilities: string[];
  latencyMs: number;
  lastSyncAt?: string;
  connectionError?: string;
  cpuAllocatable?: string;
  memoryAllocatable?: string;
  gpuCount?: number;
  workloadCount?: number;
};

export type Node = {
  id: string;
  name: string;
  clusterId: string;
  siteId: string;
  region: string;
  status: Health;
  mode: Mode;
  source: InfraSource;
  cpuCores: number;
  cpuUsedPct: number;
  ramGi: number;
  ramUsedPct: number;
  gpuCount: number;
  gpuUsedPct: number;
  vramGi: number;
  vramUsedPct: number;
  storageUsedPct: number;
  accelerator?: string;
  rttMs: number;
  bandwidthGbps: number;
  packetLossPct: number;
  powerW: number;
  temperatureC: number;
  cordoned: boolean;
  drained: boolean;
  labels: Record<string, string>;
  taints: string[];
  agentStatus: "online" | "degraded" | "offline";
  architecture?: string;
  osImage?: string;
  kubeletVersion?: string;
  podCount?: number;
  allocatableCpu?: string;
  allocatableMemory?: string;
};

export type Site = {
  id: string;
  name: string;
  region: string;
  country: string;
  status: Health;
  clusterIds: string[];
};

export type Workload = {
  id: string;
  name: string;
  type: WorkloadType;
  status: WorkloadStatus;
  image: string;
  modelId?: string;
  clusterId?: string;
  nodeId?: string;
  source: InfraSource;
  namespace?: string;
  deploymentName?: string;
  podName?: string;
  restarts?: number;
  cpu: number;
  memoryGi: number;
  gpu: number;
  gpuMemoryGi: number;
  maxLatencyMs: number;
  minBandwidthMbps: number;
  region: string;
  allowedRegions: string[];
  availability: number;
  requestsPerSec: number;
  inferenceLatencyMs: number;
  networkLatencyMs: number;
  e2eLatencyMs: number;
  errorRatePct: number;
  version: string;
};

/** Provider-agnostic deploy intent (domain → adapter maps to K8s Deployment) */
export type WorkloadSpec = {
  name: string;
  type: WorkloadType;
  image: string;
  namespace?: string;
  replicas?: number;
  resources: {
    cpu: string;
    memory: string;
    gpu?: number;
  };
  network?: {
    maxLatencyMs?: number;
    minBandwidthMbps?: number;
  };
  placement?: {
    region?: string;
    preferredNodeName?: string;
  };
  labels?: Record<string, string>;
};

export type DeploymentResult = {
  workloadId: string;
  clusterId: string;
  namespace: string;
  deploymentName: string;
  status: WorkloadStatus;
  message: string;
};

export type ClusterConnection = {
  id: string;
  name: string;
  provider: "kubernetes" | "k3s" | "kubeedge";
  createdAt: string;
  lastSyncAt?: string;
  status: Mode;
  version?: string;
  error?: string;
  /** Server-side only path reference — never expose kubeconfig content */
  hasSecret: boolean;
};

export type Model = {
  id: string;
  name: string;
  version: string;
  runtime: string;
  architecture: string;
  sizeMb: number;
  sha256: string;
  gpuCompatible: boolean;
  status: "validated" | "deployed" | "archived";
  mode: Mode;
};

export type NetNodeKind = "ue" | "gnb" | "ovs" | "edge" | "gpu" | "workload";

export type TopologyNode = {
  id: string;
  kind: NetNodeKind;
  label: string;
  x: number;
  y: number;
  refId?: string;
  status: Health;
};

export type TopologyLink = {
  id: string;
  from: string;
  to: string;
  latencyMs: number;
  bandwidthGbps: number;
  utilizationPct: number;
  packetLossPct: number;
  congested: boolean;
};

export type NetworkPath = {
  id: string;
  ueId: string;
  workloadId: string;
  hops: string[];
  networkLatencyMs: number;
  inferenceLatencyMs: number;
  e2eLatencyMs: number;
  packetLossPct: number;
  bandwidthMbps: number;
};

export type Integration = {
  id: string;
  name: string;
  status: Mode;
  version: string;
  health: Health;
  capabilities: string[];
};

export type WorldSnapshot = {
  tenant: { id: string; name: string };
  role: string;
  mode: Mode;
  sites: Site[];
  clusters: Cluster[];
  nodes: Node[];
  workloads: Workload[];
  models: Model[];
  topology: { nodes: TopologyNode[]; links: TopologyLink[] };
  paths: NetworkPath[];
  decisions: PlacementDecision[];
  events: DomainEvent[];
  integrations: Integration[];
  metrics: {
    inferenceRps: number;
    avgLatencyMs: number;
    p95LatencyMs: number;
    gpuUtilPct: number;
    networkHealthPct: number;
    energyKw: number;
    activeMigrations: number;
    incidents: number;
  };
  simulation: {
    running: boolean;
    scenario: string | null;
    tick: number;
    seed: number;
  };
};
