"use client";

import { useParams } from "next/navigation";
import { useControlPlane } from "@/components/control-plane/ControlPlaneProvider";
import {
  CpButton,
  MetricTile,
  ModePill,
  PageHeader,
  SourceBadge,
  StatusDot,
} from "@/components/control-plane/ui";

export default function NodeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const decoded = decodeURIComponent(id);
  const { world, takeNodeOffline } = useControlPlane();
  const node = world.nodes.find((n) => n.id === decoded);
  if (!node) return <p className="text-[var(--cp-muted)]">Node not found.</p>;
  const workloads = world.workloads.filter((w) => w.nodeId === node.id);
  const cluster = world.clusters.find((c) => c.id === node.clusterId);
  const real = node.source !== "simulation";

  return (
    <div>
      <PageHeader
        title={node.name}
        subtitle={`${cluster?.name ?? "—"} · ${node.region}`}
        actions={
          <>
            <SourceBadge source={node.source} />
            <ModePill mode={node.mode} />
            {!real ? (
              <CpButton variant="danger" onClick={() => takeNodeOffline(node.id)}>
                Disable (sim)
              </CpButton>
            ) : null}
          </>
        }
      />
      <StatusDot status={node.status} />

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {real ? (
          <>
            <MetricTile
              label="CPU capacity"
              value={`${node.cpuCores}`}
              hint={`allocatable ${node.allocatableCpu || "—"}`}
            />
            <MetricTile
              label="Memory"
              value={`${node.ramGi.toFixed(1)}Gi`}
              hint={`allocatable ${node.allocatableMemory || "—"}`}
            />
            <MetricTile label="GPU" value={String(node.gpuCount)} />
            <MetricTile label="Pods" value={String(node.podCount ?? 0)} />
            <MetricTile label="Arch" value={node.architecture ?? "—"} />
            <MetricTile label="OS" value={node.osImage ?? "—"} />
            <MetricTile label="Kubelet" value={node.kubeletVersion ?? "—"} />
            <MetricTile
              label="Telemetry"
              value="K8s API"
              hint="Advanced metrics: Not configured"
            />
          </>
        ) : (
          <>
            <MetricTile label="CPU" value={`${node.cpuUsedPct}%`} hint={`${node.cpuCores} cores`} />
            <MetricTile label="Memory" value={`${node.ramUsedPct}%`} hint={`${node.ramGi} Gi`} />
            <MetricTile
              label="GPU"
              value={node.gpuCount ? `${node.gpuUsedPct}%` : "n/a"}
              hint={node.accelerator}
              warn={node.gpuUsedPct > 90}
            />
            <MetricTile label="VRAM" value={node.gpuCount ? `${node.vramUsedPct}%` : "n/a"} />
            <MetricTile label="RTT" value={`${node.rttMs.toFixed(1)}ms`} />
            <MetricTile label="Bandwidth" value={`${node.bandwidthGbps} Gbps`} />
            <MetricTile label="Loss" value={`${node.packetLossPct}%`} />
            <MetricTile label="Power / Temp" value={`${node.powerW}W / ${node.temperatureC}°C`} />
          </>
        )}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="cp-panel p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--cp-muted)]">
            Workloads on node
          </p>
          <ul className="mt-3 space-y-2 text-[12px]">
            {workloads.map((w) => (
              <li
                key={w.id}
                className="flex justify-between border-t border-[var(--cp-border)] pt-2"
              >
                <span>{w.name}</span>
                <span className="text-[var(--cp-muted)]">{w.status}</span>
              </li>
            ))}
            {!workloads.length ? (
              <li className="text-[var(--cp-muted)]">No workloads scheduled</li>
            ) : null}
          </ul>
        </div>
        <div className="cp-panel p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--cp-muted)]">
            Labels / taints
          </p>
          <pre className="mt-3 max-h-48 overflow-auto text-[10px] text-[var(--cp-muted)]">
            {JSON.stringify({ labels: node.labels, taints: node.taints }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
