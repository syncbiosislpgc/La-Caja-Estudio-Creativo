"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

type AnimatedBoxProps = {
  className?: string;
  /** Duración del dibujo en segundos */
  duration?: number;
  onComplete?: () => void;
  autoPlay?: boolean;
};

/**
 * Dibuja el símbolo de La Caja con trazos. Breve; no bloquea la UX.
 * Respeta prefers-reduced-motion.
 */
export function AnimatedBox({
  className,
  duration = 1.1,
  onComplete,
  autoPlay = true,
}: AnimatedBoxProps) {
  const rootRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!autoPlay) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const paths = rootRef.current?.querySelectorAll("path");
    if (!paths?.length) return;

    if (reduced) {
      paths.forEach((p) => {
        p.style.strokeDasharray = "none";
        p.style.strokeDashoffset = "0";
      });
      onComplete?.();
      return;
    }

    let cancelled = false;
    let gsapCleanup: (() => void) | undefined;

    void (async () => {
      const { gsap } = await import("gsap");
      if (cancelled) return;

      gsap.set(paths, {
        strokeDasharray: (_i, el) => {
          const len = (el as SVGPathElement).getTotalLength();
          return len;
        },
        strokeDashoffset: (_i, el) => (el as SVGPathElement).getTotalLength(),
      });

      const tl = gsap.to(paths, {
        strokeDashoffset: 0,
        duration,
        ease: "power2.out",
        stagger: 0.12,
        onComplete: () => onComplete?.(),
      });

      gsapCleanup = () => {
        tl.kill();
      };
    })();

    return () => {
      cancelled = true;
      gsapCleanup?.();
    };
  }, [autoPlay, duration, onComplete]);

  return (
    <svg
      ref={rootRef}
      viewBox="0 0 120 100"
      fill="none"
      aria-hidden
      className={cn("text-lc-lilac", className)}
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
  );
}
