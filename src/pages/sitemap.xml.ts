import type { APIRoute } from 'astro';
import { locales, localeNames, pages as pageIds } from '../i18n';

const BASE_URL = 'https://evolverai.ch';

const getAvailablePages = () => [...pageIds];
const getAvailableLanguages = () => locales.map((code) => ({ code, ...localeNames[code] }));

const pageMeta: Record<string, { priority: string; changefreq: string }> = {
  home:    { priority: '1.0', changefreq: 'weekly' },
  b2b:     { priority: '0.8', changefreq: 'monthly' },
  wfm:     { priority: '0.8', changefreq: 'monthly' },
  elysia:  { priority: '0.8', changefreq: 'monthly' },
  academy: { priority: '0.7', changefreq: 'monthly' },
};

export const GET: APIRoute = () => {
  const pages    = getAvailablePages();
  const languages = getAvailableLanguages();
  const now      = new Date().toISOString().split('T')[0];

  const urlEntries: string[] = [];

  for (const page of pages) {
    const meta = pageMeta[page] || { priority: '0.6', changefreq: 'monthly' };

    const alternates = [
      ...languages.map(lang =>
        `<xhtml:link rel="alternate" hreflang="${lang.code}" href="${BASE_URL}/${lang.code}${page !== 'home' ? '/' + page : ''}" />`
      ),
      `<xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}/en${page !== 'home' ? '/' + page : ''}" />`,
    ].join('\n      ');

    for (const lang of languages) {
      const priority = lang.code === 'en'
        ? meta.priority
        : String((parseFloat(meta.priority) - 0.1).toFixed(1));

      urlEntries.push(`
  <url>
    <loc>${BASE_URL}/${lang.code}${page !== 'home' ? '/' + page : ''}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${meta.changefreq}</changefreq>
    <priority>${priority}</priority>
    ${alternates}
  </url>`);
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
>
${urlEntries.join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
