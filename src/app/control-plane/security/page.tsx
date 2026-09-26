import { ModePill, PageHeader } from "@/components/control-plane/ui";

const ROLES = [
  "Platform Admin",
  "Network Operator",
  "Edge Operator",
  "AI Developer",
  "Security Operator",
  "Viewer",
];

export default function SecurityPage() {
  return (
    <div>
      <PageHeader
        title="Security"
        subtitle="OIDC/OAuth2 abstraction · RBAC · audit · mTLS (stubs in Phase 1)"
        actions={<ModePill mode="NOT_CONFIGURED" />}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="cp-panel p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--cp-muted)]">
            Roles
          </p>
          <ul className="mt-3 space-y-2 text-[12px]">
            {ROLES.map((r) => (
              <li
                key={r}
                className="border-t border-[var(--cp-border)] pt-2 text-[var(--cp-text)]"
              >
                {r}
              </li>
            ))}
          </ul>
        </div>
        <div className="cp-panel p-4 text-[12px] text-[var(--cp-muted)]">
          <p className="font-semibold text-[var(--cp-text)]">Phase 1 status</p>
          <ul className="mt-3 list-disc space-y-1 pl-4">
            <li>Auth: NOT_CONFIGURED (demo role Platform Admin)</li>
            <li>RBAC model defined; enforcement pending OIDC</li>
            <li>Audit: domain events feed acts as preliminary audit stream</li>
            <li>Secrets / cert lifecycle: adapters planned</li>
            <li>Tenant isolation: single demo tenant seeded</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
