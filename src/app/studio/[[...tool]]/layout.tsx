import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "LA CAJA · CMS",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0B0B0B",
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#F4F2EE]">{children}</div>
  );
}
