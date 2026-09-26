import Link from "next/link";
import { cn } from "@/lib/cn";

type BrandLogoProps = {
  href?: string | null;
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
  showWordmark?: boolean;
  showMark?: boolean;
  priority?: boolean;
};

/**
 * Siempre usa assets gráficos originales (SVG/PNG).
 * next/image no optimiza SVG de forma fiable → <img> nativo.
 * Sustituir public/brand/wordmark.svg y box-symbol.svg por los masters oficiales.
 */
export function BrandLogo({
  href = "/",
  className,
  markClassName,
  wordmarkClassName,
  showWordmark = true,
  showMark = true,
  priority = false,
}: BrandLogoProps) {
  const content = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {showMark ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/brand/box-symbol.svg"
          alt=""
          width={44}
          height={36}
          decoding="async"
          {...(priority ? { fetchPriority: "high" as const } : {})}
          className={cn("h-8 w-auto shrink-0 md:h-9", markClassName)}
          aria-hidden
        />
      ) : null}
      {showWordmark ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/brand/wordmark.svg"
          alt="LA CAJA"
          width={160}
          height={28}
          decoding="async"
          {...(priority ? { fetchPriority: "high" as const } : {})}
          className={cn("h-5 w-auto md:h-6", wordmarkClassName)}
        />
      ) : null}
    </span>
  );

  if (!href) return content;

  return (
    <Link
      href={href}
      className="inline-flex focus-visible:outline-offset-4"
      aria-label="LA CAJA — inicio"
    >
      {content}
    </Link>
  );
}
