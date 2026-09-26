export const page = {
  name: "page",
  title: "Página",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Título",
      type: "string",
      validation: (R: { required: () => unknown }) => R.required(),
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: (R: { required: () => unknown }) => R.required(),
    },
    {
      name: "sections",
      title: "Secciones",
      type: "array",
      of: [
        {
          type: "object",
          name: "textSection",
          title: "Texto",
          fields: [
            { name: "eyebrow", title: "Eyebrow", type: "string" },
            { name: "heading", title: "Titular", type: "string" },
            {
              name: "body",
              title: "Cuerpo",
              type: "array",
              of: [{ type: "block" }],
            },
          ],
          preview: { select: { title: "heading" } },
        },
        {
          type: "object",
          name: "mediaSection",
          title: "Media",
          fields: [
            { name: "image", title: "Imagen", type: "image" },
            { name: "videoUrl", title: "Vídeo URL", type: "url" },
            { name: "caption", title: "Caption", type: "string" },
          ],
          preview: { select: { title: "caption", media: "image" } },
        },
      ],
    },
    { name: "seoTitle", title: "SEO title", type: "string" },
    { name: "seoDescription", title: "SEO description", type: "text", rows: 3 },
  ],
};

export const siteSettings = {
  name: "siteSettings",
  title: "Ajustes del sitio",
  type: "document",
  fields: [
    { name: "title", title: "Nombre del sitio", type: "string", initialValue: "LA CAJA" },
    { name: "tagline", title: "Tagline", type: "string" },
    { name: "claim", title: "Claim", type: "string" },
    { name: "email", title: "Email", type: "string" },
    { name: "phone", title: "Teléfono", type: "string" },
    {
      name: "address",
      title: "Dirección",
      type: "object",
      fields: [
        { name: "street", type: "string", title: "Calle" },
        { name: "city", type: "string", title: "Ciudad", initialValue: "Las Palmas de Gran Canaria" },
        { name: "region", type: "string", title: "Región", initialValue: "Gran Canaria" },
        { name: "country", type: "string", title: "País", initialValue: "España" },
      ],
    },
    {
      name: "social",
      title: "Redes",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "label", type: "string", title: "Red" },
            { name: "url", type: "url", title: "URL" },
          ],
        },
      ],
    },
    {
      name: "defaultOgImage",
      title: "OG image por defecto",
      type: "image",
    },
    {
      name: "seoLocal",
      title: "SEO local",
      type: "object",
      fields: [
        {
          name: "areas",
          title: "Áreas",
          type: "array",
          of: [{ type: "string" }],
          initialValue: ["Las Palmas de Gran Canaria", "Gran Canaria", "Canarias"],
        },
      ],
    },
  ],
  preview: {
    prepare: () => ({ title: "Ajustes del sitio" }),
  },
};
