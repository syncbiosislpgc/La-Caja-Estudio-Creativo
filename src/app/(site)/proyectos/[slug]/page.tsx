import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CTA } from "@/components/ui/CTA";
import { getProject, projects } from "@/data/projects";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: "Proyecto" };
  return { title: project.title, description: project.summary };
}

export default async function ProyectoSlugPage({ params }: Props) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const next = project.nextSlug ? getProject(project.nextSlug) : undefined;

  return (
    <article>
      <div className="relative h-[50vh] min-h-[320px] w-full bg-lc-dark md:h-[70vh]">
        <Image
          src={project.heroImage}
          alt={project.title}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-lc-black via-lc-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-10 md:px-8 lg:px-12">
          <p className="text-micro text-lc-lilac">
            {project.year} · {project.client}
          </p>
          <h1 className="display-lg mt-3 text-lc-offwhite">{project.title}</h1>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-5 py-14 md:px-8 md:py-20 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="text-xl leading-relaxed text-lc-offwhite/90">
              {project.description}
            </p>
            <p className="mt-6 text-base leading-relaxed text-lc-gray">
              {project.result}
            </p>
          </div>
          <aside className="lg:col-span-4 lg:col-start-9">
            <p className="text-micro text-lc-gray">Servicios</p>
            <ul className="mt-4 space-y-2">
              {project.services.map((s) => (
                <li key={s} className="text-sm text-lc-offwhite">
                  {s}
                </li>
              ))}
            </ul>
            <p className="mt-10 text-micro text-lc-gray">Créditos</p>
            <ul className="mt-4 space-y-2">
              {project.credits.map((c) => (
                <li key={c.role} className="text-sm text-lc-offwhite">
                  <span className="text-lc-gray">{c.role}:</span> {c.name}
                </li>
              ))}
            </ul>
          </aside>
        </div>

        <div className="mt-16 space-y-8">
          {project.gallery.map((img) => (
            <div
              key={img.src}
              className={
                img.layout === "large"
                  ? "relative aspect-[16/9] overflow-hidden bg-lc-dark"
                  : img.layout === "detail"
                    ? "relative mx-auto aspect-square max-w-xl overflow-hidden bg-lc-dark"
                    : "relative aspect-[4/3] max-w-4xl overflow-hidden bg-lc-dark"
              }
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover"
                sizes="100vw"
              />
            </div>
          ))}
        </div>

        <div className="mt-20 flex flex-col justify-between gap-8 border-t border-lc-offwhite/10 pt-10 md:flex-row md:items-center">
          <CTA href="/proyectos" variant="secondary" size="md">
            TODOS LOS PROYECTOS
          </CTA>
          {next ? (
            <Link href={`/proyectos/${next.slug}`} className="group text-right">
              <p className="text-micro text-lc-gray">SIGUIENTE</p>
              <p className="mt-2 text-2xl font-bold text-lc-offwhite group-hover:text-lc-lilac">
                {next.title} →
              </p>
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
