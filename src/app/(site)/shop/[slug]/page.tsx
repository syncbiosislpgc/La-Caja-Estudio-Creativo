import type { Metadata } from "next";
import { PhasePlaceholder } from "@/components/ui/PhasePlaceholder";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Producto · ${slug}` };
}

export default async function ShopProductPage({ params }: Props) {
  const { slug } = await params;
  return (
    <PhasePlaceholder
      eyebrow="PRODUCTO"
      title={slug.replace(/-/g, " ").toUpperCase()}
      body="Ficha con variantes, stock, edición limitada (p.ej. 23/50) y storytelling editorial."
      phase="Fase 5 — Shopify Storefront + overlay Sanity."
      ctaHref="/carrito"
      ctaLabel="IR AL CARRITO"
    />
  );
}
