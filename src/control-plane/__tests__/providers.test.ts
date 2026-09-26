import { describe, expect, it } from "vitest";
import { SimulationInfrastructureProvider } from "../infrastructure/simulation/simulation-provider";
import { parseCpu, parseMemoryGi } from "../infrastructure/kubernetes/kubernetes-provider";
import { scoreNode } from "../domain/scheduler";
import { createSeedWorld } from "../domain/seed";

describe("SimulationInfrastructureProvider", () => {
  it("discovers clusters and nodes", async () => {
    const p = new SimulationInfrastructureProvider();
    const clusters = await p.getClusters();
    expect(clusters.length).toBeGreaterThan(0);
    expect(clusters.every((c) => c.source === "simulation")).toBe(true);
    const nodes = await p.getNodes(clusters[0].id);
    expect(nodes.length).toBeGreaterThan(0);
  });

  it("deploys a simulated workload", async () => {
    const p = new SimulationInfrastructureProvider();
    const clusters = await p.getClusters();
    const result = await p.deployWorkload(clusters[0].id, {
      name: "unit-demo",
      type: "container",
      image: "nginx:alpine",
      resources: { cpu: "1", memory: "1Gi" },
    });
    expect(result.status).toBe("Running");
    const wl = await p.getWorkload(clusters[0].id, result.workloadId);
    expect(wl?.name).toBe("unit-demo");
  });

  it("deletes a simulated workload", async () => {
    const p = new SimulationInfrastructureProvider();
    const clusters = await p.getClusters();
    const result = await p.deployWorkload(clusters[0].id, {
      name: "to-delete",
      type: "container",
      image: "nginx:alpine",
      resources: { cpu: "1", memory: "512Mi" },
    });
    await p.deleteWorkload(clusters[0].id, result.workloadId);
    const wl = await p.getWorkload(clusters[0].id, result.workloadId);
    expect(wl).toBeNull();
  });
});

describe("scheduler scoring", () => {
  it("rejects nodes without GPU when required", () => {
    const world = createSeedWorld();
    const wl = world.workloads.find((w) => w.id === "wl-traffic-vision")!;
    const noGpu = world.nodes.find((n) => n.id === "node-mad-edge-02")!;
    const scored = scoreNode(wl, noGpu);
    expect(scored.rejectReason).toMatch(/GPU/i);
  });

  it("scores a healthy GPU node", () => {
    const world = createSeedWorld();
    const wl = world.workloads.find((w) => w.id === "wl-traffic-vision")!;
    const node = world.nodes.find((n) => n.id === "node-mad-04")!;
    const scored = scoreNode(wl, node);
    expect(scored.score).toBeGreaterThan(50);
    expect(scored.factors.length).toBeGreaterThan(0);
  });
});

describe("k8s mappers helpers", () => {
  it("parses cpu and memory", () => {
    expect(parseCpu("500m")).toBeCloseTo(0.5);
    expect(parseCpu("2")).toBe(2);
    expect(parseMemoryGi("1024Mi")).toBeCloseTo(1);
    expect(parseMemoryGi("2Gi")).toBe(2);
  });
});
