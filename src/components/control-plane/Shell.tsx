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
  const { world, realOpsEnabled, session, refreshSession } = useControlPlane();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  async function logout() {
    await fetch("/api/control-plane/auth/logout", { method: "POST" });
    await refreshSession();
  }

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
      if (e.key === "Escape") {
        setPaletteOpen(false);
        setNavOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = navOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [navOpen]);

  return (
    <div className="cp-root flex">
      {/* Desktop sidebar */}
      <aside className="cp-hide-mobile sticky top-0 flex h-dvh w-[232px] shrink-0 flex-col border-r border-[var(--cp-border)] bg-[var(--cp-panel)]/95 backdrop-blur">
        <SidebarBrand />
        <SidebarNav pathname={pathname} />
        <SidebarFooter
          mode={world.mode}
          tenant={world.tenant.name}
          role={session.role ?? world.role}
          session={session}
          onLogout={() => void logout()}
        />
      </aside>

      {/* Mobile drawer */}
      {navOpen ? (
        <div className="cp-hide-desktop fixed inset-0 z-50 flex">
          <button
            type="button"
            aria-label="Cerrar menú"
            className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
            onClick={() => setNavOpen(false)}
          />
          <aside className="cp-mobile-nav-enter relative z-10 flex h-dvh w-[min(288px,88vw)] flex-col border-r border-[var(--cp-border)] bg-[var(--cp-panel)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--cp-border)] px-3 py-3">
              <SidebarBrand compact />
              <button
                type="button"
                onClick={() => setNavOpen(false)}
                className="flex h-9 w-9 items-center justify-center border border-[var(--cp-border)] text-[var(--cp-muted)]"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
            <SidebarNav pathname={pathname} />
            <SidebarFooter
              mode={world.mode}
              tenant={world.tenant.name}
              role={session.role ?? world.role}
              session={session}
              onLogout={() => void logout()}
            />
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-12 items-center justify-between gap-2 border-b border-[var(--cp-border)] bg-[var(--cp-panel)]/90 px-3 backdrop-blur md:h-11 md:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              className="cp-hide-desktop flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--cp-border)] bg-[var(--cp-bg)] text-[var(--cp-text)]"
              onClick={() => setNavOpen(true)}
              aria-label="Abrir menú"
            >
              <span className="flex flex-col gap-1">
                <span className="block h-0.5 w-4 bg-current" />
                <span className="block h-0.5 w-4 bg-current" />
                <span className="block h-0.5 w-4 bg-current" />
              </span>
            </button>
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="min-w-0 truncate border border-[var(--cp-border)] bg-[var(--cp-bg)] px-3 py-1.5 text-[11px] text-[var(--cp-muted)] md:py-1"
            >
              <span className="truncate">Search / commands</span>
              <kbd className="cp-hide-mobile ml-3 text-[10px] text-[var(--cp-muted)]">⌘K</kbd>
            </button>
          </div>
          <div className="flex shrink-0 items-center gap-2 text-[11px] text-[var(--cp-muted)] sm:gap-4">
            <span className="cp-mono cp-hide-mobile">
              scenario: {world.simulation.scenario ?? "—"}
            </span>
            <span className="cp-mono text-[var(--cp-ok)]">● live</span>
          </div>
        </header>
        <main className="cp-scroll cp-grid-bg flex-1 overflow-auto p-3 pb-8 sm:p-4 md:p-5">
          {!realOpsEnabled ? (
            <div className="mb-4 rounded-[var(--cp-radius)] border border-amber-500/40 bg-amber-500/10 px-3 py-2.5 text-[12px] text-amber-100">
              <strong className="font-semibold">Simulation-safe host.</strong>{" "}
              Real Kubernetes connect/deploy/delete is disabled here (public/Vercel
              default). Use a local lab with{" "}
              <span className="cp-mono">CONTROL_PLANE_REAL_OPS_ENABLED=true</span>.
            </div>
          ) : null}
          {children}
        </main>
      </div>

      {paletteOpen ? <CommandPalette onClose={() => setPaletteOpen(false)} /> : null}
    </div>
  );
}

function SidebarBrand({ compact }: { compact?: boolean }) {
  return (
    <div className={cn("border-b border-[var(--cp-border)] px-3", compact ? "py-0" : "py-3")}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--cp-accent)]">
        Control Plane
      </p>
      {!compact ? (
        <>
          <p className="mt-1 text-[13px] font-semibold leading-tight text-[var(--cp-text)]">
            AI-Native Edge
          </p>
          <p className="text-[11px] text-[var(--cp-muted)]">& Network</p>
        </>
      ) : null}
    </div>
  );
}

function SidebarNav({ pathname }: { pathname: string }) {
  return (
    <nav className="cp-scroll flex-1 overflow-y-auto px-2 py-3">
      {CP_NAV.map((section) => {
        if ("href" in section && section.href) {
          const active = pathname === section.href;
          return (
            <Link
              key={section.title}
              href={section.href}
              className={cn(
                "mb-1 block rounded-[var(--cp-radius)] px-2.5 py-2 text-[13px] font-medium md:py-1.5 md:text-[12px]",
                active
                  ? "bg-[var(--cp-accent-soft)] text-[var(--cp-accent)]"
                  : "text-[var(--cp-muted)] hover:bg-white/[0.03] hover:text-[var(--cp-text)]",
              )}
            >
              {section.title}
            </Link>
          );
        }
        return (
          <div key={section.title} className="mb-3">
            <p className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--cp-muted)]">
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
                        "block rounded-[var(--cp-radius)] px-2.5 py-2 text-[13px] md:py-1 md:text-[12px]",
                        simpleActive
                          ? "bg-[var(--cp-accent-soft)] text-[var(--cp-accent)]"
                          : "text-[var(--cp-muted)] hover:bg-white/[0.03] hover:text-[var(--cp-text)]",
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
  );
}

function SidebarFooter({
  mode,
  tenant,
  role,
  session,
  onLogout,
}: {
  mode: string;
  tenant: string;
  role: string;
  session: { authenticated: boolean; username?: string; role?: string };
  onLogout: () => void;
}) {
  return (
    <div className="border-t border-[var(--cp-border)] p-3">
      <ModePill mode={mode} />
      <p className="mt-2 text-[11px] text-[var(--cp-muted)]">
        {tenant}
        <br />
        Role: {role}
      </p>
      {session.authenticated ? (
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="truncate text-[11px] text-[var(--cp-text)]">
            {session.username}
          </p>
          <button
            type="button"
            onClick={onLogout}
            className="text-[10px] text-[var(--cp-muted)] hover:text-[var(--cp-accent)]"
          >
            Logout
          </button>
        </div>
      ) : (
        <Link
          href="/control-plane/login"
          className="mt-2 inline-block text-[11px] font-medium text-[var(--cp-accent)] hover:underline"
        >
          Sign in
        </Link>
      )}
      <a
        href="/docs/CONTROL_PLANE_USER_GUIDE.pdf"
        target="_blank"
        rel="noreferrer"
        className="mt-3 block text-[10px] font-medium text-[var(--cp-accent)] hover:underline"
      >
        Guía de uso (PDF)
      </a>
      <Link
        href="/"
        className="mt-2 inline-block text-[10px] text-[var(--cp-muted)] hover:text-[var(--cp-accent)]"
      >
        ← LA CAJA site
      </Link>
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
      { label: "Connect Cluster", run: () => router.push("/control-plane/clusters/connect") },
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
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/70 px-3 pt-[10vh] backdrop-blur-[2px] sm:pt-[12vh]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-[var(--cp-radius)] border border-[var(--cp-border)] bg-[var(--cp-panel)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Type a command…"
          className="w-full border-b border-[var(--cp-border)] bg-transparent px-4 py-3.5 text-sm text-[var(--cp-text)] outline-none"
        />
        <ul className="max-h-[50vh] overflow-auto py-1">
          {filtered.map((a) => (
            <li key={a.label}>
              <button
                type="button"
                className="block w-full px-4 py-3 text-left text-[13px] text-[var(--cp-text)] hover:bg-[var(--cp-accent)]/10 md:py-2 md:text-[12px]"
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
