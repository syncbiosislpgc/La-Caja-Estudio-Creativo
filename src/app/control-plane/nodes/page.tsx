"use client";

import Link from "next/link";
import { useControlPlane } from "@/components/control-plane/ControlPlaneProvider";
import { ModePill, PageHeader, StatusDot } from "@/components/control-plane/ui";

export default function NodesPage() {
  const { world } = useControlPlane();
  return (
    <div>
      <PageHeader
        title="Nodes"
        subtitle="Per-node compute · GPU · network · agent health"
        actions={<ModePill mode="SIMULATION" />}
      />
      <div className="cp-panel overflow-x-auto">
        <table className="w-full min-w-[1100px] text-left text-[12px]">
          <thead className="text-[10px] uppercase tracking-wider text-[var(--cp-muted)]">
            <tr className="border-b border-[var(--cp-border)]">
              {["Node", "Cluster", "CPU", "RAM", "GPU", "VRAM", "RTT", "Power", "Temp", "Agent", "Health"].map(
                (h) => (
                  <th key={h} className="px-3 py-2 font-medium">
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {world.nodes.map((n) => {
              const cluster = world.clusters.find((c) => c.id === n.clusterId);
              return (
                <tr key={n.id} className="border-t border-[var(--cp-border)] hover:bg-white/[0.02]">
                  <td className="px-3 py-2">
                    <Link
                      href={`/control-plane/nodes/${n.id}`}
                      className="font-medium text-[var(--cp-accent)] hover:underline"
                    >
                      {n.name}
                    </Link>
                    <p className="text-[10px] text-[var(--cp-muted)]">
                      {n.accelerator ?? "no accelerator"}
                    </p>
                  </td>
                  <td className="px-3 py-2 text-[var(--cp-muted)]">{cluster?.name}</td>
                  <td className="cp-mono px-3 py-2">{n.cpuUsedPct}%</td>
                  <td className="cp-mono px-3 py-2">{n.ramUsedPct}%</td>
                  <td className="cp-mono px-3 py-2">
                    {n.gpuCount ? `${n.gpuUsedPct}%` : "—"}
                  </td>
                  <td className="cp-mono px-3 py-2">
                    {n.gpuCount ? `${n.vramUsedPct}%` : "—"}
                  </td>
                  <td className="cp-mono px-3 py-2">{n.rttMs.toFixed(1)}ms</td>
                  <td className="cp-mono px-3 py-2">{n.powerW}W</td>
                  <td className="cp-mono px-3 py-2">{n.temperatureC}°C</td>
                  <td className="px-3 py-2 text-[var(--cp-muted)]">{n.agentStatus}</td>
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
