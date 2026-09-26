import type { Metadata } from "next";
import { ShopCatalog } from "@/components/shop/ShopCatalog";
import { BrushStroke } from "@/components/brand/BrushStroke";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Ediciones limitadas, camisetas, prints, objetos y colaboraciones de LA CAJA.",
};

export default function ShopPage() {
  return (
    <div className="mx-auto max-w-[1600px] px-5 py-14 md:px-8 md:py-20 lg:px-12">
      <p className="text-micro text-lc-lilac">SHOP</p>
      <h1 className="display-lg mt-4 max-w-3xl text-lc-offwhite">
        COSAS QUE HACEMOS
        <br />
        PORQUE NOS DA LA GANA.
      </h1>
      <BrushStroke variant="underline" className="mt-2 h-6 w-40" />
      <p className="mt-6 max-w-2xl text-lg text-lc-gray">
        Ediciones limitadas. Camisetas. Prints. Objetos. Colaboraciones.
        Experimentos. Cuando se acaba, puede que se haya acabado.
      </p>
      <div className="mt-14">
        <ShopCatalog />
      </div>
    </div>
  );
}
