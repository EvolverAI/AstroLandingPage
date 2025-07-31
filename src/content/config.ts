import { defineCollection, z } from 'astro:content';

// Content item schema for reusable content blocks
const contentItemSchema = z.object({
    title: z.string(),
    description: z.string(),
    icon: z.string().optional(),
    image: z.string().optional(),
    link: z.string().optional(),
    features: z.array(z.string()).optional(),
    metadata: z.record(z.any()).optional()
});

// Content schema with multi-language support
const contentSchema = z.object({
    companyName: z.string().optional(),
    companyNameHighlight: z.string().optional(),
    title: z.string().optional(),
    description: z.string(),
    subtitle: z.string().optional(),
    features: z.union([
        z.array(z.union([
            z.string(),
            z.object({
                text: z.string(),
                icon: z.string().optional(),
                iconColor: z.string().optional()
            })
        ])),
        z.array(z.object({
            title: z.string(),
            description: z.string(),
            icon: z.string().optional(),
            duration: z.string().optional(),
            level: z.string().optional(),
            linkText: z.string().optional(),
            linkUrl: z.string().optional()
        }))
    ]).optional(),
    courses: z.array(z.object({
        title: z.string(),
        description: z.string(),
        duration: z.string().optional(),
        level: z.string().optional(),
        linkText: z.string().optional(),
        linkUrl: z.string().optional()
    })).optional(),
    items: z.array(contentItemSchema).optional(),
    buttonText: z.string().optional(),
    cta: z.object({
        text: z.string(),
        link: z.string(),
        style: z.enum(['primary', 'secondary', 'outline']).optional()
    }).optional()
});

// Styling schema with advanced options
const stylingSchema = z.object({
    backgroundOpacity: z.string().optional(),
    contentBackgroundOpacity: z.string().optional(),
    maxWidth: z.string().optional(),
    textAlign: z.string().optional(),
    justifyContent: z.string().optional(),
    layout: z.enum(['left', 'right', 'center', 'full', 'split']).optional(),
    theme: z.enum(['dark', 'light', 'gradient', 'custom']).optional(),
    animation: z.enum(['fade', 'slide', 'zoom', 'none']).optional(),
    spacing: z.object({
        padding: z.string().optional(),
        margin: z.string().optional()
    }).optional(),
    customClasses: z.string().optional()
});

// Metadata schema with advanced tracking
const metadataSchema = z.object({
    order: z.number().optional(),
    visible: z.boolean().default(true),
    lastUpdated: z.date().optional(),
    author: z.string().optional(),
    version: z.string().optional(),
    featured: z.boolean().optional(),
    environment: z.array(z.enum(['development', 'staging', 'production'])).optional(),
    analytics: z.object({
        trackingId: z.string().optional(),
        events: z.array(z.string()).optional()
    }).optional()
});

// Main section schema
const sectionSchema = z.object({
    id: z.string(),
    title: z.string().optional(),
    backgroundImage: z.string().optional(),
    minHeight: z.string().optional(),
    content: contentSchema,
    styling: stylingSchema.optional(),
    metadata: metadataSchema.optional(),
    // Multi-language support
    languages: z.record(z.string(), contentSchema).optional(),
    // Environment-specific content
    environments: z.record(z.string(), z.object({
        content: contentSchema.optional(),
        styling: stylingSchema.optional(),
        metadata: metadataSchema.optional()
    })).optional()
});

// Define collections
const pagesCollection = defineCollection({
    type: 'data',
    schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        language: z.string().default('en'),
        sections: z.record(z.string(), sectionSchema),
        metadata: z.object({
            lastUpdated: z.date().optional(),
            author: z.string().optional(),
            version: z.string().optional(),
            environment: z.enum(['development', 'staging', 'production']).optional()
        }).optional()
    })
});

const sectionsCollection = defineCollection({
    type: 'data',
    schema: sectionSchema
});

// Multi-language content collection
const languagesCollection = defineCollection({
    type: 'data',
    schema: z.object({
        code: z.string(), // e.g., 'en', 'it', 'de'
        name: z.string(), // e.g., 'English', 'Italiano', 'Deutsch'
        flag: z.string().optional(), // flag emoji or icon
        sections: z.record(z.string(), z.any()) // Allow any structure for maximum flexibility
    })
});

// Templates collection for reusable layouts
const templatesCollection = defineCollection({
    type: 'data',
    schema: z.object({
        name: z.string(),
        description: z.string(),
        sections: z.array(z.string()), // section IDs
        styling: stylingSchema.optional(),
        metadata: metadataSchema.optional()
    })
});

// Export collections
export const collections = {
    'pages': pagesCollection,
    'sections': sectionsCollection,
    'languages': languagesCollection,
    'templates': templatesCollection
};
