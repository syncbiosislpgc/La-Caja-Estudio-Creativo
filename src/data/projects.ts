export type ProjectCategory =
  | "branding"
  | "contenido"
  | "produccion"
  | "espacios"
  | "social"
  | "otros";

export type Project = {
  slug: string;
  title: string;
  client: string;
  year: number;
  categories: ProjectCategory[];
  summary: string;
  description: string;
  heroImage: string;
  gallery: { src: string; alt: string; layout: "large" | "detail" | "mockup" | "makingof" }[];
  services: string[];
  result: string;
  credits: { role: string; name: string }[];
  nextSlug?: string;
};

export const projects: Project[] = [
  {
    slug: "mar-abierto",
    title: "MAR ABIERTO",
    client: "Mar Abierto Hostel",
    year: 2025,
    categories: ["branding", "espacios", "produccion"],
    summary: "Identidad, fachada y señalética para un hostel frente al Atlántico.",
    description:
      "Empezó como un logo. Terminó siendo la fachada, el menú, las llaves de habitación y el vinilo del escaparate. Todo dentro de la misma caja.",
    heroImage:
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1600&q=80",
    gallery: [
      {
        src: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
        alt: "Fachada Mar Abierto",
        layout: "large",
      },
      {
        src: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80",
        alt: "Detalle tipográfico",
        layout: "detail",
      },
      {
        src: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1000&q=80",
        alt: "Mockup papelería",
        layout: "mockup",
      },
      {
        src: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1000&q=80",
        alt: "Making-of rotulación",
        layout: "makingof",
      },
    ],
    services: ["Naming", "Identidad visual", "Rotulación", "Señalética", "Packaging"],
    result: "Una marca que se lee desde la calle y se siente dentro del local.",
    credits: [
      { role: "Dirección creativa", name: "LA CAJA" },
      { role: "Fotografía", name: "Estudio Norte" },
    ],
    nextSlug: "clinica-norte",
  },
  {
    slug: "clinica-norte",
    title: "CLÍNICA NORTE",
    client: "Clínica Norte",
    year: 2025,
    categories: ["branding", "contenido", "social"],
    summary: "Rebrand premium y sistema de contenido para una clínica dental.",
    description:
      "Orden + gesto. Una identidad limpia con un trazo que humaniza el espacio sanitario sin perder seriedad.",
    heroImage:
      "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1600&q=80",
    gallery: [
      {
        src: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&q=80",
        alt: "Interior clínica",
        layout: "large",
      },
      {
        src: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80",
        alt: "Papelería",
        layout: "detail",
      },
    ],
    services: ["Branding", "Contenido redes", "Fotografía", "Campañas"],
    result: "+40% engagement en 3 meses. Nueva percepción de marca.",
    credits: [{ role: "Dirección creativa", name: "LA CAJA" }],
    nextSlug: "festival-sol",
  },
  {
    slug: "festival-sol",
    title: "FESTIVAL SOL",
    client: "Festival Sol GC",
    year: 2024,
    categories: ["contenido", "produccion", "otros"],
    summary: "Campaña audiovisual, cartelería y merchandising del festival.",
    description:
      "Carteles de gran formato, reels, camisetas y un escenario que parecía salido de La Caja.",
    heroImage:
      "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1600&q=80",
    gallery: [
      {
        src: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80",
        alt: "Escenario festival",
        layout: "large",
      },
      {
        src: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=900&q=80",
        alt: "Público",
        layout: "detail",
      },
    ],
    services: ["Dirección creativa", "Vídeo", "Cartelería", "Merchandising"],
    result: "Sold out visual. La identidad inundó la ciudad.",
    credits: [
      { role: "Dirección", name: "LA CAJA" },
      { role: "Vídeo", name: "Frame Atlántico" },
    ],
    nextSlug: "bodega-brisas",
  },
  {
    slug: "bodega-brisas",
    title: "BODEGA BRISAS",
    client: "Bodega Brisas",
    year: 2024,
    categories: ["branding", "produccion"],
    summary: "Packaging de vino y etiquetas de edición limitada.",
    description:
      "Una etiqueta que cabe en la mano y se recuerda en la mesa. Tipografía, papel y un trazo que no pide permiso.",
    heroImage:
      "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1600&q=80",
    gallery: [
      {
        src: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=1000&q=80",
        alt: "Botellas",
        layout: "mockup",
      },
    ],
    services: ["Packaging", "Diseño editorial", "Producción gráfica"],
    result: "Serie limitada agotada en 48 horas.",
    credits: [{ role: "Diseño", name: "LA CAJA" }],
    nextSlug: "tienda-ola",
  },
  {
    slug: "tienda-ola",
    title: "TIENDA OLA",
    client: "OLA Concept Store",
    year: 2024,
    categories: ["espacios", "social", "contenido"],
    summary: "Escaparate, contenido social y campaña de apertura.",
    description:
      "El escaparate es el primer scroll. Lo tratamos como una pantalla física.",
    heroImage:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80",
    gallery: [
      {
        src: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=1100&q=80",
        alt: "Escaparate",
        layout: "large",
      },
    ],
    services: ["Escaparates", "Social", "Fotografía", "Campañas"],
    result: "Apertura con cola en la puerta. Literalmente.",
    credits: [{ role: "Creatividad", name: "LA CAJA" }],
    nextSlug: "mar-abierto",
  },
];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export function filterProjects(category?: string) {
  if (!category || category === "TODOS") return projects;
  const key = category.toLowerCase() as ProjectCategory;
  return projects.filter((p) => p.categories.includes(key));
}
