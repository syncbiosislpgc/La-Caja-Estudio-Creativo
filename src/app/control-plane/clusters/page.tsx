"use client";

import Link from "next/link";
import { useControlPlane } from "@/components/control-plane/ControlPlaneProvider";
import { ModePill, PageHeader, StatusDot } from "@/components/control-plane/ui";

export default function ClustersPage() {
  const { world } = useControlPlane();

  return (
    <div>
      <PageHeader
        title="Clusters"
        subtitle="Multi-cluster abstraction · Kubernetes / K3s / KubeEdge adapters"
        actions={<ModePill mode="SIMULATION" />}
      />
      <div className="cp-panel overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-[12px]">
          <thead className="text-[10px] uppercase tracking-wider text-[var(--cp-muted)]">
            <tr className="border-b border-[var(--cp-border)]">
              {[
                "Cluster",
                "Type",
                "Region",
                "Nodes",
                "CPU free*",
                "RAM free*",
                "GPU",
                "Workloads",
                "Latency",
                "Health",
              ].map((h) => (
                <th key={h} className="px-3 py-2 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {world.clusters.map((c) => {
              const nodes = world.nodes.filter((n) => n.clusterId === c.id);
              const wls = world.workloads.filter((w) => w.clusterId === c.id);
              const cpuFree = nodes.length
                ? Math.round(
                    nodes.reduce((a, n) => a + (100 - n.cpuUsedPct), 0) /
                      nodes.length,
                  )
                : 0;
              const ramFree = nodes.length
                ? Math.round(
                    nodes.reduce((a, n) => a + (100 - n.ramUsedPct), 0) /
                      nodes.length,
                  )
                : 0;
              const gpus = nodes.reduce((a, n) => a + n.gpuCount, 0);
              return (
                <tr key={c.id} className="border-t border-[var(--cp-border)] hover:bg-white/[0.02]">
                  <td className="px-3 py-2.5">
                    <Link
                      href={`/control-plane/clusters/${c.id}`}
                      className="font-medium text-[var(--cp-accent)] hover:underline"
                    >
                      {c.name}
                    </Link>
                    <p className="text-[10px] text-[var(--cp-muted)]">{c.location}</p>
                  </td>
                  <td className="px-3 py-2.5 text-[var(--cp-muted)]">{c.provider}</td>
                  <td className="px-3 py-2.5">{c.region}</td>
                  <td className="cp-mono px-3 py-2.5">{nodes.length}</td>
                  <td className="cp-mono px-3 py-2.5">{cpuFree}%</td>
                  <td className="cp-mono px-3 py-2.5">{ramFree}%</td>
                  <td className="cp-mono px-3 py-2.5">{gpus}</td>
                  <td className="cp-mono px-3 py-2.5">{wls.length}</td>
                  <td className="cp-mono px-3 py-2.5">{c.latencyMs}ms</td>
                  <td className="px-3 py-2.5">
                    <StatusDot status={c.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="border-t border-[var(--cp-border)] px-3 py-2 text-[10px] text-[var(--cp-muted)]">
          * CPU/RAM free = average headroom across nodes · source: simulation telemetry
        </p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {world.sites.map((s) => (
          <div key={s.id} className="cp-panel p-3">
            <p className="text-[10px] uppercase tracking-wider text-[var(--cp-muted)]">
              Edge site
            </p>
            <p className="mt-1 font-semibold">{s.name}</p>
            <p className="text-[11px] text-[var(--cp-muted)]">
              {s.country} · {s.region}
            </p>
            <div className="mt-2">
              <StatusDot status={s.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
