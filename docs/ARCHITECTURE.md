# LA CAJA — Arquitectura definitiva

## 1. Visión técnica

Universo digital de **LA CAJA | Estudio Creativo** (Las Palmas de Gran Canaria).

Principio rector: *TODO CABE EN LA CAJA* — la interfaz es un contenedor abierto donde las cosas entran, salen, se transforman y conviven.

| Capa | Tecnología | Rol |
|------|------------|-----|
| Frontend | Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 | Experiencia visual, rutas, SEO |
| Animación | GSAP + ScrollTrigger; Framer Motion para microinteracciones | Entrada, scroll, hovers |
| CMS | Sanity v3 (Studio embebido en `/studio`) | Proyectos, collabs, páginas, contenido editorial |
| Commerce | Shopify Headless (Storefront API + Cart) | Productos, stock, checkout, pagos |
| Personalizador | React + Konva.js (MVP) | “MÉTELO EN LA CAJA” |
| Deploy | Vercel (Hobby / gratis) | Preview + producción |

Next.js nunca reinventa checkout ni pagos: redirige a Shopify Checkout.

---

## 2. Estructura de carpetas

```
src/
  app/
    (site)/          # Shell con Navigation + Footer
      page.tsx       # Home
      estudio/
      servicios/
      proyectos/[slug]/
      shop/[slug]/
      personaliza/
      colaboraciones/
      contacto/
      carrito/
      checkout/      # Redirect a Shopify
      legal|privacidad|cookies/
    studio/[[...tool]]/  # Sanity Studio (branded)
    not-found.tsx
    robots.ts
    sitemap.ts
  components/
    brand/           # BrandLogo, BrushStroke, BoxFrame, AnimatedBox
    layout/          # Navigation, MobileMenu, Footer
    ui/              # CTA, Button, Marquee, CustomCursor…
    project/         # (Fase 4)
    shop/            # (Fase 5)
    collab/          # (Fase 6)
    configurator/    # (Fase 7)
  lib/
    sanity/          # client, queries, image
    shopify/         # client, cart (Fase 5)
    utils/ cn
  sanity/schemaTypes/
  types/
public/brand/        # Wordmark + símbolo originales
docs/
```

---

## 3. Design system

### Color

| Token | Hex | Uso |
|-------|-----|-----|
| `--lc-black` | `#0B0B0B` | Fondo principal |
| `--lc-black-alt` | `#111111` | Alternativa / capas |
| `--lc-dark` | `#1A1A1A` | Superficies / paneles |
| `--lc-offwhite` | `#F4F2EE` | Texto primario, fondos invertidos |
| `--lc-gray` | `#8A8A8A` | Texto secundario |
| `--lc-lilac` | `#C3A6D9` | Reconocimiento: trazos, hover, CTAs, focus |

Regla: negro + blanco roto + lila estratégico. Nunca “todo lila”.

### Tipografía

- **Wordmark “LA CAJA”**: solo archivo gráfico (`/brand/wordmark.svg` o PNG del original). Nunca recrear con fuente.
- **UI**: Inter (Google Fonts / `next/font`).
  - H1: Black/Bold, compacto, impactante
  - H2: Bold
  - Body: Regular
  - Micro: Regular, tracking amplio, mayúsculas

### Lenguaje gráfico

Trazos de pincel como elementos **funcionales** (subrayar, encuadrar, revelar, máscara, dividir). La caja 3D abierta es contenedor visual interactivo.

### Contraste de marca

ORDEN + GESTO · DISEÑO + INSTINTO · ESTRUCTURA + LIBERTAD

---

## 4. Componentes (Fase 1 + roadmap)

| Componente | Fase | Función |
|------------|------|---------|
| BrandLogo | 1 | Wordmark + símbolo (asset) |
| BrushStroke | 1 | SVG de trazo reutilizable |
| BoxFrame | 1 | Contenedor “caja” |
| AnimatedBox | 1/2 | Apertura / dibujo del símbolo |
| Navigation / MobileMenu | 1 | Nav desktop + fullscreen móvil |
| Footer | 1 | Newsletter + links legales |
| CTA / Button | 1 | Brochazo lila en hover |
| CustomCursor | 1 | Cursor sutil (desktop) |
| Marquee | 1/2 | Cinta de categorías |
| Hero / Project* / Shop* / Configurator | 2–7 | Según fase |

---

## 5. Modelos de datos (Sanity)

### `project`
title, slug, client, year, category[], description, hero (image|video), gallery, videos, beforeAfter, services[], result, credits, nextProject, seo

### `productEditorial` (contenido shop enriquecido; Shopify es source of truth de precio/stock)
shopifyProductId/handle, story, artist, collection, limitedEdition {total, sold}, launchDate, gallery, video

### `collaboration`
title (`LA CAJA × ARTISTA`), number, artist, story, media, interview, process, linkedProducts[], edition, credits

### `page`
title, slug, sections (portable text / bloques)

### `siteSettings`
navigation, footer, contact, SEO local (Las Palmas / Gran Canaria / Canarias), OG defaults

### Shopify (externo)
products, variants, inventory, orders, checkout — sincronización por handle/ID.

### Personalizador (JSON guardado)
```json
{
  "productId": "...",
  "variant": { "size": "M", "color": "black" },
  "faces": {
    "front": { "layers": [{ "type": "image|text", "transform": {}, "styles": {} }] },
    "back": { "layers": [] }
  },
  "pricing": { "faces": 1, "printSize": "A4", "finish": "standard" }
}
```

---

## 6. Rutas

`/`, `/estudio`, `/servicios`, `/proyectos`, `/proyectos/[slug]`, `/shop`, `/shop/[slug]`, `/personaliza`, `/colaboraciones`, `/contacto`, `/carrito`, `/checkout`, `/legal`, `/privacidad`, `/cookies`, `/studio`

---

## 7. Dependencias

**Core:** next, react, typescript, tailwindcss  
**Motion:** gsap, framer-motion  
**CMS:** sanity, next-sanity, @sanity/image-url, @sanity/vision, styled-components  
**Utils:** clsx, tailwind-merge  
**Fase 5+:** @shopify/hydrogen-react o Storefront API client  
**Fase 7:** konva, react-konva (o fabric)

---

## 8. Credenciales / API keys necesarias

| Variable | Uso |
|----------|-----|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Proyecto Sanity |
| `NEXT_PUBLIC_SANITY_DATASET` | Dataset (`production`) |
| `NEXT_PUBLIC_SANITY_API_VERSION` | p.ej. `2025-01-01` |
| `SANITY_API_READ_TOKEN` | Lecturas privadas / draft (opcional) |
| `SANITY_API_WRITE_TOKEN` | Solo si hay mutaciones server-side |
| `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` | `tienda.myshopify.com` |
| `NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN` | Storefront API |
| `SHOPIFY_ADMIN_TOKEN` | Solo server, si hace falta sync |
| `NEXT_PUBLIC_SITE_URL` | URL canónica (Vercel) |

Ninguna clave secreta en el cliente.

---

## 9. Decisiones que requieren aprobación

1. **Logo original:** necesitamos el wordmark y símbolo de pincel en SVG/PNG. Mientras, hay placeholders en `public/brand/`.
2. **Sanity project:** crear proyecto en sanity.io y pegar IDs (o autorizar creación con CLI).
3. **Shopify store:** crear tienda (o usar existente) + Storefront API token. Checkout = Shopify Hosted.
4. **Dominio:** Vercel gratis da `*.vercel.app`; dominio propio (lacaja.es / similar) es opcional.
5. **Personalizador MVP:** Konva.js (recomendado) vs Fabric.js — pendiente confirmación en Fase 7.
6. **Idioma:** ES primario; EN futuro opcional (no i18n en Fase 1).
7. **Impuestos / envíos Canarias:** configurar en Shopify (IGIC vs IVA).

---

## 10. Fases

| Fase | Alcance | Estado |
|------|---------|--------|
| 1 | Arquitectura, tokens, layout, nav, footer, componentes base, Sanity schemas + Studio | **EN CURSO** |
| 2 | Home completa | Pendiente |
| 3 | Estudio + Servicios | Pendiente |
| 4 | Portfolio + CMS vivo | Pendiente |
| 5 | Shop headless | Pendiente |
| 6 | Collabs | Pendiente |
| 7 | Personalizador | Pendiente |
| 8 | Animaciones avanzadas | Pendiente |
| 9 | SEO + performance + a11y + QA | Pendiente |

---

## 11. Admin

- **Sanity Studio** en `/studio` con tema negro / lila / Inter alineado a la marca.
- Contenido editable sin código: proyectos, collabs, páginas, settings, overlays editoriales de productos.
- Precios, stock y pedidos: panel Shopify.
- Preview de drafts vía `next-sanity` (Fase 4).
