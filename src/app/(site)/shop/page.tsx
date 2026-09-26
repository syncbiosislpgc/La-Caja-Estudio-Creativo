import type { Metadata } from "next";
import { PhasePlaceholder } from "@/components/ui/PhasePlaceholder";

export const metadata: Metadata = {
  title: "Shop",
};

export default function ShopPage() {
  return (
    <PhasePlaceholder
      eyebrow="SHOP"
      title={"COSAS QUE HACEMOS\nPORQUE NOS DA LA GANA."}
      body="Ediciones limitadas, camisetas, prints, objetos y colaboraciones. Comercio real vía Shopify Headless."
      phase="Fase 5 — Catálogo, variantes, contador de edición limitada y checkout Shopify."
      ctaHref="/shop"
      ctaLabel="ENTRAR EN LA TIENDA"
    />
  );
}
