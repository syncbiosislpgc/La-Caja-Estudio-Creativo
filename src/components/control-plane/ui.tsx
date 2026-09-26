"use client";

import { cn } from "@/lib/cn";
import { healthColor, modeBadge } from "./nav";

export function StatusDot({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={cn(
          "inline-block h-1.5 w-1.5 rounded-full",
          status === "HEALTHY" && "bg-[var(--cp-ok)]",
          status === "WARNING" && "bg-[var(--cp-warn)]",
          status === "DEGRADED" && "bg-orange-400",
          status === "OFFLINE" && "bg-[var(--cp-crit)]",
        )}
      />
      <span className={cn("text-[11px] font-medium tracking-wide", healthColor(status))}>
        {status}
      </span>
    </span>
  );
}

export function ModePill({ mode }: { mode: string }) {
  return (
    <span
      className={cn(
        "inline-flex border px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase",
        modeBadge(mode),
      )}
    >
      {mode === "SIMULATION" ? "SIMULATION MODE" : mode}
    </span>
  );
}

export function SourceBadge({ source }: { source?: string }) {
  const real = source === "kubernetes" || source === "k3s" || source === "kubeedge";
  return (
    <span
      className={cn(
        "inline-flex border px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase",
        real
          ? "border-emerald-500/50 text-emerald-400"
          : "border-amber-500/40 text-amber-300",
      )}
    >
      {real ? "REAL" : "SIMULATED"}
    </span>
  );
}

export function MetricTile({
  label,
  value,
  hint,
  warn,
}: {
  label: string;
  value: string;
  hint?: string;
  warn?: boolean;
}) {
  return (
    <div className="cp-panel p-3">
      <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--cp-muted)]">
        {label}
      </p>
      <p
        className={cn(
          "cp-mono mt-1.5 text-xl font-semibold",
          warn ? "text-[var(--cp-crit)]" : "text-[var(--cp-text)]",
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-1 text-[11px] text-[var(--cp-muted)]">{hint}</p> : null}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-[var(--cp-border)] pb-4">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-[var(--cp-text)]">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-[12px] text-[var(--cp-muted)]">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function CpButton({
  children,
  onClick,
  variant = "default",
  disabled,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "accent" | "danger" | "ghost";
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "border px-2.5 py-1.5 text-[11px] font-semibold tracking-wide uppercase transition-colors disabled:opacity-40",
        variant === "default" &&
          "border-[var(--cp-border)] bg-[var(--cp-panel-2)] text-[var(--cp-text)] hover:border-[var(--cp-accent)]",
        variant === "accent" &&
          "border-[var(--cp-accent)] bg-[var(--cp-accent)]/15 text-[var(--cp-accent)] hover:bg-[var(--cp-accent)]/25",
        variant === "danger" &&
          "border-[var(--cp-crit)]/50 text-[var(--cp-crit)] hover:bg-[var(--cp-crit)]/10",
        variant === "ghost" &&
          "border-transparent text-[var(--cp-muted)] hover:text-[var(--cp-text)]",
      )}
    >
      {children}
    </button>
  );
}
