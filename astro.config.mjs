import { defineConfig } from "astro/config";

import tailwind from "@astrojs/tailwind";
import remarkToc from "remark-toc";

// https://astro.build/config
export default defineConfig({
  site: "https://aiko.wtf",
  integrations: [tailwind()],
  redirects: {
    "/": "/blog",
    "/blog": "/blog/gradle-wrapper", // Until multiple posts have been written
  },
  markdown: {
    remarkPlugins: [remarkToc],
  },
});
