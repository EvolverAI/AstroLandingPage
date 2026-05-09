// Content collections config
import { defineCollection, z } from 'astro:content';

export const collections = {
    blog: defineCollection({
        type: 'content',
        schema: z.object({
            title: z.string(),
            date: z.coerce.date(),
            author: z.string().optional().default('EvolverAI Team'),
            excerpt: z.string().optional(),
            coverImage: z.string().optional(),
            tags: z.array(z.string()).optional().default([]),
            featured: z.boolean().optional().default(false),
            lang: z.string().optional().default('en'),
        }),
    }),
};
