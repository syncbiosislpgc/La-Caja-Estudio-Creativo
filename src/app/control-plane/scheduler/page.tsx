"use client";

import { useState } from "react";
import { useControlPlane } from "@/components/control-plane/ControlPlaneProvider";
import { ModePill, PageHeader } from "@/components/control-plane/ui";

export default function SchedulerPage() {
  const { world } = useControlPlane();
  const [selected, setSelected] = useState(world.decisions[0]?.id);

  const decision =
    world.decisions.find((d) => d.id === selected) ?? world.decisions[0];

  return (
    <div>
      <PageHeader
        title="Network-Aware Scheduler"
        subtitle="Explainable placement · CPU/GPU/latency/residency/energy"
        actions={<ModePill mode="SIMULATION" />}
      />

      <div className="grid gap-4 xl:grid-cols-5">
        <div className="cp-panel overflow-x-auto xl:col-span-3">
          <table className="w-full min-w-[700px] text-left text-[12px]">
            <thead className="text-[10px] uppercase text-[var(--cp-muted)]">
              <tr className="border-b border-[var(--cp-border)]">
                {["Workload", "Node", "Score", "Summary", "When"].map((h) => (
                  <th key={h} className="px-3 py-2 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {world.decisions.map((d) => (
                <tr
                  key={d.id}
                  className={`cursor-pointer border-t border-[var(--cp-border)] ${
                    decision?.id === d.id ? "bg-[var(--cp-accent)]/10" : ""
                  }`}
                  onClick={() => setSelected(d.id)}
                >
                  <td className="px-3 py-2">{d.workloadName}</td>
                  <td className="px-3 py-2">{d.selectedNodeName}</td>
                  <td className="cp-mono px-3 py-2 text-[var(--cp-accent)]">
                    {d.score}
                  </td>
                  <td className="px-3 py-2 text-[var(--cp-muted)]">{d.reasonSummary}</td>
                  <td className="cp-mono px-3 py-2 text-[10px] text-[var(--cp-muted)]">
                    {new Date(d.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="cp-panel p-4 xl:col-span-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--cp-muted)]">
            Why this node?
          </p>
          {decision ? (
            <>
              <p className="mt-2 text-[15px] font-semibold">
                {decision.selectedNodeName}{" "}
                <span className="cp-mono text-[var(--cp-accent)]">
                  score {decision.score}
                </span>
              </p>
              <ul className="mt-4 space-y-2">
                {decision.factors.map((f) => (
                  <li
                    key={f.label}
                    className="flex justify-between border-t border-[var(--cp-border)] pt-2 text-[12px]"
                  >
                    <span>
                      {f.label}
                      <br />
                      <span className="text-[11px] text-[var(--cp-muted)]">
                        {f.detail}
                      </span>
                    </span>
                    <span className="cp-mono text-[var(--cp-ok)]">+{f.points}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-[var(--cp-muted)]">
                Rejected / lower
              </p>
              <ul className="mt-2 space-y-1.5 text-[11px] text-[var(--cp-muted)]">
                {decision.rejected.map((r) => (
                  <li key={r.nodeId}>
                    <span className="text-[var(--cp-text)]">{r.nodeName}</span> —{" "}
                    {r.reason}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="mt-4 text-[var(--cp-muted)]">No decisions yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
