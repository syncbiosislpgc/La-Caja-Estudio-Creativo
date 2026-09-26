import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacidad" };

export default function PrivacidadPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-24">
      <h1 className="display-md text-lc-offwhite">PRIVACIDAD</h1>
      <div className="mt-8 space-y-4 text-base leading-relaxed text-lc-gray">
        <p>
          Política de privacidad pendiente de redacción legal. La Caja tratará
          datos de contacto y pedidos conforme al RGPD.
        </p>
      </div>
    </article>
  );
}
