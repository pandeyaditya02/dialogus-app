// file: dialogus-next/lib/sanity.client.ts

import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION!;

export const client = createClient({
  projectId,
  dataset,
  apiVersion, // https://www.sanity.io/docs/api-versioning
  useCdn: true, // if you're fetching data on behalf of the user, switch to false
});

// Helper to generate image URLs from Sanity image fields
const builder = imageUrlBuilder({
  projectId,
  dataset,
});

export function urlFor(source: unknown) {
  return builder.image(source as any);
}