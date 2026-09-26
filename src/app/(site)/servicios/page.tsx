import type { Metadata } from "next";
import { BrushStroke } from "@/components/brand/BrushStroke";
import { CTA } from "@/components/ui/CTA";
import { serviceAreas } from "@/data/services";
import { MICROCOPY } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Servicios",
  description:
    "Identidad, contenido, social, producción, espacios y proyectos especiales.",
};

export default function ServiciosPage() {
  return (
    <div className="mx-auto max-w-[1600px] px-5 py-14 md:px-8 md:py-20 lg:px-12">
      <p className="text-micro text-lc-lilac">SERVICIOS</p>
      <h1 className="display-lg mt-4 max-w-4xl text-lc-offwhite">
        NO SABEMOS QUÉ NECESITAS
        <br />
        HASTA SABER QUÉ QUIERES CONSEGUIR.
      </h1>
      <BrushStroke variant="underline" className="mt-2 h-6 w-52" />
      <p className="mt-8 max-w-2xl text-lg text-lc-gray">
        No vendemos productos cerrados. Empezamos por la idea y decidimos qué
        formatos la hacen real.
      </p>

      <div className="mt-16 space-y-16">
        {serviceAreas.map((area) => (
          <section
            key={area.id}
            id={area.id}
            className="grid gap-8 border-t border-lc-offwhite/10 pt-10 lg:grid-cols-12"
          >
            <div className="lg:col-span-4">
              <h2 className="text-2xl font-bold text-lc-offwhite">{area.title}</h2>
              <p className="mt-4 text-lc-gray">{area.copy}</p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2 lg:col-span-7 lg:col-start-6">
              {area.items.map((item) => (
                <li
                  key={item}
                  className="border-l border-lc-lilac/50 pl-4 text-sm text-lc-offwhite"
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section className="mt-24 border border-lc-offwhite/10 bg-lc-dark p-6 md:p-10">
        <h2 className="display-md text-lc-offwhite">{MICROCOPY.haveIdea}</h2>
        <p className="mt-4 max-w-xl text-lc-gray">
          Cuéntanos qué tienes en mente. Respondemos con propuesta, no con
          catálogo.
        </p>
        <form className="mt-8 grid gap-4 md:grid-cols-2" action="/contacto">
          <input
            name="name"
            placeholder="Nombre"
            required
            className="border border-lc-offwhite/20 bg-transparent px-4 py-3 text-sm text-lc-offwhite placeholder:text-lc-gray focus:border-lc-lilac focus:outline-none"
          />
          <input
            name="company"
            placeholder="Empresa"
            className="border border-lc-offwhite/20 bg-transparent px-4 py-3 text-sm text-lc-offwhite placeholder:text-lc-gray focus:border-lc-lilac focus:outline-none"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="border border-lc-offwhite/20 bg-transparent px-4 py-3 text-sm text-lc-offwhite placeholder:text-lc-gray focus:border-lc-lilac focus:outline-none"
          />
          <input
            name="phone"
            placeholder="Teléfono (opcional)"
            className="border border-lc-offwhite/20 bg-transparent px-4 py-3 text-sm text-lc-offwhite placeholder:text-lc-gray focus:border-lc-lilac focus:outline-none"
          />
          <textarea
            name="message"
            placeholder="Cuéntanos qué tienes en mente"
            required
            rows={4}
            className="border border-lc-offwhite/20 bg-transparent px-4 py-3 text-sm text-lc-offwhite placeholder:text-lc-gray focus:border-lc-lilac focus:outline-none md:col-span-2"
          />
          <div className="md:col-span-2">
            <CTA href="/contacto" variant="lilac" size="lg">
              {MICROCOPY.tellIdea}
            </CTA>
          </div>
        </form>
      </section>
    </div>
  );
}
