"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { healthColor, modeBadge } from "./nav";

export function StatusDot({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={cn(
          "inline-block h-1.5 w-1.5 rounded-full",
          status === "HEALTHY" && "bg-[var(--cp-ok)] shadow-[0_0_6px_rgba(34,197,94,0.55)]",
          status === "WARNING" && "bg-[var(--cp-warn)]",
          status === "DEGRADED" && "bg-orange-400",
          status === "OFFLINE" && "bg-[var(--cp-crit)]",
          status === "CONNECTED" && "bg-[var(--cp-ok)]",
          status === "DISCONNECTED" && "bg-[var(--cp-crit)]",
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
        "inline-flex rounded-[var(--cp-radius)] border px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase",
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
        "inline-flex rounded-[var(--cp-radius)] border px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase",
        real
          ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
          : "border-amber-500/40 bg-amber-500/10 text-amber-300",
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
    <div className="cp-panel cp-panel-hover p-3.5 sm:p-3">
      <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--cp-muted)]">
        {label}
      </p>
      <p
        className={cn(
          "cp-mono mt-1.5 text-2xl font-semibold tracking-tight sm:text-xl",
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
    <div className="mb-4 flex flex-col gap-3 border-b border-[var(--cp-border)] pb-4 sm:mb-5 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight text-[var(--cp-text)] sm:text-lg">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-[var(--cp-muted)] sm:text-[12px]">
            {subtitle}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}

export function CpButton({
  children,
  onClick,
  variant = "default",
  disabled,
  type = "button",
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "accent" | "danger" | "ghost";
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "min-h-10 rounded-[var(--cp-radius)] border px-3 py-2 text-[11px] font-semibold tracking-wide uppercase transition-colors disabled:opacity-40 sm:min-h-0 sm:px-2.5 sm:py-1.5",
        variant === "default" &&
          "border-[var(--cp-border)] bg-[var(--cp-panel-2)] text-[var(--cp-text)] hover:border-[var(--cp-accent)]",
        variant === "accent" &&
          "border-[var(--cp-accent)] bg-[var(--cp-accent)]/15 text-[var(--cp-accent)] hover:bg-[var(--cp-accent)]/25",
        variant === "danger" &&
          "border-[var(--cp-crit)]/50 text-[var(--cp-crit)] hover:bg-[var(--cp-crit)]/10",
        variant === "ghost" &&
          "border-transparent text-[var(--cp-muted)] hover:text-[var(--cp-text)]",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function EntityCard({
  href,
  title,
  subtitle,
  badge,
  meta,
  footer,
}: {
  href: string;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  meta?: Array<{ label: string; value: React.ReactNode }>;
  footer?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="cp-panel cp-panel-hover block p-3.5 transition-transform active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold text-[var(--cp-accent)]">{title}</p>
          {subtitle ? (
            <p className="mt-0.5 truncate text-[11px] text-[var(--cp-muted)]">{subtitle}</p>
          ) : null}
        </div>
        {badge}
      </div>
      {meta?.length ? (
        <dl className="mt-3 grid grid-cols-2 gap-2">
          {meta.map((m) => (
            <div key={m.label}>
              <dt className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--cp-muted)]">
                {m.label}
              </dt>
              <dd className="mt-0.5 text-[12px] text-[var(--cp-text)]">{m.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {footer ? <div className="mt-3 border-t border-[var(--cp-border)] pt-2">{footer}</div> : null}
    </Link>
  );
}
