import type { DomainEvent, WorldSnapshot } from "./types";
import { placeWorkload } from "./scheduler";

function pushEvent(
  world: WorldSnapshot,
  type: string,
  message: string,
  severity: DomainEvent["severity"] = "info",
) {
  world.events = [
    {
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      message,
      severity,
      at: new Date().toISOString(),
    },
    ...world.events,
  ].slice(0, 80);
}

/** Inject GPU saturation on EDGE-MAD-04 and degrade latency toward SLA breach */
export function injectGpuSaturation(world: WorldSnapshot): WorldSnapshot {
  const next = structuredClone(world);
  const node = next.nodes.find((n) => n.id === "node-mad-04");
  const wl = next.workloads.find((w) => w.id === "wl-traffic-vision");
  if (!node || !wl) return next;

  node.gpuUsedPct = 94;
  node.vramUsedPct = 91;
  node.temperatureC = 78;
  node.status = "DEGRADED";
  node.rttMs = 9.5;

  wl.status = "Degraded";
  wl.inferenceLatencyMs = 14.2;
  wl.networkLatencyMs = 8.8;
  wl.e2eLatencyMs = 23.0;
  wl.requestsPerSec = 2100;

  const link = next.topology.links.find((l) => l.id === "l3");
  if (link) {
    link.congested = true;
    link.utilizationPct = 91;
    link.latencyMs = 5.4;
    link.packetLossPct = 0.4;
  }

  next.metrics.avgLatencyMs = 23;
  next.metrics.p95LatencyMs = 31;
  next.metrics.gpuUtilPct = 94;
  next.metrics.incidents = 2;
  next.metrics.networkHealthPct = 78;
  next.simulation.scenario = "GPU Saturation";

  pushEvent(next, "NetworkCongestionDetected", "Path OVS-12→OVS-17 congested (91% util)", "warning");
  pushEvent(next, "SLABreachDetected", "traffic-vision E2E 23ms exceeds SLA 20ms", "critical");
  pushEvent(next, "WorkloadDegraded", "traffic-vision marked Degraded on EDGE-MAD-04", "warning");

  return next;
}

/** Run automatic migration EDGE-MAD-04 → EDGE-MAD-07 with SDN path update */
export function runAutoMigration(world: WorldSnapshot): WorldSnapshot {
  let next = structuredClone(world);
  const wl = next.workloads.find((w) => w.id === "wl-traffic-vision");
  if (!wl) return next;

  wl.status = "Migrating";
  next.metrics.activeMigrations = 1;
  pushEvent(next, "WorkloadMigrationStarted", "Migrating traffic-vision off EDGE-MAD-04", "warning");

  const decision = placeWorkload(next, wl.id);
  // Prefer mad-07 after saturating mad-04
  const target = next.nodes.find((n) => n.id === "node-mad-07") ?? next.nodes.find((n) => n.id === decision?.selectedNodeId);
  if (!target) return next;

  // Force score explanation for mad-07
  const forced = placeWorkload(
    {
      ...next,
      nodes: next.nodes.map((n) =>
        n.id === "node-mad-04" ? { ...n, gpuUsedPct: 96, status: "DEGRADED" as const } : n,
      ),
    },
    wl.id,
  );

  if (forced) {
    forced.selectedNodeId = target.id;
    forced.selectedNodeName = target.name;
    forced.reasonSummary =
      "GPU available · Latency 11ms · EU residency · Healthy network";
    forced.factors = [
      { label: "GPU available", points: 22, detail: `${100 - target.gpuUsedPct}% free` },
      { label: "Latency 11ms", points: 18, detail: "Under SLA 20ms" },
      { label: "EU residency", points: 10, detail: "Madrid / ES" },
      { label: "Healthy network", points: 8, detail: "Alternate path via OVS-21" },
      { label: "Avoid saturated node", points: 15, detail: "EDGE-MAD-04 GPU 94%" },
    ];
    forced.score = forced.factors.reduce((a, f) => a + f.points, 0);
    next.decisions = [forced, ...next.decisions].slice(0, 20);
  }

  wl.nodeId = target.id;
  wl.clusterId = target.clusterId;
  wl.status = "Running";
  wl.inferenceLatencyMs = 7.4;
  wl.networkLatencyMs = 3.6;
  wl.e2eLatencyMs = 11.0;
  wl.requestsPerSec = 1910;

  // Move workload topo node
  const topoWl = next.topology.nodes.find((n) => n.id === "topo-wl");
  if (topoWl) {
    topoWl.y = 280;
    topoWl.status = "HEALTHY";
  }
  // Reroute: remove gpu-a→wl, add gpu-b→wl; activate ovs3 path
  next.topology.links = next.topology.links.filter((l) => l.id !== "l9");
  next.topology.links.push({
    id: "l10",
    from: "topo-gpu-b",
    to: "topo-wl",
    latencyMs: 0.1,
    bandwidthGbps: 25,
    utilizationPct: 28,
    packetLossPct: 0.01,
    congested: false,
  });
  const l3 = next.topology.links.find((l) => l.id === "l3");
  if (l3) {
    l3.congested = false;
    l3.utilizationPct = 35;
    l3.latencyMs = 2.0;
  }
  const l4 = next.topology.links.find((l) => l.id === "l4");
  if (l4) l4.utilizationPct = 48;

  next.paths = [
    {
      id: "path-ue-tv",
      ueId: "UE-1042",
      workloadId: "wl-traffic-vision",
      hops: [
        "UE-1042",
        "gNB-03",
        "OVS-12",
        "OVS-21",
        "EDGE-MAD-07",
        "traffic-vision v1.4",
      ],
      networkLatencyMs: 3.6,
      inferenceLatencyMs: 7.4,
      e2eLatencyMs: 11.0,
      packetLossPct: 0.01,
      bandwidthMbps: 96,
    },
  ];

  next.metrics.activeMigrations = 0;
  next.metrics.avgLatencyMs = 11;
  next.metrics.p95LatencyMs = 15.2;
  next.metrics.gpuUtilPct = 41;
  next.metrics.networkHealthPct = 96;
  next.metrics.incidents = 1;
  next.simulation.scenario = "Automatic Workload Migration";

  pushEvent(next, "WorkloadMigrationCompleted", `traffic-vision now on ${target.name}`, "info");
  pushEvent(next, "RouteChanged", "SDN path updated: OVS-12 → OVS-21 → EDGE-MAD-07", "info");
  pushEvent(next, "SLABreachDetected", "E2E latency recovered to 11.0ms (SLA 20ms)", "info");

  return next;
}

export function injectCongestion(world: WorldSnapshot): WorldSnapshot {
  const next = structuredClone(world);
  for (const l of next.topology.links) {
    if (l.id === "l3" || l.id === "l5") {
      l.congested = true;
      l.utilizationPct = Math.min(98, l.utilizationPct + 40);
      l.latencyMs *= 2.2;
      l.packetLossPct = 0.35;
    }
  }
  const wl = next.workloads.find((w) => w.id === "wl-traffic-vision");
  if (wl) {
    wl.networkLatencyMs = 12.5;
    wl.e2eLatencyMs = wl.inferenceLatencyMs + wl.networkLatencyMs;
    if (wl.e2eLatencyMs > wl.maxLatencyMs) wl.status = "Degraded";
  }
  next.metrics.networkHealthPct = 72;
  next.metrics.avgLatencyMs = wl?.e2eLatencyMs ?? 22;
  next.simulation.scenario = "Network Congestion";
  pushEvent(next, "NetworkCongestionDetected", "Injected congestion on core OVS path", "warning");
  return next;
}

export function recoverInfrastructure(world: WorldSnapshot): WorldSnapshot {
  const next = structuredClone(world);
  for (const n of next.nodes) {
    if (n.id.startsWith("node-mad")) {
      n.status = "HEALTHY";
      n.gpuUsedPct = Math.min(n.gpuUsedPct, 55);
      n.temperatureC = Math.min(n.temperatureC, 62);
    }
  }
  for (const l of next.topology.links) {
    l.congested = false;
    l.packetLossPct = 0.01;
    l.utilizationPct = Math.min(l.utilizationPct, 45);
  }
  const wl = next.workloads.find((w) => w.id === "wl-traffic-vision");
  if (wl && wl.status === "Degraded") {
    wl.status = "Running";
    wl.e2eLatencyMs = Math.min(wl.e2eLatencyMs, 14);
  }
  next.metrics.networkHealthPct = 98;
  next.metrics.incidents = 0;
  next.simulation.scenario = "Normal Edge Network";
  pushEvent(next, "ClusterRegistered", "Infrastructure recovered — all Madrid links healthy");
  return next;
}

export function disableNode(world: WorldSnapshot, nodeId: string): WorldSnapshot {
  const next = structuredClone(world);
  const node = next.nodes.find((n) => n.id === nodeId);
  if (!node) return next;
  node.status = "OFFLINE";
  node.agentStatus = "offline";
  node.cordoned = true;
  pushEvent(next, "NodeOffline", `${node.name} disabled (simulation)`, "critical");
  return next;
}
