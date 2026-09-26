import { BoxFrame } from "@/components/brand/BoxFrame";
import { CTA } from "@/components/ui/CTA";
import { MICROCOPY } from "@/lib/constants";

type PhasePlaceholderProps = {
  eyebrow: string;
  title: string;
  body: string;
  phase: string;
  ctaHref?: string;
  ctaLabel?: string;
};

export function PhasePlaceholder({
  eyebrow,
  title,
  body,
  phase,
  ctaHref = "/contacto",
  ctaLabel = MICROCOPY.tellIdea,
}: PhasePlaceholderProps) {
  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-[1600px] flex-col justify-center px-5 py-16 md:px-8 lg:px-12">
      <p className="text-micro text-lc-lilac">{eyebrow}</p>
      <h1 className="display-lg mt-4 max-w-4xl whitespace-pre-line text-lc-offwhite">
        {title}
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-lc-gray">{body}</p>

      <div className="mt-12 max-w-xl">
        <BoxFrame contentClassName="p-6 md:p-8">
          <p className="text-micro text-lc-gray">PRÓXIMAMENTE</p>
          <p className="mt-3 text-sm leading-relaxed text-lc-offwhite/80">{phase}</p>
        </BoxFrame>
      </div>

      <div className="mt-10">
        <CTA href={ctaHref} variant="primary" size="lg">
          {ctaLabel}
        </CTA>
      </div>
    </div>
  );
}
