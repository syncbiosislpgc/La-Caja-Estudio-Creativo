# LA CAJA | Estudio Creativo

Universo digital de **LA Caja** — estudio creativo 360º en Las Palmas de Gran Canaria.

> TODO EL ARTE CABE AQUÍ.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- GSAP + Framer Motion
- Sanity CMS (Studio en `/studio`)
- Shopify Headless (Fase 5+)
- Deploy: Vercel

## Desarrollo

```bash
pnpm install
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000).  
Admin CMS: [http://localhost:3000/studio](http://localhost:3000/studio) (requiere variables Sanity).

## Variables de entorno

Copia `.env.example` → `.env.local` y completa Sanity / Shopify / URL del sitio.

## Documentación

Ver [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) para arquitectura, design system, modelos de datos, credenciales y fases.

## Rutas

| Ruta | Producto |
|------|----------|
| `/` | LA CAJA — Estudio Creativo |
| `/control-plane` | AI-Native Edge & Network Control Plane |

Documentación del control plane: [`docs/CONTROL_PLANE_ARCHITECTURE.md`](./docs/CONTROL_PLANE_ARCHITECTURE.md)

## Branding LA CAJA

El wordmark **LA CAJA** es un archivo gráfico. Sustituir `public/brand/wordmark.svg` por el master oficial.
