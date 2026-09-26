import { CustomCursor } from "@/components/ui/CustomCursor";
import { Footer } from "@/components/layout/Footer";
import { Navigation } from "@/components/layout/Navigation";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CustomCursor />
      <Navigation />
      <main className="flex-1 pt-[var(--header-h)]">{children}</main>
      <Footer />
    </>
  );
}
