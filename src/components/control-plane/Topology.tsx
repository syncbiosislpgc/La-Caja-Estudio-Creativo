"use client";

import { useMemo } from "react";
import { useControlPlane } from "./ControlPlaneProvider";
import { cn } from "@/lib/cn";

export function TopologyCanvas() {
  const { world } = useControlPlane();
  const { nodes, links } = world.topology;
  const pathHops = world.paths[0]?.hops ?? [];

  const nodeMap = useMemo(
    () => Object.fromEntries(nodes.map((n) => [n.id, n])),
    [nodes],
  );

  return (
    <div className="cp-panel relative overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--cp-border)] px-3 py-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--cp-muted)]">
          Network topology
        </p>
        <p className="text-[10px] text-amber-300">SIMULATION · data-driven paths</p>
      </div>
      <svg viewBox="0 0 960 400" className="h-[360px] w-full">
        {links.map((l) => {
          const a = nodeMap[l.from];
          const b = nodeMap[l.to];
          if (!a || !b) return null;
          return (
            <g key={l.id}>
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={l.congested ? "#ef4444" : "#3d8bfd"}
                strokeWidth={l.congested ? 2.5 : 1.5}
                strokeOpacity={0.7 + l.utilizationPct / 200}
              />
              <text
                x={(a.x + b.x) / 2}
                y={(a.y + b.y) / 2 - 6}
                fill="#8b95a8"
                fontSize="9"
                textAnchor="middle"
              >
                {l.latencyMs.toFixed(1)}ms · {l.utilizationPct}%
              </text>
            </g>
          );
        })}
        {nodes.map((n) => (
          <g key={n.id}>
            <rect
              x={n.x - 48}
              y={n.y - 16}
              width={96}
              height={32}
              fill="#121826"
              stroke={
                n.status === "DEGRADED" || n.status === "WARNING"
                  ? "#eab308"
                  : n.kind === "workload"
                    ? "#22d3ee"
                    : "#3d8bfd"
              }
              strokeWidth="1.2"
            />
            <text
              x={n.x}
              y={n.y + 4}
              fill="#e8edf5"
              fontSize="10"
              textAnchor="middle"
              fontWeight={600}
            >
              {n.label}
            </text>
          </g>
        ))}
      </svg>
      {pathHops.length ? (
        <div className="border-t border-[var(--cp-border)] px-3 py-2 text-[11px] text-[var(--cp-muted)]">
          Active path:{" "}
          <span className="cp-mono text-[var(--cp-cyan)]">
            {pathHops.join(" → ")}
          </span>
        </div>
      ) : null}
    </div>
  );
}

export function EventFeed({ limit = 8 }: { limit?: number }) {
  const { world } = useControlPlane();
  return (
    <div className="cp-panel">
      <div className="border-b border-[var(--cp-border)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--cp-muted)]">
        Recent events
      </div>
      <ul className="divide-y divide-[var(--cp-border)]">
        {world.events.slice(0, limit).map((e) => (
          <li key={e.id} className="px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <span
                className={cn(
                  "text-[10px] font-semibold tracking-wide",
                  e.severity === "critical" && "text-[var(--cp-crit)]",
                  e.severity === "warning" && "text-[var(--cp-warn)]",
                  e.severity === "info" && "text-[var(--cp-accent)]",
                )}
              >
                {e.type}
              </span>
              <span className="cp-mono text-[10px] text-[var(--cp-muted)]">
                {new Date(e.at).toLocaleTimeString()}
              </span>
            </div>
            <p className="mt-0.5 text-[12px] text-[var(--cp-text)]">{e.message}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
