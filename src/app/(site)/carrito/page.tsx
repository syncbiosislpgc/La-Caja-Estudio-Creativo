"use client";

import Image from "next/image";
import Link from "next/link";
import { CTA } from "@/components/ui/CTA";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/data/products";
import { MICROCOPY } from "@/lib/constants";

export default function CarritoPage() {
  const { items, subtotal, updateQty, removeItem, clear } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60dvh] max-w-[1600px] flex-col items-start justify-center px-5 py-20 md:px-8 lg:px-12">
        <p className="text-micro text-lc-lilac">CARRITO</p>
        <h1 className="display-lg mt-4 text-lc-offwhite">
          {MICROCOPY.emptyCart}
        </h1>
        <p className="mt-4 text-lc-gray">{MICROCOPY.emptyCartHint}</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <CTA href="/shop" variant="lilac" size="lg">
            {MICROCOPY.viewShop}
          </CTA>
          <CTA href="/" variant="secondary" size="lg">
            {MICROCOPY.backHome}
          </CTA>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-14 md:px-8 md:py-20 lg:px-12">
      <p className="text-micro text-lc-lilac">CARRITO</p>
      <h1 className="display-md mt-3 text-lc-offwhite">TU PEDIDO</h1>

      <ul className="mt-12 divide-y divide-lc-offwhite/10 border-y border-lc-offwhite/10">
        {items.map((item) => (
          <li key={item.key} className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center">
            <Link
              href={`/shop/${item.productSlug}`}
              className="relative h-28 w-24 shrink-0 overflow-hidden bg-lc-dark sm:h-32 sm:w-28"
            >
              <Image src={item.image} alt={item.name} fill className="object-cover" sizes="112px" />
            </Link>
            <div className="flex-1">
              <Link
                href={`/shop/${item.productSlug}`}
                className="text-sm font-semibold text-lc-offwhite hover:text-lc-lilac"
              >
                {item.name}
              </Link>
              <p className="mt-1 text-xs text-lc-gray">
                {[item.color, item.size].filter(Boolean).join(" · ")}
              </p>
              <p className="mt-2 text-sm text-lc-lilac">{formatPrice(item.price)}</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="sr-only" htmlFor={`qty-${item.key}`}>
                Cantidad
              </label>
              <input
                id={`qty-${item.key}`}
                type="number"
                min={1}
                max={99}
                value={item.quantity}
                onChange={(e) => updateQty(item.key, Number(e.target.value) || 1)}
                className="w-16 border border-lc-offwhite/20 bg-transparent px-2 py-2 text-center text-sm text-lc-offwhite"
              />
              <button
                type="button"
                onClick={() => removeItem(item.key)}
                className="text-micro text-lc-gray hover:text-lc-lilac"
              >
                {MICROCOPY.removeItem}
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <button
          type="button"
          onClick={clear}
          className="text-micro text-lc-gray hover:text-lc-offwhite"
        >
          {MICROCOPY.clearCart}
        </button>
        <div className="text-right">
          <p className="text-micro text-lc-gray">SUBTOTAL</p>
          <p className="display-md mt-2 text-lc-offwhite">{formatPrice(subtotal)}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <CTA href="/shop" variant="secondary" size="md">
              {MICROCOPY.keepShopping}
            </CTA>
            <CTA href="/checkout" variant="lilac" size="md">
              {MICROCOPY.checkout}
            </CTA>
          </div>
        </div>
      </div>
    </div>
  );
}
