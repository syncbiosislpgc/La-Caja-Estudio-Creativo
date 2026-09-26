"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/brand/Wordmark";
import { cn } from "@/lib/cn";

const SESSION_KEY = "lc-welcome-seen";

/**
 * Intro de bienvenida: dibuja la caja con trazos y revela la marca.
 * Solo en home, una vez por sesión. Se puede saltar. Respeta reduced-motion.
 */
export function WelcomeIntro() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [exiting, setExiting] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const claimRef = useRef<HTMLParagraphElement>(null);
  const finished = useRef(false);

  const dismiss = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* ignore */
    }
    setExiting(true);
    window.setTimeout(() => setActive(false), 550);
  }, []);

  useEffect(() => {
    if (pathname !== "/") return;
    try {
      if (sessionStorage.getItem(SESSION_KEY) === "1") return;
    } catch {
      /* show anyway */
    }
    setActive(true);
  }, [pathname]);

  useEffect(() => {
    if (!active) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.body.style.overflow = "hidden";

    if (reduced) {
      const t = window.setTimeout(dismiss, 600);
      return () => {
        window.clearTimeout(t);
        document.body.style.overflow = "";
      };
    }

    let cancelled = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let tl: any;

    void (async () => {
      const { gsap } = await import("gsap");
      if (cancelled || !svgRef.current) return;

      const paths = svgRef.current.querySelectorAll("path");
      gsap.set(paths, {
        strokeDasharray: (_i: number, el: Element) =>
          (el as SVGPathElement).getTotalLength(),
        strokeDashoffset: (_i: number, el: Element) =>
          (el as SVGPathElement).getTotalLength(),
      });
      gsap.set([brandRef.current, claimRef.current], { opacity: 0, y: 16 });

      tl = gsap
        .timeline({
          onComplete: () => {
            window.setTimeout(dismiss, 700);
          },
        })
        .to(paths, {
          strokeDashoffset: 0,
          duration: 1.05,
          ease: "power2.out",
          stagger: 0.1,
        })
        .to(
          brandRef.current,
          { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" },
          "-=0.25",
        )
        .to(
          claimRef.current,
          { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
          "-=0.2",
        );
    })();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        dismiss();
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      cancelled = true;
      tl?.kill();
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active, dismiss]);

  if (!active) return null;

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-label="Bienvenida a LA CAJA"
      aria-modal="true"
      className={cn(
        "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-lc-black px-6 transition-opacity duration-500",
        exiting ? "pointer-events-none opacity-0" : "opacity-100",
      )}
      onClick={dismiss}
    >
      {/* Trazos decorativos de fondo */}
      <svg
        className="pointer-events-none absolute left-[-10%] top-[15%] h-40 w-64 text-lc-lilac/25 md:h-56 md:w-80"
        viewBox="0 0 200 80"
        fill="none"
        aria-hidden
      >
        <path
          d="M8 40 C40 10, 80 70, 120 30 C150 8, 170 50, 192 36"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      <svg
        className="pointer-events-none absolute bottom-[18%] right-[-5%] h-48 w-40 text-lc-lilac/20 md:h-64 md:w-52"
        viewBox="0 0 160 160"
        fill="none"
        aria-hidden
      >
        <path
          d="M12 140 C40 90, 80 60, 148 12"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>

      <svg
        ref={svgRef}
        viewBox="0 0 120 100"
        fill="none"
        aria-hidden
        className="h-28 w-auto text-lc-lilac md:h-36"
      >
        <path
          d="M18 62 C20 40, 28 28, 58 22 C72 19, 88 24, 98 38 C104 48, 102 58, 96 68"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M18 62 C22 70, 40 78, 60 80 C78 82, 96 76, 96 68"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M58 22 L58 52 C58 60, 68 66, 78 64 L96 58"
          stroke="currentColor"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M58 52 C48 56, 30 60, 18 62"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <path
          d="M58 22 C62 10, 78 6, 92 14 C98 18, 100 28, 96 34"
          stroke="currentColor"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <div ref={brandRef} className="mt-8 flex flex-col items-center gap-3">
        <Wordmark className="h-7 w-auto md:h-9" />
        <p className="text-micro text-lc-gray">ESTUDIO CREATIVO</p>
      </div>

      <p
        ref={claimRef}
        className="mt-6 text-center text-sm tracking-[0.2em] text-lc-lilac md:text-base"
      >
        TODO EL ARTE CABE AQUÍ.
      </p>

      <button
        type="button"
        className="absolute bottom-8 text-micro text-lc-gray transition-colors hover:text-lc-lilac"
        onClick={(e) => {
          e.stopPropagation();
          dismiss();
        }}
      >
        SALTAR INTRO
      </button>
    </div>
  );
}
