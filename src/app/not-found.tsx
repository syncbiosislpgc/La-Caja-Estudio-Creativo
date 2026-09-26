import Link from "next/link";
import { AnimatedBox } from "@/components/brand/AnimatedBox";
import { CTA } from "@/components/ui/CTA";
import { MICROCOPY } from "@/lib/constants";

export default function NotFound() {
  return (
    <div className="flex min-h-[80dvh] flex-col items-center justify-center px-5 py-20 text-center">
      <AnimatedBox className="mb-10 h-28 w-auto opacity-80" />
      <p className="text-micro text-lc-lilac">404</p>
      <h1 className="display-lg mt-4 whitespace-pre-line text-lc-offwhite">
        {MICROCOPY.notFound}
      </h1>
      <div className="mt-10">
        <CTA href="/" variant="primary" size="lg">
          {MICROCOPY.backHome}
        </CTA>
      </div>
      <p className="mt-8 text-sm text-lc-gray">
        ¿Buscabas el{" "}
        <Link href="/studio" className="text-lc-lilac hover:underline">
          estudio admin
        </Link>
        ?
      </p>
    </div>
  );
}
