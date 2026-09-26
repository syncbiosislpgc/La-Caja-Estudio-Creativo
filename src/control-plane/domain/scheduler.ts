import type {
  Node,
  PlacementDecision,
  ScoreFactor,
  Workload,
  WorldSnapshot,
} from "./types";

/** Network-aware placement scorer — always explainable */
export function scoreNode(workload: Workload, node: Node): {
  score: number;
  factors: ScoreFactor[];
  rejectReason?: string;
} {
  if (workload.gpu > 0 && node.gpuCount < workload.gpu) {
    return {
      score: 0,
      factors: [],
      rejectReason: "No GPU available on node",
    };
  }
  if (!workload.allowedRegions.includes(node.region)) {
    return {
      score: 0,
      factors: [],
      rejectReason: "Data residency violation",
    };
  }
  if (node.status === "OFFLINE" || node.cordoned) {
    return {
      score: 0,
      factors: [],
      rejectReason: node.cordoned ? "Node cordoned" : "Node offline",
    };
  }

  const factors: ScoreFactor[] = [];

  if (workload.gpu > 0) {
    factors.push({
      label: "GPU compatible",
      points: 25,
      detail: `${node.accelerator ?? "GPU"} matches requirement`,
    });
    const avail = Math.max(0, 100 - node.gpuUsedPct);
    const pts = Math.round((avail / 100) * 20);
    factors.push({
      label: "GPU availability",
      points: pts,
      detail: `${node.gpuUsedPct}% util`,
    });
  } else {
    factors.push({
      label: "CPU capacity",
      points: Math.round((100 - node.cpuUsedPct) / 5),
      detail: `${node.cpuUsedPct}% CPU used`,
    });
  }

  const latPts =
    node.rttMs <= workload.maxLatencyMs * 0.4
      ? 20
      : node.rttMs <= workload.maxLatencyMs * 0.7
        ? 12
        : node.rttMs <= workload.maxLatencyMs
          ? 6
          : 0;
  factors.push({
    label: `Latency ${node.rttMs.toFixed(1)}ms`,
    points: latPts,
    detail: `SLA max ${workload.maxLatencyMs}ms`,
  });

  const bwMbps = node.bandwidthGbps * 1000;
  factors.push({
    label: bwMbps >= workload.minBandwidthMbps ? "Bandwidth OK" : "Bandwidth low",
    points: bwMbps >= workload.minBandwidthMbps ? 10 : 2,
    detail: `${node.bandwidthGbps} Gbps`,
  });

  factors.push({
    label: "EU residency",
    points: node.region === "EU" ? 10 : 0,
    detail: node.region,
  });

  factors.push({
    label: node.status === "HEALTHY" ? "Healthy node" : "Node degraded",
    points: node.status === "HEALTHY" ? 8 : 2,
    detail: node.status,
  });

  factors.push({
    label: node.packetLossPct < 0.05 ? "Low congestion" : "Loss elevated",
    points: node.packetLossPct < 0.05 ? 5 : 1,
    detail: `${node.packetLossPct}% loss`,
  });

  factors.push({
    label: "Energy efficiency",
    points: node.powerW < 200 ? 3 : 1,
    detail: `${node.powerW}W`,
  });

  const score = factors.reduce((a, f) => a + f.points, 0);
  return { score, factors };
}

export function placeWorkload(
  world: WorldSnapshot,
  workloadId: string,
): PlacementDecision | null {
  const wl = world.workloads.find((w) => w.id === workloadId);
  if (!wl) return null;

  const candidates = world.nodes.map((n) => ({
    node: n,
    ...scoreNode(wl, n),
  }));

  const valid = candidates
    .filter((c) => !c.rejectReason)
    .sort((a, b) => b.score - a.score);
  const best = valid[0];
  if (!best) return null;

  return {
    id: `dec-${Date.now()}`,
    workloadId: wl.id,
    workloadName: wl.name,
    selectedNodeId: best.node.id,
    selectedNodeName: best.node.name,
    score: best.score,
    factors: best.factors,
    rejected: candidates
      .filter((c) => c.rejectReason || c.node.id !== best.node.id)
      .slice(0, 6)
      .map((c) => ({
        nodeId: c.node.id,
        nodeName: c.node.name,
        reason: c.rejectReason ?? `Lower score (${c.score})`,
      })),
    createdAt: new Date().toISOString(),
    reasonSummary: best.factors
      .slice(0, 3)
      .map((f) => f.label)
      .join(" · "),
  };
}
