"use client";

import Link from "next/link";
import { EventFeed, TopologyCanvas } from "@/components/control-plane/Topology";
import { useControlPlane } from "@/components/control-plane/ControlPlaneProvider";
import { CpButton, MetricTile, ModePill, PageHeader, StatusDot } from "@/components/control-plane/ui";

export default function ControlPlaneOverviewPage() {
  const { world, runDemoMigration, demoRunning } = useControlPlane();
  const m = world.metrics;

  return (
    <div>
      <PageHeader
        title="NOC Overview"
        subtitle="Global state of compute · AI · network · edge"
        actions={
          <>
            <ModePill mode={world.mode} />
            <CpButton
              variant="accent"
              disabled={demoRunning}
              onClick={() => void runDemoMigration()}
            >
              {demoRunning ? "Running demo…" : "Run migration demo"}
            </CpButton>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4 xl:grid-cols-8">
        <MetricTile label="Clusters" value={String(world.clusters.length)} />
        <MetricTile label="Sites" value={String(world.sites.length)} />
        <MetricTile label="Nodes" value={String(world.nodes.length)} />
        <MetricTile
          label="GPUs"
          value={String(world.nodes.reduce((a, n) => a + n.gpuCount, 0))}
        />
        <MetricTile label="Workloads" value={String(world.workloads.length)} />
        <MetricTile
          label="Inference RPS"
          value={m.inferenceRps.toLocaleString()}
          hint="source: simulator"
        />
        <MetricTile
          label="Avg / p95 lat"
          value={`${m.avgLatencyMs.toFixed(1)} / ${m.p95LatencyMs.toFixed(1)}ms`}
          warn={m.avgLatencyMs > 20}
        />
        <MetricTile
          label="GPU util"
          value={`${m.gpuUtilPct}%`}
          warn={m.gpuUtilPct > 90}
        />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3">
        <MetricTile label="Network health" value={`${m.networkHealthPct}%`} />
        <MetricTile label="Energy est." value={`${m.energyKw} kW`} hint="SIMULATED" />
        <MetricTile
          label="Incidents / migrations"
          value={`${m.incidents} / ${m.activeMigrations}`}
          warn={m.incidents > 1}
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <TopologyCanvas />
        </div>
        <EventFeed />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="cp-panel overflow-hidden">
          <div className="border-b border-[var(--cp-border)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--cp-muted)]">
            Clusters
          </div>
          <ul className="divide-y divide-[var(--cp-border)] md:hidden">
            {world.clusters.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-2 px-3 py-3">
                <div className="min-w-0">
                  <Link
                    href={`/control-plane/clusters/${c.id}`}
                    className="block truncate font-medium text-[var(--cp-accent)]"
                  >
                    {c.name}
                  </Link>
                  <p className="text-[11px] text-[var(--cp-muted)]">{c.provider}</p>
                </div>
                <div className="shrink-0 text-right">
                  <StatusDot status={c.status} />
                  <p className="cp-mono mt-1 text-[11px] text-[var(--cp-muted)]">
                    {c.latencyMs}ms
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <table className="cp-hide-mobile w-full text-left text-[12px]">
            <thead className="text-[10px] uppercase tracking-wider text-[var(--cp-muted)]">
              <tr>
                <th className="px-3 py-2 font-medium">Cluster</th>
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium">Health</th>
                <th className="px-3 py-2 font-medium">Lat</th>
              </tr>
            </thead>
            <tbody>
              {world.clusters.map((c) => (
                <tr key={c.id} className="border-t border-[var(--cp-border)]">
                  <td className="px-3 py-2">
                    <Link
                      href={`/control-plane/clusters/${c.id}`}
                      className="text-[var(--cp-accent)] hover:underline"
                    >
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-[var(--cp-muted)]">{c.provider}</td>
                  <td className="px-3 py-2">
                    <StatusDot status={c.status} />
                  </td>
                  <td className="cp-mono px-3 py-2">{c.latencyMs}ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="cp-panel">
          <div className="border-b border-[var(--cp-border)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--cp-muted)]">
            Scheduler decisions
          </div>
          <ul className="divide-y divide-[var(--cp-border)]">
            {world.decisions.slice(0, 4).map((d) => (
              <li key={d.id} className="px-3 py-2">
                <Link
                  href="/control-plane/scheduler"
                  className="text-[12px] font-medium text-[var(--cp-text)] hover:text-[var(--cp-accent)]"
                >
                  {d.workloadName} → {d.selectedNodeName}
                </Link>
                <p className="cp-mono mt-0.5 text-[11px] text-[var(--cp-muted)]">
                  score {d.score} · {d.reasonSummary}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
