import { getCollection } from "astro:content";

export type Entry = Awaited<ReturnType<typeof getEntries>>[number];

export async function getEntries() {
  const entries = await getCollection("entries");
  return entries
    .map((entry) => ({ ...entry, url: `/index/${entry.id}` }))
    .sort(
      (a, b) =>
        Date.parse(b.data.date) - Date.parse(a.data.date) ||
        a.id.localeCompare(b.id),
    );
}

export function formatEntryDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    ...(value.length > 7 ? { day: "numeric" as const } : {}),
    timeZone: "UTC",
  }).format(new Date(value));
}
