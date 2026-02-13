import { getCollection } from "astro:content";

export async function GET({ params, request }) {
  return new Response(JSON.stringify(await getCollection("happenings")));
}
