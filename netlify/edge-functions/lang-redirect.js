// Server-side language redirect for unprefixed paths.
//
// Replaces the old client-side localStorage spinner pages (index.astro /
// [page].astro). Runs at the edge BEFORE static files are served, so there is
// no flash and crawlers get a clean 302 to the localized URL.
//
// Order of preference: `lang` cookie → Accept-Language header → default ("en").

const LOCALES = ["en", "it", "de"];
const DEFAULT_LOCALE = "en";

function pickLocale(request) {
  // 1. Explicit cookie set by the language switcher (if present).
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(/(?:^|;\s*)lang=([a-z]{2})/i);
  if (match && LOCALES.includes(match[1].toLowerCase())) {
    return match[1].toLowerCase();
  }

  // 2. Accept-Language negotiation.
  const header = request.headers.get("accept-language") || "";
  for (const part of header.split(",")) {
    const code = part.trim().split(";")[0].split("-")[0].toLowerCase();
    if (LOCALES.includes(code)) return code;
  }

  // 3. Fallback.
  return DEFAULT_LOCALE;
}

export default async (request, context) => {
  const url = new URL(request.url);
  // Strip a trailing slash for matching (keep root as "").
  const path = url.pathname.replace(/\/+$/, "");

  // Only act on unprefixed paths: "" (root) or "/<page>".
  // Anything already under /en, /it, /de is passed straight through.
  const locale = pickLocale(request);
  const target = path === "" ? `/${locale}` : `/${locale}${path}`;

  return Response.redirect(`${url.origin}${target}${url.search}`, 302);
};

export const config = {
  // Bare, locale-less entry points. Localized URLs are NOT listed here, so
  // they bypass the edge function entirely.
  path: ["/", "/b2b", "/wfm", "/elysia", "/academy"],
};
