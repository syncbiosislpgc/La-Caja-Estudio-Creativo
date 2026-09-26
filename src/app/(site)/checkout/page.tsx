import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Checkout",
};

/**
 * Checkout real = Shopify Hosted Checkout.
 * Sin store configurada, redirigimos al carrito.
 */
export default function CheckoutPage() {
  redirect("/carrito");
}
