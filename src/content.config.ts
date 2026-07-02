import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      slug: z.string(),
      oneLiner: z.string(),
      year: z.number().int(),
      role: z.string(),
      stack: z.array(z.string()),
      url: z.url(),
      cover: image(),
      featured: z.boolean().default(false),
      order: z.number(),
      testimonial: z
        .object({
          quote: z.string(),
          name: z.string(),
          business: z.string(),
        })
        .optional(),
      metric: z
        .object({
          value: z.string(),
          label: z.string(),
        })
        .optional(),
      lang: z.enum(['el', 'en']),
    }),
});

export const collections = { projects };
