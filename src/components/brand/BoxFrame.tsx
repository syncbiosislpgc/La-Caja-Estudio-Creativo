import { cn } from "@/lib/cn";

type BoxFrameProps = {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  /** Muestra el trazo de caja alrededor del contenido */
  stroke?: boolean;
};

/**
 * Contenedor visual “caja”: las cosas entran / salen / conviven dentro.
 */
export function BoxFrame({
  children,
  className,
  contentClassName,
  stroke = true,
}: BoxFrameProps) {
  return (
    <div className={cn("relative", className)}>
      {stroke ? (
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full text-lc-lilac"
          viewBox="0 0 400 300"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d="M28 48 C60 28, 120 36, 180 30 C240 24, 300 40, 360 32 L372 250 C340 268, 280 252, 220 262 C160 272, 90 258, 36 266 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          {/* solapa superior abierta */}
          <path
            d="M180 30 C200 8, 260 4, 310 18 C330 24, 348 40, 352 52"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      ) : null}
      <div className={cn("relative z-10 p-[8%] md:p-10", contentClassName)}>
        {children}
      </div>
    </div>
  );
}
