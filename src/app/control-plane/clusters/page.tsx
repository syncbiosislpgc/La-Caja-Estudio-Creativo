"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useControlPlane } from "@/components/control-plane/ControlPlaneProvider";
import {
  CpButton,
  EntityCard,
  ModePill,
  PageHeader,
  SourceBadge,
  StatusDot,
} from "@/components/control-plane/ui";

type Filter = "ALL" | "REAL" | "SIMULATION";

export default function ClustersPage() {
  const { world, refresh } = useControlPlane();
  const [filter, setFilter] = useState<Filter>("ALL");

  const clusters = useMemo(() => {
    return world.clusters.filter((c) => {
      if (filter === "ALL") return true;
      if (filter === "REAL") return c.source !== "simulation";
      return c.source === "simulation";
    });
  }, [world.clusters, filter]);

  return (
    <div>
      <PageHeader
        title="Clusters"
        subtitle="Hybrid inventory · Simulation + Connected Kubernetes"
        actions={
          <>
            <ModePill mode="SIMULATION" />
            <CpButton onClick={() => void refresh()}>Sync</CpButton>
            <Link href="/control-plane/clusters/connect">
              <CpButton variant="accent">Connect Cluster</CpButton>
            </Link>
          </>
        }
      />

      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        {(["ALL", "REAL", "SIMULATION"] as const).map((f) => (
          <CpButton
            key={f}
            variant={filter === f ? "accent" : "default"}
            onClick={() => setFilter(f)}
            className="shrink-0"
          >
            {f}
          </CpButton>
        ))}
      </div>

      {/* Mobile cards */}
      <div className="grid gap-3 md:hidden">
        {clusters.map((c) => {
          const nodes = world.nodes.filter((n) => n.clusterId === c.id);
          const wls = world.workloads.filter((w) => w.clusterId === c.id);
          return (
            <EntityCard
              key={c.id}
              href={`/control-plane/clusters/${c.id}`}
              title={c.name}
              subtitle={c.connectionError ?? c.location}
              badge={<SourceBadge source={c.source} />}
              meta={[
                { label: "Provider", value: c.provider },
                { label: "Region", value: c.region },
                {
                  label: "Nodes",
                  value: String(c.nodeIds?.length || nodes.length),
                },
                {
                  label: "Workloads",
                  value: String(c.workloadCount ?? wls.length),
                },
              ]}
              footer={<StatusDot status={c.status} />}
            />
          );
        })}
      </div>

      {/* Desktop table */}
      <div className="cp-panel cp-hide-mobile overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-[12px]">
          <thead className="text-[10px] uppercase tracking-wider text-[var(--cp-muted)]">
            <tr className="border-b border-[var(--cp-border)]">
              {[
                "Cluster",
                "Source",
                "Type",
                "Region",
                "Nodes",
                "Workloads",
                "Version",
                "Health",
                "Last sync",
              ].map((h) => (
                <th key={h} className="px-3 py-2 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clusters.map((c) => {
              const nodes = world.nodes.filter((n) => n.clusterId === c.id);
              const wls = world.workloads.filter((w) => w.clusterId === c.id);
              return (
                <tr
                  key={c.id}
                  className="border-t border-[var(--cp-border)] hover:bg-white/[0.02]"
                >
                  <td className="px-3 py-2.5">
                    <Link
                      href={`/control-plane/clusters/${c.id}`}
                      className="font-medium text-[var(--cp-accent)] hover:underline"
                    >
                      {c.name}
                    </Link>
                    {c.connectionError ? (
                      <p className="text-[10px] text-[var(--cp-crit)]">
                        {c.connectionError}
                      </p>
                    ) : (
                      <p className="text-[10px] text-[var(--cp-muted)]">
                        {c.location}
                      </p>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <SourceBadge source={c.source} />
                  </td>
                  <td className="px-3 py-2.5 text-[var(--cp-muted)]">
                    {c.provider}
                  </td>
                  <td className="px-3 py-2.5">{c.region}</td>
                  <td className="cp-mono px-3 py-2.5">
                    {c.nodeIds?.length || nodes.length}
                  </td>
                  <td className="cp-mono px-3 py-2.5">
                    {c.workloadCount ?? wls.length}
                  </td>
                  <td className="cp-mono px-3 py-2.5 text-[10px]">{c.version}</td>
                  <td className="px-3 py-2.5">
                    <StatusDot status={c.status} />
                  </td>
                  <td className="cp-mono px-3 py-2.5 text-[10px] text-[var(--cp-muted)]">
                    {c.lastSyncAt
                      ? new Date(c.lastSyncAt).toLocaleTimeString()
                      : c.source === "simulation"
                        ? "live sim"
                        : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {world.sites.map((s) => (
          <div key={s.id} className="cp-panel cp-panel-hover p-3.5">
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
