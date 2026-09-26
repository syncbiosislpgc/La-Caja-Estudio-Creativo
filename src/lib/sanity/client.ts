import { createClient } from "next-sanity";
import { sanityEnv } from "./env";

export const sanityClient = createClient({
  projectId: sanityEnv.projectId || "placeholder",
  dataset: sanityEnv.dataset,
  apiVersion: sanityEnv.apiVersion,
  useCdn: sanityEnv.useCdn,
  stega: {
    enabled: false,
    studioUrl: "/studio",
  },
});
