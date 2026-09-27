"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useControlPlane } from "@/components/control-plane/ControlPlaneProvider";
import {
  CpButton,
  MetricTile,
  ModePill,
  PageHeader,
  SourceBadge,
} from "@/components/control-plane/ui";

export default function WorkloadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const decoded = decodeURIComponent(id);
  const { world, migrate, injectGpuSat, refresh } = useControlPlane();
  const wl = world.workloads.find((w) => w.id === decoded);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (!wl) return <p className="text-[var(--cp-muted)]">Workload not found.</p>;
  const node = world.nodes.find((n) => n.id === wl.nodeId);
  const model = world.models.find((m) => m.id === wl.modelId);
  const path = world.paths.find((p) => p.workloadId === wl.id);
  const decision = world.decisions.find((d) => d.workloadId === wl.id);
  const real = wl.source !== "simulation";
  const clusterId = wl.clusterId ?? decoded.split(":")[0];

  async function action(kind: "restart" | "stop" | "delete") {
    setBusy(true);
    setMsg(null);
    try {
      const url = `/api/control-plane/workloads/${encodeURIComponent(wl!.id)}?cluster=${clusterId}`;
      if (kind === "delete") {
        const res = await fetch(url, { method: "DELETE" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Delete failed");
        setMsg("Deleted from Kubernetes");
      } else {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: kind }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Action failed");
        setMsg(`${kind} requested`);
      }
      await refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        title={wl.name}
        subtitle={`${wl.type} · ${wl.image}`}
        actions={
          <>
            <SourceBadge source={wl.source} />
            <ModePill mode={real ? "CONNECTED" : "SIMULATION"} />
            {real ? (
              <>
                <CpButton disabled={busy} onClick={() => void action("restart")}>
                  Restart
                </CpButton>
                <CpButton disabled={busy} onClick={() => void action("stop")}>
                  Stop
                </CpButton>
                <CpButton
                  variant="danger"
                  disabled={busy}
                  onClick={() => void action("delete")}
                >
                  Delete
                </CpButton>
              </>
            ) : (
              <>
                <CpButton onClick={injectGpuSat}>Simulate saturation</CpButton>
                <CpButton variant="accent" onClick={migrate}>
                  Migrate now
                </CpButton>
              </>
            )}
          </>
        }
      />
      {msg ? <p className="mb-3 text-[12px] text-[var(--cp-accent)]">{msg}</p> : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile label="Status" value={wl.status} />
        <MetricTile label="Node" value={node?.name ?? "—"} />
        <MetricTile label="Namespace" value={wl.namespace ?? "—"} />
        <MetricTile label="Pod" value={wl.podName ?? "—"} />
        {real ? (
          <>
            <MetricTile label="Deployment" value={wl.deploymentName ?? "—"} />
            <MetricTile label="Restarts" value={String(wl.restarts ?? 0)} />
            <MetricTile label="CPU req" value={String(wl.cpu)} />
            <MetricTile label="Memory req Gi" value={String(wl.memoryGi)} />
          </>
        ) : (
          <>
            <MetricTile
              label="E2E latency"
              value={`${wl.e2eLatencyMs.toFixed(1)}ms`}
              warn={wl.e2eLatencyMs > wl.maxLatencyMs}
              hint={`SLA < ${wl.maxLatencyMs}ms`}
            />
            <MetricTile label="Requests/sec" value={String(wl.requestsPerSec)} />
            <MetricTile
              label="Inference"
              value={`${wl.inferenceLatencyMs.toFixed(1)}ms`}
            />
            <MetricTile
              label="Model"
              value={model ? `${model.name} v${model.version}` : "—"}
            />
          </>
        )}
      </div>

      {!real && path ? (
        <div className="cp-panel mt-4 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--cp-muted)]">
            End-to-end network trace
          </p>
          <p className="cp-mono mt-3 text-[13px] text-[var(--cp-cyan)]">
            {path.hops.join("  ↓  ")}
          </p>
        </div>
      ) : null}

      {!real && decision ? (
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
