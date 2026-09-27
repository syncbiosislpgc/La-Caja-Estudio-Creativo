import { getAllowedNamespace } from "./config";

const BLOCKED_IMAGE_PATTERNS = [
  /:latest$/i,
  /^docker\.io\/library\/busybox/i,
  /privileged/i,
];

const BLOCKED_NAME_PATTERNS = [
  /^kube-/i,
  /^system:/i,
];

export type PolicyResult = { ok: true } | { ok: false; reason: string };

export function validateWorkloadSpec(input: {
  name?: string;
  image?: string;
  namespace?: string;
  replicas?: number;
}): PolicyResult {
  if (!input.name || !/^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/.test(input.name)) {
    return {
      ok: false,
      reason: "Invalid workload name (DNS-1123 subdomain required)",
    };
  }
  if (BLOCKED_NAME_PATTERNS.some((p) => p.test(input.name!))) {
    return { ok: false, reason: "Workload name reserved" };
  }
  if (!input.image || input.image.length > 255) {
    return { ok: false, reason: "Image required" };
  }
  if (input.image.includes(" ") || input.image.includes("\n")) {
    return { ok: false, reason: "Invalid image reference" };
  }
  for (const p of BLOCKED_IMAGE_PATTERNS) {
    if (p.test(input.image)) {
      return {
        ok: false,
        reason: `Image blocked by policy (${p}). Pin a specific non-latest tag.`,
      };
    }
  }
  const ns = input.namespace ?? getAllowedNamespace();
  if (ns !== getAllowedNamespace()) {
    return {
      ok: false,
      reason: `Writes limited to namespace "${getAllowedNamespace()}"`,
    };
  }
  if (input.replicas !== undefined && (input.replicas < 0 || input.replicas > 10)) {
    return { ok: false, reason: "Replicas must be between 0 and 10" };
  }
  return { ok: true };
}

export function assertManagedNamespace(namespace: string | undefined): PolicyResult {
  const allowed = getAllowedNamespace();
  if (!namespace || namespace !== allowed) {
    return {
      ok: false,
      reason: `Mutation limited to managed namespace "${allowed}"`,
    };
  }
  return { ok: true };
}

export function validateKubeconfigShape(content: string): PolicyResult {
  if (!content || content.length < 32) {
    return { ok: false, reason: "Kubeconfig too short" };
  }
  if (content.length > 512_000) {
    return { ok: false, reason: "Kubeconfig too large" };
  }
  if (!content.includes("apiVersion") || !content.includes("clusters")) {
    return { ok: false, reason: "Invalid kubeconfig structure" };
  }
  // Reject obvious private key dumps pasted alone
  if (content.includes("BEGIN OPENSSH PRIVATE KEY") && !content.includes("kind: Config")) {
    return { ok: false, reason: "Paste a full kubeconfig, not a bare private key" };
  }
  return { ok: true };
}
