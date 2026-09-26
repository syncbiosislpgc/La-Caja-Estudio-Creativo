import type { Metadata } from "next";
import { CTA } from "@/components/ui/CTA";
import { MICROCOPY } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Carrito",
};

export default function CarritoPage() {
  return (
    <div className="mx-auto flex min-h-[60dvh] max-w-[1600px] flex-col items-start justify-center px-5 py-20 md:px-8 lg:px-12">
      <p className="text-micro text-lc-lilac">CARRITO</p>
      <h1 className="display-lg mt-4 whitespace-pre-line text-lc-offwhite">
        {MICROCOPY.emptyCart}
      </h1>
      <p className="mt-6 max-w-md text-lc-gray">
        El carrito se conectará a Shopify Cart API en la Fase 5.
      </p>
      <div className="mt-10 flex gap-3">
        <CTA href="/shop" variant="primary" size="lg">
          IR AL SHOP
        </CTA>
        <CTA href="/" variant="secondary" size="lg">
          {MICROCOPY.backHome}
        </CTA>
      </div>
    </div>
  );
}
