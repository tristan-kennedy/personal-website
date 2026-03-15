import { getCollection } from "astro:content";
import { toTimestamp } from "../shared";

export async function getPosts() {
  const postEntries = import.meta.glob("../../content/posts/**/*.mdx");
  if (Object.keys(postEntries).length === 0) {
    return [];
  }

  const posts = await getCollection("posts");
  return posts
    .map((post) => ({
      ...post,
      url: `/posts/${post.id}`,
    }))
    .sort((a, b) => toTimestamp(b.data.date) - toTimestamp(a.data.date));
}
