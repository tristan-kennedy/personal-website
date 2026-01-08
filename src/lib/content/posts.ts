import { getCollection } from "astro:content";
import { toTimestamp } from "../shared";

export async function getPosts() {
  const posts = await getCollection("posts");
  return posts
    .map((post) => ({
      ...post,
      url: `/posts/${post.slug}`,
    }))
    .sort((a, b) => toTimestamp(b.data.date) - toTimestamp(a.data.date));
}
