"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useControlPlane } from "@/components/control-plane/ControlPlaneProvider";
import { CpButton, PageHeader } from "@/components/control-plane/ui";

export default function ControlPlaneLoginPage() {
  const router = useRouter();
  const { refreshSession, realOpsEnabled } = useControlPlane();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/control-plane/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      await refreshSession();
      router.push("/control-plane/security");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <PageHeader
        title="Sign in"
        subtitle="Local session auth · Admin / Operator / Viewer"
      />
      {!realOpsEnabled ? (
        <p className="mb-4 rounded-[var(--cp-radius)] border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-[12px] text-amber-100">
          Real Kubernetes ops are disabled on this host. You can still sign in to
          inspect security posture; connect/deploy remain blocked until the lab
          flag is enabled.
        </p>
      ) : null}
      <form onSubmit={onSubmit} className="cp-panel space-y-4 p-4 sm:p-5">
        <label className="block text-[11px] text-[var(--cp-muted)]">
          Username
          <input
            className="cp-input mt-1"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </label>
        <label className="block text-[11px] text-[var(--cp-muted)]">
          Password
          <input
            type="password"
            className="cp-input mt-1"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>
        {error ? (
          <p className="text-[12px] text-[var(--cp-crit)]">{error}</p>
        ) : null}
        <CpButton type="submit" variant="accent" disabled={busy} className="w-full">
          {busy ? "Signing in…" : "Sign in"}
        </CpButton>
        <p className="text-[11px] text-[var(--cp-muted)]">
          Lab defaults: set <span className="cp-mono">CONTROL_PLANE_ADMIN_PASSWORD</span>.
          Roles: admin · operator · viewer.
        </p>
      </form>
    </div>
  );
}
