import type { Metadata } from "next";
import { PhasePlaceholder } from "@/components/ui/PhasePlaceholder";
import { MICROCOPY } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Servicios",
};

export default function ServiciosPage() {
  return (
    <PhasePlaceholder
      eyebrow="SERVICIOS"
      title={"NO SABEMOS QUÉ NECESITAS\nHASTA SABER QUÉ QUIERES CONSEGUIR."}
      body="Identidad, contenido, social, producción, espacios y proyectos especiales — no como productos cerrados."
      phase="Fase 3 — Áreas de servicio + formulario TENGO UNA IDEA."
      ctaLabel={MICROCOPY.haveIdea}
    />
  );
}
