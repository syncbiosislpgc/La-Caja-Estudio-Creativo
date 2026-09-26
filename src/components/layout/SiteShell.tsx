import { CustomCursor } from "@/components/ui/CustomCursor";
import { Footer } from "@/components/layout/Footer";
import { Navigation } from "@/components/layout/Navigation";
import { CartProvider } from "@/context/CartContext";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <CustomCursor />
      <Navigation />
      <main className="flex-1 pt-[var(--header-h)]">{children}</main>
      <Footer />
    </CartProvider>
  );
}
