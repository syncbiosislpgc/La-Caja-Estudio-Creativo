import { cn } from "@/lib/cn";

type MarqueeProps = {
  items: readonly string[];
  className?: string;
  separator?: string;
};

export function Marquee({
  items,
  className,
  separator = "·",
}: MarqueeProps) {
  const row = items.join(`  ${separator}  `);

  return (
    <div
      className={cn(
        "relative overflow-hidden border-y border-lc-offwhite/10 py-4",
        className,
      )}
      aria-hidden
    >
      <div className="animate-lc-marquee flex w-max gap-0 whitespace-nowrap text-micro text-lc-gray">
        <span className="px-6">{row}</span>
        <span className="px-6">{row}</span>
        <span className="px-6">{row}</span>
        <span className="px-6">{row}</span>
      </div>
    </div>
  );
}
