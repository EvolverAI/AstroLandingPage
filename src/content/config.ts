import { defineCollection, z } from 'astro:content';

// Multi-language content collection
const languagesCollection = defineCollection({
    type: 'data',
    schema: z.object({
        code: z.string(), // e.g., 'en', 'it', 'de'
        name: z.string(), // e.g., 'English', 'Italiano', 'Deutsch'
        flag: z.string().optional(), // flag emoji or icon
        page_sections: z.array(z.object({
            type: z.enum(['content_header', 'cards', 'product', 'hero']),
            section_id: z.string(),
            order: z.number(),
            background_image: z.string().optional(),
            min_height: z.string().optional(),
            image: z.string().optional(),
        })).optional(), // Page layout configuration
        defaults: z.any().optional(), // Allow any structure for defaults
        sections: z.record(z.string(), z.any()) // Allow any structure for maximum flexibility
    }).passthrough() // Allow additional properties to pass through without validation
});

// Export collections
export const collections = {
    'languages': languagesCollection
};
