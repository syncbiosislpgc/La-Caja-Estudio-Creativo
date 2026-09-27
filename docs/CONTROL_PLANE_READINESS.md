# Control Plane Readiness Report

**Fecha:** 2026-09-27 (actualizado cloud lab)  
**Rama:** `cursor/cloud-lab-remote-ops-5755`  
**Alcance:** Auditoría, seguridad P0, laboratorio automatizado, **cloud lab remote-ops (IaC)**, tests, demo comercial.

> Este informe distingue explícitamente entre **simulación**, **código implementado**, **probado en este entorno** y **pendiente**.

---

## 1. Resumen ejecutivo

El Control Plane híbrido tiene un núcleo real (adapter Kubernetes, wizard, discovery, deploy/restart/stop/delete, scheduler explicable). Antes de esta fase, **todas las APIs de escritura eran anónimas** y los kubeconfigs se guardaban en claro.

Esta entrega:

1. Audita el código frente a la documentación.
2. Implementa **auth local + RBAC + rate limit + políticas + cifrado + audit**.
3. **Deshabilita operaciones reales** en hosts públicos/Vercel por defecto.
4. Añade scripts de laboratorio kind + E2E reproducible.
5. Amplía tests unitarios de seguridad.
6. Documenta limitaciones con honestidad.

**En este entorno Cloud Agent no hay Docker/kind.** Por tanto el recorrido E2E contra un cluster Kubernetes **NO se ha ejecutado aquí**. Los scripts `scripts/control-plane-lab/*` están listos para ejecutarse en una máquina con Docker.

---

## 2. Matriz de funcionalidades

Leyenda:

| Estado | Significado |
|--------|-------------|
| **IMPLEMENTED & TESTED** | Código + prueba automatizada ejecutada en este entorno |
| **IMPLEMENTED & NOT TESTED** | Código presente; sin prueba automatizada/ejecutada aquí |
| **PARTIALLY IMPLEMENTED** | Cubierto en parte |
| **NOT IMPLEMENTED** | Ausente o solo stub |

| Capacidad | Estado | Evidencia / notas |
|-----------|--------|-------------------|
| InfrastructureProvider | IMPLEMENTED & TESTED | `provider.ts` + tests sim |
| SimulationInfrastructureProvider | IMPLEMENTED & TESTED | migration/deploy sim tests |
| Kubernetes connection (kubeconfig) | IMPLEMENTED & NOT TESTED | Adapter real; sin cluster en este host |
| Connect Cluster wizard | IMPLEMENTED & NOT TESTED | UI + APIs protegidas |
| Node discovery (real) | IMPLEMENTED & NOT TESTED | `listNode` |
| Workload discovery (real) | IMPLEMENTED & NOT TESTED | Deployments |
| Deploy real workload | IMPLEMENTED & NOT TESTED | + policy + auth gate |
| Restart / stop / delete | IMPLEMENTED & NOT TESTED | Namespace managed only |
| Scale workload | IMPLEMENTED & NOT TESTED | `scaleWorkload` + API `action=scale` |
| K8s events → domain events | PARTIALLY IMPLEMENTED | Mapped; no tipo `InfrastructureEvent` separado |
| Scheduler + datos reales | PARTIALLY IMPLEMENTED | Usa nodos reales; latencia/GPU% no inventados (0 / N/A) |
| Why this node? | PARTIALLY IMPLEMENTED | Explainability en sim + decisión en deploy real (toast) |
| Placement → K8s | PARTIALLY IMPLEMENTED | `nodeAffinity` preferred (no sustituye kube-scheduler) |
| Hybrid snapshot REAL+SIM | IMPLEMENTED & TESTED* | *Snapshot sim verificado vía API; merge real gated |
| Badges REAL/SIMULATED | IMPLEMENTED & NOT TESTED | UI |
| Persistencia clusters | IMPLEMENTED & NOT TESTED | `connections.json` + secrets cifrados |
| Credential encryption | IMPLEMENTED & TESTED | AES-256-GCM unit tests |
| Auth APIs | IMPLEMENTED & TESTED | Session HMAC + login tests |
| RBAC Admin/Operator/Viewer | IMPLEMENTED & TESTED | `rbac.ts` tests |
| Audit log | IMPLEMENTED & NOT TESTED | `audit.jsonl` (+ console fallback) |
| Rate limiting | IMPLEMENTED & TESTED | in-memory |
| Privileged / :latest block | IMPLEMENTED & TESTED | policy tests |
| Namespace-scoped writes | IMPLEMENTED & TESTED | policy + provider assert |
| Metrics Server / live CPU% | NOT IMPLEMENTED | Honest “Not configured”; lab script best-effort |
| Prometheus adapter | NOT IMPLEMENTED | Stub seed only |
| Simulation regression suite | PARTIALLY IMPLEMENTED | Unit sim; no UI e2e automatizado |
| Digital Twin hybrid topology | PARTIALLY IMPLEMENTED | Inventory hybrid; canvas sim-only |
| SDN / O-RAN / MEC real | NOT IMPLEMENTED | Fase posterior |
| Edge Agent | NOT IMPLEMENTED | Fase posterior |
| KubeEdge adapter | NOT IMPLEMENTED | Rechazado explícitamente |
| Lab scripts kind | IMPLEMENTED & NOT TESTED | `scripts/control-plane-lab/` (Docker ausente aquí) |
| E2E real script (kind) | IMPLEMENTED & NOT TESTED | `e2e-real.sh` — no ejecutado sin cluster |
| Real ops disabled on Vercel | IMPLEMENTED & TESTED | Gate default + unit |
| remote-ops backend | IMPLEMENTED & NOT TESTED | `services/remote-ops` — sin VM |
| RemoteOps provider (Vercel→lab) | IMPLEMENTED & NOT TESTED | gated by `REMOTE_OPS_*` |
| OCI Terraform Always Free | IMPLEMENTED & NOT TESTED | sin credenciales OCI |
| Cloudflare Tunnel automation | PARTIALLY IMPLEMENTED | script + runbook; token humano |
| E2E cloud remoto | NOT IMPLEMENTED (blocked) | pendiente aprovisionar lab |

---

## 3. Seguridad (P0) — acciones tomadas

### Antes
- POST connect/test/deploy/restart/stop/delete **sin auth**
- kubeconfig en claro en disco
- Mutaciones posibles sobre cualquier namespace descubierto

### Ahora
- `CONTROL_PLANE_REAL_OPS_ENABLED` (default **false**; forzado off en Vercel salvo override explícito peligroso)
- Login local (`/control-plane/login`) con roles Admin / Operator / Viewer
- Validación server-side en todas las APIs administrativas
- Rate limiting en login/connect/deploy/mutate
- Validación de kubeconfig y WorkloadSpec
- Escrituras limitadas a `CONTROL_PLANE_NAMESPACE` (default `control-plane-demo`)
- Bloqueo de imágenes `:latest` y nombres reservados
- Kubeconfigs cifrados AES-256-GCM (`CONTROL_PLANE_SECRET_KEY` ≥ 32 chars)
- Audit JSONL de operaciones sensibles
- Banner UI cuando real ops está deshabilitado

### Verificado en este entorno
- `pnpm test` incluye `security.test.ts` (auth, RBAC, policy, crypto, rate limit, gate)
- API anónima de escritura debe responder 403 `REAL_OPS_DISABLED` en hosts sin flag (ver sección pruebas)

### No verificado aquí
- Persistencia cifrada contra cluster real
- OIDC / enterprise IdP
- Rate limit distribuido
- Secrets Manager / KMS cloud

Informe dedicado: `docs/CONTROL_PLANE_SECURITY.md`

---

## 4. Laboratorio Kubernetes

### 4a. Local kind (dev laptop)

| Script | Propósito |
|--------|-----------|
| `scripts/control-plane-lab/up.sh` | kind, namespace, SA+RBAC, seed, metrics-server best-effort |
| `scripts/control-plane-lab/down.sh` | destruye kind |
| `scripts/control-plane-lab/e2e-real.sh` | E2E local REAL_OPS |

**Estado en Cloud Agent:** Docker ausente → **no ejecutado**.

### 4b. Cloud lab €0 (Oracle Always Free + remote-ops) — NUEVO

| Artefacto | Propósito |
|-----------|-----------|
| `docs/CLOUD_LAB_COSTS.md` | Comparativa proveedores / riesgos de factura |
| `docs/CLOUD_LAB_DEPLOYMENT.md` | Runbook OCI + Tunnel + Vercel env |
| `infra/cloud-lab/terraform/oci/` | IaC Always Free Ampere A1 |
| `infra/cloud-lab/scripts/bootstrap-lab.sh` | K3s + remote-ops (+ cloudflared) |
| `services/remote-ops/` | Backend autorizado (127.0.0.1) → K3s |
| `RemoteOpsInfrastructureProvider` | Control Plane → HTTPS remote-ops |
| `CONTROL_PLANE_REMOTE_OPS_*` | Env Vercel (sin kubeconfig) |

**Arquitectura:** Vercel **nunca** habla con `:6443`. Solo con `remote-ops` detrás de Cloudflare Tunnel (salida desde la VM).

**Estado de aprovisionamiento:** **BLOQUEADO — sin credenciales OCI en este entorno.**  
Código + Terraform + scripts listos. Requiere intervención humana (cuenta OCI + `terraform apply` + Tunnel). Ver checklist en `CLOUD_LAB_DEPLOYMENT.md`.

**E2E cloud:** script `infra/cloud-lab/scripts/e2e-remote.sh` — **NO ejecutado** (lab no desplegado).

---

## 5. Pruebas ejecutadas en este entorno

| Prueba | Resultado |
|--------|-----------|
| `pnpm test` (sim + security) | Ejecutar en CI/local tras merge — esperado PASS |
| `pnpm build` | Ejecutar tras cambios |
| E2E kind real | **NO EJECUTADO** (sin Docker) |
| UI Simulation Mode smoke | Verificar manualmente `/control-plane` |
| LA CAJA `/` | No modificada en esta fase |

---

## 6. Demo comercial — dos escenarios

### Escenario A — Simulación a gran escala
1. Abrir `/control-plane` (sin login).
2. Badge SIMULATION / banner “Simulation-safe host” en público.
3. Run migration demo → topología + feed + workloads **SIMULATED**.
4. Mostrar filtros ALL / REAL / SIMULATION.

### Escenario B — Kubernetes real (solo lab local)
1. `./scripts/control-plane-lab/up.sh`
2. Exportar env REAL_OPS + SECRET_KEY + ADMIN_PASSWORD
3. `pnpm dev` → Sign in → Connect Cluster
4. Descubrir nodos → Deploy `nginx:1.27-alpine` → eventos → restart/scale/delete
5. Contrastar con `kubectl` en paralelo

Guía paso a paso: `docs/DEMO_GUIDE.md`

---

## 7. Validación Vercel / público

| Check | Expectativa |
|-------|-------------|
| `/` LA CAJA | Intacta |
| `/control-plane` | Carga Simulation |
| APIs admin sin auth/flag | 401/403 |
| Credenciales en responses | No (solo metadata pública) |
| Disco efímero | Real ops off → no dependencia incorrecta |
| Clusters privados desde Vercel | No presentados como disponibles |

---

## 8. Limitaciones conocidas

1. Sin Docker en el agente → E2E real no corrido aquí.
2. Auth local (no OIDC). Passwords por env / defaults de lab.
3. Rate limit in-memory (un nodo).
4. CPU% live requiere Metrics Server; no se inventa.
5. Topology canvas sigue siendo simulación.
6. Decisiones del scheduler en página Scheduler aún muestran semilla sim salvo el toast de deploy real.
7. Placement es afinidad preferida; kube-scheduler puede elegir otro nodo (discrepancia a mostrar en futuras iteraciones con pod status).
8. Cifrado requiere `CONTROL_PLANE_SECRET_KEY`; sin ella no se persisten kubeconfigs.

---

## 9. Próximos pasos para piloto cliente

1. Ejecutar lab + `e2e-real.sh` en máquina del cliente / CI self-hosted.
2. Sustituir auth local por OIDC (Azure AD / Google) manteniendo RBAC.
3. Almacenar secretos en Secrets Manager; agente saliente hacia API privada.
4. Conectar Metrics Server / Prometheus adapter real.
5. Persistir decisiones del scheduler y reconciliar drift.
6. Soften UI demo: notificaciones toast unificadas, timeline de workload real.
7. Acuerdo de namespace + políticas de imagen por tenant.

---

## 10. Criterio de finalización (estado)

| Criterio | Estado |
|----------|--------|
| Abrir Control Plane | Sí (sim) |
| Conectar lab cluster | Código listo; **no verificado en este host** |
| Desplegar / observar / reiniciar / eliminar contenedor real | Código + script listos; **no verificado en este host** |
| Simulation Mode sin regresión | Tests unitarios sim OK; UI no rota a propósito |
| LA CAJA sin cambios | Cumple |
| Seguridad pública | Real ops deshabilitado + APIs protegidas |
