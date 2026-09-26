export const productEditorial = {
  name: "productEditorial",
  title: "Producto editorial (Shop)",
  type: "document",
  description:
    "Capa editorial sobre productos Shopify. Precio/stock viven en Shopify.",
  fields: [
    {
      name: "title",
      title: "Nombre",
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
      name: "shopifyHandle",
      title: "Shopify handle",
      type: "string",
      description: "Handle del producto en Shopify (source of truth commerce)",
    },
    {
      name: "shopifyProductId",
      title: "Shopify Product ID",
      type: "string",
    },
    {
      name: "category",
      title: "Categoría LA CAJA",
      type: "string",
      options: {
        list: [
          { title: "LA CAJA", value: "la-caja" },
          { title: "LIMITED", value: "limited" },
          { title: "COLLABS", value: "collabs" },
          { title: "PRINTS", value: "prints" },
          { title: "WEAR", value: "wear" },
          { title: "OBJECTS", value: "objects" },
        ],
      },
    },
    { name: "artist", title: "Artista", type: "string" },
    { name: "collection", title: "Colección", type: "string" },
    {
      name: "story",
      title: "Historia",
      type: "array",
      of: [{ type: "block" }],
    },
    {
      name: "limitedEdition",
      title: "Edición limitada",
      type: "object",
      fields: [
        { name: "enabled", title: "Activa", type: "boolean", initialValue: false },
        { name: "total", title: "Total piezas", type: "number" },
        {
          name: "available",
          title: "Disponibles (display)",
          type: "number",
          description: "Puede sincronizarse con Shopify inventory",
        },
        { name: "numbering", title: "Numeración (ej. 001)", type: "string" },
      ],
    },
    {
      name: "launchDate",
      title: "Fecha de lanzamiento",
      type: "datetime",
    },
    {
      name: "gallery",
      title: "Galería editorial",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [{ name: "alt", title: "Alt", type: "string" }],
        },
      ],
    },
    { name: "videoUrl", title: "Vídeo", type: "url" },
  ],
  preview: {
    select: { title: "title", subtitle: "category", media: "gallery.0" },
  },
};
