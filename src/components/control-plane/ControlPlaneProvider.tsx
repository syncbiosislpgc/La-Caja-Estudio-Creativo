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
import type { WorldSnapshot } from "@/control-plane/domain/types";

type CpContext = {
  world: WorldSnapshot;
  loading: boolean;
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

export function ControlPlaneProvider({ children }: { children: React.ReactNode }) {
  const [world, setWorld] = useState<WorldSnapshot>(() => createSeedWorld());
  const [loading, setLoading] = useState(true);
  const [demoRunning, setDemoRunning] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/control-plane/snapshot");
        if (res.ok) {
          const data = (await res.json()) as WorldSnapshot;
          if (!cancelled) setWorld(data);
        }
      } catch {
        /* keep local seed */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const reset = useCallback(() => setWorld(createSeedWorld()), []);
  const injectGpuSat = useCallback(
    () => setWorld((w) => injectGpuSaturation(w)),
    [],
  );
  const injectNetCongestion = useCallback(
    () => setWorld((w) => injectCongestion(w)),
    [],
  );
  const migrate = useCallback(() => setWorld((w) => runAutoMigration(w)), []);
  const recover = useCallback(
    () => setWorld((w) => recoverInfrastructure(w)),
    [],
  );
  const takeNodeOffline = useCallback(
    (nodeId: string) => setWorld((w) => disableNode(w, nodeId)),
    [],
  );

  const runDemoMigration = useCallback(async () => {
    setDemoRunning(true);
    setWorld(createSeedWorld());
    await wait(600);
    setWorld((w) => injectGpuSaturation(w));
    await wait(1200);
    setWorld((w) => runAutoMigration(w));
    await wait(400);
    setDemoRunning(false);
  }, []);

  const value = useMemo(
    () => ({
      world,
      loading,
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
      loading,
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
