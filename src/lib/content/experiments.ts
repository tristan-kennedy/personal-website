import { getCollection } from "astro:content";
import { toTimestamp } from "../shared";

export async function getExperiments() {
  const experimentEntries = import.meta.glob(
    "../../content/experiments/**/*.mdx",
  );
  if (Object.keys(experimentEntries).length === 0) {
    return [];
  }

  const experiments = await getCollection("experiments");
  return experiments
    .map((experiment) => ({
      ...experiment,
      url: `/experiments/${experiment.id}`,
    }))
    .sort((a, b) => toTimestamp(b.data.date) - toTimestamp(a.data.date));
}
