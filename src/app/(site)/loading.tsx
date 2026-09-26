import { MICROCOPY } from "@/lib/constants";

export default function Loading() {
  return (
    <div className="flex min-h-[50dvh] items-center justify-center px-5">
      <p className="text-micro text-lc-lilac">{MICROCOPY.loading}</p>
    </div>
  );
}
