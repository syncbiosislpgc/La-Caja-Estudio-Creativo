import type { Metadata } from "next";
import { ProjectEditorialGrid } from "@/components/project/ProjectEditorialGrid";
import { BrushStroke } from "@/components/brand/BrushStroke";

export const metadata: Metadata = {
  title: "Proyectos",
  description: "Cosas que han salido de La Caja. Portfolio del estudio creativo.",
};

export default function ProyectosPage() {
  return (
    <div className="mx-auto max-w-[1600px] px-5 py-14 md:px-8 md:py-20 lg:px-12">
      <p className="text-micro text-lc-lilac">PROYECTOS</p>
      <h1 className="display-lg mt-4 text-lc-offwhite">
        COSAS QUE
        <br />
        HAN SALIDO
        <br />
        DE LA CAJA.
      </h1>
      <BrushStroke variant="underline" className="mt-2 h-6 w-44" />
      <p className="mt-6 max-w-xl text-lg text-lc-gray">
        Portfolio editorial. Cada proyecto abre un case study completo.
      </p>
      <div className="mt-14">
        <ProjectEditorialGrid />
      </div>
    </div>
  );
}
