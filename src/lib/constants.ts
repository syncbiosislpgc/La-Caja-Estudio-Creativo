export const SITE = {
  name: "LA CAJA",
  tagline: "Estudio creativo",
  claim: "TODO EL ARTE CABE AQUÍ.",
  philosophy: "TODO CABE EN LA CAJA.",
  location: "Las Palmas de Gran Canaria",
  region: "Gran Canaria, Canarias",
  email: "hola@lacaja.studio",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;

export const NAV_LINKS = [
  { href: "/proyectos", label: "PROYECTOS" },
  { href: "/servicios", label: "SERVICIOS" },
  { href: "/estudio", label: "ESTUDIO" },
  { href: "/shop", label: "SHOP" },
  { href: "/colaboraciones", label: "COLLABS" },
] as const;

export const SERVICE_CATEGORIES = [
  "DISEÑO",
  "CONTENIDO",
  "PRODUCCIÓN",
  "MARCAS",
  "ESPACIOS",
] as const;

export const PROJECT_FILTERS = [
  "TODOS",
  "BRANDING",
  "CONTENIDO",
  "PRODUCCIÓN",
  "ESPACIOS",
  "SOCIAL",
  "OTROS",
] as const;

export const SHOP_CATEGORIES = [
  "LA CAJA",
  "LIMITED",
  "COLLABS",
  "PRINTS",
  "WEAR",
  "OBJECTS",
] as const;

/**
 * Microcopy de interfaz: claro primero.
 * El tono de marca queda en titulares y claims, no en botones confusos.
 */
export const MICROCOPY = {
  emptyCart: "TU CARRITO ESTÁ VACÍO",
  emptyCartHint: "Cuando añadas algo, aparecerá aquí.",
  notFound: "PÁGINA NO ENCONTRADA",
  notFoundHint: "Este enlace no existe o ya no está disponible.",
  backHome: "VOLVER AL INICIO",
  loading: "CARGANDO...",
  newsletterTitle: "NOVEDADES DEL ESTUDIO",
  newsletterBody:
    "Proyectos, lanzamientos, colaboraciones y alguna cosa que todavía no sabemos qué será.",
  newsletterCta: "SUSCRIBIRME",
  soldOut: "AGOTADO",
  addedToCart: "AÑADIDO AL CARRITO",
  addToCart: "AÑADIR AL CARRITO",
  viewCart: "VER CARRITO",
  viewProjects: "VER PROYECTOS",
  viewShop: "IR A LA TIENDA",
  checkout: "FINALIZAR COMPRA",
  clearCart: "VACIAR CARRITO",
  removeItem: "QUITAR",
  keepShopping: "SEGUIR COMPRANDO",
  tellIdea: "CUÉNTANOS TU IDEA",
  haveIdea: "TENGO UNA IDEA",
  proposeCollab: "PROPONER COLABORACIÓN",
} as const;
