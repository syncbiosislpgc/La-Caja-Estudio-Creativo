import Link from "next/link";
import { BoxMark } from "@/components/brand/BoxMark";
import { Wordmark } from "@/components/brand/Wordmark";
import { cn } from "@/lib/cn";

type BrandLogoProps = {
  href?: string | null;
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
  showWordmark?: boolean;
  showMark?: boolean;
  /** @deprecated ya no hace falta; se mantiene por compat */
  priority?: boolean;
};

/**
 * Logo de marca: símbolo (caja pincel) + wordmark gráfico.
 * Todo inline SVG — no se rompe en iOS/Safari ni en deploy.
 */
export function BrandLogo({
  href = "/",
  className,
  markClassName,
  wordmarkClassName,
  showWordmark = true,
  showMark = true,
}: BrandLogoProps) {
  const content = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {showMark ? (
        <BoxMark className={cn("h-8 w-auto shrink-0 md:h-9", markClassName)} />
      ) : null}
      {showWordmark ? (
        <Wordmark
          className={cn("h-[1.05rem] w-auto md:h-5", wordmarkClassName)}
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
