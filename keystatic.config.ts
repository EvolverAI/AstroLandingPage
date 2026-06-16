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
//
// Presentational fields (icons, colours, alignment…) are dropdowns/presets so you
// never have to remember icon names or CSS classes. Every value already present in
// the content is included as an option (Keystatic's reader is strict).
// ─────────────────────────────────────────────────────────────────────────────

const LOCALES = ['en', 'it', 'de'] as const;
const PAGES = ['home', 'b2b', 'wfm', 'elysia', 'academy'] as const;
const LOCALE_LABEL: Record<(typeof LOCALES)[number], string> = { en: 'EN', it: 'IT', de: 'DE' };

// ── Friendly option lists ────────────────────────────────────────────────────
const prettify = (s: string) =>
  s.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

// Material icon names used in the content + a few common extras. Pick from a list
// instead of typing names.
const ICON_NAMES = [
  'access_time', 'account_balance', 'analytics', 'arrow_forward', 'assistant', 'autorenew',
  'bolt', 'build', 'business', 'business_center', 'calendar_today', 'chat', 'check',
  'check_circle', 'clock', 'cloud', 'computer', 'data_usage', 'dashboard', 'diversity_3',
  'document_scanner', 'email', 'engineering', 'enhanced_encryption', 'expand_more', 'forum',
  'gpp_good', 'gpp_maybe', 'group_add', 'groups', 'handshake', 'headset_mic', 'health_and_safety',
  'home', 'hub', 'insights', 'integration_instructions', 'lightbulb', 'link', 'local_hospital',
  'location_on', 'monetization_on', 'moving', 'palette', 'people', 'percent', 'policy',
  'precision_manufacturing', 'psychology', 'public', 'refresh', 'report_problem', 'rocket_launch',
  'room_service', 'savings', 'schedule', 'school', 'security', 'sentiment_very_satisfied',
  'settings', 'settings_applications', 'shopping_cart', 'speed', 'star', 'support_agent', 'sync',
  'trending_down', 'trending_up', 'tune', 'verified', 'verified_user', 'video_call', 'visibility',
  'warning',
];
const NONE = { label: '— none —', value: '' };
const iconOptions = [NONE, ...ICON_NAMES.map((n) => ({ label: prettify(n), value: n }))];

const iconSelect = (label: string) =>
  fields.select({ label, options: iconOptions, defaultValue: '' });

const iconColor = fields.select({
  label: 'Icon colour',
  options: [
    NONE,
    { label: 'Blue', value: 'text-blue-400' },
    { label: 'Green', value: 'text-green-500' },
    { label: 'Light yellow', value: 'text-yellow-100' },
    { label: 'Off-white', value: '#F5F5F5' },
    { label: 'White', value: 'text-white' },
  ],
  defaultValue: '',
});

const iconAlign = fields.select({
  label: 'Icon alignment',
  options: [
    { label: 'Top', value: 'top' },
    { label: 'Top (large)', value: 'top-big' },
    { label: 'Left', value: 'left' },
    { label: 'Left (large)', value: 'left-big' },
    { label: 'Left (headline)', value: 'left-headline' },
  ],
  defaultValue: 'top',
});

const buttonColor = fields.select({
  label: 'Button colour',
  options: [
    { label: 'Blue', value: 'bg-blue-600 hover:bg-blue-700' },
    { label: 'Green', value: 'bg-green-600 hover:bg-green-700' },
    { label: 'Purple', value: 'bg-purple-600 hover:bg-purple-700' },
    { label: 'Pink', value: 'bg-pink-600 hover:bg-pink-700' },
    { label: 'Indigo', value: 'bg-indigo-600 hover:bg-indigo-700' },
  ],
  defaultValue: 'bg-blue-600 hover:bg-blue-700',
});

const bulletColor = fields.select({
  label: 'Bullet colour',
  options: [
    NONE,
    { label: 'Blue', value: 'text-blue-400' },
    { label: 'Green', value: 'text-green-400' },
    { label: 'Yellow', value: 'text-yellow-400' },
    { label: 'Purple', value: 'text-purple-400' },
    { label: 'Orange', value: 'text-orange-400' },
    { label: 'Red', value: 'text-red-400' },
  ],
  defaultValue: 'text-green-400',
});

const bulletType = fields.select({
  label: 'Bullet style',
  options: [
    NONE,
    { label: 'Icon', value: 'icon' },
    { label: 'Symbol', value: 'symbol' },
    { label: 'Dot', value: 'dot' },
  ],
  defaultValue: 'icon',
});

const badgeColor = fields.select({
  label: 'Colour',
  options: [
    { label: 'Red', value: 'bg-red-500' },
    { label: 'Blue', value: 'bg-blue-500' },
    { label: 'Green', value: 'bg-green-500' },
    { label: 'Green (light)', value: 'bg-green-400' },
    { label: 'Yellow', value: 'bg-yellow-500' },
    { label: 'Purple', value: 'bg-purple-500' },
  ],
  defaultValue: 'bg-red-500',
});

const sectionAlignment = fields.select({
  label: 'Text alignment',
  options: [
    { label: 'Left', value: 'left' },
    { label: 'Center', value: 'center' },
    { label: 'Right', value: 'right' },
  ],
  defaultValue: 'left',
});

const sectionBackground = fields.select({
  label: 'Background',
  options: [
    NONE,
    { label: 'Blue gradient', value: 'bg-gradient-to-r from-blue-900 to-slate-800 rounded-lg' },
  ],
  defaultValue: '',
});

const overlayOpacity = fields.select({
  label: 'Image overlay darkness',
  options: [
    { label: 'Default', value: '' },
    { label: '10%', value: '0.1' },
    { label: '15%', value: '0.15' },
    { label: '20%', value: '0.2' },
    { label: '30%', value: '0.3' },
    { label: '50%', value: '0.5' },
  ],
  defaultValue: '',
});

const imagePosition = fields.select({
  label: 'Image position',
  options: [
    { label: 'Right', value: 'right' },
    { label: 'Left', value: 'left' },
  ],
  defaultValue: 'right',
});

const cardVariant = fields.select({
  label: 'Card style',
  options: [
    { label: 'Default', value: 'default' },
    { label: 'Glass', value: 'glass' },
    { label: 'Bordered', value: 'bordered' },
    { label: 'Flat', value: 'flat' },
    { label: 'Feature', value: 'feature' },
  ],
  defaultValue: 'default',
});

// ── Shared leaf fields ───────────────────────────────────────────────────────
const idField = fields.text({ label: 'Section ID (anchor)', validation: { isRequired: true } });
const visibleField = fields.checkbox({ label: 'Visible', defaultValue: true });

const badge = fields.object(
  { text: fields.text({ label: 'Text' }), color: badgeColor, tooltip: fields.text({ label: 'Tooltip' }) },
  { label: 'Badge' }
);

const iconObject = fields.object(
  {
    type: iconSelect('Icon'),
    image: fields.text({ label: 'Image path (instead of an icon)' }),
    color: iconColor,
    alignment: iconAlign,
  },
  { label: 'Icon' }
);

const feature = fields.object(
  {
    text: fields.text({ label: 'Text', multiline: true }),
    title: fields.text({ label: 'Title (for rich features)' }),
    icon: iconSelect('Icon (rich features)'),
    bullet: fields.text({ label: 'Bullet character (optional)' }),
    bulletType,
    bulletColor,
    badges: fields.array(badge, { label: 'Badges', itemLabel: (p) => p.fields.text.value || 'Badge' }),
  },
  { label: 'Feature' }
);

const subsection = fields.object(
  {
    title: fields.text({ label: 'Title' }),
    icon: iconSelect('Icon'),
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
      { icon: iconSelect('Icon'), title: fields.text({ label: 'Title' }), text: fields.text({ label: 'Text', multiline: true }) },
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
    buttonColor,
  },
  { label: 'Card' }
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
    overlayOpacity,
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
    buttonColor,
    responsiveColumns: fields.object(
      {
        mobile: fields.integer({ label: 'Mobile columns' }),
        tablet: fields.integer({ label: 'Tablet columns' }),
        desktop: fields.integer({ label: 'Desktop columns' }),
      },
      { label: 'Columns per breakpoint' }
    ),
    alignment: sectionAlignment,
    background: sectionBackground,
    cardVariant,
  }),
  product: fields.object({
    id: idField,
    visible: visibleField,
    subtitle: fields.text({ label: 'Subtitle' }),
    description: fields.text({ label: 'Description', multiline: true }),
    image: fields.text({ label: 'Image path' }),
    imagePosition,
    buttonText: fields.text({ label: 'Button text' }),
    buttonUrl: fields.text({ label: 'Button URL' }),
    buttonColor,
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
      // Edit English here; run `npm run translate` to regenerate IT/DE.
      'English (edit here)': PAGES.map((p) => `en_${p}`),
      'Italiano (translations)': PAGES.map((p) => `it_${p}`),
      'Deutsch (translations)': PAGES.map((p) => `de_${p}`),
    },
  },
  singletons,
});
