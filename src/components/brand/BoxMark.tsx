import { cn } from "@/lib/cn";

type Props = {
  className?: string;
  title?: string;
};

/**
 * Símbolo LA CAJA — caja 3D abierta con trazo de pincel.
 * Inline SVG (no depende de /public) para evitar roturas en iOS/Safari.
 */
export function BoxMark({ className, title }: Props) {
  return (
    <svg
      viewBox="0 0 64 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-lc-lilac", className)}
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {/* Base frontal */}
      <path
        d="M8.5 30.5c1.2-9.5 6.8-16.2 18.8-19.2 7.2-1.8 16.4.4 22.6 5.8 4.2 3.6 6.4 8.8 5.6 14.2"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Base inferior */}
      <path
        d="M8.5 30.5c2.4 5.8 12.2 10.8 23.2 11.6 10.2.8 19.6-2.6 22.8-7.8"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Arista central / profundidad */}
      <path
        d="M27.2 11.4v16.8c0 4.2 4.6 7.2 9.8 6.4l11.6-2.4"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Costado izquierdo */}
      <path
        d="M27.2 28.2c-5.4 2.2-13.6 3.8-18.7 2.3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Solapa abierta arriba */}
      <path
        d="M27.2 11.4c2.6-7.2 11.8-10.4 19.6-6.6 4.2 2 6.8 6.8 5.4 11.2"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Gesto de pincel — detalle imperfecto */}
      <path
        d="M14 24.5c2.8-1.6 5.2.8 3.6 2.4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}
