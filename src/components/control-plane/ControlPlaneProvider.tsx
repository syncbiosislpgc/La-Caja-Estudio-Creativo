"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createSeedWorld } from "@/control-plane/domain/seed";
import {
  disableNode,
  injectCongestion,
  injectGpuSaturation,
  recoverInfrastructure,
  runAutoMigration,
} from "@/control-plane/domain/simulator";
import type {
  ClusterConnection,
  InfraSource,
  WorldSnapshot,
} from "@/control-plane/domain/types";

type HybridSnapshot = WorldSnapshot & {
  connections?: ClusterConnection[];
  telemetryNote?: string;
  realOpsEnabled?: boolean;
  remoteOpsEnabled?: boolean;
  security?: {
    note?: string;
    realOpsEnabled?: boolean;
    remoteOpsEnabled?: boolean;
    remoteOpsConfigured?: boolean;
  };
};

type SessionInfo = {
  authenticated: boolean;
  username?: string;
  role?: string;
};

type CpContext = {
  world: WorldSnapshot;
  connections: ClusterConnection[];
  telemetryNote: string;
  realOpsEnabled: boolean;
  remoteOpsEnabled: boolean;
  session: SessionInfo;
  refreshSession: () => Promise<void>;
  sourceFilter: "ALL" | "REAL" | "SIMULATION";
  setSourceFilter: (f: "ALL" | "REAL" | "SIMULATION") => void;
  loading: boolean;
  refresh: () => Promise<void>;
  reset: () => void;
  injectGpuSat: () => void;
  injectNetCongestion: () => void;
  migrate: () => void;
  recover: () => void;
  takeNodeOffline: (nodeId: string) => void;
  runDemoMigration: () => Promise<void>;
  demoRunning: boolean;
};

const Ctx = createContext<CpContext | null>(null);

function isReal(source?: InfraSource) {
  return source === "kubernetes" || source === "k3s" || source === "kubeedge";
}

export function ControlPlaneProvider({ children }: { children: React.ReactNode }) {
  const [simWorld, setSimWorld] = useState<WorldSnapshot>(() => createSeedWorld());
  const [realSlice, setRealSlice] = useState<{
    clusters: WorldSnapshot["clusters"];
    nodes: WorldSnapshot["nodes"];
    workloads: WorldSnapshot["workloads"];
    events: WorldSnapshot["events"];
    sites: WorldSnapshot["sites"];
  }>({ clusters: [], nodes: [], workloads: [], events: [], sites: [] });
  const [connections, setConnections] = useState<ClusterConnection[]>([]);
  const [telemetryNote, setTelemetryNote] = useState("");
  const [realOpsEnabled, setRealOpsEnabled] = useState(false);
  const [remoteOpsEnabled, setRemoteOpsEnabled] = useState(false);
  const [session, setSession] = useState<SessionInfo>({ authenticated: false });
  const [sourceFilter, setSourceFilter] = useState<"ALL" | "REAL" | "SIMULATION">(
    "ALL",
  );
  const [loading, setLoading] = useState(true);
  const [demoRunning, setDemoRunning] = useState(false);

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch("/api/control-plane/auth/session", {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = (await res.json()) as {
        authenticated: boolean;
        user?: { username: string; role: string } | null;
      };
      setSession({
        authenticated: data.authenticated,
        username: data.user?.username,
        role: data.user?.role,
      });
    } catch {
      /* ignore */
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/control-plane/snapshot", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as HybridSnapshot;
      // Split: keep client sim mutations for sim entities; replace real from server
      const realClusters = data.clusters.filter((c) => isReal(c.source));
      const realNodes = data.nodes.filter((n) => isReal(n.source));
      const realWorkloads = data.workloads.filter((w) => isReal(w.source));
      const simClusters = data.clusters.filter((c) => !isReal(c.source));
      const simNodes = data.nodes.filter((n) => !isReal(n.source));
      const simWorkloads = data.workloads.filter((w) => !isReal(w.source));

      setRealSlice({
        clusters: realClusters,
        nodes: realNodes,
        workloads: realWorkloads,
        events: data.events.filter((e) => e.meta?.source === "kubernetes"),
        sites: data.sites.filter((s) => s.id.startsWith("site-k8s")),
      });

      setSimWorld((prev) => {
        // On first load or reset, take sim from server; else preserve sim mutations
        const hasMutations = prev.simulation.scenario !== "Normal Edge Network";
        if (!hasMutations && prev.simulation.tick === 0) {
          return {
            ...data,
            clusters: simClusters,
            nodes: simNodes,
            workloads: simWorkloads,
            sites: data.sites.filter((s) => !s.id.startsWith("site-k8s")),
            events: data.events.filter((e) => e.meta?.source !== "kubernetes"),
          };
        }
        return prev;
      });

      setConnections(data.connections ?? []);
      setTelemetryNote(data.telemetryNote ?? "");
      setRealOpsEnabled(Boolean(data.realOpsEnabled ?? data.security?.realOpsEnabled));
      setRemoteOpsEnabled(
        Boolean(data.remoteOpsEnabled ?? data.security?.remoteOpsConfigured),
      );
    } catch {
      /* keep local */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await Promise.all([refresh(), refreshSession()]);
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh, refreshSession]);

  const world = useMemo<WorldSnapshot>(() => {
    return {
      ...simWorld,
      clusters: [...simWorld.clusters, ...realSlice.clusters],
      nodes: [...simWorld.nodes, ...realSlice.nodes],
      workloads: [...simWorld.workloads, ...realSlice.workloads],
      sites: [...simWorld.sites, ...realSlice.sites],
      events: [...realSlice.events, ...simWorld.events].slice(0, 100),
    };
  }, [simWorld, realSlice]);

  const reset = useCallback(() => {
    setSimWorld(createSeedWorld());
    void refresh();
  }, [refresh]);

  const injectGpuSat = useCallback(
    () => setSimWorld((w) => injectGpuSaturation(w)),
    [],
  );
  const injectNetCongestion = useCallback(
    () => setSimWorld((w) => injectCongestion(w)),
    [],
  );
  const migrate = useCallback(() => setSimWorld((w) => runAutoMigration(w)), []);
  const recover = useCallback(
    () => setSimWorld((w) => recoverInfrastructure(w)),
    [],
  );
  const takeNodeOffline = useCallback((nodeId: string) => {
    setSimWorld((w) => {
      const n = w.nodes.find((x) => x.id === nodeId);
      if (!n || isReal(n.source)) return w;
      return disableNode(w, nodeId);
    });
  }, []);

  const runDemoMigration = useCallback(async () => {
    setDemoRunning(true);
    setSimWorld(createSeedWorld());
    await wait(600);
    setSimWorld((w) => injectGpuSaturation(w));
    await wait(1200);
    setSimWorld((w) => runAutoMigration(w));
    await wait(400);
    setDemoRunning(false);
  }, []);

  const value = useMemo(
    () => ({
      world,
      connections,
      telemetryNote,
      realOpsEnabled,
      remoteOpsEnabled,
      session,
      refreshSession,
      sourceFilter,
      setSourceFilter,
      loading,
      refresh,
      reset,
      injectGpuSat,
      injectNetCongestion,
      migrate,
      recover,
      takeNodeOffline,
      runDemoMigration,
      demoRunning,
    }),
    [
      world,
      connections,
      telemetryNote,
      realOpsEnabled,
      remoteOpsEnabled,
      session,
      refreshSession,
      sourceFilter,
      loading,
      refresh,
      reset,
      injectGpuSat,
      injectNetCongestion,
      migrate,
      recover,
      takeNodeOffline,
      runDemoMigration,
      demoRunning,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useControlPlane() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useControlPlane outside provider");
  return ctx;
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
