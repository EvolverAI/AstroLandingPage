import { config, fields, singleton } from '@keystatic/core';

// ─────────────────────────────────────────────────────────────────────────────
// Keystatic — the local, schema-driven content editor.
//
// Run `npm run dev` and open http://localhost:4321/keystatic. Edits are written
// straight to the per-locale YAML files under src/content/pages/, which you then
// commit to Git. Nothing here is deployed — production builds exclude Keystatic
// (see astro.config.mjs).
//
// This schema MIRRORS the Zod schema in src/content.config.ts. The polymorphic
// `sections` list maps onto Astro's typed `section` discriminated union: each
// item is a `conditional` keyed on the section type, which Keystatic stores as
// `{ discriminant, value }` and src/content.config.ts flattens back to `{ type, … }`.
// ─────────────────────────────────────────────────────────────────────────────

const LOCALES = ['en', 'it', 'de'] as const;
const PAGES = ['home', 'b2b', 'wfm', 'elysia', 'academy'] as const;
const LOCALE_LABEL: Record<(typeof LOCALES)[number], string> = { en: 'EN', it: 'IT', de: 'DE' };

// ── Shared leaf fields ───────────────────────────────────────────────────────
const idField = fields.text({ label: 'Section ID (anchor)', validation: { isRequired: true } });
const visibleField = fields.checkbox({ label: 'Visible', defaultValue: true });

const badge = fields.object(
  {
    text: fields.text({ label: 'Text' }),
    color: fields.text({ label: 'Color (CSS classes)' }),
    tooltip: fields.text({ label: 'Tooltip' }),
  },
  { label: 'Badge' }
);

const iconObject = fields.object(
  {
    type: fields.text({ label: 'Icon name (Material)' }),
    image: fields.text({ label: 'Image path (instead of icon)' }),
    color: fields.text({ label: 'Color class' }),
    alignment: fields.text({ label: 'Alignment' }),
  },
  { label: 'Icon' }
);

const feature = fields.object(
  {
    text: fields.text({ label: 'Text', multiline: true }),
    title: fields.text({ label: 'Title (rich feature)' }),
    icon: fields.text({ label: 'Icon (Material name)' }),
    bullet: fields.text({ label: 'Bullet' }),
    bulletType: fields.text({ label: 'Bullet type (icon/symbol/dot)' }),
    bulletColor: fields.text({ label: 'Bullet color class' }),
    badges: fields.array(badge, { label: 'Badges', itemLabel: (p) => p.fields.text.value || 'Badge' }),
  },
  { label: 'Feature' }
);

const subsection = fields.object(
  {
    title: fields.text({ label: 'Title' }),
    icon: fields.text({ label: 'Icon' }),
    description: fields.text({ label: 'Description', multiline: true }),
    features: fields.array(feature, { label: 'Features', itemLabel: (p) => p.fields.text.value || p.fields.title.value || 'Feature' }),
  },
  { label: 'Subsection' }
);

const card = fields.object(
  {
    title: fields.text({ label: 'Title', validation: { isRequired: true } }),
    description: fields.text({ label: 'Description', multiline: true }),
    icon: iconObject,
    badges: fields.array(badge, { label: 'Badges', itemLabel: (p) => p.fields.text.value || 'Badge' }),
    features: fields.array(feature, { label: 'Features', itemLabel: (p) => p.fields.text.value || p.fields.title.value || 'Feature' }),
    subsections: fields.array(subsection, { label: 'Subsections', itemLabel: (p) => p.fields.title.value || 'Subsection' }),
    subsectionColumns: fields.integer({ label: 'Subsection columns' }),
    subsectionStyle: fields.text({ label: 'Subsection style' }),
    callout: fields.object(
      { icon: fields.text({ label: 'Icon' }), title: fields.text({ label: 'Title' }), text: fields.text({ label: 'Text', multiline: true }) },
      { label: 'Callout' }
    ),
    note: fields.conditional(
      fields.select({
        label: 'Note',
        options: [
          { label: 'None', value: 'none' },
          { label: 'Simple text', value: 'text' },
          { label: 'Rich (title / content / signature)', value: 'rich' },
        ],
        defaultValue: 'none',
      }),
      {
        none: fields.empty(),
        text: fields.text({ label: 'Note text', multiline: true }),
        rich: fields.object(
          {
            title: fields.text({ label: 'Title' }),
            content: fields.text({ label: 'Content', multiline: true }),
            signature: fields.text({ label: 'Signature' }),
          },
          { label: 'Rich note' }
        ),
      }
    ),
    linkText: fields.text({ label: 'Link text' }),
    linkUrl: fields.text({ label: 'Link URL' }),
    buttonText: fields.text({ label: 'Button text' }),
    buttonUrl: fields.text({ label: 'Button URL' }),
    buttonColor: fields.text({ label: 'Button color classes' }),
  },
  { label: 'Card' }
);

const responsiveColumns = fields.object(
  {
    mobile: fields.integer({ label: 'Mobile' }),
    tablet: fields.integer({ label: 'Tablet' }),
    desktop: fields.integer({ label: 'Desktop' }),
  },
  { label: 'Responsive columns' }
);

// ── Section type branches (mirrors the in-use members of the Zod union) ───────
const sectionTypes = {
  hero: fields.object({
    id: idField,
    visible: visibleField,
    eyebrow: fields.text({ label: 'Eyebrow' }),
    companyName: fields.text({ label: 'Company name' }),
    companyNameHighlight: fields.text({ label: 'Company name highlight' }),
    title: fields.text({ label: 'Title' }),
    subtitle: fields.text({ label: 'Subtitle', multiline: true }),
    description: fields.text({ label: 'Description', multiline: true }),
    minHeight: fields.text({ label: 'Min height (e.g. 100vh)' }),
  }),
  content_header: fields.object({
    id: idField,
    visible: visibleField,
    title: fields.text({ label: 'Title' }),
    description: fields.text({ label: 'Description', multiline: true }),
    companyName: fields.text({ label: 'Company name' }),
    companyNameHighlight: fields.text({ label: 'Company name highlight' }),
    buttonText: fields.text({ label: 'Button text' }),
    backgroundImage: fields.text({ label: 'Background image path' }),
    overlayOpacity: fields.text({ label: 'Overlay opacity (e.g. 0.1)' }),
    minHeight: fields.text({ label: 'Min height' }),
  }),
  cards: fields.object({
    id: idField,
    visible: visibleField,
    title: fields.text({ label: 'Title' }),
    subtitle: fields.text({ label: 'Subtitle' }),
    description: fields.text({ label: 'Description', multiline: true }),
    cards: fields.array(card, { label: 'Cards', itemLabel: (p) => p.fields.title.value || 'Card' }),
    buttonText: fields.text({ label: 'Button text' }),
    buttonUrl: fields.text({ label: 'Button URL' }),
    buttonColor: fields.text({ label: 'Button color classes' }),
    responsiveColumns,
    alignment: fields.text({ label: 'Alignment (left/center/right)' }),
    background: fields.text({ label: 'Background classes' }),
    cardVariant: fields.select({
      label: 'Card variant',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Glass', value: 'glass' },
        { label: 'Bordered', value: 'bordered' },
        { label: 'Flat', value: 'flat' },
        { label: 'Feature', value: 'feature' },
      ],
      defaultValue: 'default',
    }),
  }),
  product: fields.object({
    id: idField,
    visible: visibleField,
    subtitle: fields.text({ label: 'Subtitle' }),
    description: fields.text({ label: 'Description', multiline: true }),
    image: fields.text({ label: 'Image path' }),
    imagePosition: fields.text({ label: 'Image position (left/right)' }),
    buttonText: fields.text({ label: 'Button text' }),
    buttonUrl: fields.text({ label: 'Button URL' }),
    buttonColor: fields.text({ label: 'Button color classes' }),
  }),
  blog: fields.object({
    id: idField,
    visible: visibleField,
    title: fields.text({ label: 'Title' }),
    description: fields.text({ label: 'Description', multiline: true }),
    maxPosts: fields.integer({ label: 'Max posts' }),
    buttonText: fields.text({ label: 'Button text' }),
    buttonUrl: fields.text({ label: 'Button URL' }),
  }),
  testimonials: fields.object({
    id: idField,
    visible: visibleField,
    title: fields.text({ label: 'Title' }),
    description: fields.text({ label: 'Description', multiline: true }),
    testimonials: fields.array(
      fields.object({
        quote: fields.text({ label: 'Quote', multiline: true }),
        name: fields.text({ label: 'Name' }),
        role: fields.text({ label: 'Role' }),
        company: fields.text({ label: 'Company' }),
        rating: fields.integer({ label: 'Rating (1-5)' }),
      }),
      { label: 'Testimonials', itemLabel: (p) => p.fields.name.value || 'Testimonial' }
    ),
  }),
  pricing: fields.object({
    id: idField,
    visible: visibleField,
    title: fields.text({ label: 'Title' }),
    description: fields.text({ label: 'Description', multiline: true }),
    plans: fields.array(
      fields.object({
        name: fields.text({ label: 'Name' }),
        price: fields.text({ label: 'Price' }),
        period: fields.text({ label: 'Period' }),
        features: fields.array(fields.text({ label: 'Feature' }), { label: 'Features', itemLabel: (p) => p.value }),
        cta: fields.text({ label: 'CTA label' }),
        ctaUrl: fields.text({ label: 'CTA URL' }),
        highlighted: fields.checkbox({ label: 'Highlighted' }),
        badge: fields.text({ label: 'Badge' }),
      }),
      { label: 'Plans', itemLabel: (p) => p.fields.name.value || 'Plan' }
    ),
  }),
};

const sectionsField = fields.array(
  fields.conditional(
    fields.select({
      label: 'Section type',
      options: [
        { label: 'Hero', value: 'hero' },
        { label: 'Content header', value: 'content_header' },
        { label: 'Cards', value: 'cards' },
        { label: 'Product', value: 'product' },
        { label: 'Blog', value: 'blog' },
        { label: 'Testimonials', value: 'testimonials' },
        { label: 'Pricing', value: 'pricing' },
      ],
      defaultValue: 'cards',
    }),
    sectionTypes
  ),
  { label: 'Sections', itemLabel: (p) => p.discriminant }
);

const footer = fields.object(
  {
    title: fields.text({ label: 'Title' }),
    description: fields.text({ label: 'Description', multiline: true }),
    buttonText: fields.text({ label: 'Button text' }),
    copyright: fields.text({ label: 'Copyright' }),
    contact: fields.object(
      {
        email_label: fields.text({ label: 'Email label' }),
        phone_label: fields.text({ label: 'Phone label' }),
        address_label: fields.text({ label: 'Address label' }),
        email: fields.text({ label: 'Email' }),
        phone: fields.text({ label: 'Phone' }),
        address: fields.text({ label: 'Address', multiline: true }),
      },
      { label: 'Contact' }
    ),
    social: fields.object(
      {
        linkedin: fields.text({ label: 'LinkedIn' }),
        twitter: fields.text({ label: 'Twitter' }),
        instagram: fields.text({ label: 'Instagram' }),
        facebook: fields.text({ label: 'Facebook' }),
      },
      { label: 'Social' }
    ),
  },
  { label: 'Footer' }
);

function pageSchema() {
  return {
    meta: fields.object(
      {
        title: fields.text({ label: 'Title', validation: { isRequired: true } }),
        description: fields.text({ label: 'Description', multiline: true, validation: { isRequired: true } }),
        ogImage: fields.text({ label: 'OG image path' }),
      },
      { label: 'Meta (SEO)' }
    ),
    status: fields.select({
      label: 'Status',
      options: [
        { label: 'Published', value: 'published' },
        { label: 'Draft', value: 'draft' },
      ],
      defaultValue: 'published',
    }),
    sections: sectionsField,
    footer,
  };
}

// One singleton per locale × page, all sharing the schema above.
const singletons: Record<string, ReturnType<typeof singleton>> = {};
for (const locale of LOCALES) {
  for (const page of PAGES) {
    singletons[`${locale}_${page}`] = singleton({
      label: `${LOCALE_LABEL[locale]} · ${page}`,
      path: `src/content/pages/${locale}/${page}`,
      format: { data: 'yaml' },
      schema: pageSchema(),
    });
  }
}

export default config({
  storage: { kind: 'local' },
  ui: {
    brand: { name: 'EvolverAI Content' },
    navigation: {
      English: LOCALES.includes('en') ? PAGES.map((p) => `en_${p}`) : [],
      Italiano: PAGES.map((p) => `it_${p}`),
      Deutsch: PAGES.map((p) => `de_${p}`),
    },
  },
  singletons,
});
