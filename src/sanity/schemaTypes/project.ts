export const projectCategory = {
  name: "projectCategory",
  title: "Categoría de proyecto",
  type: "string",
  options: {
    list: [
      { title: "Branding", value: "branding" },
      { title: "Contenido", value: "contenido" },
      { title: "Producción", value: "produccion" },
      { title: "Espacios", value: "espacios" },
      { title: "Social", value: "social" },
      { title: "Otros", value: "otros" },
    ],
  },
} as const;

export const project = {
  name: "project",
  title: "Proyecto",
  type: "document",
  groups: [
    { name: "content", title: "Contenido", default: true },
    { name: "media", title: "Media" },
    { name: "meta", title: "Meta / SEO" },
  ],
  fields: [
    {
      name: "title",
      title: "Título",
      type: "string",
      validation: (R: { required: () => unknown }) => R.required(),
      group: "content",
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (R: { required: () => unknown }) => R.required(),
      group: "content",
    },
    { name: "client", title: "Cliente", type: "string", group: "content" },
    { name: "year", title: "Año", type: "number", group: "content" },
    {
      name: "categories",
      title: "Categorías",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Branding", value: "branding" },
          { title: "Contenido", value: "contenido" },
          { title: "Producción", value: "produccion" },
          { title: "Espacios", value: "espacios" },
          { title: "Social", value: "social" },
          { title: "Otros", value: "otros" },
        ],
      },
      group: "content",
    },
    {
      name: "description",
      title: "Descripción",
      type: "array",
      of: [{ type: "block" }],
      group: "content",
    },
    {
      name: "services",
      title: "Servicios realizados",
      type: "array",
      of: [{ type: "string" }],
      group: "content",
    },
    {
      name: "result",
      title: "Resultado",
      type: "text",
      rows: 4,
      group: "content",
    },
    {
      name: "credits",
      title: "Créditos",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "role", title: "Rol", type: "string" },
            { name: "name", title: "Nombre", type: "string" },
          ],
        },
      ],
      group: "content",
    },
    {
      name: "nextProject",
      title: "Proyecto siguiente",
      type: "reference",
      to: [{ type: "project" }],
      group: "content",
    },
    {
      name: "heroImage",
      title: "Hero image",
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", title: "Alt text", type: "string" }],
      group: "media",
    },
    {
      name: "heroVideoUrl",
      title: "Hero vídeo (URL)",
      type: "url",
      group: "media",
    },
    {
      name: "gallery",
      title: "Galería",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            { name: "alt", title: "Alt text", type: "string" },
            {
              name: "layout",
              title: "Layout",
              type: "string",
              options: {
                list: [
                  { title: "Grande", value: "large" },
                  { title: "Detalle", value: "detail" },
                  { title: "Mockup", value: "mockup" },
                  { title: "Making-of", value: "makingof" },
                ],
              },
            },
          ],
        },
      ],
      group: "media",
    },
    {
      name: "videos",
      title: "Vídeos",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "title", title: "Título", type: "string" },
            { name: "url", title: "URL", type: "url" },
          ],
        },
      ],
      group: "media",
    },
    {
      name: "beforeAfter",
      title: "Antes / Después",
      type: "object",
      fields: [
        { name: "before", title: "Antes", type: "image" },
        { name: "after", title: "Después", type: "image" },
      ],
      group: "media",
    },
    {
      name: "seoTitle",
      title: "SEO title",
      type: "string",
      group: "meta",
    },
    {
      name: "seoDescription",
      title: "SEO description",
      type: "text",
      rows: 3,
      group: "meta",
    },
  ],
  preview: {
    select: { title: "title", subtitle: "client", media: "heroImage" },
  },
};
