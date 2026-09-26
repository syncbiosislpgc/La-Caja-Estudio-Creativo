export type Collaboration = {
  slug: string;
  title: string;
  number: string;
  artist: string;
  story: string;
  interview?: string;
  process?: string;
  heroImage: string;
  gallery: string[];
  editionTotal: number;
  editionNote: string;
  productSlugs: string[];
  credits: { role: string; name: string }[];
};

export const collaborations: Collaboration[] = [
  {
    slug: "kira-voss",
    title: "LA CAJA × KIRA VOSS",
    number: "001",
    artist: "Kira Voss",
    story:
      "Kira dibuja como si el papel le debiera algo. Nosotros teníamos una caja vacía. Salieron 50 camisetas y un print que no se va a repetir.",
    interview:
      "—¿Qué metiste en La Caja?\n—Una idea que llevaba meses en el cuaderno. Ahora cabe en una tee.\n—¿Y cuando se acaben?\n—Se acabaron. Así tiene que ser.",
    process:
      "Boceto → trazo vectorizado a mano → prueba de serigrafía → edición numerada.",
    heroImage:
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1200&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&q=80",
    ],
    editionTotal: 50,
    editionNote: "50 piezas. Una idea. Cuando se acaben, se acabaron.",
    productSlugs: ["camiseta-x-kira"],
    credits: [
      { role: "Ilustración", name: "Kira Voss" },
      { role: "Producción", name: "LA CAJA" },
    ],
  },
  {
    slug: "nerea-sol",
    title: "LA CAJA × NEREA SOL",
    number: "002",
    artist: "Nerea Sol",
    story:
      "Fotografía del Atlántico intervenida con pincel. El mar entra en La Caja y sale como pared.",
    process: "Sesión en la costa → selección → intervención manual → print 40×50.",
    heroImage:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1200&q=80",
    ],
    editionTotal: 30,
    editionNote: "Edición de 30. Numerada.",
    productSlugs: ["print-atlantico"],
    credits: [
      { role: "Fotografía", name: "Nerea Sol" },
      { role: "Intervención", name: "LA CAJA" },
    ],
  },
];

export function getCollaboration(slug: string) {
  return collaborations.find((c) => c.slug === slug);
}
