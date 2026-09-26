import type { Metadata } from "next";

export const metadata: Metadata = { title: "Aviso legal" };

export default function LegalPage() {
  return (
    <LegalShell title="AVISO LEGAL">
      <p>
        Contenido legal pendiente de revisión por asesoría. Placeholder para La
        Caja Estudio Creativo — Las Palmas de Gran Canaria.
      </p>
    </LegalShell>
  );
}

function LegalShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-24">
      <h1 className="display-md text-lc-offwhite">{title}</h1>
      <div className="prose-invert mt-8 space-y-4 text-base leading-relaxed text-lc-gray">
        {children}
      </div>
    </article>
  );
}
