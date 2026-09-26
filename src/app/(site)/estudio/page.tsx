import type { Metadata } from "next";
import { BrushStroke } from "@/components/brand/BrushStroke";
import { BoxFrame } from "@/components/brand/BoxFrame";
import { CTA } from "@/components/ui/CTA";
import { MICROCOPY } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Estudio",
  description:
    "La Caja no nació para hacer una sola cosa. Estudio creativo en Las Palmas de Gran Canaria.",
};

export default function EstudioPage() {
  return (
    <div className="mx-auto max-w-[1600px] px-5 py-14 md:px-8 md:py-20 lg:px-12">
      <p className="text-micro text-lc-lilac">ESTUDIO</p>
      <h1 className="display-lg mt-4 max-w-4xl text-lc-offwhite">
        LA CAJA NO NACIÓ
        <br />
        PARA HACER UNA SOLA COSA.
      </h1>
      <BrushStroke variant="underline" className="mt-2 h-6 w-48" />

      <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <p className="text-xl leading-relaxed text-lc-offwhite/90">
          Creemos en las ideas antes que en los formatos.
        </p>
        <div className="space-y-5 text-lg leading-relaxed text-lc-gray">
          <p>
            Por eso no empezamos preguntándonos si algo será un cartel, un
            vídeo, una camiseta o una campaña.
          </p>
          <p>Primero encontramos la idea.</p>
          <p>Después decidimos hasta dónde puede llegar.</p>
        </div>
      </div>

      <section className="mt-24 border-t border-lc-offwhite/10 pt-16">
        <p className="text-micro text-lc-lilac">EL SÍMBOLO</p>
        <h2 className="display-md mt-4 max-w-3xl text-lc-offwhite">
          DE DÓNDE VIENE EL TRAZO.
        </h2>
        <div className="mt-10 max-w-3xl space-y-5 text-lg leading-relaxed text-lc-gray">
          <p>
            Antes de convertirse en una identidad visual, el movimiento ya
            formaba parte de nuestra historia.
          </p>
          <p>
            El breakdance, la cultura hip-hop y todo lo que sucede cuando
            alguien utiliza un espacio vacío para crear algo propio forman parte
            de las raíces de La Caja.
          </p>
          <p>El pincel conserva algo de esa energía.</p>
          <p>
            Pero La Caja ha crecido. Hoy ese gesto convive con estrategia,
            diseño, producción y tecnología.
          </p>
          <p className="text-lc-offwhite">
            No define un estilo. Define una actitud.
          </p>
        </div>
      </section>

      <section className="mt-20">
        <BoxFrame className="max-w-3xl">
          <p className="text-micro text-lc-lilac">ORDEN + GESTO</p>
          <p className="mt-4 text-2xl font-bold text-lc-offwhite">
            DISEÑO + INSTINTO
            <br />
            ESTRUCTURA + LIBERTAD
          </p>
          <p className="mt-6 text-lc-gray">
            Trabajamos con marcas premium, restaurantes, clínicas, artistas,
            festivales, moda, arquitectura y proyectos culturales. La cultura
            urbana es una raíz, no una limitación.
          </p>
        </BoxFrame>
      </section>

      <div className="mt-16">
        <CTA href="/contacto" variant="lilac" size="lg">
          {MICROCOPY.tellIdea}
        </CTA>
      </div>
    </div>
  );
}
