import { cn } from "@/lib/cn";

type StrokeVariant = "underline" | "frame" | "slash" | "connect";

type BrushStrokeProps = {
  variant?: StrokeVariant;
  className?: string;
  color?: string;
  animated?: boolean;
};

const PATHS: Record<StrokeVariant, string> = {
  underline:
    "M4 28 C28 8, 52 34, 78 16 C98 4, 118 30, 142 18 C162 8, 178 26, 196 14",
  frame:
    "M18 22 C40 18, 70 28, 90 20 C110 12, 130 30, 142 24 L138 138 C120 144, 90 132, 70 140 C50 148, 28 136, 20 142 Z",
  slash: "M12 140 C40 90, 80 60, 148 12",
  connect: "M8 40 C40 10, 80 70, 120 30 C150 8, 170 50, 192 36",
};

const VIEWS: Record<StrokeVariant, string> = {
  underline: "0 0 200 40",
  frame: "0 0 160 160",
  slash: "0 0 160 160",
  connect: "0 0 200 80",
};

/**
 * Trazo funcional de identidad — subrayar, encuadrar, tachar, conectar.
 * No decoración aleatoria: cada uso debe tener intención.
 */
export function BrushStroke({
  variant = "underline",
  className,
  color = "currentColor",
  animated = false,
}: BrushStrokeProps) {
  return (
    <svg
      viewBox={VIEWS[variant]}
      fill="none"
      aria-hidden
      className={cn(
        "pointer-events-none text-lc-lilac",
        animated && "brush-stroke-draw",
        className,
      )}
    >
      <path
        d={PATHS[variant]}
        stroke={color}
        strokeWidth={variant === "frame" ? 5 : 4}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        style={
          animated
            ? {
                strokeDasharray: 1,
                strokeDashoffset: 1,
              }
            : undefined
        }
      />
    </svg>
  );
}
