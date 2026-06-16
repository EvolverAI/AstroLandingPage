#!/usr/bin/env node
/**
 * EvolverAI Translation Engine
 *
 * Translates the English page entries (src/content/pages/en/<page>.yaml) into the
 * other locales using OpenAI, writing src/content/pages/<lang>/<page>.yaml.
 *
 * Because page entries now mix content with presentation (CSS classes, URLs, icon
 * names, ids…), only values under a whitelist of human-text keys are translated;
 * everything else is copied verbatim, preserving structure exactly.
 *
 * Usage:
 *   npm run translate                 # all target locales, all pages
 *   npm run translate -- --lang=it    # only Italian
 *   npm run translate -- --page=home  # only the home page
 *   npm run translate:status          # show which locale files exist
 */
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const PAGES_DIR = path.resolve('src/content/pages');
const GLOSSARY_PATH = path.resolve('scripts/glossary.yaml');
const SOURCE_LOCALE = 'en';
const TARGET_LOCALES = ['it', 'de'];
const MODEL = 'gpt-4o-mini';

// Keys whose string values carry human-readable copy worth translating. Anything
// not listed (ids, types, colors, classes, urls, icon names, image paths…) is
// preserved verbatim.
const TRANSLATE_KEYS = new Set([
  'title', 'subtitle', 'description', 'eyebrow',
  'buttonText', 'cta', 'ctaText', 'secondaryCtaText', 'primaryCta', 'secondaryCta',
  'quote', 'role', 'label', 'question', 'answer', 'period',
  'content', 'text', 'copyright', 'tooltip', 'badge', 'signature', 'linkText',
  'email_label', 'phone_label', 'address_label',
]);

const args = process.argv.slice(2);
const flags = {};
for (const a of args) {
  if (a.startsWith('--')) {
    const [k, v] = a.slice(2).split('=');
    flags[k] = v ?? true;
  }
}

function loadGlossary() {
  try {
    return yaml.load(fs.readFileSync(GLOSSARY_PATH, 'utf-8'));
  } catch {
    return { brand_terms: [], technical_terms: [], translation_context: '' };
  }
}

function listPages() {
  const dir = path.join(PAGES_DIR, SOURCE_LOCALE);
  return fs.readdirSync(dir).filter((f) => f.endsWith('.yaml')).map((f) => f.replace('.yaml', ''));
}

// Walk the tree, collecting { path -> text } for translatable leaves.
function collect(node, atPath, out, parent) {
  if (Array.isArray(node)) {
    node.forEach((item, i) => collect(item, `${atPath}[${i}]`, out, parent));
    return;
  }
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      collect(v, atPath ? `${atPath}.${k}` : k, out, { key: k, obj: node });
    }
    return;
  }
  if (typeof node === 'string' && parent) {
    const translatable =
      TRANSLATE_KEYS.has(parent.key) ||
      // note conditional: { discriminant: 'text', value: '<note>' }
      (parent.key === 'value' && parent.obj.discriminant === 'text');
    if (translatable && node.trim()) out[atPath] = node;
  }
}

// Apply translated { path -> text } back onto a deep clone.
function apply(node, atPath, translations) {
  if (Array.isArray(node)) {
    return node.map((item, i) => apply(item, `${atPath}[${i}]`, translations));
  }
  if (node && typeof node === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(node)) {
      out[k] = apply(v, atPath ? `${atPath}.${k}` : k, translations);
    }
    return out;
  }
  if (typeof node === 'string' && atPath in translations) return translations[atPath];
  return node;
}

async function translateStrings(strings, targetLang, glossary) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY not set. Add it to .env.local');
    process.exit(1);
  }
  const langNames = { it: 'Italian', de: 'German' };
  const targetLangName = langNames[targetLang] || targetLang;

  const systemPrompt = `You are a professional translator for a corporate technology website.
Translate the JSON object values from English to ${targetLangName}. Keep every JSON key
exactly as-is; only translate the string values.

RULES:
- Do NOT translate these brand terms: ${(glossary.brand_terms || []).join(', ')}
- Do NOT translate these technical terms: ${(glossary.technical_terms || []).join(', ')}
- Keep any HTML tags, URLs, or placeholders intact.
- Professional yet approachable tone; natural marketing copy, not literal.
- ${glossary.translation_context || ''}

Return ONLY valid JSON with the same keys.`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(strings, null, 2) },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    }),
  });
  if (!res.ok) throw new Error(`OpenAI API error: ${res.status} - ${await res.text()}`);
  const data = await res.json();
  return JSON.parse(data.choices[0].message.content);
}

async function translatePage(page, lang, glossary) {
  const srcPath = path.join(PAGES_DIR, SOURCE_LOCALE, `${page}.yaml`);
  const source = yaml.load(fs.readFileSync(srcPath, 'utf-8'));

  const strings = {};
  collect(source, '', strings, null);
  const count = Object.keys(strings).length;
  console.log(`  🔄 ${page} → ${lang} (${count} strings)`);

  const translated = await translateStrings(strings, lang, glossary);
  const result = apply(source, '', translated);

  const outPath = path.join(PAGES_DIR, lang, `${page}.yaml`);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, yaml.dump(result, { lineWidth: 120, noRefs: true }), 'utf-8');
  console.log(`  ✅ ${path.relative(process.cwd(), outPath)}`);
}

function showStatus() {
  const pages = listPages();
  console.log('\n📊 Locale files\n');
  for (const page of pages) {
    const have = [SOURCE_LOCALE, ...TARGET_LOCALES].filter((l) =>
      fs.existsSync(path.join(PAGES_DIR, l, `${page}.yaml`))
    );
    console.log(`   ${page.padEnd(10)} ${have.join(', ')}`);
  }
  console.log('');
}

async function main() {
  if (flags.status || args.includes('status')) return showStatus();

  const glossary = loadGlossary();
  const pages = flags.page ? [flags.page] : listPages();
  const langs = flags.lang ? [flags.lang] : TARGET_LOCALES;

  console.log(`\n🌍 EvolverAI Translation Engine (${MODEL})`);
  console.log(`   Pages: ${pages.join(', ')}   Locales: ${langs.join(', ')}\n`);

  for (const page of pages) {
    for (const lang of langs) {
      await translatePage(page, lang, glossary);
    }
  }
  console.log('\nDone.\n');
}

main().catch((err) => {
  console.error('❌ Translation failed:', err.message);
  process.exit(1);
});
