import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    description: z.string().optional(),
    categories: z.array(z.string()).optional(),
  }),
});

const books = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    author: z.string(),
    cover: z.string(),
    date: z.date(),
    status: z.enum(['finished', 'reading', 'todo']),
    wereadBookId: z.string().optional(),
    source: z.enum(['weread']).optional(),
  }),
});

const investing = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    description: z.string().optional(),
    categories: z.array(z.string()).optional(),
  }),
});

export const collections = { posts, books, investing };
