import type { Metadata } from "next";
import { BrushStroke } from "@/components/brand/BrushStroke";
import { CTA } from "@/components/ui/CTA";
import { MICROCOPY } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contacto",
};

export default function ContactoPage() {
  return (
    <div className="mx-auto grid max-w-[1600px] gap-12 px-5 py-16 md:grid-cols-12 md:px-8 md:py-24 lg:px-12">
      <div className="md:col-span-5">
        <p className="text-micro text-lc-lilac">CONTACTO</p>
        <h1 className="display-lg mt-4 text-lc-offwhite">
          CUÉNTANOS
          <br />
          TU PROYECTO
        </h1>
        <BrushStroke variant="underline" className="mt-2 h-6 w-40" />
        <p className="mt-8 max-w-md text-lg leading-relaxed text-lc-gray">
          Puedes llegar con un briefing perfecto o simplemente decirnos: «tengo
          una idea». Empezamos desde ahí.
        </p>
      </div>

      <form className="space-y-5 md:col-span-7 md:pl-8" action="#" method="post">
        <Field id="name" label="Nombre" required />
        <Field id="company" label="Empresa" />
        <Field id="email" label="Email" type="email" required />
        <Field id="phone" label="Teléfono (opcional)" type="tel" />
        <div>
          <label htmlFor="message" className="text-micro text-lc-gray">
            Cuéntanos qué tienes en mente
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={5}
            className="mt-2 w-full border border-lc-offwhite/20 bg-transparent px-4 py-3 text-sm text-lc-offwhite placeholder:text-lc-gray focus:border-lc-lilac focus:outline-none"
            placeholder="Una idea, un local, una campaña, un objeto…"
          />
        </div>
        <Field id="budget" label="Presupuesto aproximado (opcional)" />
        <div>
          <label htmlFor="files" className="text-micro text-lc-gray">
            Adjuntar archivos
          </label>
          <input
            id="files"
            name="files"
            type="file"
            multiple
            className="mt-2 block w-full text-sm text-lc-gray file:mr-4 file:border-0 file:bg-lc-lilac file:px-4 file:py-2 file:text-micro file:text-lc-black"
          />
        </div>
        <CTA type="submit" variant="lilac" size="lg">
          {MICROCOPY.tellIdea}
        </CTA>
        <p className="text-xs text-lc-gray">
          El envío se conectará en fases posteriores (API / email / CRM).
        </p>
      </form>
    </div>
  );
}

function Field({
  id,
  label,
  type = "text",
  required,
}: {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-micro text-lc-gray">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        className="mt-2 w-full border border-lc-offwhite/20 bg-transparent px-4 py-3 text-sm text-lc-offwhite focus:border-lc-lilac focus:outline-none"
      />
    </div>
  );
}
