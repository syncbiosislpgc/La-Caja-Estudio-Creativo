"use client";

import { useState } from "react";
import { CTA } from "@/components/ui/CTA";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/data/products";

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="mx-auto flex min-h-[60dvh] max-w-3xl flex-col justify-center px-5 py-20 md:px-8">
        <p className="text-micro text-lc-lilac">PEDIDO DEMO</p>
        <h1 className="display-lg mt-4 text-lc-offwhite">
          YA SALIÓ
          <br />
          DE LA CAJA.
        </h1>
        <p className="mt-6 text-lc-gray">
          Esto es un checkout de demostración. En producción redirigiremos a
          Shopify Checkout real.
        </p>
        <div className="mt-10">
          <CTA href="/shop" variant="primary" size="lg">
            VOLVER AL SHOP
          </CTA>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex min-h-[50dvh] flex-col items-start justify-center px-5 py-20">
        <h1 className="display-md text-lc-offwhite">LA CAJA ESTÁ VACÍA.</h1>
        <div className="mt-8">
          <CTA href="/shop" variant="lilac" size="lg">
            IR AL SHOP
          </CTA>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-[1100px] gap-12 px-5 py-14 md:grid-cols-2 md:px-8 md:py-20">
      <div>
        <p className="text-micro text-lc-lilac">CHECKOUT DEMO</p>
        <h1 className="display-md mt-3 text-lc-offwhite">SACAR DE LA CAJA</h1>
        <p className="mt-4 text-sm text-lc-gray">
          Formulario ficticio. No se procesa ningún pago.
        </p>
        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            clear();
            setDone(true);
          }}
        >
          <Field id="name" label="Nombre" required />
          <Field id="email" label="Email" type="email" required />
          <Field id="address" label="Dirección" required />
          <Field id="city" label="Ciudad" required />
          <Field id="cp" label="Código postal" required />
          <CTA type="submit" variant="lilac" size="lg" className="w-full">
            CONFIRMAR PEDIDO DEMO
          </CTA>
        </form>
      </div>
      <div className="border border-lc-offwhite/10 bg-lc-dark p-6 md:p-8">
        <p className="text-micro text-lc-gray">RESUMEN</p>
        <ul className="mt-6 space-y-4">
          {items.map((i) => (
            <li key={i.key} className="flex justify-between gap-4 text-sm">
              <span className="text-lc-offwhite">
                {i.name} × {i.quantity}
              </span>
              <span className="text-lc-lilac">
                {formatPrice(i.price * i.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex justify-between border-t border-lc-offwhite/10 pt-4">
          <span className="text-micro text-lc-gray">TOTAL</span>
          <span className="text-xl font-bold text-lc-offwhite">
            {formatPrice(subtotal)}
          </span>
        </div>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  type = "text",
  required,
}: {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-micro text-lc-gray">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        className="mt-2 w-full border border-lc-offwhite/20 bg-transparent px-4 py-3 text-sm text-lc-offwhite focus:border-lc-lilac focus:outline-none"
      />
    </div>
  );
}
