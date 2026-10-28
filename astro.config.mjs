// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  compressHTML: true,
  integrations: [react(), mdx()],
  vite: {
    plugins: [tailwindcss()],
  },
});
