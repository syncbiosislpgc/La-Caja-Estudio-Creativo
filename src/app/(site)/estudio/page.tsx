import type { Metadata } from "next";
import { PhasePlaceholder } from "@/components/ui/PhasePlaceholder";

export const metadata: Metadata = {
  title: "Estudio",
};

export default function EstudioPage() {
  return (
    <PhasePlaceholder
      eyebrow="ESTUDIO"
      title={"LA CAJA NO NACIÓ\nPARA HACER UNA SOLA COSA."}
      body="Creemos en las ideas antes que en los formatos. El contenido completo de esta página llega en la Fase 3."
      phase="Fase 3 — Filosofía, historia del trazo y raíces hip-hop sin quedar atrapados en lo urbano."
    />
  );
}
