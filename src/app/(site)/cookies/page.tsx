import type { Metadata } from "next";

export const metadata: Metadata = { title: "Cookies" };

export default function CookiesPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-24">
      <h1 className="display-md text-lc-offwhite">COOKIES</h1>
      <div className="mt-8 space-y-4 text-base leading-relaxed text-lc-gray">
        <p>
          Información sobre cookies pendientes de configuración (analytics /
          preferencias). Priorizamos lo esencial para el funcionamiento del
          sitio.
        </p>
      </div>
    </article>
  );
}
