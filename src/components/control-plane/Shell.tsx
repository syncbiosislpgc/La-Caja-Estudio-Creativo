"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useControlPlane } from "./ControlPlaneProvider";
import { CP_NAV } from "./nav";
import { ModePill } from "./ui";
import { cn } from "@/lib/cn";

export function ControlPlaneShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { world } = useControlPlane();
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
      if (e.key === "Escape") setPaletteOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="cp-root flex">
      <aside className="sticky top-0 flex h-dvh w-[220px] shrink-0 flex-col border-r border-[var(--cp-border)] bg-[var(--cp-panel)]">
        <div className="border-b border-[var(--cp-border)] px-3 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--cp-accent)]">
            Control Plane
          </p>
          <p className="mt-1 text-[13px] font-semibold leading-tight text-[var(--cp-text)]">
            AI-Native Edge
          </p>
          <p className="text-[11px] text-[var(--cp-muted)]">& Network</p>
        </div>
        <nav className="cp-scroll flex-1 overflow-y-auto px-2 py-3">
          {CP_NAV.map((section) => {
            if ("href" in section && section.href) {
              const active = pathname === section.href;
              return (
                <Link
                  key={section.title}
                  href={section.href}
                  className={cn(
                    "mb-1 block px-2 py-1.5 text-[12px] font-medium",
                    active
                      ? "bg-[var(--cp-accent)]/15 text-[var(--cp-accent)]"
                      : "text-[var(--cp-muted)] hover:text-[var(--cp-text)]",
                  )}
                >
                  {section.title}
                </Link>
              );
            }
            return (
              <div key={section.title} className="mb-3">
                <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--cp-muted)]">
                  {section.title}
                </p>
                {"items" in section
                  ? section.items.map((item) => {
                      const base = item.href.split("?")[0];
                      const simpleActive =
                        pathname === base ||
                        (base !== "/control-plane" && pathname.startsWith(base));
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "block px-2 py-1 text-[12px]",
                            simpleActive
                              ? "text-[var(--cp-accent)]"
                              : "text-[var(--cp-muted)] hover:text-[var(--cp-text)]",
                          )}
                        >
                          {item.label}
                        </Link>
                      );
                    })
                  : null}
              </div>
            );
          })}
        </nav>
        <div className="border-t border-[var(--cp-border)] p-3">
          <ModePill mode={world.mode} />
          <p className="mt-2 text-[11px] text-[var(--cp-muted)]">
            {world.tenant.name}
            <br />
            Role: {world.role}
          </p>
          <Link
            href="/"
            className="mt-3 inline-block text-[10px] text-[var(--cp-muted)] hover:text-[var(--cp-accent)]"
          >
            ← LA CAJA site
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-11 items-center justify-between border-b border-[var(--cp-border)] bg-[var(--cp-panel)] px-4">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="border border-[var(--cp-border)] bg-[var(--cp-bg)] px-3 py-1 text-[11px] text-[var(--cp-muted)]"
          >
            Search / commands
            <kbd className="ml-3 text-[10px] text-[var(--cp-muted)]">⌘K</kbd>
          </button>
          <div className="flex items-center gap-4 text-[11px] text-[var(--cp-muted)]">
            <span className="cp-mono">
              scenario: {world.simulation.scenario ?? "—"}
            </span>
            <span className="cp-mono text-[var(--cp-ok)]">● live feed</span>
          </div>
        </header>
        <main className="cp-scroll cp-grid-bg flex-1 overflow-auto p-4 md:p-5">
          {children}
        </main>
      </div>

      {paletteOpen ? <CommandPalette onClose={() => setPaletteOpen(false)} /> : null}
    </div>
  );
}

function CommandPalette({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { runDemoMigration, injectGpuSat, reset } = useControlPlane();
  const [q, setQ] = useState("");

  const actions = useMemo(
    () => [
      { label: "Open Overview", run: () => router.push("/control-plane") },
      { label: "Open Clusters", run: () => router.push("/control-plane/clusters") },
      { label: "Open Nodes", run: () => router.push("/control-plane/nodes") },
      { label: "Open Workloads", run: () => router.push("/control-plane/workloads") },
      { label: "Open Network Topology", run: () => router.push("/control-plane/network") },
      { label: "Open Scheduler", run: () => router.push("/control-plane/scheduler") },
      { label: "Open Simulation Lab", run: () => router.push("/control-plane/simulation") },
      { label: "Run auto-migration demo", run: () => void runDemoMigration() },
      { label: "Inject GPU saturation", run: () => injectGpuSat() },
      { label: "Reset simulation", run: () => reset() },
    ],
    [router, runDemoMigration, injectGpuSat, reset],
  );

  const filtered = actions.filter((a) =>
    a.label.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 pt-[12vh]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg border border-[var(--cp-border)] bg-[var(--cp-panel)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Type a command…"
          className="w-full border-b border-[var(--cp-border)] bg-transparent px-4 py-3 text-sm text-[var(--cp-text)] outline-none"
        />
        <ul className="max-h-80 overflow-auto py-1">
          {filtered.map((a) => (
            <li key={a.label}>
              <button
                type="button"
                className="block w-full px-4 py-2 text-left text-[12px] text-[var(--cp-text)] hover:bg-[var(--cp-accent)]/10"
                onClick={() => {
                  a.run();
                  onClose();
                }}
              >
                {a.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
