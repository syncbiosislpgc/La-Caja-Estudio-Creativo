import type { Metadata } from "next";
import { PhasePlaceholder } from "@/components/ui/PhasePlaceholder";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Proyecto · ${slug}` };
}

export default async function ProyectoSlugPage({ params }: Props) {
  const { slug } = await params;
  return (
    <PhasePlaceholder
      eyebrow="CASE STUDY"
      title={slug.replace(/-/g, " ").toUpperCase()}
      body="Cada proyecto abrirá galería, vídeos, servicios, resultado, créditos y proyecto siguiente."
      phase="Fase 4 — Plantilla de case study conectada a Sanity."
      ctaHref="/proyectos"
      ctaLabel="VER PROYECTOS"
    />
  );
}
