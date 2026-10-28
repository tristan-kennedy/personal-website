import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const entries = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/catalog" }),
  schema: z.object({
    title: z.string(),
    date: z
      .string()
      .regex(/^\d{4}-(0[1-9]|1[0-2])(-\d{2})?$/)
      .refine(
        (value) => !Number.isNaN(Date.parse(value)),
        "Use YYYY-MM or YYYY-MM-DD",
      ),
    keywords: z.array(z.string()).default([]),
    link: z.url().optional(),
    readingTime: z.string().optional(),
    featured: z.number().int().positive().optional(),
  }),
});

export const collections = { entries };
