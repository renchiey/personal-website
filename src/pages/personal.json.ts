import { getCollection } from "astro:content";

export async function GET() {
  const happenings = await getCollection("happenings");
  const softwareTools = await getCollection("softwareTools");
  const hardwareTools = await getCollection("hardwareTools");

  return new Response(
    JSON.stringify({
      happenings,
      softwareTools,
      hardwareTools,
    }),
  );
}
