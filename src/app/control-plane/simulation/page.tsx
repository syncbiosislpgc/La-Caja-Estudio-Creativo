"use client";

import { EventFeed, TopologyCanvas } from "@/components/control-plane/Topology";
import { useControlPlane } from "@/components/control-plane/ControlPlaneProvider";
import {
  CpButton,
  ModePill,
  PageHeader,
} from "@/components/control-plane/ui";

const SCENARIOS = [
  "Normal Edge Network",
  "GPU Saturation",
  "Network Congestion",
  "Automatic Workload Migration",
  "Edge Site Failure",
  "AI Traffic Spike",
];

export default function SimulationPage() {
  const {
    world,
    reset,
    injectGpuSat,
    injectNetCongestion,
    migrate,
    recover,
    runDemoMigration,
    demoRunning,
    takeNodeOffline,
  } = useControlPlane();

  return (
    <div>
      <PageHeader
        title="Network Lab / Simulation"
        subtitle="Deterministic seed · all actions marked SIMULATION MODE"
        actions={<ModePill mode="SIMULATION" />}
      />

      <div className="cp-panel mb-4 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--cp-muted)]">
          Inject / control
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <CpButton variant="accent" disabled={demoRunning} onClick={() => void runDemoMigration()}>
            Full migration demo
          </CpButton>
          <CpButton onClick={injectGpuSat}>Saturate GPU</CpButton>
          <CpButton onClick={injectNetCongestion}>Inject congestion</CpButton>
          <CpButton onClick={migrate}>Force migrate</CpButton>
          <CpButton onClick={() => takeNodeOffline("node-mad-04")}>
            Disable EDGE-MAD-04
          </CpButton>
          <CpButton onClick={recover}>Recover</CpButton>
          <CpButton variant="danger" onClick={reset}>
            Reset world
          </CpButton>
        </div>
        <p className="mt-3 text-[12px] text-[var(--cp-muted)]">
          Active scenario:{" "}
          <span className="text-[var(--cp-text)]">
            {world.simulation.scenario ?? "—"}
          </span>{" "}
          · seed {world.simulation.seed}
        </p>
      </div>

      <div className="mb-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {SCENARIOS.map((s) => (
          <div
            key={s}
            className={`cp-panel px-3 py-2 text-[11px] ${
              world.simulation.scenario === s
                ? "border-[var(--cp-accent)] text-[var(--cp-accent)]"
                : "text-[var(--cp-muted)]"
            }`}
          >
            {s}
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <TopologyCanvas />
        </div>
        <EventFeed limit={12} />
      </div>

      <div className="cp-panel mt-4 p-4 text-[12px] leading-relaxed text-[var(--cp-muted)]">
        <p className="font-semibold text-[var(--cp-text)]">Demo story</p>
        <ol className="mt-2 list-decimal space-y-1 pl-4">
          <li>Deploy traffic-vision (GPU, latency &lt;20ms, EU)</li>
          <li>Scheduler selects EDGE-MAD-04 with explainable score</li>
          <li>Path UE → gNB → OVS → EDGE → GPU → inference</li>
          <li>Inject GPU saturation / congestion → SLA breach</li>
          <li>Scheduler picks EDGE-MAD-07 · SDN reroutes · latency recovers</li>
        </ol>
      </div>
    </div>
  );
}
