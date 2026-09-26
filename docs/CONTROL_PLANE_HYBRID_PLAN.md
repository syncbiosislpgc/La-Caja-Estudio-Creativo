# Hybrid Control Plane — Implementation Plan (P0)

## Estado actual
- Dominio + seed + simulator + scheduler en `src/control-plane/domain`
- UI cliente con mundo 100% simulado
- API: solo `GET /api/control-plane/snapshot`
- **No existe** abstracción InfrastructureProvider todavía

## Cambios (quirúrgicos, sin tocar LA CAJA)

1. Extender tipos con `source: simulation | kubernetes`
2. `InfrastructureProvider` interface + `SimulationInfrastructureProvider` + `KubernetesInfrastructureProvider`
3. Registry híbrido que fusiona ambas fuentes
4. Persistencia local server-side de conexiones (kubeconfig **nunca** al cliente)
5. APIs: connect / test / discover / deploy / delete / events
6. UI: badges REAL/SIMULATED, filtro, wizard Connect Cluster
7. Tests unitarios de providers (mock K8s)
8. Docs: architecture, KUBERNETES_ADAPTER, LOCAL_DEMO

## No hacer ahora
O-RAN/MEC/SDN físico, Edge Agent, OIDC enterprise, microservicios.
