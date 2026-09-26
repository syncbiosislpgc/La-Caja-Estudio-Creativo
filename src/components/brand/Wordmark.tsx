import { cn } from "@/lib/cn";

type Props = {
  className?: string;
  tone?: "offwhite" | "lilac" | "current";
};

/**
 * Wordmark personalizado LA CAJA.
 * Las A tienen aperturas/cortes deliberados — no es una fuente.
 */
export function Wordmark({ className, tone = "offwhite" }: Props) {
  const fill =
    tone === "lilac"
      ? "#C3A6D9"
      : tone === "current"
        ? "currentColor"
        : "#F4F2EE";

  return (
    <svg
      viewBox="0 0 188 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("overflow-visible", className)}
      role="img"
      aria-label="LA CAJA"
    >
      <g fill={fill}>
        {/* L */}
        <path d="M0 1h5.8v19.4H16.2v5.8H0V1z" />

        {/* A — vértice abierto (dos piernas sin cerrar arriba) */}
        <path d="M25.4 26.2L34.6 1h3.2l1.6 4.4L32.2 26.2h-6.8z" />
        <path d="M42.8 1l9.2 25.2h-6.8L36.6 5.4 38.2 1h4.6z" />
        {/* barra media con corte */}
        <path d="M32.8 15.6h10.4v3.2H35.4v-.2h-2.6v-3z" />

        {/* C */}
        <path d="M65.6 6.8c4-3.8 9.8-5.2 15.6-4.2v5.6c-4-1.2-8.6-.4-11.2 2.4-2.8 3.2-2.8 8.6 0 11.8 2.6 2.8 7.2 3.6 11.2 2.4v5.6c-5.8 1.4-13 .4-17.6-4.6-5.6-5.6-5.6-15.2.2-19z" />

        {/* A — asimétrica: pierna izquierda más gruesa, apertura arriba */}
        <path d="M90.2 26.2L99.2 1h3.6l1.4 4L96.8 26.2h-6.6z" />
        <path d="M108.4 1l9.4 25.2h-6.6L102.4 5 104 1h4.4z" />
        <path d="M97.4 16.2h10.8v2.6H97.4z" />

        {/* J */}
        <path d="M129.6 1h5.8v17.4c0 4.2-2.4 6.8-6.8 6.8-3.2 0-5.8-1.2-7.4-3.2l4.4-4c.8 1.2 1.8 1.6 2.8 1.6 1.6 0 2.6-.8 2.6-2.8V1z" />

        {/* A — apertura inferior (barra interrumpida) */}
        <path d="M143.2 26.2L152.4 1h3.2l1.6 4.4L150 26.2h-6.8z" />
        <path d="M160.6 1l9.2 25.2h-6.8L154.4 5.4 156 1h4.6z" />
        <path d="M150.6 15.6h3.6v3.2h-3.6z" />
        <path d="M157.2 15.6h3.8v3.2h-3.8z" />
      </g>
    </svg>
  );
}
