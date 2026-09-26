export type ShopCategory =
  | "la-caja"
  | "limited"
  | "collabs"
  | "prints"
  | "wear"
  | "objects";

export type ProductVariant = {
  id: string;
  size?: string;
  color?: string;
  colorHex?: string;
  stock: number;
};

export type Product = {
  slug: string;
  name: string;
  price: number;
  category: ShopCategory;
  description: string;
  images: string[];
  videoUrl?: string;
  variants: ProductVariant[];
  artist?: string;
  collection?: string;
  limitedEdition?: {
    total: number;
    available: number;
    numbering?: string;
  };
  launchDate?: string;
  tags: string[];
};

export const products: Product[] = [
  {
    slug: "camiseta-todo-cabe",
    name: "CAMISETA TODO CABE",
    price: 32,
    category: "wear",
    description:
      "Algodón pesado. Trazo lila delante. La frase detrás. Cuando se acaba el stock de esta tanda, se acabó.",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&q=80",
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1200&q=80",
    ],
    variants: [
      { id: "tc-s-black", size: "S", color: "Negro", colorHex: "#0B0B0B", stock: 8 },
      { id: "tc-m-black", size: "M", color: "Negro", colorHex: "#0B0B0B", stock: 12 },
      { id: "tc-l-black", size: "L", color: "Negro", colorHex: "#0B0B0B", stock: 6 },
      { id: "tc-m-off", size: "M", color: "Blanco roto", colorHex: "#F4F2EE", stock: 4 },
    ],
    collection: "LA CAJA CORE",
    tags: ["camiseta", "wear"],
  },
  {
    slug: "sudadera-caja-abierta",
    name: "SUDADERA CAJA ABIERTA",
    price: 58,
    category: "wear",
    description:
      "Sudadera oversized con el símbolo bordado. Hecha para salir de La Caja y no volver igual.",
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1200&q=80",
      "https://images.unsplash.com/photo-1578587018452-892bacefd1f0?w=1200&q=80",
    ],
    variants: [
      { id: "sa-m", size: "M", color: "Negro", colorHex: "#0B0B0B", stock: 5 },
      { id: "sa-l", size: "L", color: "Negro", colorHex: "#0B0B0B", stock: 3 },
      { id: "sa-xl", size: "XL", color: "Negro", colorHex: "#0B0B0B", stock: 2 },
    ],
    collection: "LA CAJA CORE",
    tags: ["sudadera", "wear"],
  },
  {
    slug: "print-gesto-001",
    name: "PRINT GESTO 001",
    price: 45,
    category: "prints",
    description:
      "Serigrafía a 2 tintas sobre papel 300g. Numerada a mano. Edición de 50.",
    images: [
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1200&q=80",
      "https://images.unsplash.com/photo-1515405295579-ba7b416594f0?w=1200&q=80",
    ],
    variants: [{ id: "pg-unique", stock: 23 }],
    limitedEdition: { total: 50, available: 23, numbering: "001" },
    collection: "GESTOS",
    tags: ["print", "limited"],
  },
  {
    slug: "print-atlantico",
    name: "PRINT ATLÁNTICO",
    price: 55,
    category: "prints",
    description: "Fotografía intervenida con trazo. 40×50 cm. Edición de 30.",
    images: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80",
    ],
    variants: [{ id: "pa-unique", stock: 11 }],
    limitedEdition: { total: 30, available: 11, numbering: "002" },
    artist: "Nerea Sol",
    collection: "COLLABS",
    tags: ["print", "collabs"],
  },
  {
    slug: "cuadro-caja-negra",
    name: "CUADRO CAJA NEGRA",
    price: 180,
    category: "objects",
    description:
      "Pieza única montada sobre bastidor. El trazo no se repite. Cuando sale, sale.",
    images: [
      "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1200&q=80",
    ],
    variants: [{ id: "ccn-1", stock: 1 }],
    limitedEdition: { total: 1, available: 1, numbering: "ÚNICO" },
    collection: "OBJETOS",
    tags: ["cuadro", "objects", "limited"],
  },
  {
    slug: "tote-meterlo",
    name: "TOTE MÉTELO",
    price: 22,
    category: "la-caja",
    description: "Lona cruda. Tipografía grande. Capacidad: todo lo que quepa.",
    images: [
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=1200&q=80",
    ],
    variants: [
      { id: "tm-off", color: "Crudo", colorHex: "#F4F2EE", stock: 40 },
      { id: "tm-black", color: "Negro", colorHex: "#0B0B0B", stock: 18 },
    ],
    collection: "LA CAJA CORE",
    tags: ["tote", "la-caja"],
  },
  {
    slug: "camiseta-x-kira",
    name: "LA CAJA × KIRA — TEE 001",
    price: 38,
    category: "collabs",
    description:
      "50 piezas. Una idea. Colaboración con la ilustradora Kira Voss. Cuando se acaben, se acabaron.",
    images: [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=1200&q=80",
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1200&q=80",
    ],
    variants: [
      { id: "kx-s", size: "S", color: "Negro", colorHex: "#0B0B0B", stock: 4 },
      { id: "kx-m", size: "M", color: "Negro", colorHex: "#0B0B0B", stock: 7 },
      { id: "kx-l", size: "L", color: "Negro", colorHex: "#0B0B0B", stock: 2 },
    ],
    artist: "Kira Voss",
    limitedEdition: { total: 50, available: 13, numbering: "001" },
    collection: "COLLABS",
    launchDate: "2025-09-01",
    tags: ["collabs", "wear", "limited"],
  },
  {
    slug: "sticker-pack",
    name: "STICKER PACK TRAZOS",
    price: 8,
    category: "objects",
    description: "6 stickers con gestos de la identidad. Para meter donde quieras.",
    images: [
      "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=1200&q=80",
    ],
    variants: [{ id: "sp-1", stock: 120 }],
    collection: "LA CAJA CORE",
    tags: ["objects", "la-caja"],
  },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function filterProducts(category?: string) {
  if (!category || category === "TODOS") return products;

  const map: Record<string, ShopCategory | "limited-flag"> = {
    "LA CAJA": "la-caja",
    LIMITED: "limited-flag",
    COLLABS: "collabs",
    PRINTS: "prints",
    WEAR: "wear",
    OBJECTS: "objects",
  };

  const key = map[category] ?? (category.toLowerCase() as ShopCategory);

  if (key === "limited-flag") {
    return products.filter((p) => Boolean(p.limitedEdition));
  }
  if (key === "la-caja") {
    return products.filter(
      (p) => p.category === "la-caja" || p.collection === "LA CAJA CORE",
    );
  }
  return products.filter((p) => p.category === key);
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(price);
}
