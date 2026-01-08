import { getCollection } from "astro:content";
import { toTimestamp } from "../shared";

export async function getExperiments() {
  const experiments = await getCollection("experiments");
  return experiments
    .map((experiment) => ({
      ...experiment,
      url: `/experiments/${experiment.slug}`,
    }))
    .sort((a, b) => toTimestamp(b.data.date) - toTimestamp(a.data.date));
}
