import { structureTool } from "sanity/structure";
import type { StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("LA CAJA")
    .items([
      S.listItem()
        .title("Ajustes del sitio")
        .id("siteSettings")
        .child(
          S.document().schemaType("siteSettings").documentId("siteSettings"),
        ),
      S.divider(),
      S.documentTypeListItem("project").title("Proyectos"),
      S.documentTypeListItem("collaboration").title("Colaboraciones"),
      S.documentTypeListItem("productEditorial").title("Shop editorial"),
      S.documentTypeListItem("page").title("Páginas"),
    ]);

export const studioPlugins = [structureTool({ structure })];
