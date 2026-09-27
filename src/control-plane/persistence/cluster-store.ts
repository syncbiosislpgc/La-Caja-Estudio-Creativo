import { mkdir, readFile, writeFile, unlink } from "fs/promises";
import path from "path";
import type { ClusterConnection } from "@/control-plane/domain/types";
import { decryptSecret, encryptSecret } from "@/control-plane/security/crypto";
import { getSecretKey, realOpsEnabled } from "@/control-plane/security/config";

const ROOT = path.join(process.cwd(), "data", "control-plane");
const META = path.join(ROOT, "connections.json");
const SECRETS = path.join(ROOT, "secrets");

export type StoredConnection = ClusterConnection & {
  /** Absolute path to encrypted kubeconfig on server */
  kubeconfigPath: string;
  context?: string;
  region?: string;
};

async function ensureDirs() {
  await mkdir(SECRETS, { recursive: true });
}

async function readMeta(): Promise<StoredConnection[]> {
  try {
    const raw = await readFile(META, "utf8");
    return JSON.parse(raw) as StoredConnection[];
  } catch {
    return [];
  }
}

async function writeMeta(rows: StoredConnection[]) {
  await ensureDirs();
  await writeFile(META, JSON.stringify(rows, null, 2), "utf8");
}

/** Public view — never includes kubeconfig path content */
export function toPublicConnection(c: StoredConnection): ClusterConnection {
  return {
    id: c.id,
    name: c.name,
    provider: c.provider,
    createdAt: c.createdAt,
    lastSyncAt: c.lastSyncAt,
    status: c.status,
    version: c.version,
    error: c.error,
    hasSecret: true,
  };
}

export async function listConnections(): Promise<StoredConnection[]> {
  return readMeta();
}

export async function getConnection(id: string) {
  return (await readMeta()).find((c) => c.id === id) ?? null;
}

export async function readKubeconfigContent(conn: StoredConnection): Promise<string> {
  const raw = await readFile(conn.kubeconfigPath, "utf8");
  return decryptSecret(raw);
}

export async function saveConnection(input: {
  id: string;
  name: string;
  provider: "kubernetes" | "k3s" | "kubeedge";
  kubeconfigContent: string;
  context?: string;
  region?: string;
}): Promise<StoredConnection> {
  if (!realOpsEnabled()) {
    throw new Error("Real ops disabled — refusing to persist kubeconfig");
  }
  if (!getSecretKey()) {
    throw new Error(
      "CONTROL_PLANE_SECRET_KEY (min 32 chars) required to encrypt kubeconfigs at rest",
    );
  }
  await ensureDirs();
  if (!input.kubeconfigContent.includes("apiVersion")) {
    throw new Error("Invalid kubeconfig: missing apiVersion");
  }

  const kubeconfigPath = path.join(SECRETS, `${input.id}.kubeconfig.enc`);
  const encrypted = encryptSecret(input.kubeconfigContent);
  await writeFile(kubeconfigPath, encrypted, {
    encoding: "utf8",
    mode: 0o600,
  });

  const rows = await readMeta();
  const next: StoredConnection = {
    id: input.id,
    name: input.name,
    provider: input.provider,
    createdAt: new Date().toISOString(),
    status: "CONNECTED",
    hasSecret: true,
    kubeconfigPath,
    context: input.context,
    region: input.region,
  };
  const filtered = rows.filter((r) => r.id !== input.id);
  filtered.push(next);
  await writeMeta(filtered);
  return next;
}

export async function updateConnectionMeta(
  id: string,
  patch: Partial<Pick<StoredConnection, "status" | "version" | "error" | "lastSyncAt">>,
) {
  const rows = await readMeta();
  const idx = rows.findIndex((r) => r.id === id);
  if (idx < 0) return;
  rows[idx] = { ...rows[idx], ...patch };
  await writeMeta(rows);
}

export async function deleteConnection(id: string) {
  const rows = await readMeta();
  const found = rows.find((r) => r.id === id);
  await writeMeta(rows.filter((r) => r.id !== id));
  if (found) {
    try {
      await unlink(found.kubeconfigPath);
    } catch {
      /* ignore */
    }
  }
}
