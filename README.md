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

## Fases

1. Arquitectura + design system + layout ← actual
2. Home
3. Estudio + Servicios
4. Portfolio + CMS
5. Shop
6. Collabs
7. Personalizador
8. Animaciones avanzadas
9. SEO + performance + a11y + QA

## Branding

El wordmark **LA CAJA** es un archivo gráfico original. Sustituir `public/brand/wordmark.svg` por el master oficial.
