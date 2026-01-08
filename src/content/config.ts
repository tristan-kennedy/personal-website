import { defineCollection, z } from "astro:content";

const projects = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.string(),
      description: z.string(),
      tech: z.array(z.string()),
      image: image(),
    }),
});

const posts = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.string(),
      description: z.string(),
      length: z.string(),
      image: image(),
    }),
});

const experiments = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.string(),
      description: z.string(),
      tech: z.array(z.string()),
      image: image(),
    }),
});

export const collections = { projects, posts, experiments };
