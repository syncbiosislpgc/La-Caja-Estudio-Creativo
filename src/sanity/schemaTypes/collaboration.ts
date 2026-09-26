export const collaboration = {
  name: "collaboration",
  title: "Colaboración",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Título",
      type: "string",
      description: "Formato: LA CAJA × NOMBRE DEL ARTISTA",
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
      name: "number",
      title: "Número de serie",
      type: "string",
      description: "Ej. 001",
    },
    { name: "artist", title: "Artista", type: "string" },
    {
      name: "story",
      title: "Historia",
      type: "array",
      of: [{ type: "block" }],
    },
    {
      name: "interview",
      title: "Entrevista",
      type: "array",
      of: [{ type: "block" }],
    },
    {
      name: "process",
      title: "Proceso",
      type: "array",
      of: [{ type: "block" }],
    },
    {
      name: "heroImage",
      title: "Hero",
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", title: "Alt", type: "string" }],
    },
    {
      name: "gallery",
      title: "Fotografías",
      type: "array",
      of: [
        {
          type: "image",
          fields: [{ name: "alt", title: "Alt", type: "string" }],
        },
      ],
    },
    { name: "videoUrl", title: "Vídeo", type: "url" },
    {
      name: "products",
      title: "Productos vinculados",
      type: "array",
      of: [{ type: "reference", to: [{ type: "productEditorial" }] }],
    },
    {
      name: "edition",
      title: "Edición",
      type: "object",
      fields: [
        { name: "total", title: "Total piezas", type: "number" },
        { name: "note", title: "Nota", type: "string" },
      ],
    },
    {
      name: "credits",
      title: "Créditos",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "role", type: "string", title: "Rol" },
            { name: "name", type: "string", title: "Nombre" },
          ],
        },
      ],
    },
  ],
  preview: {
    select: { title: "title", subtitle: "number", media: "heroImage" },
  },
};
