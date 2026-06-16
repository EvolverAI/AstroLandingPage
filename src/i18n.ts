// Central i18n config — the single list of supported locales and their display
// metadata. Replaces the old runtime .meta.json lookups in content-loader.js.
export const locales = ['en', 'it', 'de'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, { name: string; flag: string }> = {
  en: { name: 'English', flag: '🇺🇸' },
  it: { name: 'Italiano', flag: '🇮🇹' },
  de: { name: 'Deutsch', flag: '🇩🇪' },
};

export const pages = ['home', 'b2b', 'wfm', 'elysia', 'academy'] as const;
export type PageId = (typeof pages)[number];

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Build the public URL path for a page in a locale (home has no page segment). */
export function pagePath(locale: Locale, page: string): string {
  return page === 'home' ? `/${locale}` : `/${locale}/${page}`;
}
