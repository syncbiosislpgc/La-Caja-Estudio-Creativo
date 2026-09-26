import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/estudio",
    "/servicios",
    "/proyectos",
    "/shop",
    "/personaliza",
    "/colaboraciones",
    "/contacto",
    "/legal",
    "/privacidad",
    "/cookies",
  ];

  return routes.map((route) => ({
    url: `${SITE.url}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.7,
  }));
}
