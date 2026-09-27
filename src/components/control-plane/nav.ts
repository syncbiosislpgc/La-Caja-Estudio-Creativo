export const CP_NAV = [
  {
    title: "Overview",
    href: "/control-plane",
  },
  {
    title: "Infrastructure",
    items: [
      { label: "Clusters", href: "/control-plane/clusters" },
      { label: "Connect Cluster", href: "/control-plane/clusters/connect" },
      { label: "Nodes", href: "/control-plane/nodes" },
      { label: "Edge Sites", href: "/control-plane/clusters?view=sites" },
    ],
  },
  {
    title: "Applications",
    items: [
      { label: "Workloads", href: "/control-plane/workloads" },
      { label: "Models", href: "/control-plane/models" },
    ],
  },
  {
    title: "Network",
    items: [
      { label: "Topology", href: "/control-plane/network" },
      { label: "E2E Trace", href: "/control-plane/network?tab=trace" },
    ],
  },
  {
    title: "Intelligence",
    items: [
      { label: "Scheduler", href: "/control-plane/scheduler" },
      { label: "Policies", href: "/control-plane/scheduler?tab=policies" },
    ],
  },
  {
    title: "Simulation",
    items: [
      { label: "Network Lab", href: "/control-plane/simulation" },
      { label: "Scenarios", href: "/control-plane/simulation?tab=scenarios" },
    ],
  },
  {
    title: "Observability",
    href: "/control-plane/observability",
  },
  {
    title: "Security",
    href: "/control-plane/security",
  },
  {
    title: "Integrations",
    href: "/control-plane/integrations",
  },
] as const;

export function healthColor(h: string) {
  switch (h) {
    case "HEALTHY":
      return "text-[var(--cp-ok)]";
    case "WARNING":
      return "text-[var(--cp-warn)]";
    case "DEGRADED":
      return "text-orange-400";
    case "OFFLINE":
      return "text-[var(--cp-crit)]";
    default:
      return "text-[var(--cp-muted)]";
  }
}

export function modeBadge(mode: string) {
  if (mode === "CONNECTED") return "border-emerald-500/40 text-emerald-400";
  if (mode === "SIMULATION") return "border-amber-500/40 text-amber-300";
  return "border-zinc-600 text-zinc-400";
}
