"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useControlPlane } from "@/components/control-plane/ControlPlaneProvider";
import { ModePill, PageHeader, StatusDot } from "@/components/control-plane/ui";

export default function ClusterDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { world } = useControlPlane();
  const cluster = world.clusters.find((c) => c.id === id);
  if (!cluster) {
    return <p className="text-[var(--cp-muted)]">Cluster not found.</p>;
  }
  const nodes = world.nodes.filter((n) => n.clusterId === cluster.id);
  const workloads = world.workloads.filter((w) => w.clusterId === cluster.id);

  return (
    <div>
      <PageHeader
        title={cluster.name}
        subtitle={`${cluster.provider} ${cluster.version} · ${cluster.location}`}
        actions={<ModePill mode={cluster.mode} />}
      />
      <div className="mb-4 flex flex-wrap gap-4 text-[12px]">
        <StatusDot status={cluster.status} />
        <span className="text-[var(--cp-muted)]">Latency {cluster.latencyMs}ms</span>
        <span className="text-[var(--cp-muted)]">
          Capabilities: {cluster.capabilities.join(", ")}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="cp-panel">
          <div className="border-b border-[var(--cp-border)] px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--cp-muted)]">
            Nodes
          </div>
          <ul className="divide-y divide-[var(--cp-border)]">
            {nodes.map((n) => (
              <li key={n.id} className="flex items-center justify-between px-3 py-2 text-[12px]">
                <Link
                  href={`/control-plane/nodes/${n.id}`}
                  className="text-[var(--cp-accent)] hover:underline"
                >
                  {n.name}
                </Link>
                <StatusDot status={n.status} />
              </li>
            ))}
          </ul>
        </div>
        <div className="cp-panel">
          <div className="border-b border-[var(--cp-border)] px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--cp-muted)]">
            Workloads
          </div>
          <ul className="divide-y divide-[var(--cp-border)]">
            {workloads.map((w) => (
              <li key={w.id} className="flex items-center justify-between px-3 py-2 text-[12px]">
                <Link
                  href={`/control-plane/workloads/${w.id}`}
                  className="text-[var(--cp-accent)] hover:underline"
                >
                  {w.name}
                </Link>
                <span className="text-[var(--cp-muted)]">{w.status}</span>
              </li>
            ))}
            {!workloads.length ? (
              <li className="px-3 py-3 text-[12px] text-[var(--cp-muted)]">No workloads</li>
            ) : null}
          </ul>
        </div>
      </div>
    </div>
  );
}
