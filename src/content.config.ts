import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const journal = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/journal' }),
  schema: z.object({
    title: z.string(),
    eyebrow: z.string(),
    date: z.coerce.date(),
    ogImage: z.string(),
    excerpt: z.string(),
    related: z.array(z.string()).default([]),
    length_words: z.number().optional(),
  }),
});

export const collections = { journal };
