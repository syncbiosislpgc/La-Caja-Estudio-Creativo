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

export const MICROCOPY = {
  emptyCart: "LA CAJA ESTÁ VACÍA.\nPOR AHORA.",
  notFound: "ESTO NO ESTABA\nDENTRO DE LA CAJA.",
  backHome: "VOLVER A METERME",
  loading: "ABRIENDO LA CAJA...",
  newsletterTitle: "COSAS QUE SALEN\nDE LA CAJA.",
  newsletterBody:
    "Proyectos, lanzamientos, colaboraciones y alguna cosa que todavía no sabemos qué será.",
  newsletterCta: "QUIERO ESTAR DENTRO",
  soldOut: "YA SALIÓ DE LA CAJA.",
  addedToCart: "YA ESTÁ DENTRO.",
  openBox: "ABRIR LA CAJA",
  tellIdea: "CUÉNTANOS TU IDEA",
  haveIdea: "TENGO UNA IDEA",
} as const;
