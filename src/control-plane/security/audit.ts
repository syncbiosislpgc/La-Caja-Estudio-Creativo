import { appendFile, mkdir, readFile } from "fs/promises";
import path from "path";
import type { SessionUser } from "./auth";

const ROOT = path.join(process.cwd(), "data", "control-plane");
const AUDIT = path.join(ROOT, "audit.jsonl");

export type AuditEvent = {
  at: string;
  actor: string;
  role: string;
  action: string;
  ok: boolean;
  detail?: Record<string, unknown>;
};

export async function appendAudit(
  user: SessionUser | null,
  action: string,
  ok: boolean,
  detail?: Record<string, unknown>,
) {
  const evt: AuditEvent = {
    at: new Date().toISOString(),
    actor: user?.username ?? "anonymous",
    role: user?.role ?? "none",
    action,
    ok,
    detail: redact(detail),
  };
  try {
    await mkdir(ROOT, { recursive: true });
    await appendFile(AUDIT, `${JSON.stringify(evt)}\n`, "utf8");
  } catch {
    // Avoid failing the request if disk is unavailable (e.g. some serverless).
    console.info("[cp-audit]", JSON.stringify(evt));
  }
}

export async function readAudit(limit = 100): Promise<AuditEvent[]> {
  try {
    const raw = await readFile(AUDIT, "utf8");
    return raw
      .trim()
      .split("\n")
      .filter(Boolean)
      .slice(-limit)
      .map((l) => JSON.parse(l) as AuditEvent)
      .reverse();
  } catch {
    return [];
  }
}

function redact(detail?: Record<string, unknown>) {
  if (!detail) return detail;
  const out: Record<string, unknown> = { ...detail };
  for (const k of Object.keys(out)) {
    const lk = k.toLowerCase();
    if (
      lk.includes("kubeconfig") ||
      lk.includes("token") ||
      lk.includes("password") ||
      lk.includes("secret")
    ) {
      out[k] = "[redacted]";
    }
  }
  return out;
}
