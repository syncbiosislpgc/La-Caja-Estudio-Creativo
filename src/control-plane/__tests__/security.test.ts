import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  authenticateLocal,
  createSessionToken,
  verifySessionToken,
} from "@/control-plane/security/auth";
import { can } from "@/control-plane/security/rbac";
import {
  validateKubeconfigShape,
  validateWorkloadSpec,
} from "@/control-plane/security/policy";
import { encryptSecret, decryptSecret, isEncryptedPayload } from "@/control-plane/security/crypto";
import { rateLimit } from "@/control-plane/security/rate-limit";
import { realOpsEnabled } from "@/control-plane/security/config";

describe("RBAC", () => {
  it("Viewer cannot deploy", () => {
    expect(can("Viewer", "workload:deploy")).toBe(false);
    expect(can("Viewer", "snapshot:read")).toBe(true);
  });
  it("Operator can deploy but not security:admin", () => {
    expect(can("Operator", "workload:deploy")).toBe(true);
    expect(can("Operator", "security:admin")).toBe(false);
  });
  it("Admin has full permissions", () => {
    expect(can("Admin", "cluster:connect")).toBe(true);
    expect(can("Admin", "security:admin")).toBe(true);
  });
});

describe("Local session auth", () => {
  it("rejects bad password", () => {
    expect(authenticateLocal("admin", "wrong-password")).toBeNull();
  });
  it("issues and verifies signed session", () => {
    const user = authenticateLocal("admin", "cp-admin-lab-change-me");
    expect(user?.role).toBe("Admin");
    const token = createSessionToken({
      username: user!.username,
      role: user!.role,
    });
    const verified = verifySessionToken(token);
    expect(verified?.username).toBe("admin");
    expect(verifySessionToken("tampered.token")).toBeNull();
  });
});

describe("Workload policy", () => {
  it("blocks :latest images", () => {
    const r = validateWorkloadSpec({
      name: "demo",
      image: "nginx:latest",
      namespace: "control-plane-demo",
    });
    expect(r.ok).toBe(false);
  });
  it("allows pinned nginx in managed namespace", () => {
    const r = validateWorkloadSpec({
      name: "traffic-demo",
      image: "nginx:1.27-alpine",
      namespace: "control-plane-demo",
    });
    expect(r.ok).toBe(true);
  });
  it("rejects foreign namespace writes", () => {
    const r = validateWorkloadSpec({
      name: "traffic-demo",
      image: "nginx:1.27-alpine",
      namespace: "kube-system",
    });
    expect(r.ok).toBe(false);
  });
});

describe("Kubeconfig validation", () => {
  it("rejects empty", () => {
    expect(validateKubeconfigShape("").ok).toBe(false);
  });
  it("accepts minimal shape", () => {
    const kc = `
apiVersion: v1
kind: Config
clusters:
- name: c
  cluster:
    server: https://127.0.0.1
contexts: []
users: []
`;
    expect(validateKubeconfigShape(kc).ok).toBe(true);
  });
});

describe("Secret encryption", () => {
  beforeEach(() => {
    process.env.CONTROL_PLANE_SECRET_KEY = "a".repeat(32) + "test-key-material";
  });

  it("round-trips kubeconfig ciphertext", () => {
    const plain = "apiVersion: v1\nkind: Config\n";
    const enc = encryptSecret(plain);
    expect(isEncryptedPayload(enc)).toBe(true);
    expect(decryptSecret(enc)).toBe(plain);
  });
});

describe("Rate limit", () => {
  it("trips after limit", () => {
    const key = `test-${Math.random()}`;
    expect(rateLimit(key, 2, 60_000).ok).toBe(true);
    expect(rateLimit(key, 2, 60_000).ok).toBe(true);
    expect(rateLimit(key, 2, 60_000).ok).toBe(false);
  });
});

describe("Real ops gate", () => {
  it("defaults to disabled without env", () => {
    const prev = process.env.CONTROL_PLANE_REAL_OPS_ENABLED;
    delete process.env.CONTROL_PLANE_REAL_OPS_ENABLED;
    expect(realOpsEnabled()).toBe(false);
    if (prev !== undefined) process.env.CONTROL_PLANE_REAL_OPS_ENABLED = prev;
  });
});
