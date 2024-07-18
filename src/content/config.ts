import { defineCollection, z } from "astro:content";

const blogCollection = defineCollection({
  type: "content",
  schema: ({image}) => z.object({
    title: z.string(),
    date: z.date(),
    description: z.string(),
    cover: image().optional()
  }),
});

export const collections = {
  blog: blogCollection,
};
