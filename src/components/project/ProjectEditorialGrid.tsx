"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { BrushStroke } from "@/components/brand/BrushStroke";
import { projects, type ProjectCategory } from "@/data/projects";
import { PROJECT_FILTERS } from "@/lib/constants";
import { cn } from "@/lib/cn";

const filterMap: Record<string, ProjectCategory | "all"> = {
  TODOS: "all",
  BRANDING: "branding",
  CONTENIDO: "contenido",
  PRODUCCIÓN: "produccion",
  ESPACIOS: "espacios",
  SOCIAL: "social",
  OTROS: "otros",
};

export function ProjectEditorialGrid() {
  const [filter, setFilter] = useState("TODOS");
  const list = useMemo(() => {
    const key = filterMap[filter];
    if (!key || key === "all") return projects;
    return projects.filter((p) => p.categories.includes(key));
  }, [filter]);

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {PROJECT_FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "shrink-0 border px-4 py-2 text-micro transition-colors",
              filter === f
                ? "border-lc-lilac text-lc-lilac"
                : "border-lc-offwhite/15 text-lc-gray hover:text-lc-offwhite",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mt-12 space-y-16 md:space-y-24">
        {list.map((project, i) => (
          <ProjectRow key={project.slug} project={project} index={i} />
        ))}
      </div>
    </div>
  );
}

function ProjectRow({
  project,
  index,
}: {
  project: (typeof projects)[number];
  index: number;
}) {
  const odd = index % 2 === 1;
  const large = index % 3 === 0;

  return (
    <Link
      href={`/proyectos/${project.slug}`}
      className={cn(
        "group grid gap-6 md:grid-cols-12 md:items-end md:gap-8",
        large && "md:min-h-[60vh]",
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-lc-dark",
          large ? "aspect-[16/10] md:col-span-8" : "aspect-[4/3] md:col-span-7",
          odd && !large && "md:order-2 md:col-span-7",
        )}
      >
        <Image
          src={project.heroImage}
          alt={project.title}
          fill
          sizes="(max-width:768px) 100vw, 70vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
        />
        <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <BrushStroke
            variant="frame"
            className="absolute inset-4 h-[calc(100%-2rem)] w-[calc(100%-2rem)] opacity-80"
          />
        </span>
      </div>
      <div
        className={cn(
          "md:col-span-4",
          large && "md:col-span-4",
          odd && !large && "md:order-1 md:col-span-5",
        )}
      >
        <p className="text-micro text-lc-lilac">
          {project.year} · {project.client}
        </p>
        <h2 className="display-md mt-3 text-lc-offwhite group-hover:text-lc-lilac transition-colors">
          {project.title}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-lc-gray">
          {project.summary}
        </p>
        <p className="mt-6 text-micro text-lc-offwhite">ABRIR CASE STUDY →</p>
      </div>
    </Link>
  );
}
