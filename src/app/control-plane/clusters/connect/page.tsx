"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  CpButton,
  ModePill,
  PageHeader,
} from "@/components/control-plane/ui";

type Step = 1 | 2 | 3 | 4 | 5 | 6;

export default function ConnectClusterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState("lab-k8s");
  const [provider, setProvider] = useState<"kubernetes" | "k3s" | "kubeedge">(
    "kubernetes",
  );
  const [kubeconfig, setKubeconfig] = useState("");
  const [context, setContext] = useState("");
  const [region, setRegion] = useState("lab");
  const [busy, setBusy] = useState(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    message: string;
    version?: string;
  } | null>(null);
  const [discover, setDiscover] = useState<{
    nodes?: number;
    version?: string;
    error?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runTest() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/control-plane/clusters/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kubeconfig, context: context || undefined }),
      });
      const data = await res.json();
      setTestResult(data);
      if (data.ok) setStep(5);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Test failed");
    } finally {
      setBusy(false);
    }
  }

  async function connect() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/control-plane/clusters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          provider,
          kubeconfig,
          context: context || undefined,
          region,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Connect failed");
      setDiscover({
        nodes: data.cluster?.nodeIds?.length ?? 0,
        version: data.test?.version,
        error: data.test?.ok ? undefined : data.test?.message,
      });
      setStep(6);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connect failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Connect Cluster"
        subtitle="Register a real Kubernetes/K3s API — kubeconfig stays server-side"
        actions={<ModePill mode="NOT_CONFIGURED" />}
      />

      <ol className="mb-4 flex flex-wrap gap-2 text-[10px] uppercase tracking-wider text-[var(--cp-muted)]">
        {["Name", "Provider", "Connection", "Test", "Discover", "Confirm"].map(
          (label, i) => (
            <li
              key={label}
              className={
                step === i + 1 ? "text-[var(--cp-accent)]" : undefined
              }
            >
              {i + 1}. {label}
            </li>
          ),
        )}
      </ol>

      <div className="cp-panel space-y-4 p-4">
        {step === 1 ? (
          <>
            <label className="block text-[11px] text-[var(--cp-muted)]">
              Cluster name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full border border-[var(--cp-border)] bg-[var(--cp-bg)] px-3 py-2 text-[13px] text-[var(--cp-text)]"
              />
            </label>
            <CpButton variant="accent" onClick={() => setStep(2)}>
              Next
            </CpButton>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <p className="text-[11px] text-[var(--cp-muted)]">Provider</p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["kubernetes", "Kubernetes"],
                  ["k3s", "K3s"],
                  ["kubeedge", "KubeEdge (soon)"],
                ] as const
              ).map(([id, label]) => (
                <CpButton
                  key={id}
                  variant={provider === id ? "accent" : "default"}
                  onClick={() => setProvider(id)}
                  disabled={id === "kubeedge"}
                >
                  {label}
                </CpButton>
              ))}
            </div>
            <div className="flex gap-2">
              <CpButton onClick={() => setStep(1)}>Back</CpButton>
              <CpButton variant="accent" onClick={() => setStep(3)}>
                Next
              </CpButton>
            </div>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <label className="block text-[11px] text-[var(--cp-muted)]">
              Kubeconfig (paste) — never sent back to browser after save
              <textarea
                value={kubeconfig}
                onChange={(e) => setKubeconfig(e.target.value)}
                rows={12}
                className="mt-1 w-full border border-[var(--cp-border)] bg-[var(--cp-bg)] px-3 py-2 font-mono text-[11px] text-[var(--cp-text)]"
                placeholder="apiVersion: v1&#10;kind: Config&#10;..."
              />
            </label>
            <label className="block text-[11px] text-[var(--cp-muted)]">
              Context (optional)
              <input
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="mt-1 w-full border border-[var(--cp-border)] bg-[var(--cp-bg)] px-3 py-2 text-[13px]"
              />
            </label>
            <label className="block text-[11px] text-[var(--cp-muted)]">
              Region label
              <input
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="mt-1 w-full border border-[var(--cp-border)] bg-[var(--cp-bg)] px-3 py-2 text-[13px]"
              />
            </label>
            <div className="flex gap-2">
              <CpButton onClick={() => setStep(2)}>Back</CpButton>
              <CpButton
                variant="accent"
                disabled={!kubeconfig.trim()}
                onClick={() => setStep(4)}
              >
                Next
              </CpButton>
            </div>
          </>
        ) : null}

        {step === 4 ? (
          <>
            <p className="text-[12px] text-[var(--cp-text)]">
              Test connection to Kubernetes API using the provided kubeconfig
              (server-side only).
            </p>
            {testResult ? (
              <p
                className={
                  testResult.ok
                    ? "text-[12px] text-emerald-400"
                    : "text-[12px] text-[var(--cp-crit)]"
                }
              >
                {testResult.ok ? "Connected" : "Connection failed"} —{" "}
                {testResult.message}
              </p>
            ) : null}
            <div className="flex gap-2">
              <CpButton onClick={() => setStep(3)}>Back</CpButton>
              <CpButton variant="accent" disabled={busy} onClick={() => void runTest()}>
                {busy ? "Testing…" : "Test connection"}
              </CpButton>
            </div>
          </>
        ) : null}

        {step === 5 ? (
          <>
            <p className="text-[12px] text-emerald-400">
              {testResult?.message ?? "Ready to discover"}
            </p>
            <p className="text-[12px] text-[var(--cp-muted)]">
              Confirm to store the connection and discover nodes/workloads.
            </p>
            <div className="flex gap-2">
              <CpButton onClick={() => setStep(4)}>Back</CpButton>
              <CpButton variant="accent" disabled={busy} onClick={() => void connect()}>
                {busy ? "Discovering…" : "Discover infrastructure"}
              </CpButton>
            </div>
          </>
        ) : null}

        {step === 6 ? (
          <>
            <p className="text-[15px] font-semibold text-emerald-400">Connected</p>
            <ul className="space-y-1 text-[12px] text-[var(--cp-text)]">
              <li>Cluster: {name}</li>
              <li>Provider: {provider}</li>
              <li>Version: {discover?.version ?? "—"}</li>
              <li>Nodes discovered: {discover?.nodes ?? "—"}</li>
            </ul>
            {discover?.error ? (
              <p className="text-[12px] text-[var(--cp-crit)]">{discover.error}</p>
            ) : null}
            <CpButton
              variant="accent"
              onClick={() => router.push("/control-plane/clusters")}
            >
              Open Clusters
            </CpButton>
          </>
        ) : null}

        {error ? (
          <p className="text-[12px] text-[var(--cp-crit)]">
            Connection failed — {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
