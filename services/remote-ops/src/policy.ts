import type { RemoteOpsConfig } from "./config.js";

export type PolicyResult = { ok: true } | { ok: false; reason: string };

export function validateDeploy(
  cfg: RemoteOpsConfig,
  body: {
    name?: string;
    image?: string;
    namespace?: string;
    replicas?: number;
    cpu?: string;
    memory?: string;
  },
): PolicyResult {
  if (!body.name || !/^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/.test(body.name)) {
    return { ok: false, reason: "Invalid DNS-1123 name" };
  }
  if (!body.image) return { ok: false, reason: "image required" };
  if (body.image.includes(":latest") || /:latest$/i.test(body.image)) {
    return { ok: false, reason: "image tag :latest is blocked" };
  }
  const allowed = cfg.allowedImagePrefixes.some((p) => body.image!.startsWith(p));
  if (!allowed) {
    return {
      ok: false,
      reason: `image not in allowlist (prefixes: ${cfg.allowedImagePrefixes.join(", ")})`,
    };
  }
  const ns = body.namespace ?? cfg.namespace;
  if (ns !== cfg.namespace) {
    return { ok: false, reason: `namespace must be ${cfg.namespace}` };
  }
  const replicas = body.replicas ?? 1;
  if (replicas < 0 || replicas > cfg.maxReplicas) {
    return { ok: false, reason: `replicas must be 0..${cfg.maxReplicas}` };
  }
  return { ok: true };
}
