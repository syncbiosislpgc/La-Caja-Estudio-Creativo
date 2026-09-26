"use client";

import { TopologyCanvas } from "@/components/control-plane/Topology";
import { useControlPlane } from "@/components/control-plane/ControlPlaneProvider";
import { ModePill, PageHeader } from "@/components/control-plane/ui";

export default function NetworkPage() {
  const { world } = useControlPlane();
  const path = world.paths[0];

  return (
    <div>
      <PageHeader
        title="Network"
        subtitle="Topology · flows · SDN paths · RAN/MEC stubs"
        actions={<ModePill mode="SIMULATION" />}
      />
      <TopologyCanvas />

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="cp-panel overflow-x-auto">
          <div className="border-b border-[var(--cp-border)] px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--cp-muted)]">
            Links
          </div>
          <table className="w-full text-left text-[12px]">
            <thead className="text-[10px] uppercase text-[var(--cp-muted)]">
              <tr>
                <th className="px-3 py-2">Link</th>
                <th className="px-3 py-2">Lat</th>
                <th className="px-3 py-2">BW</th>
                <th className="px-3 py-2">Util</th>
                <th className="px-3 py-2">Loss</th>
              </tr>
            </thead>
            <tbody>
              {world.topology.links.map((l) => (
                <tr
                  key={l.id}
                  className={`border-t border-[var(--cp-border)] ${l.congested ? "bg-red-500/5" : ""}`}
                >
                  <td className="px-3 py-2">
                    {l.from.replace("topo-", "")} → {l.to.replace("topo-", "")}
                    {l.congested ? (
                      <span className="ml-2 text-[10px] text-[var(--cp-crit)]">
                        CONGESTED
                      </span>
                    ) : null}
                  </td>
                  <td className="cp-mono px-3 py-2">{l.latencyMs.toFixed(1)}ms</td>
                  <td className="cp-mono px-3 py-2">{l.bandwidthGbps}G</td>
                  <td className="cp-mono px-3 py-2">{l.utilizationPct}%</td>
                  <td className="cp-mono px-3 py-2">{l.packetLossPct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="cp-panel p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--cp-muted)]">
            E2E trace · UE → Inference
          </p>
          {path ? (
            <>
              <ol className="mt-4 space-y-2">
                {path.hops.map((h, i) => (
                  <li key={`${h}-${i}`} className="text-[13px]">
                    <span className="text-[var(--cp-cyan)]">{h}</span>
                    {i < path.hops.length - 1 ? (
                      <span className="ml-2 text-[var(--cp-muted)]">↓</span>
                    ) : null}
                  </li>
                ))}
              </ol>
              <dl className="mt-6 grid grid-cols-2 gap-2 text-[12px]">
                <div>
                  <dt className="text-[var(--cp-muted)]">Network latency</dt>
                  <dd className="cp-mono">{path.networkLatencyMs}ms</dd>
                </div>
                <div>
                  <dt className="text-[var(--cp-muted)]">Inference latency</dt>
                  <dd className="cp-mono">{path.inferenceLatencyMs}ms</dd>
                </div>
                <div>
                  <dt className="text-[var(--cp-muted)]">Total E2E</dt>
                  <dd className="cp-mono">{path.e2eLatencyMs}ms</dd>
                </div>
                <div>
                  <dt className="text-[var(--cp-muted)]">Packet loss</dt>
                  <dd className="cp-mono">{path.packetLossPct}%</dd>
                </div>
              </dl>
            </>
          ) : (
            <p className="mt-4 text-[var(--cp-muted)]">No active path</p>
          )}
        </div>
      </div>
    </div>
  );
}
