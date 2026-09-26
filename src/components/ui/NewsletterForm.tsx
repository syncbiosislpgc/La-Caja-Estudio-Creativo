"use client";

import { CTA } from "@/components/ui/CTA";
import { MICROCOPY } from "@/lib/constants";

export function NewsletterForm() {
  return (
    <form
      className="mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault();
        // Cableado a proveedor/newsletter en fases posteriores
      }}
    >
      <label className="sr-only" htmlFor="newsletter-email">
        Email
      </label>
      <input
        id="newsletter-email"
        name="email"
        type="email"
        required
        placeholder="tu@email.com"
        className="min-h-12 flex-1 border border-lc-offwhite/20 bg-transparent px-4 text-sm text-lc-offwhite placeholder:text-lc-gray focus:border-lc-lilac focus:outline-none"
      />
      <CTA type="submit" variant="lilac" size="md">
        {MICROCOPY.newsletterCta}
      </CTA>
    </form>
  );
}
