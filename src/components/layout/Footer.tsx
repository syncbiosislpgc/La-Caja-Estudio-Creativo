import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { BrushStroke } from "@/components/brand/BrushStroke";
import { NewsletterForm } from "@/components/ui/NewsletterForm";
import { MICROCOPY, NAV_LINKS, SITE } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="relative mt-auto border-t border-lc-offwhite/10 bg-lc-black">
      <div className="mx-auto max-w-[1600px] px-5 py-16 md:px-8 md:py-20 lg:px-12">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <p className="text-micro text-lc-lilac">{SITE.philosophy}</p>
            <h2 className="display-md mt-4 whitespace-pre-line text-lc-offwhite">
              {MICROCOPY.newsletterTitle}
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-lc-gray">
              {MICROCOPY.newsletterBody}
            </p>
            <NewsletterForm />
          </div>

          <div className="grid gap-10 sm:grid-cols-3 lg:col-span-7 lg:grid-cols-3 lg:pl-8">
            <div>
              <p className="text-micro text-lc-gray">Navegar</p>
              <ul className="mt-4 space-y-3">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-lc-offwhite transition-colors hover:text-lc-lilac"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/contacto"
                    className="text-sm text-lc-offwhite transition-colors hover:text-lc-lilac"
                  >
                    CONTACTO
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-micro text-lc-gray">Shop</p>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link
                    href="/shop"
                    className="text-sm text-lc-offwhite transition-colors hover:text-lc-lilac"
                  >
                    TIENDA
                  </Link>
                </li>
                <li>
                  <Link
                    href="/personaliza"
                    className="text-sm text-lc-offwhite transition-colors hover:text-lc-lilac"
                  >
                    MÉTELO EN LA CAJA
                  </Link>
                </li>
                <li>
                  <Link
                    href="/carrito"
                    className="text-sm text-lc-offwhite transition-colors hover:text-lc-lilac"
                  >
                    CARRITO
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-micro text-lc-gray">Legal</p>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link
                    href="/legal"
                    className="text-sm text-lc-offwhite transition-colors hover:text-lc-lilac"
                  >
                    AVISO LEGAL
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacidad"
                    className="text-sm text-lc-offwhite transition-colors hover:text-lc-lilac"
                  >
                    PRIVACIDAD
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cookies"
                    className="text-sm text-lc-offwhite transition-colors hover:text-lc-lilac"
                  >
                    COOKIES
                  </Link>
                </li>
              </ul>
              <p className="mt-8 text-sm text-lc-gray">
                {SITE.location}
                <br />
                {SITE.region}
              </p>
              <a
                href={`mailto:${SITE.email}`}
                className="mt-2 inline-block text-sm text-lc-offwhite transition-colors hover:text-lc-lilac"
              >
                {SITE.email}
              </a>
            </div>
          </div>
        </div>

        <div className="relative mt-16 flex flex-col items-start justify-between gap-6 border-t border-lc-offwhite/10 pt-8 md:flex-row md:items-end">
          <BrandLogo showMark wordmarkClassName="opacity-90" />
          <BrushStroke
            variant="underline"
            className="absolute right-0 top-4 hidden h-8 w-48 opacity-50 md:block"
          />
          <p className="text-micro text-lc-gray">
            © {new Date().getFullYear()} LA CAJA · ESTUDIO CREATIVO
          </p>
        </div>
      </div>
    </footer>
  );
}
