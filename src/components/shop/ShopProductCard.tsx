"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CTA } from "@/components/ui/CTA";
import { useCart } from "@/context/CartContext";
import { formatPrice, type Product } from "@/data/products";
import { MICROCOPY } from "@/lib/constants";
import { cn } from "@/lib/cn";

export function ProductPurchase({ product }: { product: Product }) {
  const { addItem, justAdded, clearJustAdded } = useCart();
  const sizes = useMemo(
    () =>
      Array.from(
        new Set(product.variants.map((v) => v.size).filter(Boolean) as string[]),
      ),
    [product.variants],
  );
  const colors = useMemo(
    () =>
      Array.from(
        new Set(
          product.variants.map((v) => v.color).filter(Boolean) as string[],
        ),
      ),
    [product.variants],
  );

  const [size, setSize] = useState(sizes[0]);
  const [color, setColor] = useState(colors[0]);

  const variant = product.variants.find((v) => {
    const sizeOk = !sizes.length || v.size === size;
    const colorOk = !colors.length || v.color === color;
    return sizeOk && colorOk;
  }) ?? product.variants[0];

  const soldOut = !variant || variant.stock <= 0;
  const limited = product.limitedEdition;

  return (
    <div className="space-y-8">
      {limited ? (
        <p className="text-micro text-lc-lilac">
          EDICIÓN DE {limited.total}
          {limited.numbering ? ` · ${limited.numbering}` : ""}
          <span className="ml-3 text-lc-offwhite">
            {limited.available} / {limited.total} DISPONIBLES
          </span>
        </p>
      ) : null}

      <div>
        <p className="display-md text-lc-offwhite">{formatPrice(product.price)}</p>
        {product.artist ? (
          <p className="mt-2 text-sm text-lc-gray">Artista: {product.artist}</p>
        ) : null}
      </div>

      {colors.length > 0 ? (
        <div>
          <p className="text-micro text-lc-gray">Color</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setColor(c);
                  clearJustAdded();
                }}
                className={cn(
                  "border px-4 py-2 text-micro transition-colors",
                  color === c
                    ? "border-lc-lilac text-lc-lilac"
                    : "border-lc-offwhite/20 text-lc-offwhite hover:border-lc-lilac",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {sizes.length > 0 ? (
        <div>
          <p className="text-micro text-lc-gray">Talla</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setSize(s);
                  clearJustAdded();
                }}
                className={cn(
                  "min-w-12 border px-4 py-2 text-micro transition-colors",
                  size === s
                    ? "border-lc-lilac text-lc-lilac"
                    : "border-lc-offwhite/20 text-lc-offwhite hover:border-lc-lilac",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <CTA
          type="button"
          variant="lilac"
          size="lg"
          disabled={soldOut}
          onClick={() => {
            if (!variant) return;
            addItem({ product, variantId: variant.id });
          }}
        >
          {soldOut ? MICROCOPY.soldOut : MICROCOPY.addToCart}
        </CTA>
        <CTA href="/carrito" variant="secondary" size="lg">
          {MICROCOPY.viewCart}
        </CTA>
      </div>

      {justAdded ? (
        <p className="text-micro text-lc-lilac">{MICROCOPY.addedToCart}</p>
      ) : null}

      <p className="text-sm leading-relaxed text-lc-gray">
        Stock variante: {variant?.stock ?? 0} uds. Checkout demo (sin pago real).
      </p>
    </div>
  );
}

export function ShopProductCard({ product }: { product: Product }) {
  const limited = product.limitedEdition;
  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group block"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-lc-dark">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width:768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="absolute inset-3 border border-lc-lilac/80" />
        </span>
        {limited ? (
          <span className="absolute left-3 top-3 bg-lc-black/80 px-2 py-1 text-micro text-lc-lilac">
            {limited.available}/{limited.total}
          </span>
        ) : null}
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold tracking-wide text-lc-offwhite">
            {product.name}
          </h3>
          {product.artist ? (
            <p className="mt-1 text-xs text-lc-gray">× {product.artist}</p>
          ) : null}
        </div>
        <p className="text-sm text-lc-lilac">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}
