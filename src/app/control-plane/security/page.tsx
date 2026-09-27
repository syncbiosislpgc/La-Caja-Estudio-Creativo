"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useControlPlane } from "@/components/control-plane/ControlPlaneProvider";
import { CpButton, ModePill, PageHeader } from "@/components/control-plane/ui";

type SecurityPayload = {
  security: {
    realOpsEnabled: boolean;
    remoteOpsEnabled?: boolean;
    remoteOpsConfigured?: boolean;
    vercel: boolean;
    secretKeyConfigured: boolean;
    adminPasswordConfigured: boolean;
    allowedNamespace: string;
    authMode: string;
    note: string;
  };
  audit: Array<{
    at: string;
    actor: string;
    role: string;
    action: string;
    ok: boolean;
  }>;
};

export default function SecurityPage() {
  const { session, realOpsEnabled } = useControlPlane();
  const [data, setData] = useState<SecurityPayload | null>(null);

  useEffect(() => {
    void fetch("/api/control-plane/security/status")
      .then((r) => r.json())
      .then((d: SecurityPayload) => setData(d))
      .catch(() => setData(null));
  }, [session.authenticated]);

  const s = data?.security;

  return (
    <div>
      <PageHeader
        title="Security"
        subtitle="Local session RBAC · real-ops gate · audit · encrypted kubeconfigs"
        actions={
          <>
            <ModePill mode={realOpsEnabled ? "CONNECTED" : "NOT_CONFIGURED"} />
            {!session.authenticated ? (
              <Link href="/control-plane/login">
                <CpButton variant="accent">Sign in</CpButton>
              </Link>
            ) : null}
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="cp-panel space-y-3 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--cp-muted)]">
            Runtime posture
          </p>
          <ul className="space-y-2 text-[12px]">
            <li>
              Local kubeconfig ops:{" "}
              <strong className={s?.realOpsEnabled ? "text-emerald-400" : "text-amber-300"}>
                {s?.realOpsEnabled ? "ENABLED" : "DISABLED"}
              </strong>
            </li>
            <li>
              Cloud lab remote-ops:{" "}
              <strong
                className={
                  s?.remoteOpsConfigured ? "text-emerald-400" : "text-amber-300"
                }
              >
                {s?.remoteOpsConfigured ? "CONFIGURED" : "NOT CONFIGURED"}
              </strong>
            </li>
            <li>Auth mode: {s?.authMode ?? "—"}</li>
            <li>Allowed namespace: {s?.allowedNamespace ?? "—"}</li>
            <li>
              Secret key:{" "}
              {s?.secretKeyConfigured ? "configured" : "missing (required for kubeconfig encryption)"}
            </li>
            <li>
              Admin password env:{" "}
              {s?.adminPasswordConfigured ? "set" : "using lab default"}
            </li>
            <li>Vercel runtime: {s?.vercel ? "yes" : "no"}</li>
          </ul>
          <p className="text-[11px] text-[var(--cp-muted)]">{s?.note}</p>
        </div>

        <div className="cp-panel p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--cp-muted)]">
            RBAC roles
          </p>
          <ul className="mt-3 space-y-2 text-[12px]">
            <li className="border-t border-[var(--cp-border)] pt-2">
              <strong>Admin</strong> — connect, deploy, mutate, audit, security
            </li>
            <li className="border-t border-[var(--cp-border)] pt-2">
              <strong>Operator</strong> — connect, deploy, mutate, audit
            </li>
            <li className="border-t border-[var(--cp-border)] pt-2">
              <strong>Viewer</strong> — read-only when real ops enabled
            </li>
          </ul>
          <p className="mt-4 text-[11px] text-[var(--cp-muted)]">
            Enforcement is server-side on all administrative APIs. Simulation snapshot
            remains publicly readable for demos.
          </p>
        </div>
      </div>

      <div className="cp-panel mt-4 overflow-x-auto p-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--cp-muted)]">
          Audit trail {session.authenticated ? "" : "(sign in to view)"}
        </p>
        {data?.audit?.length ? (
          <table className="w-full text-left text-[12px]">
            <thead className="text-[10px] uppercase text-[var(--cp-muted)]">
              <tr>
                <th className="py-1 pr-3">When</th>
                <th className="py-1 pr-3">Actor</th>
                <th className="py-1 pr-3">Action</th>
                <th className="py-1">OK</th>
              </tr>
            </thead>
            <tbody>
              {data.audit.map((a, i) => (
                <tr key={`${a.at}-${i}`} className="border-t border-[var(--cp-border)]">
                  <td className="cp-mono py-1.5 pr-3 text-[10px]">
                    {new Date(a.at).toLocaleString()}
                  </td>
                  <td className="py-1.5 pr-3">
                    {a.actor} · {a.role}
                  </td>
                  <td className="py-1.5 pr-3">{a.action}</td>
                  <td className="py-1.5">{a.ok ? "yes" : "no"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-[12px] text-[var(--cp-muted)]">No audit events loaded.</p>
        )}
      </div>
    </div>
  );
}
