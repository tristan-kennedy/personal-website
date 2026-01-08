import { getCollection } from "astro:content";
import { toTimestamp } from "../shared";

export async function getProjects() {
  const projects = await getCollection("projects");
  return projects
    .map((project) => ({
      ...project,
      url: `/projects/${project.slug}`,
    }))
    .sort((a, b) => toTimestamp(b.data.date) - toTimestamp(a.data.date));
}
