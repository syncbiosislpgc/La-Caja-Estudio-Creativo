# AI-Native Edge & Network Control Plane — Architecture Assessment

## Existing repository (LA CAJA)

| Area | Estado |
|------|--------|
| Stack | Next.js 16 App Router, TypeScript, Tailwind 4, GSAP |
| Auth | Ninguna (sitio marketing) |
| Database | Ninguna |
| Frontend | Site group `(site)` + Sanity Studio |
| Deploy | Vercel temporary / Hobby |
| Reutilizable | Next.js monorepo, Tailwind, Vercel pipeline |

**No reescribir** LA CAJA. El Control Plane vive en una **ruta paralela**.

## Decisión de montaje

```
/                     → LA CAJA (estudio creativo)
/control-plane/*      → AI-Native Edge & Network Control Plane
/api/control-plane/*  → APIs del control plane
```

## Arquitectura objetivo (incremental)

Modular monolith dentro de Next.js:

- **Domain** (`src/control-plane/domain`) — clusters, nodes, workloads, network, scheduler, events
- **Adapters** — Simulation (ahora); K8s/K3s/KubeEdge/OVS (después)
- **API** — Route Handlers App Router
- **Store** — In-memory + seed determinista (Fase 1); SQLite/Postgres después
- **UI** — Layout desktop-first tipo NOC, dark, denso, sin look “SaaS genérico”
- **Auth/RBAC** — Stub con roles (Platform Admin / Viewer…); OIDC real en fases posteriores

## Fases

1. **Ahora:** shell + domain + API + overview + clusters/nodes/workloads + topology + scheduler explain + simulation lab + demo migración  
2. Adapters K8s reales + Edge Agent  
3. Scheduler avanzado + models + OTel  
4. SDN/OVS  
5. Digital twin scale + RAN/MEC  
6. Auto-migración predictiva  
7. Hardening seguridad

## Regla de honestidad

Todo lo no conectado a infra real se marca **SIMULATION MODE**.
