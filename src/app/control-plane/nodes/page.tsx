"use client";

import Link from "next/link";
import { useControlPlane } from "@/components/control-plane/ControlPlaneProvider";
import {
  EntityCard,
  ModePill,
  PageHeader,
  SourceBadge,
  StatusDot,
} from "@/components/control-plane/ui";

export default function NodesPage() {
  const { world, telemetryNote } = useControlPlane();
  return (
    <div>
      <PageHeader
        title="Nodes"
        subtitle="Hybrid node inventory · REAL from Kubernetes API · SIMULATED from lab"
        actions={<ModePill mode="SIMULATION" />}
      />
      {telemetryNote ? (
        <p className="mb-3 rounded-[var(--cp-radius)] border border-[var(--cp-border)] bg-[var(--cp-panel)]/60 px-3 py-2 text-[11px] text-[var(--cp-muted)]">
          {telemetryNote}
        </p>
      ) : null}

      <div className="grid gap-3 md:hidden">
        {world.nodes.map((n) => {
          const cluster = world.clusters.find((c) => c.id === n.clusterId);
          const real = n.source !== "simulation";
          return (
            <EntityCard
              key={n.id}
              href={`/control-plane/nodes/${encodeURIComponent(n.id)}`}
              title={n.name}
              subtitle={n.accelerator ?? n.osImage ?? cluster?.name}
              badge={<SourceBadge source={n.source} />}
              meta={[
                {
                  label: "CPU",
                  value: real
                    ? `${n.cpuCores} / ${n.allocatableCpu || "—"}`
                    : `${n.cpuUsedPct}%`,
                },
                {
                  label: "RAM",
                  value: real ? `${n.ramGi.toFixed(0)}Gi` : `${n.ramUsedPct}%`,
                },
                {
                  label: "GPU",
                  value: n.gpuCount ? String(n.gpuCount) : "—",
                },
                { label: "Pods", value: String(n.podCount ?? "—") },
              ]}
              footer={<StatusDot status={n.status} />}
            />
          );
        })}
      </div>

      <div className="cp-panel cp-hide-mobile overflow-x-auto">
        <table className="w-full min-w-[1100px] text-left text-[12px]">
          <thead className="text-[10px] uppercase tracking-wider text-[var(--cp-muted)]">
            <tr className="border-b border-[var(--cp-border)]">
              {[
                "Node",
                "Source",
                "Cluster",
                "CPU",
                "RAM",
                "GPU",
                "Pods",
                "Arch",
                "Agent",
                "Health",
              ].map((h) => (
                <th key={h} className="px-3 py-2 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {world.nodes.map((n) => {
              const cluster = world.clusters.find((c) => c.id === n.clusterId);
              const real = n.source !== "simulation";
              return (
                <tr
                  key={n.id}
                  className="border-t border-[var(--cp-border)] hover:bg-white/[0.02]"
                >
                  <td className="px-3 py-2">
                    <Link
                      href={`/control-plane/nodes/${encodeURIComponent(n.id)}`}
                      className="font-medium text-[var(--cp-accent)] hover:underline"
                    >
                      {n.name}
                    </Link>
                    <p className="text-[10px] text-[var(--cp-muted)]">
                      {n.accelerator ?? n.osImage ?? "—"}
                    </p>
                  </td>
                  <td className="px-3 py-2">
                    <SourceBadge source={n.source} />
                  </td>
                  <td className="px-3 py-2 text-[var(--cp-muted)]">
                    {cluster?.name}
                  </td>
                  <td className="cp-mono px-3 py-2">
                    {real
                      ? `${n.cpuCores} / ${n.allocatableCpu || "—"}`
                      : `${n.cpuUsedPct}%`}
                  </td>
                  <td className="cp-mono px-3 py-2">
                    {real ? `${n.ramGi.toFixed(0)}Gi` : `${n.ramUsedPct}%`}
                  </td>
                  <td className="cp-mono px-3 py-2">{n.gpuCount || "—"}</td>
                  <td className="cp-mono px-3 py-2">{n.podCount ?? "—"}</td>
                  <td className="px-3 py-2 text-[var(--cp-muted)]">
                    {n.architecture ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-[var(--cp-muted)]">
                    {n.agentStatus ?? "—"}
                  </td>
                  <td className="px-3 py-2">
                    <StatusDot status={n.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
