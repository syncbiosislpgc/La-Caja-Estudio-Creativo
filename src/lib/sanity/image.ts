import createImageUrlBuilder from "@sanity/image-url";
import { sanityEnv } from "./env";

const builder = createImageUrlBuilder({
  projectId: sanityEnv.projectId || "placeholder",
  dataset: sanityEnv.dataset,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function urlForImage(source: any) {
  return builder.image(source);
}
