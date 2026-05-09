/**
 * EvolverAI CMS — TypeScript Type Definitions
 * Central source of truth for all content and layout structures.
 */

// ── Design Tokens ─────────────────────────────────────────────────────────────

export interface DesignSettings {
  '--color-brand-blue'?: string;
  '--color-brand-blue-light'?: string;
  '--color-accent-orange'?: string;
  '--color-bg-base'?: string;
  '--color-bg-surface'?: string;
  '--font-sans'?: string;
  '--radius-lg'?: string;
  '--space-section-custom'?: string;
  '--text-base-size'?: string;
  [key: string]: string | undefined;
}

// ── Blog ──────────────────────────────────────────────────────────────────────

export interface BlogPost {
  title: string;
  date: Date;
  author: string;
  excerpt?: string;
  coverImage?: string;
  tags: string[];
  featured: boolean;
  lang: string;
}

// ── Content ───────────────────────────────────────────────────────────────────

export interface CardBadge {
  text: string;
  color: string;
  tooltip?: string;
}

export interface CardFeature {
  text: string;
  bullet?: string;
  bulletType?: 'icon' | 'symbol' | 'dot';
  bulletColor?: string;
  badges?: CardBadge[];
}

export interface CardNote {
  title: string;
  content: string;
  signature?: string;
}

export interface CardIcon {
  type?: string;
  image?: string;
  color?: string;
  alignment?: 'top' | 'left' | 'left-big' | 'top-big' | 'top-headline' | 'left-headline';
}

export interface CardContent {
  title: string;
  description: string;
  badges?: CardBadge[];
  icon?: string | CardIcon | CardIcon[];
  features?: string[] | CardFeature[];
  note?: CardNote | string;
  linkText?: string;
  linkUrl?: string;
  buttonText?: string;
  buttonUrl?: string;
  buttonColor?: string;
  image?: string;
}

export interface TestimonialContent {
  quote: string;
  name: string;
  role?: string;
  company?: string;
  avatar?: string;
  rating?: number;
  caseStudyUrl?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface StatItem {
  value: string;
  label: string;
  prefix?: string;
  suffix?: string;
  icon?: string;
}

export interface PricingPlan {
  name: string;
  price: string;
  priceMonthly?: string;
  priceYearly?: string;
  description?: string;
  features: string[];
  cta: string;
  ctaUrl: string;
  highlighted?: boolean;
  badge?: string;
}

export interface TeamMember {
  name: string;
  role: string;
  bio?: string;
  avatar?: string;
  linkedIn?: string;
  twitter?: string;
}

export interface GalleryImage {
  src: string;
  alt: string;
  caption?: string;
}

export interface TimelineItem {
  year: string;
  title: string;
  description: string;
  icon?: string;
}

export interface LogoItem {
  src: string;
  alt: string;
  url?: string;
}

export interface MetaContent {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

export interface FooterContent {
  title: string;
  description?: string;
  buttonText: string;
  buttonUrl?: string;
  copyright: string;
  contact?: {
    email?: string;
    email_label?: string;
    phone?: string;
    phone_label?: string;
    address?: string;
    address_label?: string;
  };
}

export interface HeroContent {
  companyName?: string;
  companyNameHighlight?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  eyebrow?: string;
  ctaText?: string;
  ctaUrl?: string;
  secondaryCtaText?: string;
  secondaryCtaUrl?: string;
  heroImage?: string;
  videoSrc?: string;
  variant?: 'default' | 'gradient' | 'video' | 'split' | 'particles';
}

export interface SectionContent {
  title?: string;
  subtitle?: string;
  description?: string;
  cards?: CardContent[];
  testimonials?: TestimonialContent[];
  items?: FaqItem[] | StatItem[] | TimelineItem[];
  plans?: PricingPlan[];
  members?: TeamMember[];
  images?: GalleryImage[];
  logos?: LogoItem[];
  buttonText?: string;
  buttonUrl?: string;
  primaryCta?: string;
  primaryCtaUrl?: string;
  secondaryCta?: string;
  secondaryCtaUrl?: string;
  backgroundStyle?: 'gradient' | 'solid' | 'image';
  videoUrl?: string;
  thumbnail?: string;
  autoplay?: boolean;
  loop?: boolean;
  layout?: 'accordion' | 'grid' | 'vertical' | 'horizontal' | 'masonry' | 'carousel';
  scrolling?: boolean;
  maxPosts?: number;
  [key: string]: unknown;
}

export interface PageContent {
  meta: MetaContent;
  footer?: FooterContent;
  hero?: HeroContent;
  [sectionId: string]: SectionContent | MetaContent | FooterContent | HeroContent | undefined;
}

// ── Layout ────────────────────────────────────────────────────────────────────

export type SectionType =
  | 'hero'
  | 'content_header'
  | 'cards'
  | 'product'
  | 'divider'
  | 'blog'
  | 'testimonials'
  | 'faq'
  | 'stats'
  | 'pricing'
  | 'team'
  | 'cta_banner'
  | 'video'
  | 'gallery'
  | 'timeline'
  | 'logo_strip';

export interface PageSection {
  type: SectionType;
  section_id: string;
  order: number;
  visible?: boolean;
  background_image?: string;
  min_height?: string;
  height?: string;
  backgroundColor?: string;
  showLine?: boolean;
  lineColor?: string;
  lineWidth?: string;
  logo?: string;
  [key: string]: unknown;
}

export interface CardLayoutConfig {
  icon?: CardIcon;
  linkUrl?: string;
  buttonUrl?: string;
  buttonColor?: string;
  image?: string;
  features_config?: unknown[];
}

export interface SectionLayoutConfig {
  image?: string;
  imagePosition?: 'left' | 'right';
  buttonUrl?: string;
  buttonColor?: string;
  responsiveColumns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  cards?: CardLayoutConfig[];
  billingToggle?: boolean;
  layout?: string;
  scrolling?: boolean;
  backgroundStyle?: string;
  backgroundImage?: string;
  primaryCtaUrl?: string;
  secondaryCtaUrl?: string;
  videoUrl?: string;
  thumbnail?: string;
  autoplay?: boolean;
  loop?: boolean;
  [key: string]: unknown;
}

export interface PageLayout {
  status?: 'draft' | 'published';
  page_sections: PageSection[];
  defaults?: {
    cards?: {
      responsiveColumns?: { mobile?: number; tablet?: number; desktop?: number };
      icon?: { alignment?: string };
    };
  };
  section_config?: Record<string, SectionLayoutConfig>;
}

// ── Form Submissions ──────────────────────────────────────────────────────────

export interface FormSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  timestamp: string;
  read: boolean;
}
