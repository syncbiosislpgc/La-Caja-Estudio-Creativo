"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useControlPlane } from "@/components/control-plane/ControlPlaneProvider";
import {
  CpButton,
  ModePill,
  PageHeader,
} from "@/components/control-plane/ui";

type Step = 1 | 2 | 3 | 4 | 5 | 6;

const STEPS = ["Name", "Provider", "Connection", "Test", "Discover", "Confirm"] as const;

export default function ConnectClusterPage() {
  const router = useRouter();
  const { realOpsEnabled, session } = useControlPlane();
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
        subtitle="Register a real Kubernetes/K3s API — kubeconfig encrypted server-side"
        actions={<ModePill mode={realOpsEnabled ? "CONNECTED" : "NOT_CONFIGURED"} />}
      />

      {!realOpsEnabled ? (
        <div className="mb-4 rounded-[var(--cp-radius)] border border-amber-500/40 bg-amber-500/10 px-3 py-3 text-[12px] text-amber-100">
          <p className="font-semibold">Real ops disabled on this host</p>
          <p className="mt-1 text-amber-100/90">
            Public/Vercel deployments cannot accept kubeconfigs or mutate clusters.
            Run the local lab (see <span className="cp-mono">docs/DEMO_GUIDE.md</span>).
          </p>
        </div>
      ) : null}

      {realOpsEnabled && !session.authenticated ? (
        <div className="mb-4 rounded-[var(--cp-radius)] border border-[var(--cp-accent)]/40 bg-[var(--cp-accent)]/10 px-3 py-3 text-[12px]">
          Authentication required.{" "}
          <Link href="/control-plane/login" className="text-[var(--cp-accent)] underline">
            Sign in as Admin/Operator
          </Link>
        </div>
      ) : null}

      <ol className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={
              step === i + 1
                ? "cp-step cp-step-active shrink-0"
                : step > i + 1
                  ? "cp-step shrink-0 border-emerald-500/40 text-emerald-400"
                  : "cp-step shrink-0"
            }
          >
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      <div className="cp-panel space-y-4 p-4 sm:p-5">
        {step === 1 ? (
          <>
            <label className="block text-[11px] text-[var(--cp-muted)]">
              Cluster name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="cp-input mt-1"
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
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
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
                  className="w-full"
                >
                  {label}
                </CpButton>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
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
                rows={10}
                className="cp-input mt-1 font-mono text-[11px]"
                placeholder="apiVersion: v1&#10;kind: Config&#10;..."
              />
            </label>
            <label className="block text-[11px] text-[var(--cp-muted)]">
              Context (optional)
              <input
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="cp-input mt-1"
              />
            </label>
            <label className="block text-[11px] text-[var(--cp-muted)]">
              Region label
              <input
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="cp-input mt-1"
              />
            </label>
            <div className="flex flex-wrap gap-2">
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
            <p className="text-[13px] leading-relaxed text-[var(--cp-text)]">
              Test connection to Kubernetes API using the provided kubeconfig
              (server-side only).
            </p>
            {testResult ? (
              <p
                className={
                  testResult.ok
                    ? "rounded-[var(--cp-radius)] border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-[12px] text-emerald-400"
                    : "rounded-[var(--cp-radius)] border border-[var(--cp-crit)]/30 bg-[var(--cp-crit)]/10 px-3 py-2 text-[12px] text-[var(--cp-crit)]"
                }
              >
                {testResult.ok ? "Connected" : "Connection failed"} —{" "}
                {testResult.message}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <CpButton onClick={() => setStep(3)}>Back</CpButton>
              <CpButton variant="accent" disabled={busy} onClick={() => void runTest()}>
                {busy ? "Testing…" : "Test connection"}
              </CpButton>
            </div>
          </>
        ) : null}

        {step === 5 ? (
          <>
            <p className="text-[13px] text-emerald-400">
              {testResult?.message ?? "Ready to discover"}
            </p>
            <p className="text-[12px] text-[var(--cp-muted)]">
              Confirm to store the connection and discover nodes/workloads.
            </p>
            <div className="flex flex-wrap gap-2">
              <CpButton onClick={() => setStep(4)}>Back</CpButton>
              <CpButton variant="accent" disabled={busy} onClick={() => void connect()}>
                {busy ? "Discovering…" : "Discover infrastructure"}
              </CpButton>
            </div>
          </>
        ) : null}

        {step === 6 ? (
          <>
            <p className="text-[18px] font-semibold text-emerald-400">Connected</p>
            <ul className="grid grid-cols-2 gap-2 text-[12px] text-[var(--cp-text)]">
              <li className="cp-panel p-3">
                <span className="text-[10px] uppercase text-[var(--cp-muted)]">Cluster</span>
                <p className="mt-1 font-medium">{name}</p>
              </li>
              <li className="cp-panel p-3">
                <span className="text-[10px] uppercase text-[var(--cp-muted)]">Provider</span>
                <p className="mt-1 font-medium">{provider}</p>
              </li>
              <li className="cp-panel p-3">
                <span className="text-[10px] uppercase text-[var(--cp-muted)]">Version</span>
                <p className="mt-1 font-medium">{discover?.version ?? "—"}</p>
              </li>
              <li className="cp-panel p-3">
                <span className="text-[10px] uppercase text-[var(--cp-muted)]">Nodes</span>
                <p className="mt-1 font-medium">{discover?.nodes ?? "—"}</p>
              </li>
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
          <p className="rounded-[var(--cp-radius)] border border-[var(--cp-crit)]/30 bg-[var(--cp-crit)]/10 px-3 py-2 text-[12px] text-[var(--cp-crit)]">
            Connection failed — {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
