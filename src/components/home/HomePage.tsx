import Image from "next/image";
import Link from "next/link";
import { AnimatedBox } from "@/components/brand/AnimatedBox";
import { BrushStroke } from "@/components/brand/BrushStroke";
import { BoxFrame } from "@/components/brand/BoxFrame";
import { CTA } from "@/components/ui/CTA";
import { Marquee } from "@/components/ui/Marquee";
import { ShopProductCard } from "@/components/shop/ShopProductCard";
import { collaborations } from "@/data/collaborations";
import { products } from "@/data/products";
import { projects } from "@/data/projects";
import { serviceAreas } from "@/data/services";
import { MICROCOPY, SERVICE_CATEGORIES } from "@/lib/constants";

export function HomePage() {
  const featuredProjects = projects.slice(0, 3);
  const shopPreview = products.filter((p) => p.limitedEdition || p.category === "wear").slice(0, 4);

  return (
    <div>
      {/* 1. HERO */}
      <section className="relative flex min-h-[calc(100dvh-var(--header-h))] flex-col justify-center overflow-hidden px-5 py-14 md:px-8 lg:px-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 70% 45% at 80% 15%, #C3A6D9 0%, transparent 55%)",
          }}
        />
        <div className="relative z-10 mx-auto grid w-full max-w-[1600px] items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="text-micro text-lc-lilac">LA CAJA · ESTUDIO CREATIVO</p>
            <h1 className="display-xl mt-5 text-lc-offwhite">
              TODO EL ARTE
              <br />
              CABE AQUÍ.
            </h1>
            <BrushStroke variant="underline" className="mt-1 h-6 w-44 md:h-8 md:w-56" />
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-lc-gray md:text-xl">
              La Caja es un estudio creativo donde las ideas entran sin saber
              todavía en qué se van a convertir.
            </p>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-lc-offwhite/75">
              Diseño, contenido, producción, marcas, espacios y cualquier cosa
              que podamos imaginar.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <CTA href="/proyectos" variant="primary" size="lg">
                {MICROCOPY.viewProjects}
              </CTA>
              <CTA href="/contacto" variant="secondary" size="lg">
                {MICROCOPY.tellIdea}
              </CTA>
            </div>
          </div>
          <div className="flex justify-center lg:col-span-5">
            <AnimatedBox className="h-44 w-auto md:h-64 lg:h-72" />
          </div>
        </div>
      </section>

      <Marquee items={SERVICE_CATEGORIES} />

      {/* 2. QUÉ ES */}
      <section className="mx-auto max-w-[1600px] px-5 py-20 md:px-8 md:py-28 lg:px-12">
        <p className="text-micro text-lc-gray">QUÉ ES LA CAJA</p>
        <h2 className="display-lg mt-4 max-w-4xl text-lc-offwhite">
          NO HACEMOS UNA SOLA COSA.
          <br />
          ESA ES LA IDEA.
        </h2>
        <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <p className="text-lg leading-relaxed text-lc-gray">
            Una marca no necesita diez proveedores. Necesita una buena idea y
            alguien capaz de llevarla hasta el final.
          </p>
          <p className="text-lg leading-relaxed text-lc-offwhite/80">
            En La Caja podemos empezar diseñando un logo y terminar rotulando un
            local, grabando una campaña, creando contenido o produciendo el
            packaging. Todo conectado. Todo dentro de la misma caja.
          </p>
        </div>
      </section>

      {/* 3. SERVICIOS */}
      <section className="border-y border-lc-offwhite/10 bg-lc-black-alt">
        <div className="mx-auto max-w-[1600px] px-5 py-20 md:px-8 md:py-28 lg:px-12">
          <h2 className="display-lg max-w-3xl text-lc-offwhite">
            ¿QUÉ METEMOS
            <br />
            DENTRO DE LA CAJA?
          </h2>
          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {serviceAreas.map((area) => (
              <div key={area.id} className="border-t border-lc-offwhite/15 pt-6">
                <h3 className="text-micro text-lc-lilac">{area.title}</h3>
                <ul className="mt-4 space-y-2">
                  {area.items.slice(0, 5).map((item) => (
                    <li key={item} className="text-sm text-lc-offwhite/85">
                      {item}
                    </li>
                  ))}
                  {area.items.length > 5 ? (
                    <li className="text-sm text-lc-gray">+ {area.items.length - 5} más</li>
                  ) : null}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12">
            <CTA href="/servicios" variant="secondary" size="md">
              VER SERVICIOS
            </CTA>
          </div>
        </div>
      </section>

      {/* 4. TRABAJOS */}
      <section className="mx-auto max-w-[1600px] px-5 py-20 md:px-8 md:py-28 lg:px-12">
        <h2 className="display-lg text-lc-offwhite">
          COSAS QUE
          <br />
          HAN SALIDO
          <br />
          DE LA CAJA.
        </h2>
        <div className="mt-14 space-y-16">
          {featuredProjects.map((project, i) => (
            <Link
              key={project.slug}
              href={`/proyectos/${project.slug}`}
              className={`group grid gap-6 md:grid-cols-12 md:items-center ${
                i % 2 === 1 ? "" : ""
              }`}
            >
              <div
                className={`relative aspect-[16/10] overflow-hidden bg-lc-dark md:col-span-7 ${
                  i % 2 === 1 ? "md:order-2" : ""
                }`}
              >
                <Image
                  src={project.heroImage}
                  alt={project.title}
                  fill
                  sizes="(max-width:768px) 100vw, 60vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                />
              </div>
              <div className={`md:col-span-5 ${i % 2 === 1 ? "md:order-1" : "md:pl-6"}`}>
                <p className="text-micro text-lc-lilac">
                  {project.year} · {project.client}
                </p>
                <h3 className="display-md mt-3 text-lc-offwhite">{project.title}</h3>
                <p className="mt-4 text-lc-gray">{project.summary}</p>
                <p className="mt-6 text-micro text-lc-offwhite group-hover:text-lc-lilac">
                  VER PROYECTO →
                </p>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-12">
          <CTA href="/proyectos" variant="primary" size="md">
            VER TODOS LOS PROYECTOS
          </CTA>
        </div>
      </section>

      {/* 5. PROCESO */}
      <section className="bg-lc-dark">
        <div className="mx-auto max-w-[1600px] px-5 py-20 md:px-8 md:py-28 lg:px-12">
          <h2 className="display-lg text-lc-offwhite">
            ¿CÓMO FUNCIONA
            <br />
            LA CAJA?
          </h2>
          <ol className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["01", "ENTRA UNA IDEA."],
              ["02", "LA PENSAMOS."],
              ["03", "LA HACEMOS REAL."],
              ["04", "SALE DE LA CAJA."],
            ].map(([n, t]) => (
              <li key={n} className="border-t border-lc-lilac/40 pt-6">
                <p className="text-micro text-lc-lilac">{n}</p>
                <p className="mt-3 text-xl font-bold text-lc-offwhite">{t}</p>
              </li>
            ))}
          </ol>
          <p className="mt-12 max-w-2xl text-lg text-lc-gray">
            Puedes llegar con un briefing perfectamente preparado o simplemente
            decirnos: «tengo una idea». Nosotros empezamos desde ahí.
          </p>
        </div>
      </section>

      {/* 6. SHOP */}
      <section className="mx-auto max-w-[1600px] px-5 py-20 md:px-8 md:py-28 lg:px-12">
        <p className="text-micro text-lc-lilac">SHOP</p>
        <h2 className="display-lg mt-4 max-w-3xl text-lc-offwhite">
          COSAS QUE HACEMOS
          <br />
          PORQUE NOS DA LA GANA.
        </h2>
        <p className="mt-6 max-w-2xl text-lg text-lc-gray">
          No todo tiene que empezar con un cliente. Ediciones limitadas,
          camisetas, prints, objetos. Cuando se acaba, puede que se haya
          acabado.
        </p>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {shopPreview.map((p) => (
            <ShopProductCard key={p.slug} product={p} />
          ))}
        </div>
        <div className="mt-12">
          <CTA href="/shop" variant="lilac" size="lg">
            {MICROCOPY.viewShop}
          </CTA>
        </div>
      </section>

      {/* 7. COLLABS */}
      <section className="border-t border-lc-offwhite/10">
        <div className="mx-auto max-w-[1600px] px-5 py-20 md:px-8 md:py-28 lg:px-12">
          <h2 className="display-lg text-lc-offwhite">
            HAY MÁS SITIO
            <br />
            DENTRO DE LA CAJA.
          </h2>
          <p className="mt-6 max-w-2xl text-lg text-lc-gray">
            Artistas, ilustradores, fotógrafos, diseñadores, músicos y gente con
            cosas que decir.
          </p>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {collaborations.map((c) => (
              <Link
                key={c.slug}
                href={`/colaboraciones#${c.slug}`}
                className="group relative block overflow-hidden bg-lc-dark"
              >
                <div className="relative aspect-[16/10]">
                  <Image
                    src={c.heroImage}
                    alt={c.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    sizes="(max-width:768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-lc-black via-transparent to-transparent" />
                </div>
                <div className="absolute bottom-0 p-6">
                  <p className="text-micro text-lc-lilac">{c.number}</p>
                  <h3 className="mt-2 text-2xl font-bold text-lc-offwhite">
                    {c.title}
                  </h3>
                  <p className="mt-2 text-sm text-lc-gray">{c.editionNote}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-12">
            <CTA href="/colaboraciones" variant="secondary" size="md">
              {MICROCOPY.proposeCollab}
            </CTA>
          </div>
        </div>
      </section>

      {/* 8. CTA FINAL */}
      <section className="relative overflow-hidden border-t border-lc-offwhite/10">
        <div className="mx-auto flex max-w-[1600px] flex-col items-start px-5 py-24 md:px-8 md:py-32 lg:px-12">
          <BoxFrame className="w-full max-w-4xl" contentClassName="p-6 md:p-12">
            <h2 className="display-xl text-lc-offwhite">
              ¿EMPEZAMOS
              <br />
              TU PROYECTO?
            </h2>
            <div className="mt-10">
              <CTA href="/contacto" variant="lilac" size="lg">
                {MICROCOPY.tellIdea}
              </CTA>
            </div>
          </BoxFrame>
        </div>
      </section>
    </div>
  );
}
