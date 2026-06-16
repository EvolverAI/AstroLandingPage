// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for all site content.
//
// This Zod schema replaces the former three-file model (layout + master +
// translations). Every page is now ONE entry per locale under
// `src/content/pages/<locale>/<page>.yaml`, whose `sections` array carries both
// the copy and the visual config that previously had to be merged at runtime.
//
// The same field shape drives: (1) build-time validation (astro check / build),
// (2) the typed render switch in DynamicSection.astro, and (3) the Keystatic
// editing UI (keystatic.config.ts mirrors this schema).
// ─────────────────────────────────────────────────────────────────────────────
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// ── Shared leaf schemas ──────────────────────────────────────────────────────

const badge = z.object({
  text: z.string(),
  color: z.string(),
  tooltip: z.string().optional(),
});

// Card icon is intentionally polymorphic: a material-icon name, a single icon
// object, or a list of icon objects.
const iconObject = z.object({
  type: z.string().optional(),
  image: z.string().optional(),
  color: z.string().optional(),
  alignment: z.string().optional(),
});
const cardIcon = z.union([z.string(), iconObject, z.array(iconObject)]);

// A card feature is either a plain string or a rich feature object.
const cardFeature = z.union([
  z.string(),
  z.object({
    text: z.string().optional(),
    title: z.string().optional(),
    icon: z.string().optional(),
    bullet: z.string().optional(),
    // Kept loose (not an enum) so the Keystatic editor can round-trip freely.
    bulletType: z.string().optional(),
    bulletColor: z.string().optional(),
    badges: z.array(badge).optional(),
  }),
]);

// `note` is a union (plain string vs rich object). Keystatic stores it as a
// conditional ({ discriminant, value }); flatten that back to the value the
// card components expect. Hand-authored string/object notes pass through.
const note = z.preprocess((raw) => {
  if (raw && typeof raw === 'object' && 'discriminant' in (raw as any)) {
    const r = raw as { discriminant: string; value?: unknown };
    return r.discriminant === 'none' ? undefined : r.value;
  }
  return raw;
}, z
  .union([z.string(), z.object({ title: z.string(), content: z.string(), signature: z.string().optional() })])
  .optional());

const card = z.object({
  title: z.string(),
  description: z.string().optional().default(''),
  subtitle: z.string().optional(),
  badges: z.array(badge).optional(),
  icon: cardIcon.optional(),
  features: z.array(cardFeature).optional(),
  subsections: z
    .array(
      z.object({
        title: z.string().optional(),
        icon: z.string().optional(),
        description: z.string().optional(),
        features: z.array(cardFeature).optional(),
      })
    )
    .optional(),
  subsectionColumns: z.number().optional(),
  subsectionStyle: z.string().optional(),
  callout: z
    .object({ icon: z.string().optional(), title: z.string().optional(), text: z.string() })
    .optional(),
  note: note,
  linkText: z.string().optional(),
  linkUrl: z.string().optional(),
  buttonText: z.string().optional(),
  buttonUrl: z.string().optional(),
  buttonColor: z.string().optional(),
  theme: z.string().optional(),
  iconColor: z.string().optional(),
  customClasses: z.string().optional(),
  centerContent: z.boolean().optional(),
  variant: z.enum(['default', 'glass', 'bordered', 'flat', 'feature']).optional(),
});

const responsiveColumns = z.object({
  mobile: z.union([z.string(), z.number()]).optional(),
  tablet: z.union([z.string(), z.number()]).optional(),
  desktop: z.union([z.string(), z.number()]).optional(),
});

export type SectionCard = z.infer<typeof card>;
export type ResponsiveColumns = z.infer<typeof responsiveColumns>;

// ── Per-section schemas (discriminated on `type`) ────────────────────────────
// Fields common to every section.
const base = { id: z.string(), visible: z.boolean().optional().default(true) };

const hero = z.object({
  type: z.literal('hero'),
  ...base,
  eyebrow: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  companyName: z.string().optional(),
  companyNameHighlight: z.string().optional(),
  ctaText: z.string().optional(),
  ctaUrl: z.string().optional(),
  secondaryCtaText: z.string().optional(),
  secondaryCtaUrl: z.string().optional(),
  heroImage: z.string().optional(),
  videoSrc: z.string().optional(),
  minHeight: z.string().optional(),
  variant: z.enum(['default', 'gradient', 'video', 'split', 'particles']).optional(),
});

const contentHeader = z.object({
  type: z.literal('content_header'),
  ...base,
  title: z.string().optional(),
  description: z.string().optional(),
  companyName: z.string().optional(),
  companyNameHighlight: z.string().optional(),
  buttonText: z.string().optional(),
  backgroundImage: z.string().optional(),
  minHeight: z.string().optional(),
  overlayOpacity: z.string().optional(),
  logo: z.string().optional(),
});

const cards = z.object({
  type: z.literal('cards'),
  ...base,
  title: z.string().optional(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  cards: z.array(card).default([]),
  buttonText: z.string().optional(),
  buttonUrl: z.string().optional(),
  buttonColor: z.string().optional(),
  responsiveColumns: responsiveColumns.optional(),
  alignment: z.string().optional(),
  background: z.string().optional(),
  cardVariant: z.enum(['default', 'glass', 'bordered', 'flat', 'feature']).optional(),
});

const productFeature = z.union([
  z.string(),
  z.object({ text: z.string(), icon: z.string().optional(), iconColor: z.string().optional() }),
]);

const product = z.object({
  type: z.literal('product'),
  ...base,
  subtitle: z.string().optional(),
  description: z.string().optional(),
  features: z.array(productFeature).optional(),
  buttonText: z.string().optional(),
  buttonUrl: z.string().optional(),
  buttonColor: z.string().optional(),
  image: z.string().optional(),
  imageAlt: z.string().optional(),
  imagePosition: z.string().optional(),
  useIconInstead: z.boolean().optional(),
  iconName: z.string().optional(),
  iconGradient: z.string().optional(),
  customClasses: z.string().optional(),
});

const divider = z.object({
  type: z.literal('divider'),
  ...base,
  height: z.string().optional(),
  backgroundColor: z.string().optional(),
  showLine: z.boolean().optional(),
  lineColor: z.string().optional(),
  lineWidth: z.string().optional(),
});

const blog = z.object({
  type: z.literal('blog'),
  ...base,
  title: z.string().optional(),
  description: z.string().optional(),
  maxPosts: z.number().optional(),
  buttonText: z.string().optional(),
  buttonUrl: z.string().optional(),
});

const testimonials = z.object({
  type: z.literal('testimonials'),
  ...base,
  title: z.string().optional(),
  description: z.string().optional(),
  testimonials: z
    .array(
      z.object({
        quote: z.string(),
        name: z.string().optional(),
        role: z.string().optional(),
        company: z.string().optional(),
        avatar: z.string().optional(),
        rating: z.number().optional(),
        caseStudyUrl: z.string().optional(),
      })
    )
    .default([]),
  buttonText: z.string().optional(),
  buttonUrl: z.string().optional(),
  layout: z.enum(['grid', 'masonry', 'carousel']).optional(),
});

const faq = z.object({
  type: z.literal('faq'),
  ...base,
  title: z.string().optional(),
  description: z.string().optional(),
  items: z.array(z.object({ question: z.string(), answer: z.string() })).default([]),
  layout: z.enum(['accordion', 'grid']).optional(),
});

const stats = z.object({
  type: z.literal('stats'),
  ...base,
  title: z.string().optional(),
  description: z.string().optional(),
  items: z
    .array(
      z.object({
        value: z.union([z.string(), z.number()]),
        label: z.string(),
        prefix: z.string().optional(),
        suffix: z.string().optional(),
        icon: z.string().optional(),
      })
    )
    .default([]),
});

const pricing = z.object({
  type: z.literal('pricing'),
  ...base,
  title: z.string().optional(),
  description: z.string().optional(),
  billingToggle: z.boolean().optional(),
  plans: z
    .array(
      z.object({
        name: z.string(),
        price: z.union([z.string(), z.number()]),
        priceMonthly: z.union([z.string(), z.number()]).optional(),
        priceYearly: z.union([z.string(), z.number()]).optional(),
        period: z.string().optional(),
        description: z.string().optional(),
        features: z.array(z.string()).default([]),
        cta: z.string(),
        ctaUrl: z.string(),
        highlighted: z.boolean().optional(),
        badge: z.string().optional(),
      })
    )
    .default([]),
});

const team = z.object({
  type: z.literal('team'),
  ...base,
  title: z.string().optional(),
  description: z.string().optional(),
  members: z
    .array(
      z.object({
        name: z.string(),
        role: z.string(),
        bio: z.string().optional(),
        avatar: z.string().optional(),
        linkedIn: z.string().optional(),
        twitter: z.string().optional(),
      })
    )
    .default([]),
});

const ctaBanner = z.object({
  type: z.literal('cta_banner'),
  ...base,
  title: z.string().optional(),
  description: z.string().optional(),
  primaryCta: z.string().optional(),
  primaryCtaUrl: z.string().optional(),
  secondaryCta: z.string().optional(),
  secondaryCtaUrl: z.string().optional(),
  backgroundStyle: z.enum(['gradient', 'solid', 'image']).optional(),
  backgroundImage: z.string().optional(),
});

const video = z.object({
  type: z.literal('video'),
  ...base,
  title: z.string().optional(),
  description: z.string().optional(),
  videoUrl: z.string().optional(),
  thumbnail: z.string().optional(),
  autoplay: z.boolean().optional(),
  loop: z.boolean().optional(),
});

const gallery = z.object({
  type: z.literal('gallery'),
  ...base,
  title: z.string().optional(),
  description: z.string().optional(),
  images: z
    .array(z.object({ src: z.string(), alt: z.string(), caption: z.string().optional() }))
    .default([]),
  layout: z.enum(['grid', 'masonry', 'carousel']).optional(),
});

const timeline = z.object({
  type: z.literal('timeline'),
  ...base,
  title: z.string().optional(),
  description: z.string().optional(),
  items: z
    .array(
      z.object({
        year: z.string().optional(),
        title: z.string(),
        description: z.string().optional(),
        icon: z.string().optional(),
      })
    )
    .default([]),
  layout: z.enum(['vertical', 'horizontal']).optional(),
});

const logoStrip = z.object({
  type: z.literal('logo_strip'),
  ...base,
  title: z.string().optional(),
  logos: z.array(z.object({ src: z.string(), alt: z.string(), url: z.string().optional() })).default([]),
  scrolling: z.boolean().optional(),
});

export const section = z.discriminatedUnion('type', [
  hero,
  contentHeader,
  cards,
  product,
  divider,
  blog,
  testimonials,
  faq,
  stats,
  pricing,
  team,
  ctaBanner,
  video,
  gallery,
  timeline,
  logoStrip,
]);

export type Section = z.infer<typeof section>;

// Keystatic stores polymorphic array items in a nested `{ discriminant, value }`
// shape. We flatten that to the typed `{ type, ...fields }` union here, so the
// renderer (DynamicSection) always works with a clean, flat `Section`. Hand-authored
// flat entries are accepted too.
const sectionEntry = z.preprocess((raw) => {
  if (raw && typeof raw === 'object' && 'discriminant' in (raw as any)) {
    const r = raw as { discriminant: string; value?: Record<string, unknown> };
    return { type: r.discriminant, ...(r.value ?? {}) };
  }
  return raw;
}, section);

// ── Collections ──────────────────────────────────────────────────────────────

const footer = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  buttonText: z.string().optional(),
  copyright: z.string().optional(),
  contact: z
    .object({
      email_label: z.string().optional(),
      phone_label: z.string().optional(),
      address_label: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
    })
    .optional(),
  social: z
    .object({
      linkedin: z.string().optional(),
      twitter: z.string().optional(),
      instagram: z.string().optional(),
      facebook: z.string().optional(),
    })
    .optional(),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/[^_]*.yaml', base: './src/content/pages' }),
  schema: z.object({
    meta: z.object({
      title: z.string(),
      description: z.string(),
      ogImage: z.string().optional(),
    }),
    status: z.enum(['published', 'draft']).default('published'),
    sections: z.array(sectionEntry).default([]),
    footer: footer.optional(),
  }),
});

// Per-page design tokens (card styling defaults, responsive columns). These are
// presentation, not content, so they live in their own collection — one entry
// per page, locale-agnostic — and are NOT exposed in the Keystatic editor.
const pageDefaults = defineCollection({
  loader: glob({ pattern: '**/[^_]*.yaml', base: './src/content/page-defaults' }),
  schema: z.record(z.any()),
});

const blogCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
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
});

export const collections = {
  pages,
  pageDefaults,
  blog: blogCollection,
};
