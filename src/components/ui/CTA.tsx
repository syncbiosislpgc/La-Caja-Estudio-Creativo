import Link from "next/link";
import { cn } from "@/lib/cn";

type CTAVariant = "primary" | "secondary" | "ghost" | "lilac";
type CTASize = "sm" | "md" | "lg";

type CTAProps = {
  href?: string;
  children: React.ReactNode;
  variant?: CTAVariant;
  size?: CTASize;
  className?: string;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
  external?: boolean;
};

const variants: Record<CTAVariant, string> = {
  primary:
    "border border-lc-offwhite/80 text-lc-offwhite btn-brush hover:border-lc-lilac",
  secondary:
    "border border-lc-offwhite/25 text-lc-offwhite btn-brush hover:border-lc-lilac",
  ghost: "text-lc-offwhite underline-offset-4 hover:text-lc-lilac hover:underline",
  lilac:
    "bg-lc-lilac text-lc-black border border-lc-lilac hover:bg-lc-offwhite",
};

const sizes: Record<CTASize, string> = {
  sm: "px-4 py-2 text-micro",
  md: "px-6 py-3 text-micro",
  lg: "px-8 py-4 text-micro",
};

export function CTA({
  href,
  children,
  variant = "primary",
  size = "md",
  className,
  type = "button",
  onClick,
  disabled,
  external,
}: CTAProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 font-medium transition-colors duration-300",
    variant !== "ghost" && "uppercase tracking-[0.18em]",
    variants[variant],
    sizes[size],
    disabled && "pointer-events-none opacity-40",
    className,
  );

  if (href) {
    if (external) {
      return (
        <a
          href={href}
          className={classes}
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
