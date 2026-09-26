"use client";

import { EventFeed } from "@/components/control-plane/Topology";
import { useControlPlane } from "@/components/control-plane/ControlPlaneProvider";
import { MetricTile, ModePill, PageHeader } from "@/components/control-plane/ui";

export default function ObservabilityPage() {
  const { world } = useControlPlane();
  const m = world.metrics;
  return (
    <div>
      <PageHeader
        title="Observability"
        subtitle="OpenTelemetry / Prometheus compatible model · SIMULATED metrics"
        actions={<ModePill mode="SIMULATION" />}
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile label="Inference RPS" value={m.inferenceRps.toLocaleString()} />
        <MetricTile label="Avg latency" value={`${m.avgLatencyMs}ms`} />
        <MetricTile label="p95 latency" value={`${m.p95LatencyMs}ms`} />
        <MetricTile label="GPU util" value={`${m.gpuUtilPct}%`} />
        <MetricTile label="Network health" value={`${m.networkHealthPct}%`} />
        <MetricTile label="Energy" value={`${m.energyKw} kW`} />
        <MetricTile label="Migrations" value={String(m.activeMigrations)} />
        <MetricTile label="Incidents" value={String(m.incidents)} />
      </div>
      <div className="mt-4">
        <EventFeed limit={20} />
      </div>
    </div>
  );
}
