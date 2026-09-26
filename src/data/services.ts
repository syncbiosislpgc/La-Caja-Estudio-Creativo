export type ServiceArea = {
  id: string;
  title: string;
  items: string[];
  copy: string;
};

export const serviceAreas: ServiceArea[] = [
  {
    id: "identidad",
    title: "IDENTIDAD & DISEÑO",
    copy: "Desde el nombre hasta el sistema visual completo. Lo que se ve y lo que se siente.",
    items: [
      "Naming",
      "Branding",
      "Identidad visual",
      "Diseño gráfico",
      "Diseño editorial",
      "Packaging",
      "Campañas",
      "Cartelería",
    ],
  },
  {
    id: "contenido",
    title: "CONTENIDO",
    copy: "Dirección creativa, foto y vídeo con intención. No relleno: piezas que cuentan.",
    items: [
      "Dirección creativa",
      "Fotografía",
      "Vídeo",
      "Reels",
      "Contenido para redes",
      "Campañas audiovisuales",
    ],
  },
  {
    id: "social",
    title: "SOCIAL",
    copy: "Estrategia y ejecución. Calendario, diseño, foto y vídeo en el mismo hilo.",
    items: [
      "Estrategia",
      "Gestión de redes",
      "Creación de contenido",
      "Calendario editorial",
      "Diseño",
      "Foto y vídeo",
    ],
  },
  {
    id: "produccion",
    title: "PRODUCCIÓN",
    copy: "Lo que se diseña se fabrica. Impresión, vinilos, gran formato e instalación.",
    items: [
      "Impresión",
      "Vinilos",
      "Rotulación",
      "Cartelería",
      "Gran formato",
      "Soportes",
      "Producción gráfica",
      "Instalación",
    ],
  },
  {
    id: "espacios",
    title: "ESPACIOS",
    copy: "Fachadas, escaparates y locales que hablan la misma lengua que la marca.",
    items: [
      "Fachadas",
      "Escaparates",
      "Rotulación interior",
      "Señalética",
      "Decoración gráfica",
      "Intervenciones creativas",
    ],
  },
  {
    id: "especiales",
    title: "PROYECTOS ESPECIALES",
    copy: "Cosas que todavía no tienen categoría. Merch, arte, ediciones, experiencias.",
    items: [
      "Merchandising",
      "Moda",
      "Objetos",
      "Arte",
      "Ediciones limitadas",
      "Colaboraciones",
      "Experiencias",
      "Proyectos sin categoría",
    ],
  },
];
