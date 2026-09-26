"use client";

import { useControlPlane } from "@/components/control-plane/ControlPlaneProvider";
import { ModePill, PageHeader, StatusDot } from "@/components/control-plane/ui";
import { modeBadge } from "@/components/control-plane/nav";
import { cn } from "@/lib/cn";

export default function IntegrationsPage() {
  const { world, connections } = useControlPlane();
  const hasReal = connections.some((c) => c.status === "CONNECTED");

  const items = world.integrations.map((i) => {
    if (
      (i.id === "int-k8s" || i.id === "int-k3s") &&
      hasReal
    ) {
      return {
        ...i,
        status: "CONNECTED" as const,
        health: "HEALTHY" as const,
        version: connections[0]?.version ?? i.version,
      };
    }
    return i;
  });

  return (
    <div>
      <PageHeader
        title="Integrations"
        subtitle="Adapters · REAL only when a cluster is connected"
        actions={<ModePill mode={hasReal ? "CONNECTED" : "SIMULATION"} />}
      />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.map((i) => (
          <div key={i.id} className="cp-panel p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold">{i.name}</p>
              <span
                className={cn(
                  "border px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                  modeBadge(i.status),
                )}
              >
                {i.status}
              </span>
            </div>
            <div className="mt-2">
              <StatusDot status={i.health} />
            </div>
            <p className="mt-2 text-[11px] text-[var(--cp-muted)]">
              version {i.version}
            </p>
            <p className="mt-2 text-[11px] text-[var(--cp-text)]">
              {i.capabilities.join(" · ")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
