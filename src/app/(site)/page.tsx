import { AnimatedBox } from "@/components/brand/AnimatedBox";
import { BrushStroke } from "@/components/brand/BrushStroke";
import { CTA } from "@/components/ui/CTA";
import { Marquee } from "@/components/ui/Marquee";
import { MICROCOPY, SERVICE_CATEGORIES, SITE } from "@/lib/constants";

/**
 * Home — estructura Fase 1 (shell + identidad).
 * Contenido completo e interacciones de entrada: Fase 2.
 */
export default function HomePage() {
  return (
    <div className="relative">
      <section className="relative flex min-h-[calc(100dvh-var(--header-h))] flex-col justify-center overflow-hidden px-5 py-16 md:px-8 lg:px-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 80% 50% at 70% 20%, #C3A6D9 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 10% 80%, #1A1A1A 0%, transparent 50%)",
          }}
        />

        <div className="relative z-10 mx-auto grid w-full max-w-[1600px] items-center gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <p className="text-micro text-lc-lilac">
              {SITE.name} · {SITE.tagline.toUpperCase()}
            </p>

            <h1 className="display-xl mt-6 text-lc-offwhite">
              TODO EL ARTE
              <br />
              CABE AQUÍ.
            </h1>

            <div className="relative mt-2 inline-block">
              <BrushStroke
                variant="underline"
                className="h-6 w-40 text-lc-lilac md:h-8 md:w-56"
              />
            </div>

            <p className="mt-8 max-w-xl text-lg leading-relaxed text-lc-gray md:text-xl">
              La Caja es un estudio creativo donde las ideas entran sin saber
              todavía en qué se van a convertir.
              <br />
              <span className="mt-3 block text-lc-offwhite/80">
                Diseño, contenido, producción, marcas, espacios y cualquier cosa
                que podamos imaginar.
              </span>
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <CTA href="/contacto" variant="primary" size="lg">
                {MICROCOPY.openBox}
              </CTA>
              <CTA href="/contacto" variant="secondary" size="lg">
                {MICROCOPY.tellIdea}
              </CTA>
            </div>
          </div>

          <div className="flex items-center justify-center lg:col-span-5">
            <AnimatedBox className="h-48 w-auto md:h-64 lg:h-72" />
          </div>
        </div>
      </section>

      <Marquee items={SERVICE_CATEGORIES} />

      <section className="mx-auto max-w-[1600px] px-5 py-20 md:px-8 md:py-28 lg:px-12">
        <p className="text-micro text-lc-gray">FASE 1 · SISTEMA BASE</p>
        <h2 className="display-md mt-4 max-w-3xl text-lc-offwhite">
          NO HACEMOS UNA SOLA COSA.
          <br />
          ESA ES LA IDEA.
        </h2>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-lc-gray md:text-lg">
          Arquitectura, design system, navegación y componentes de marca listos.
          La Home completa, portfolio, shop, collabs y personalizador llegan en
          las siguientes fases — sin plantilla de agencia, con el universo de La
          Caja.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <CTA href="/estudio" variant="secondary" size="md">
            ESTUDIO
          </CTA>
          <CTA href="/servicios" variant="secondary" size="md">
            SERVICIOS
          </CTA>
          <CTA href="/proyectos" variant="secondary" size="md">
            PROYECTOS
          </CTA>
          <CTA href="/shop" variant="secondary" size="md">
            SHOP
          </CTA>
          <CTA href="/studio" variant="lilac" size="md">
            ADMIN CMS
          </CTA>
        </div>
      </section>
    </div>
  );
}
