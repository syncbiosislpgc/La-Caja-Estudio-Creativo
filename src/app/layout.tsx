import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SITE } from "@/lib/constants";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} | ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description:
    "Estudio creativo 360º en Las Palmas de Gran Canaria. Diseño, contenido, producción, marcas, espacios y proyectos especiales. Todo cabe en La Caja.",
  keywords: [
    "estudio creativo",
    "Las Palmas de Gran Canaria",
    "Gran Canaria",
    "Canarias",
    "branding",
    "diseño",
    "producción gráfica",
    "LA CAJA",
  ],
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: SITE.name,
    title: `${SITE.name} | ${SITE.tagline}`,
    description: SITE.claim,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-lc-black font-sans text-lc-offwhite">
        {children}
      </body>
    </html>
  );
}
