"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useControlPlane } from "@/components/control-plane/ControlPlaneProvider";
import {
  CpButton,
  ModePill,
  PageHeader,
  SourceBadge,
  StatusDot,
} from "@/components/control-plane/ui";

export default function ClusterDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { world, refresh } = useControlPlane();
  const cluster = world.clusters.find((c) => c.id === id);
  const [deploying, setDeploying] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [image, setImage] = useState("nginx:1.27-alpine");
  const [wlName, setWlName] = useState("traffic-demo");

  if (!cluster) {
    return <p className="text-[var(--cp-muted)]">Cluster not found.</p>;
  }
  const nodes = world.nodes.filter((n) => n.clusterId === cluster.id);
  const workloads = world.workloads.filter((w) => w.clusterId === cluster.id);
  const real = cluster.source !== "simulation";

  async function disconnect() {
    if (!real) return;
    await fetch(`/api/control-plane/clusters/${cluster!.id}`, { method: "DELETE" });
    await refresh();
    router.push("/control-plane/clusters");
  }

  async function deploy() {
    setDeploying(true);
    setMsg(null);
    try {
      const res = await fetch(
        `/api/control-plane/clusters/${cluster!.id}/workloads`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: wlName,
            type: "container",
            image,
            namespace: "control-plane-demo",
            resources: { cpu: "100m", memory: "128Mi", gpu: 0 },
            network: { maxLatencyMs: 50, minBandwidthMbps: 10 },
            placement: { region: cluster!.region },
            useScheduler: true,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Deploy failed");
      setMsg(
        `Deployed → ${data.decision?.selectedNodeName ?? "k8s-scheduler"} (score ${data.decision?.score ?? "—"})`,
      );
      await refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Deploy failed");
    } finally {
      setDeploying(false);
    }
  }

  return (
    <div>
      <PageHeader
        title={cluster.name}
        subtitle={`${cluster.provider} ${cluster.version} · ${cluster.location}`}
        actions={
          <>
            <SourceBadge source={cluster.source} />
            <ModePill mode={cluster.mode} />
            {real ? (
              <CpButton variant="danger" onClick={() => void disconnect()}>
                Disconnect
              </CpButton>
            ) : null}
          </>
        }
      />
      <div className="mb-4 flex flex-wrap gap-4 text-[12px]">
        <StatusDot status={cluster.status} />
        <span className="text-[var(--cp-muted)]">
          Last sync:{" "}
          {cluster.lastSyncAt
            ? new Date(cluster.lastSyncAt).toLocaleString()
            : real
              ? "—"
              : "simulation"}
        </span>
        {cluster.cpuAllocatable ? (
          <span className="text-[var(--cp-muted)]">
            CPU {cluster.cpuAllocatable} · Mem {cluster.memoryAllocatable} · GPU{" "}
            {cluster.gpuCount ?? 0}
          </span>
        ) : null}
      </div>
      {cluster.connectionError ? (
        <div className="cp-panel mb-4 border-[var(--cp-crit)]/40 p-3 text-[12px] text-[var(--cp-crit)]">
          Connection failed — {cluster.connectionError}
          <br />
          <span className="text-[var(--cp-muted)]">
            Showing last known / disconnected state. Retry via Sync on Clusters.
          </span>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="cp-panel">
          <div className="border-b border-[var(--cp-border)] px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--cp-muted)]">
            Nodes
          </div>
          <ul className="divide-y divide-[var(--cp-border)]">
            {nodes.map((n) => (
              <li
                key={n.id}
                className="flex items-center justify-between px-3 py-2 text-[12px]"
              >
                <Link
                  href={`/control-plane/nodes/${encodeURIComponent(n.id)}`}
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
              <li
                key={w.id}
                className="flex items-center justify-between px-3 py-2 text-[12px]"
              >
                <Link
                  href={`/control-plane/workloads/${encodeURIComponent(w.id)}`}
                  className="text-[var(--cp-accent)] hover:underline"
                >
                  {w.name}
                </Link>
                <span className="text-[var(--cp-muted)]">{w.status}</span>
              </li>
            ))}
            {!workloads.length ? (
              <li className="px-3 py-3 text-[12px] text-[var(--cp-muted)]">
                No workloads
              </li>
            ) : null}
          </ul>
        </div>
      </div>

      {real ? (
        <div className="cp-panel mt-4 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--cp-muted)]">
            Deploy REAL workload
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="text-[11px] text-[var(--cp-muted)]">
              Name
              <input
                value={wlName}
                onChange={(e) => setWlName(e.target.value)}
                className="mt-1 w-full border border-[var(--cp-border)] bg-[var(--cp-bg)] px-2 py-1.5 text-[12px]"
              />
            </label>
            <label className="text-[11px] text-[var(--cp-muted)]">
              Image
              <input
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="mt-1 w-full border border-[var(--cp-border)] bg-[var(--cp-bg)] px-2 py-1.5 text-[12px]"
              />
            </label>
          </div>
          <div className="mt-3">
            <CpButton
              variant="accent"
              disabled={deploying}
              onClick={() => void deploy()}
            >
              {deploying ? "Deploying…" : "Scheduler → Deploy"}
            </CpButton>
          </div>
          {msg ? (
            <p className="mt-2 text-[12px] text-[var(--cp-text)]">{msg}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
