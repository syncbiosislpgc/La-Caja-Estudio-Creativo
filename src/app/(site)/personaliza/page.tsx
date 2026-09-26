import type { Metadata } from "next";
import { PhasePlaceholder } from "@/components/ui/PhasePlaceholder";

export const metadata: Metadata = {
  title: "Personaliza",
};

export default function PersonalizaPage() {
  return (
    <PhasePlaceholder
      eyebrow="MÉTELO EN LA CAJA"
      title={"PERSONALIZA.\nMETE TU IDEA\nDENTRO."}
      body="MVP: modelo, color, talla, subir arte, texto, tipografía, mockup en tiempo real y precio dinámico."
      phase="Fase 7 — React + Konva.js. Guardado JSON + preview de producción."
      ctaHref="/contacto"
      ctaLabel="CUÉNTANOS TU IDEA"
    />
  );
}
