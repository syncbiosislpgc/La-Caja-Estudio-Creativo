"use client";

import { useParams } from "next/navigation";
import { useControlPlane } from "@/components/control-plane/ControlPlaneProvider";
import {
  CpButton,
  MetricTile,
  ModePill,
  PageHeader,
  StatusDot,
} from "@/components/control-plane/ui";

export default function NodeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { world, takeNodeOffline } = useControlPlane();
  const node = world.nodes.find((n) => n.id === id);
  if (!node) return <p className="text-[var(--cp-muted)]">Node not found.</p>;
  const workloads = world.workloads.filter((w) => w.nodeId === node.id);
  const cluster = world.clusters.find((c) => c.id === node.clusterId);

  return (
    <div>
      <PageHeader
        title={node.name}
        subtitle={`${cluster?.name ?? "—"} · ${node.region}`}
        actions={
          <>
            <ModePill mode={node.mode} />
            <CpButton variant="danger" onClick={() => takeNodeOffline(node.id)}>
              Disable (sim)
            </CpButton>
          </>
        }
      />
      <StatusDot status={node.status} />

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="cp-panel p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--cp-muted)]">
            Workloads on node
          </p>
          <ul className="mt-3 space-y-2 text-[12px]">
            {workloads.map((w) => (
              <li key={w.id} className="flex justify-between border-t border-[var(--cp-border)] pt-2">
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
            Agent / Kubernetes
          </p>
          <dl className="mt-3 space-y-2 text-[12px]">
            <div className="flex justify-between">
              <dt className="text-[var(--cp-muted)]">Agent</dt>
              <dd>{node.agentStatus}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--cp-muted)]">Cordoned</dt>
              <dd>{node.cordoned ? "yes" : "no"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--cp-muted)]">Drained</dt>
              <dd>{node.drained ? "yes" : "no"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[var(--cp-muted)]">Taints</dt>
              <dd>{node.taints.length ? node.taints.join(", ") : "none"}</dd>
            </div>
          </dl>
          <p className="mt-4 text-[10px] text-amber-300">
            Actions (drain/cordon/restart) mutate simulation state + emit events.
          </p>
        </div>
      </div>
    </div>
  );
}
