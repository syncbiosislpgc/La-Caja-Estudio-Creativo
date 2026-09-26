import type { Metadata } from "next";
import { PhasePlaceholder } from "@/components/ui/PhasePlaceholder";

export const metadata: Metadata = {
  title: "Proyectos",
};

export default function ProyectosPage() {
  return (
    <PhasePlaceholder
      eyebrow="PROYECTOS"
      title={"COSAS QUE\nHAN SALIDO\nDE LA CAJA."}
      body="Portfolio editorial: fotografía grande, vídeo, mockup, texto, detalle y making-of. Sin grid de tarjetas idénticas."
      phase="Fase 4 — CMS Sanity + case studies + filtros."
      ctaHref="/studio"
      ctaLabel="ABRIR CMS"
    />
  );
}
