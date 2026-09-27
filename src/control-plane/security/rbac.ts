import type { CpRole } from "./config";

export type Permission =
  | "snapshot:read"
  | "cluster:read"
  | "cluster:connect"
  | "cluster:disconnect"
  | "workload:read"
  | "workload:deploy"
  | "workload:mutate"
  | "workload:delete"
  | "audit:read"
  | "security:admin";

const ROLE_PERMS: Record<CpRole, Permission[]> = {
  Viewer: ["snapshot:read", "cluster:read", "workload:read"],
  Operator: [
    "snapshot:read",
    "cluster:read",
    "cluster:connect",
    "cluster:disconnect",
    "workload:read",
    "workload:deploy",
    "workload:mutate",
    "workload:delete",
    "audit:read",
  ],
  Admin: [
    "snapshot:read",
    "cluster:read",
    "cluster:connect",
    "cluster:disconnect",
    "workload:read",
    "workload:deploy",
    "workload:mutate",
    "workload:delete",
    "audit:read",
    "security:admin",
  ],
};

export function can(role: CpRole, permission: Permission): boolean {
  return ROLE_PERMS[role].includes(permission);
}
