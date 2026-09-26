import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BrushStroke } from "@/components/brand/BrushStroke";
import { CTA } from "@/components/ui/CTA";
import { collaborations } from "@/data/collaborations";
import { getProduct, formatPrice } from "@/data/products";

export const metadata: Metadata = {
  title: "Colaboraciones",
  description: "LA CAJA × artistas. Ediciones limitadas y proyectos compartidos.",
};

export default function ColaboracionesPage() {
  return (
    <div className="mx-auto max-w-[1600px] px-5 py-14 md:px-8 md:py-20 lg:px-12">
      <p className="text-micro text-lc-lilac">COLLABS</p>
      <h1 className="display-lg mt-4 max-w-3xl text-lc-offwhite">
        HAY MÁS SITIO
        <br />
        DENTRO DE LA CAJA.
      </h1>
      <BrushStroke variant="underline" className="mt-2 h-6 w-44" />
      <p className="mt-6 max-w-2xl text-lg text-lc-gray">
        Artistas, ilustradores, fotógrafos, diseñadores, músicos y gente con
        cosas que decir. Creamos cosas que ninguno habría hecho por separado.
      </p>

      <div className="mt-16 space-y-28">
        {collaborations.map((c) => {
          const linked = c.productSlugs
            .map((s) => getProduct(s))
            .filter(Boolean);
          return (
            <article
              key={c.slug}
              id={c.slug}
              className="scroll-mt-28 border-t border-lc-offwhite/10 pt-14"
            >
              <p className="text-micro text-lc-lilac">{c.number}</p>
              <h2 className="display-md mt-3 text-lc-offwhite">{c.title}</h2>
              <p className="mt-2 text-sm text-lc-gray">{c.editionNote}</p>

              <div className="relative mt-10 aspect-[16/9] overflow-hidden bg-lc-dark">
                <Image
                  src={c.heroImage}
                  alt={c.title}
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
              </div>

              <div className="mt-10 grid gap-10 lg:grid-cols-2">
                <div>
                  <p className="text-micro text-lc-gray">Historia</p>
                  <p className="mt-3 text-lg leading-relaxed text-lc-offwhite/90">
                    {c.story}
                  </p>
                  {c.process ? (
                    <>
                      <p className="mt-8 text-micro text-lc-gray">Proceso</p>
                      <p className="mt-3 text-base text-lc-gray">{c.process}</p>
                    </>
                  ) : null}
                </div>
                <div>
                  {c.interview ? (
                    <>
                      <p className="text-micro text-lc-gray">Entrevista</p>
                      <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-lc-offwhite/85">
                        {c.interview}
                      </p>
                    </>
                  ) : null}
                  <p className="mt-8 text-micro text-lc-gray">Créditos</p>
                  <ul className="mt-3 space-y-1">
                    {c.credits.map((cr) => (
                      <li key={cr.role} className="text-sm text-lc-offwhite">
                        {cr.role}: {cr.name}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {linked.length > 0 ? (
                <div className="mt-12">
                  <p className="text-micro text-lc-lilac">PRODUCTOS DE LA EDICIÓN</p>
                  <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {linked.map((p) =>
                      p ? (
                        <Link
                          key={p.slug}
                          href={`/shop/${p.slug}`}
                          className="group block border border-lc-offwhite/10 p-4 transition-colors hover:border-lc-lilac"
                        >
                          <div className="relative aspect-square overflow-hidden bg-lc-dark">
                            <Image
                              src={p.images[0]}
                              alt={p.name}
                              fill
                              className="object-cover"
                              sizes="300px"
                            />
                          </div>
                          <p className="mt-4 text-sm font-semibold text-lc-offwhite">
                            {p.name}
                          </p>
                          <p className="mt-1 text-sm text-lc-lilac">
                            {formatPrice(p.price)}
                          </p>
                          {p.limitedEdition ? (
                            <p className="mt-2 text-micro text-lc-gray">
                              {p.limitedEdition.available}/{p.limitedEdition.total}{" "}
                              DISPONIBLES
                            </p>
                          ) : null}
                        </Link>
                      ) : null,
                    )}
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      <div className="mt-20 border-t border-lc-offwhite/10 pt-12">
        <h2 className="display-md text-lc-offwhite">
          ¿TIENES ALGO
          <br />
          QUE METER?
        </h2>
        <div className="mt-8">
          <CTA href="/contacto" variant="lilac" size="lg">
            PROPONER COLABORACIÓN
          </CTA>
        </div>
      </div>
    </div>
  );
}
