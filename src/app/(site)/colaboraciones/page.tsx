import type { Metadata } from "next";
import { PhasePlaceholder } from "@/components/ui/PhasePlaceholder";

export const metadata: Metadata = {
  title: "Colaboraciones",
};

export default function ColaboracionesPage() {
  return (
    <PhasePlaceholder
      eyebrow="COLLABS"
      title={"HAY MÁS SITIO\nDENTRO DE LA CAJA."}
      body="LA CAJA × ARTISTA. Historia, vídeo, proceso, productos y ediciones que, cuando se acaban, se acabaron."
      phase="Fase 6 — Entidad propia de colaboraciones en Sanity."
      ctaHref="/contacto"
      ctaLabel="PROPONER UNA COLABORACIÓN"
    />
  );
}
