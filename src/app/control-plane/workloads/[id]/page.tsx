"use client";

import { useParams } from "next/navigation";
import { useControlPlane } from "@/components/control-plane/ControlPlaneProvider";
import {
  CpButton,
  MetricTile,
  ModePill,
  PageHeader,
} from "@/components/control-plane/ui";

export default function WorkloadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { world, migrate, injectGpuSat } = useControlPlane();
  const wl = world.workloads.find((w) => w.id === id);
  if (!wl) return <p className="text-[var(--cp-muted)]">Workload not found.</p>;
  const node = world.nodes.find((n) => n.id === wl.nodeId);
  const model = world.models.find((m) => m.id === wl.modelId);
  const path = world.paths.find((p) => p.workloadId === wl.id);
  const decision = world.decisions.find((d) => d.workloadId === wl.id);

  return (
    <div>
      <PageHeader
        title={wl.name}
        subtitle={`${wl.type} · ${wl.image}`}
        actions={
          <>
            <ModePill mode="SIMULATION" />
            <CpButton onClick={injectGpuSat}>Simulate saturation</CpButton>
            <CpButton variant="accent" onClick={migrate}>
              Migrate now
            </CpButton>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile label="Status" value={wl.status} />
        <MetricTile label="Node" value={node?.name ?? "—"} />
        <MetricTile
          label="E2E latency"
          value={`${wl.e2eLatencyMs.toFixed(1)}ms`}
          warn={wl.e2eLatencyMs > wl.maxLatencyMs}
          hint={`SLA < ${wl.maxLatencyMs}ms`}
        />
        <MetricTile label="Requests/sec" value={String(wl.requestsPerSec)} />
        <MetricTile label="Inference" value={`${wl.inferenceLatencyMs.toFixed(1)}ms`} />
        <MetricTile label="Network" value={`${wl.networkLatencyMs.toFixed(1)}ms`} />
        <MetricTile label="Model" value={model ? `${model.name} v${model.version}` : "—"} />
        <MetricTile label="GPU req" value={String(wl.gpu)} />
      </div>

      {path ? (
        <div className="cp-panel mt-4 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--cp-muted)]">
            End-to-end network trace
          </p>
          <p className="cp-mono mt-3 text-[13px] text-[var(--cp-cyan)]">
            {path.hops.join("  ↓  ")}
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-4 text-[12px]">
            <p>
              Network: <span className="cp-mono">{path.networkLatencyMs}ms</span>
            </p>
            <p>
              Inference: <span className="cp-mono">{path.inferenceLatencyMs}ms</span>
            </p>
            <p>
              Total E2E: <span className="cp-mono">{path.e2eLatencyMs}ms</span>
            </p>
            <p>
              Loss / BW:{" "}
              <span className="cp-mono">
                {path.packetLossPct}% / {path.bandwidthMbps}Mbps
              </span>
            </p>
          </div>
        </div>
      ) : null}

      {decision ? (
        <div className="cp-panel mt-4 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--cp-muted)]">
            Why this node? · {decision.selectedNodeName} · score {decision.score}
          </p>
          <ul className="mt-3 space-y-1.5">
            {decision.factors.map((f) => (
              <li
                key={f.label}
                className="flex justify-between gap-4 border-t border-[var(--cp-border)] pt-1.5 text-[12px]"
              >
                <span>
                  {f.label}
                  <span className="ml-2 text-[var(--cp-muted)]">{f.detail}</span>
                </span>
                <span className="cp-mono text-[var(--cp-accent)]">+{f.points}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
