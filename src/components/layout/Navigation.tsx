"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { BrushStroke } from "@/components/brand/BrushStroke";
import { CTA } from "@/components/ui/CTA";
import { MICROCOPY, NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/cn";

function CartIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M4 6h2.2l1.1 9.2a1.5 1.5 0 0 0 1.5 1.3h8.6a1.5 1.5 0 0 0 1.5-1.2L20 8H7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="20" r="1.2" fill="currentColor" />
      <circle cx="17" cy="20" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuId = useId();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background,border-color] duration-300",
          scrolled || open
            ? "border-b border-lc-offwhite/10 bg-lc-black/90 backdrop-blur-md"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <div className="mx-auto flex h-[var(--header-h)] max-w-[1600px] items-center justify-between gap-6 px-5 md:px-8 lg:px-12">
          <BrandLogo priority />

          <nav
            className="hidden items-center gap-8 lg:flex"
            aria-label="Principal"
          >
            {NAV_LINKS.map((link) => {
              const active =
                pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "group relative text-micro text-lc-gray transition-colors hover:text-lc-offwhite",
                    active && "text-lc-offwhite",
                  )}
                >
                  {link.label}
                  <span
                    className={cn(
                      "absolute -bottom-2 left-0 h-px w-full origin-left scale-x-0 bg-lc-lilac transition-transform duration-300 group-hover:scale-x-100",
                      active && "scale-x-100",
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 md:gap-4">
            <CTA
              href="/contacto"
              variant="primary"
              size="sm"
              className="hidden sm:inline-flex"
            >
              {MICROCOPY.openBox}
            </CTA>

            <Link
              href="/carrito"
              className="relative inline-flex h-10 w-10 items-center justify-center text-lc-offwhite transition-colors hover:text-lc-lilac"
              aria-label="Carrito"
            >
              <CartIcon className="h-5 w-5" />
            </Link>

            <button
              type="button"
              className="relative z-[60] inline-flex h-11 w-11 flex-col items-center justify-center gap-[6px] lg:hidden"
              aria-expanded={open}
              aria-controls={menuId}
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              onClick={() => setOpen((v) => !v)}
            >
              <span
                className={cn(
                  "block h-[1.5px] w-6 bg-lc-offwhite transition-transform duration-300",
                  open && "translate-y-[7.5px] rotate-45",
                )}
              />
              <span
                className={cn(
                  "block h-[1.5px] w-6 bg-lc-offwhite transition-opacity duration-300",
                  open && "opacity-0",
                )}
              />
              <span
                className={cn(
                  "block h-[1.5px] w-6 bg-lc-offwhite transition-transform duration-300",
                  open && "-translate-y-[7.5px] -rotate-45",
                )}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile fullscreen menu */}
      <div
        id={menuId}
        className={cn(
          "fixed inset-0 z-40 bg-lc-black transition-[opacity,visibility] duration-300 lg:hidden",
          open
            ? "visible opacity-100"
            : "invisible pointer-events-none opacity-0",
        )}
        aria-hidden={!open}
      >
        <div className="relative flex h-full flex-col px-6 pb-10 pt-[calc(var(--header-h)+1.5rem)]">
          {open ? (
            <>
              <BrushStroke
                variant="slash"
                className="pointer-events-none absolute right-0 top-24 h-48 w-40 opacity-40"
                animated
              />
              <BrushStroke
                variant="connect"
                className="pointer-events-none absolute bottom-32 left-0 h-24 w-56 opacity-30"
                animated
              />
            </>
          ) : null}

          <nav
            className="relative z-10 flex flex-1 flex-col justify-center gap-6"
            aria-label="Móvil"
          >
            {NAV_LINKS.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                className="display-md text-lc-offwhite transition-colors hover:text-lc-lilac"
                style={{
                  transitionDelay: open ? `${i * 40}ms` : "0ms",
                  opacity: open ? 1 : 0,
                  transform: open ? "translateY(0)" : "translateY(12px)",
                  transition: "opacity 0.35s ease, transform 0.35s ease, color 0.2s",
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="relative z-10 mt-auto space-y-4">
            <CTA href="/contacto" variant="lilac" size="lg" className="w-full">
              {MICROCOPY.openBox}
            </CTA>
            <p className="text-micro text-lc-gray">ESTUDIO CREATIVO · CANARIAS</p>
          </div>
        </div>
      </div>
    </>
  );
}
