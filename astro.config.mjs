// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";
import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  // Preserve the HTML whitespace behavior used before Astro 7.
  compressHTML: true,
  integrations: [react(), mdx()],

  vite: {
    plugins: [tailwindcss(), svgr()],
  },
});
