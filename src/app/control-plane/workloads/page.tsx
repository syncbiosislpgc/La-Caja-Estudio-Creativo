"use client";

import Link from "next/link";
import { useControlPlane } from "@/components/control-plane/ControlPlaneProvider";
import { ModePill, PageHeader, SourceBadge } from "@/components/control-plane/ui";

export default function WorkloadsPage() {
  const { world } = useControlPlane();
  return (
    <div>
      <PageHeader
        title="Workloads"
        subtitle="SIMULATED lab workloads + REAL Deployments from connected clusters"
        actions={<ModePill mode="SIMULATION" />}
      />
      <div className="cp-panel overflow-x-auto">
        <table className="w-full min-w-[1000px] text-left text-[12px]">
          <thead className="text-[10px] uppercase tracking-wider text-[var(--cp-muted)]">
            <tr className="border-b border-[var(--cp-border)]">
              {[
                "Workload",
                "Source",
                "Type",
                "Status",
                "Namespace",
                "Node",
                "E2E / Restarts",
              ].map((h) => (
                <th key={h} className="px-3 py-2 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {world.workloads.map((w) => {
              const node = world.nodes.find((n) => n.id === w.nodeId);
              const real = w.source !== "simulation";
              const breach = !real && w.e2eLatencyMs > w.maxLatencyMs;
              return (
                <tr key={w.id} className="border-t border-[var(--cp-border)]">
                  <td className="px-3 py-2">
                    <Link
                      href={`/control-plane/workloads/${encodeURIComponent(w.id)}`}
                      className="font-medium text-[var(--cp-accent)] hover:underline"
                    >
                      {w.name}
                    </Link>
                    <p className="text-[10px] text-[var(--cp-muted)]">{w.image}</p>
                  </td>
                  <td className="px-3 py-2">
                    <SourceBadge source={w.source} />
                  </td>
                  <td className="px-3 py-2 text-[var(--cp-muted)]">{w.type}</td>
                  <td className="px-3 py-2">{w.status}</td>
                  <td className="px-3 py-2 text-[var(--cp-muted)]">
                    {w.namespace ?? "—"}
                  </td>
                  <td className="px-3 py-2">{node?.name ?? "—"}</td>
                  <td
                    className={`cp-mono px-3 py-2 ${breach ? "text-[var(--cp-crit)]" : ""}`}
                  >
                    {real
                      ? `${w.restarts ?? 0} restarts`
                      : `${w.e2eLatencyMs.toFixed(1)}ms`}
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
