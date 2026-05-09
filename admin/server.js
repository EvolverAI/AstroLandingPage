/**
 * EvolverAI Admin Server
 * Local-only content editor at http://localhost:4322
 * Reads/writes YAML files, proxies OpenAI translations, runs git commands.
 */

import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { execSync, exec } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const MASTER_DIR = path.join(ROOT, 'src/content/master');
const LAYOUT_DIR = path.join(ROOT, 'src/content/layout');
const TRANSLATIONS_DIR = path.join(ROOT, 'src/content/translations');
const META_PATH = path.join(TRANSLATIONS_DIR, '.meta.json');
const GLOSSARY_PATH = path.join(ROOT, 'scripts/glossary.yaml');
const PORT = parseInt(process.env.PORT || '4322', 10);

// ─── Startup env validation ──────────────────────────────────────────────────

function loadEnvLocal() {
  const envPath = path.join(ROOT, '.env.local');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}
loadEnvLocal();

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || null;
if (!ADMIN_TOKEN) {
  console.warn('\n⚠️  ADMIN_TOKEN not set — admin API is unprotected. Set it in .env.local for security.\n');
}

const app = express();
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));
// Serve project images so the media library can display them (admin is at a different port)
app.use('/img', express.static(path.join(ROOT, 'public/img')));

// ─── Request logger (development) ──────────────────────────────────────────────────

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    const color = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';
    console.log(`${color}${req.method}\x1b[0m ${req.path} ${res.statusCode} ${ms}ms`);
  });
  next();
});

// ─── Auth middleware ───────────────────────────────────────────────────────────────

function authMiddleware(req, res, next) {
  // Skip auth if no token is configured (local dev convenience)
  if (!ADMIN_TOKEN) return next();
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace('Bearer ', '').trim();
  if (token === ADMIN_TOKEN) return next();
  res.status(401).json({ error: 'Unauthorized', code: 'INVALID_TOKEN' });
}

app.use('/api', authMiddleware);

// ─── Helpers ────────────────────────────────────────────────────────────────

function readYaml(filePath) {
  try {
    return yaml.load(fs.readFileSync(filePath, 'utf-8')) || {};
  } catch { return null; }
}

function writeYaml(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, yaml.dump(data, { lineWidth: 120, noRefs: true }));
}

function readMeta() {
  try { return JSON.parse(fs.readFileSync(META_PATH, 'utf-8')); }
  catch { return { languages: {}, translations: {} }; }
}

function writeMeta(meta) {
  fs.writeFileSync(META_PATH, JSON.stringify(meta, null, 2));
}

function getPages() {
  return fs.readdirSync(MASTER_DIR)
    .filter(f => f.endsWith('.yaml'))
    .map(f => f.replace('.yaml', ''));
}

function getLanguages() {
  const meta = readMeta();
  return [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    ...Object.entries(meta.languages).map(([code, d]) => ({ code, name: d.name, flag: d.flag }))
  ];
}

function getTranslationStatus() {
  const meta = readMeta();
  const pages = getPages();
  const langs = Object.keys(meta.languages);
  const status = {};

  for (const page of pages) {
    status[page] = { en: 'master' };
    const masterPath = path.join(MASTER_DIR, `${page}.yaml`);
    const masterStat = fs.existsSync(masterPath) ? fs.statSync(masterPath) : null;

    for (const lang of langs) {
      const key = `${lang}/${page}.yaml`;
      const entry = meta.translations[key];
      const filePath = path.join(TRANSLATIONS_DIR, lang, `${page}.yaml`);
      const exists = fs.existsSync(filePath);

      if (!exists) { status[page][lang] = 'missing'; continue; }
      if (!entry) { status[page][lang] = 'outdated'; continue; }

      // Compare file mod time vs meta timestamp
      const fileStat = fs.statSync(filePath);
      const masterModified = masterStat ? masterStat.mtimeMs : 0;
      const translatedAt = new Date(entry.lastTranslated).getTime();
      status[page][lang] = masterModified > translatedAt ? 'outdated' : 'current';
    }
  }
  return status;
}

// ─── API: Pages ─────────────────────────────────────────────────────────────

app.get('/api/pages', (req, res) => {
  res.json({ pages: getPages() });
});

app.get('/api/languages', (req, res) => {
  res.json({ languages: getLanguages() });
});

app.get('/api/status', (req, res) => {
  res.json({ status: getTranslationStatus(), languages: getLanguages(), pages: getPages() });
});

// ─── API: Content CRUD ───────────────────────────────────────────────────────

app.get('/api/content/:page', (req, res) => {
  const { page } = req.params;
  const { lang = 'en' } = req.query;

  let content;
  if (lang === 'en') {
    content = readYaml(path.join(MASTER_DIR, `${page}.yaml`));
  } else {
    const transPath = path.join(TRANSLATIONS_DIR, lang, `${page}.yaml`);
    content = fs.existsSync(transPath)
      ? readYaml(transPath)
      : readYaml(path.join(MASTER_DIR, `${page}.yaml`)); // fallback
  }

  const layout = readYaml(path.join(LAYOUT_DIR, `${page}.yaml`));

  if (!content) return res.status(404).json({ error: 'Page not found' });
  res.json({ content, layout });
});

app.put('/api/content/:page', (req, res) => {
  const { page } = req.params;
  const { lang = 'en', content } = req.body;

  if (!content) return res.status(400).json({ error: 'No content provided' });

  const filePath = lang === 'en'
    ? path.join(MASTER_DIR, `${page}.yaml`)
    : path.join(TRANSLATIONS_DIR, lang, `${page}.yaml`);

  writeYaml(filePath, content);

  // If saving a translation, update meta
  if (lang !== 'en') {
    const meta = readMeta();
    const key = `${lang}/${page}.yaml`;
    meta.translations[key] = {
      ...meta.translations[key],
      lastTranslated: new Date().toISOString(),
      status: 'current',
    };
    writeMeta(meta);
  }

  res.json({ ok: true });
});

// Save a single section within a page
app.put('/api/content/:page/section/:section', (req, res) => {
  const { page, section } = req.params;
  const { lang = 'en', data } = req.body;

  const filePath = lang === 'en'
    ? path.join(MASTER_DIR, `${page}.yaml`)
    : path.join(TRANSLATIONS_DIR, lang, `${page}.yaml`);

  // Read existing, merge section, write back
  let existing = readYaml(filePath);
  if (!existing) {
    // If translation doesn't exist yet, start from master
    existing = readYaml(path.join(MASTER_DIR, `${page}.yaml`)) || {};
  }

  existing[section] = data;
  writeYaml(filePath, existing);

  // Append revision snapshot
  appendRevision(page, section, lang, JSON.stringify(data));

  if (lang !== 'en') {
    const meta = readMeta();
    const key = `${lang}/${page}.yaml`;
    meta.translations[key] = {
      ...meta.translations[key],
      lastTranslated: new Date().toISOString(),
      status: 'current',
    };
    writeMeta(meta);
  }

  res.json({ ok: true });
});

// ─── API: Translation ────────────────────────────────────────────────────────

app.post('/api/translate', async (req, res) => {
  const { page, lang, section } = req.body;

  // Load env from root .env.local
  const envPath = path.join(ROOT, '.env.local');
  let apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey && fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const match = envContent.match(/OPENAI_API_KEY=(.+)/);
    if (match) apiKey = match[1].trim();
  }

  if (!apiKey || apiKey === 'sk-your-key-here') {
    return res.status(400).json({ error: 'OPENAI_API_KEY not configured in .env.local' });
  }

  const masterContent = readYaml(path.join(MASTER_DIR, `${page}.yaml`));
  if (!masterContent) return res.status(404).json({ error: 'Master content not found' });

  const glossary = readYaml(GLOSSARY_PATH) || {};
  const langNames = { it: 'Italian', de: 'German', es: 'Spanish', fr: 'French', pt: 'Portuguese' };
  const targetLangName = langNames[lang] || lang;

  // Translate only the requested section, or the whole page
  const toTranslate = section ? { [section]: masterContent[section] } : masterContent;

  const systemPrompt = `You are a professional translator for a corporate technology website.
Translate the JSON values from English to ${targetLangName}.
Keep all JSON keys exactly as-is. Only translate string values.
Do NOT translate: ${[...(glossary.brand_terms || []), ...(glossary.technical_terms || [])].join(', ')}.
Tone: professional yet approachable. Sound natural in ${targetLangName}, not like a literal translation.
Return ONLY valid JSON with the same structure.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: JSON.stringify(toTranslate, null, 2) },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(500).json({ error: `OpenAI error: ${response.status} - ${err}` });
    }

    const data = await response.json();
    const translated = JSON.parse(data.choices[0].message.content);

    // Merge translated section(s) into existing translation file
    const transPath = path.join(TRANSLATIONS_DIR, lang, `${page}.yaml`);
    let existing = fs.existsSync(transPath) ? readYaml(transPath) : { ...masterContent };
    Object.assign(existing, translated);
    writeYaml(transPath, existing);

    // Update meta
    const meta = readMeta();
    const key = `${lang}/${page}.yaml`;
    meta.translations[key] = {
      lastTranslated: new Date().toISOString(),
      status: 'current',
    };
    writeMeta(meta);

    const usage = data.usage;
    res.json({ ok: true, translated, usage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── API: Language Management ────────────────────────────────────────────────

app.post('/api/languages', (req, res) => {
  const { code, name, flag } = req.body;
  if (!code || !name) return res.status(400).json({ error: 'code and name required' });

  const meta = readMeta();
  if (meta.languages[code]) return res.status(409).json({ error: 'Language already exists' });

  meta.languages[code] = { name, flag: flag || '🌐' };
  writeMeta(meta);

  // Create empty translation dir
  fs.mkdirSync(path.join(TRANSLATIONS_DIR, code), { recursive: true });

  res.json({ ok: true });
});

app.delete('/api/languages/:code', (req, res) => {
  const { code } = req.params;
  if (code === 'en') return res.status(400).json({ error: 'Cannot delete English' });

  const meta = readMeta();
  delete meta.languages[code];
  // Remove translation entries for this language
  for (const key of Object.keys(meta.translations)) {
    if (key.startsWith(`${code}/`)) delete meta.translations[key];
  }
  writeMeta(meta);

  // Remove translation files
  const langDir = path.join(TRANSLATIONS_DIR, code);
  if (fs.existsSync(langDir)) fs.rmSync(langDir, { recursive: true });

  res.json({ ok: true });
});

// ─── API: Git ────────────────────────────────────────────────────────────────

app.get('/api/git/status', (req, res) => {
  try {
    const status = execSync('git status --porcelain', { cwd: ROOT }).toString().trim();
    const branch = execSync('git branch --show-current', { cwd: ROOT }).toString().trim();
    const lines = status ? status.split('\n').map(l => ({ status: l.slice(0, 2).trim(), file: l.slice(3) })) : [];
    res.json({ branch, changes: lines, clean: lines.length === 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/git/commit', (req, res) => {
  const { message = 'Content update via admin editor' } = req.body;
  try {
    execSync('git add -A', { cwd: ROOT });
    execSync(`git commit -m "${message.replace(/"/g, "'")}"`, { cwd: ROOT });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/git/push', (req, res) => {
  exec('git push', { cwd: ROOT }, (err, stdout, stderr) => {
    if (err) return res.status(500).json({ error: stderr || err.message });
    res.json({ ok: true, output: stdout });
  });
});

// ─── Start ───────────────────────────────────────────────────────────────────

app.listen(PORT, 'localhost', () => {
  console.log(`\n🎛️  EvolverAI Admin Editor`);
  console.log(`   http://localhost:${PORT}\n`);
  console.log(`   Astro dev server should be running at http://localhost:4321`);
  console.log(`   Press Ctrl+C to stop\n`);
});

// ─── Global error handler ───────────────────────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err);
  res.status(500).json({ error: err.message || 'Internal server error', code: 'SERVER_ERROR' });
});

// Unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED REJECTION]', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err);
});

// ── API: AI Copy Suggestions ─────────────────────────────────────────────────

app.post('/api/suggest', async (req, res) => {
  const { text, tone = 'professional', context = '' } = req.body;
  if (!text) return res.status(400).json({ error: 'text is required' });

  let apiKey = process.env.OPENAI_API_KEY;
  const envPath = path.join(ROOT, '.env.local');
  if (!apiKey && fs.existsSync(envPath)) {
    const match = fs.readFileSync(envPath, 'utf-8').match(/OPENAI_API_KEY=(.+)/);
    if (match) apiKey = match[1].trim();
  }
  if (!apiKey || apiKey === 'sk-your-key-here') {
    return res.status(400).json({ error: 'OPENAI_API_KEY not configured in .env.local' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a professional copywriter for EvolverAI, a technology company specialising in AI solutions. 
Improve the provided marketing copy. Tone: ${tone}. ${context ? 'Context: ' + context : ''}
Return ONLY the improved text, no explanations, no quotes around it.`,
          },
          { role: 'user', content: text },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(500).json({ error: `OpenAI error: ${err}` });
    }

    const data = await response.json();
    res.json({ suggestion: data.choices[0].message.content.trim() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── API: Layout ─────────────────────────────────────────────────────────────

app.get('/api/layout/:page', (req, res) => {
  const layout = readYaml(path.join(LAYOUT_DIR, `${req.params.page}.yaml`));
  if (!layout) return res.status(404).json({ error: 'Layout not found' });
  res.json({ layout });
});

// ─── API: Card CRUD ──────────────────────────────────────────────────────────

// Add a card to a section
app.post('/api/content/:page/section/:section/cards', (req, res) => {
  const { page, section } = req.params;
  const { lang = 'en', card = {} } = req.body;

  const filePath = lang === 'en'
    ? path.join(MASTER_DIR, `${page}.yaml`)
    : path.join(TRANSLATIONS_DIR, lang, `${page}.yaml`);

  let content = readYaml(filePath) || readYaml(path.join(MASTER_DIR, `${page}.yaml`)) || {};
  if (!content[section]) content[section] = {};
  if (!Array.isArray(content[section].cards)) content[section].cards = [];

  const newCard = { title: 'New Card', description: 'Card description.', ...card };
  content[section].cards.push(newCard);
  writeYaml(filePath, content);

  // Also add a placeholder icon entry to layout
  const layoutPath = path.join(LAYOUT_DIR, `${page}.yaml`);
  const layout = readYaml(layoutPath) || {};
  if (!layout.section_config) layout.section_config = {};
  if (!layout.section_config[section]) layout.section_config[section] = {};
  if (!Array.isArray(layout.section_config[section].cards)) layout.section_config[section].cards = [];
  layout.section_config[section].cards.push({ icon: { type: 'star', alignment: 'top' } });
  writeYaml(layoutPath, layout);

  res.json({ ok: true, index: content[section].cards.length - 1 });
});

// Reorder two cards within a section (swap fromIndex ↔ toIndex)
app.put('/api/content/:page/section/:section/cards/reorder', (req, res) => {
  const { page, section } = req.params;
  const { lang = 'en', fromIndex, toIndex } = req.body;
  const from = parseInt(fromIndex);
  const to = parseInt(toIndex);

  const filePath = lang === 'en'
    ? path.join(MASTER_DIR, `${page}.yaml`)
    : path.join(TRANSLATIONS_DIR, lang, `${page}.yaml`);

  const content = readYaml(filePath);
  if (!Array.isArray(content?.[section]?.cards)) return res.status(404).json({ error: 'Cards not found' });

  const cards = content[section].cards;
  if (from < 0 || from >= cards.length || to < 0 || to >= cards.length) {
    return res.status(400).json({ error: 'Index out of bounds' });
  }
  [cards[from], cards[to]] = [cards[to], cards[from]];
  writeYaml(filePath, content);

  // Also swap layout entries
  const layoutPath = path.join(LAYOUT_DIR, `${page}.yaml`);
  const layout = readYaml(layoutPath) || {};
  const layoutCards = layout.section_config?.[section]?.cards;
  if (Array.isArray(layoutCards) && layoutCards[from] !== undefined && layoutCards[to] !== undefined) {
    [layoutCards[from], layoutCards[to]] = [layoutCards[to], layoutCards[from]];
    writeYaml(layoutPath, layout);
  }

  res.json({ ok: true });
});

// Delete a card from a section
app.delete('/api/content/:page/section/:section/cards/:index', (req, res) => {
  const { page, section, index } = req.params;
  const { lang = 'en' } = req.query;
  const idx = parseInt(index);

  const filePath = lang === 'en'
    ? path.join(MASTER_DIR, `${page}.yaml`)
    : path.join(TRANSLATIONS_DIR, lang, `${page}.yaml`);

  const content = readYaml(filePath);
  if (!content?.[section]?.cards) return res.status(404).json({ error: 'Cards not found' });

  content[section].cards.splice(idx, 1);
  writeYaml(filePath, content);

  // Also remove from layout
  const layoutPath = path.join(LAYOUT_DIR, `${page}.yaml`);
  const layout = readYaml(layoutPath) || {};
  if (Array.isArray(layout.section_config?.[section]?.cards)) {
    layout.section_config[section].cards.splice(idx, 1);
    writeYaml(layoutPath, layout);
  }

  res.json({ ok: true });
});

// ─── API: Section CRUD ───────────────────────────────────────────────────────

// Add a section to a page
app.post('/api/content/:page/sections', (req, res) => {
  const { page } = req.params;
  const { sectionId, type = 'cards', backgroundImage, logo, productImage, imagePosition = 'right', desktopColumns = 3, insertAfter } = req.body;

  if (!sectionId) return res.status(400).json({ error: 'sectionId required' });

  // Add content stub to master
  const masterPath = path.join(MASTER_DIR, `${page}.yaml`);
  const master = readYaml(masterPath) || {};
  if (master[sectionId]) return res.status(409).json({ error: `Section "${sectionId}" already exists` });

  const stubs = {
    cards: { title: `${sectionId} Title`, description: 'Section description.', cards: [{ title: 'Card 1', description: 'Description.' }] },
    content_header: { title: `${sectionId} Title`, description: 'Section description.' },
    product: { subtitle: `${sectionId} Product`, description: 'Product description.', buttonText: 'Learn More' },
    hero: { companyName: 'Evolver', companyNameHighlight: 'AI', title: 'Hero Title', subtitle: 'We believe in AI.', description: 'Your mission statement or key value proposition goes here.' },
    divider: {},
    blog: { title: 'Latest News & Insights', description: 'Thoughts, updates and stories from our team.', buttonText: 'Read all articles', maxPosts: 6 },
    testimonials: {
      title: 'What Our Clients Say',
      description: '',
      testimonials: [
        { quote: 'EvolverAI transformed how we work. Highly recommended.', name: 'Jane Smith', role: 'CEO', company: 'Acme Corp', rating: 5 },
      ],
    },
    faq: { title: 'FAQ', description: '', items: [{ question: 'Your question?', answer: 'Your answer.' }] },
    stats: { title: '', items: [{ value: '100+', label: 'Clients', prefix: '', suffix: '' }, { value: '5', label: 'Years', suffix: '+' }] },
    pricing: { title: 'Pricing', description: '', plans: [{ name: 'Starter', price: 'Free', features: ['Feature 1', 'Feature 2'], cta: 'Get Started', ctaUrl: '#' }, { name: 'Pro', price: '€49', period: 'mo', features: ['Everything in Starter', 'Priority support'], cta: 'Start Free Trial', ctaUrl: '#', highlighted: true, badge: 'Most Popular' }] },
    team: { title: 'Meet the Team', description: '', members: [{ name: 'Jane Smith', role: 'CEO', bio: 'Passionate about AI and building great products.' }] },
    cta_banner: { title: 'Ready to get started?', description: 'Join hundreds of companies already using EvolverAI.', primaryCta: 'Get Started', primaryCtaUrl: '#', secondaryCta: 'Learn More', secondaryCtaUrl: '#' },
    video: { title: '', description: '', videoUrl: '' },
    gallery: { title: '', description: '', images: [{ src: '/img/placeholder.jpg', alt: 'Image 1' }] },
    timeline: { title: 'Our Journey', items: [{ year: '2020', title: 'Founded', description: 'EvolverAI was born.' }, { year: '2023', title: 'Scale', description: 'Reached 100+ enterprise clients.' }] },
    logo_strip: { title: 'Trusted by industry leaders', logos: [{ src: '/img/logo-placeholder.svg', alt: 'Partner 1' }] },
  };
  master[sectionId] = stubs[type] || stubs.cards;
  writeYaml(masterPath, master);

  // Add to layout page_sections at the right position
  const layoutPath = path.join(LAYOUT_DIR, `${page}.yaml`);
  const layout = readYaml(layoutPath) || { page_sections: [] };
  if (!Array.isArray(layout.page_sections)) layout.page_sections = [];

  // Sort existing sections by order
  const sorted = [...layout.page_sections].sort((a, b) => (a.order || 0) - (b.order || 0));

  let newOrder;
  if (insertAfter === null) {
    // Insert at top: use min order - 1, or 0.5 if empty
    const minOrder = sorted.length > 0 ? (sorted[0].order || 1) : 1;
    newOrder = minOrder - 1;
  } else if (insertAfter) {
    // Insert after a specific section: midpoint between it and the next
    const idx = sorted.findIndex(s => s.section_id === insertAfter);
    if (idx !== -1 && idx < sorted.length - 1) {
      const orderA = sorted[idx].order || 0;
      const orderB = sorted[idx + 1].order || orderA + 2;
      newOrder = (orderA + orderB) / 2;
    } else {
      // insertAfter is the last section — append after it
      newOrder = (sorted[idx]?.order || 0) + 1;
    }
  } else {
    // Append at end
    newOrder = sorted.length > 0 ? (sorted[sorted.length - 1].order || 0) + 1 : 1;
  }

  const newSection = { type, section_id: sectionId, order: newOrder };
  if (backgroundImage) newSection.background_image = backgroundImage;
  if (logo) newSection.logo = logo;
  layout.page_sections.push(newSection);

  // For product sections, seed layout section_config with image + imagePosition
  if (type === 'product' && productImage) {
    if (!layout.section_config) layout.section_config = {};
    layout.section_config[sectionId] = {
      image: productImage,
      imagePosition: imagePosition,
    };
  }

  // For cards sections, seed layout section_config with responsiveColumns
  if (type === 'cards') {
    if (!layout.section_config) layout.section_config = {};
    layout.section_config[sectionId] = {
      responsiveColumns: { mobile: 1, tablet: 2, desktop: parseInt(desktopColumns) || 3 },
    };
  }

  writeYaml(layoutPath, layout);

  res.json({ ok: true });
});

// Duplicate a section within a page
app.post('/api/content/:page/sections/duplicate', (req, res) => {
  const { page } = req.params;
  const { sectionId } = req.body;
  if (!sectionId) return res.status(400).json({ error: 'sectionId required' });

  const newId = `${sectionId}_copy_${Date.now()}`;

  // Duplicate in master
  const masterPath = path.join(MASTER_DIR, `${page}.yaml`);
  const master = readYaml(masterPath);
  if (!master || !master[sectionId]) return res.status(404).json({ error: `Section "${sectionId}" not found` });
  master[newId] = JSON.parse(JSON.stringify(master[sectionId]));
  writeYaml(masterPath, master);

  // Duplicate in layout — insert right after source section
  const layoutPath = path.join(LAYOUT_DIR, `${page}.yaml`);
  const layout = readYaml(layoutPath) || {};
  if (!layout.page_sections) layout.page_sections = [];
  const srcIdx = layout.page_sections.findIndex(s => s.section_id === sectionId);
  const srcSection = srcIdx >= 0 ? layout.page_sections[srcIdx] : null;
  const newSection = {
    ...(srcSection ? JSON.parse(JSON.stringify(srcSection)) : { type: 'cards', order: 0 }),
    section_id: newId,
  };
  // Shift orders of sections after insertion point
  if (srcIdx >= 0) {
    const insertOrder = (srcSection.order || 0) + 1;
    newSection.order = insertOrder;
    layout.page_sections.forEach(s => {
      if (s.section_id !== sectionId && (s.order || 0) >= insertOrder) s.order += 1;
    });
    layout.page_sections.splice(srcIdx + 1, 0, newSection);
  } else {
    const maxOrder = Math.max(0, ...layout.page_sections.map(s => s.order || 0));
    newSection.order = maxOrder + 1;
    layout.page_sections.push(newSection);
  }
  // Duplicate section_config if it exists
  if (layout.section_config?.[sectionId]) {
    layout.section_config[newId] = JSON.parse(JSON.stringify(layout.section_config[sectionId]));
  }
  writeYaml(layoutPath, layout);

  // Duplicate in all translation files
  const meta = readMeta();
  for (const lang of Object.keys(meta.languages)) {
    const transPath = path.join(TRANSLATIONS_DIR, lang, `${page}.yaml`);
    if (fs.existsSync(transPath)) {
      const trans = readYaml(transPath);
      if (trans?.[sectionId]) {
        trans[newId] = JSON.parse(JSON.stringify(trans[sectionId]));
        writeYaml(transPath, trans);
      }
    }
  }

  res.json({ ok: true, newSectionId: newId });
});

// Delete a section from a page
app.delete('/api/content/:page/sections/:sectionId', (req, res) => {
  const { page, sectionId } = req.params;

  // Remove from master
  const masterPath = path.join(MASTER_DIR, `${page}.yaml`);
  const master = readYaml(masterPath);
  if (master) { delete master[sectionId]; writeYaml(masterPath, master); }

  // Remove from layout
  const layoutPath = path.join(LAYOUT_DIR, `${page}.yaml`);
  const layout = readYaml(layoutPath);
  if (layout?.page_sections) {
    layout.page_sections = layout.page_sections.filter(s => s.section_id !== sectionId);
    if (layout.section_config) delete layout.section_config[sectionId];
    writeYaml(layoutPath, layout);
  }

  // Remove from all translation files
  const meta = readMeta();
  for (const lang of Object.keys(meta.languages)) {
    const transPath = path.join(TRANSLATIONS_DIR, lang, `${page}.yaml`);
    if (fs.existsSync(transPath)) {
      const trans = readYaml(transPath);
      if (trans) { delete trans[sectionId]; writeYaml(transPath, trans); }
    }
  }

  res.json({ ok: true });
});

// ─── API: Page CRUD ──────────────────────────────────────────────────────────

// ─── API: Draft / Publish status ─────────────────────────────────────────────

app.put('/api/layout/:page/status', (req, res) => {
  const { page } = req.params;
  const { status } = req.body; // 'draft' | 'published'
  if (!['draft', 'published'].includes(status)) return res.status(400).json({ error: 'status must be draft or published' });
  const layoutPath = path.join(LAYOUT_DIR, `${page}.yaml`);
  const layout = readYaml(layoutPath);
  if (!layout) return res.status(404).json({ error: 'Layout not found' });
  layout.status = status;
  writeYaml(layoutPath, layout);
  res.json({ ok: true, status });
});

app.get('/api/layout/:page/status', (req, res) => {
  const layout = readYaml(path.join(LAYOUT_DIR, `${req.params.page}.yaml`));
  if (!layout) return res.status(404).json({ error: 'Layout not found' });
  res.json({ status: layout.status || 'published' });
});

// ─── API: Revision History ────────────────────────────────────────────────────

const REVISIONS_DIR = path.join(ROOT, 'src/content/.revisions');

app.get('/api/revisions/:page/:section', (req, res) => {
  const { page, section } = req.params;
  const revPath = path.join(REVISIONS_DIR, page, `${section}.json`);
  if (!fs.existsSync(revPath)) return res.json({ revisions: [] });
  try {
    const revisions = JSON.parse(fs.readFileSync(revPath, 'utf-8'));
    res.json({ revisions });
  } catch { res.json({ revisions: [] }); }
});

// Append a revision snapshot (called internally after section save)
function appendRevision(page, section, lang, snapshot) {
  const dir = path.join(REVISIONS_DIR, page);
  fs.mkdirSync(dir, { recursive: true });
  const revPath = path.join(dir, `${section}.json`);
  let revisions = [];
  try { revisions = JSON.parse(fs.readFileSync(revPath, 'utf-8')); } catch { /* new file */ }
  revisions.push({ timestamp: new Date().toISOString(), lang, snapshot });
  // Keep max 20 per section
  if (revisions.length > 20) revisions = revisions.slice(-20);
  fs.writeFileSync(revPath, JSON.stringify(revisions, null, 2));
}

// ─── API: Form Submissions ────────────────────────────────────────────────────

const SUBMISSIONS_DIR = path.join(ROOT, 'src/content/submissions');

app.get('/api/submissions', (req, res) => {
  fs.mkdirSync(SUBMISSIONS_DIR, { recursive: true });
  const files = fs.readdirSync(SUBMISSIONS_DIR).filter(f => f.endsWith('.json')).sort().reverse();
  const submissions = files.map(f => {
    try { return { id: f.replace('.json', ''), ...JSON.parse(fs.readFileSync(path.join(SUBMISSIONS_DIR, f), 'utf-8')) }; }
    catch { return null; }
  }).filter(Boolean);
  res.json({ submissions });
});

app.put('/api/submissions/:id/read', (req, res) => {
  const filePath = path.join(SUBMISSIONS_DIR, `${req.params.id}.json`);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Not found' });
  const sub = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  sub.read = true;
  fs.writeFileSync(filePath, JSON.stringify(sub, null, 2));
  res.json({ ok: true });
});

app.delete('/api/submissions/:id', (req, res) => {
  const filePath = path.join(SUBMISSIONS_DIR, `${req.params.id}.json`);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Not found' });
  fs.unlinkSync(filePath);
  res.json({ ok: true });
});

// ─── API: Design Settings ─────────────────────────────────────────────────────

const DESIGN_SETTINGS_PATH = path.join(ROOT, 'src/content/design-settings.json');

app.get('/api/design', (req, res) => {
  try {
    const settings = fs.existsSync(DESIGN_SETTINGS_PATH)
      ? JSON.parse(fs.readFileSync(DESIGN_SETTINGS_PATH, 'utf-8'))
      : {};
    res.json({ settings });
  } catch { res.json({ settings: {} }); }
});

app.put('/api/design', (req, res) => {
  const { settings } = req.body;
  if (!settings) return res.status(400).json({ error: 'settings required' });
  fs.mkdirSync(path.dirname(DESIGN_SETTINGS_PATH), { recursive: true });
  fs.writeFileSync(DESIGN_SETTINGS_PATH, JSON.stringify(settings, null, 2));
  res.json({ ok: true });
});

app.post('/api/pages', (req, res) => {
  const { pageId } = req.body;
  if (!pageId) return res.status(400).json({ error: 'pageId required' });

  const masterPath = path.join(MASTER_DIR, `${pageId}.yaml`);
  if (fs.existsSync(masterPath)) return res.status(409).json({ error: `Page "${pageId}" already exists` });

  const master = {
    about: { title: `${pageId.charAt(0).toUpperCase() + pageId.slice(1)}`, description: 'Page description.' },
    footer: { title: "Let's talk", description: 'Contact us.', buttonText: 'Get in Touch', copyright: 'All rights reserved', contact: { email_label: 'Email', phone_label: 'Phone', address_label: 'Address' } },
    meta: { title: `${pageId} | EvolverAI`, description: `EvolverAI ${pageId} page.` },
  };
  const layout = {
    page_sections: [
      { type: 'content_header', section_id: 'about', order: 1, background_image: '/img/evolverai-web-company-bg.jpg' },
      { type: 'content_header', section_id: 'contact', order: 99, background_image: '/img/evolverai-web-contact-bg.jpg' },
    ],
    defaults: { cards: { responsiveColumns: { mobile: 1, tablet: 2, desktop: 3 } } },
    section_config: {},
  };

  writeYaml(masterPath, master);
  writeYaml(path.join(LAYOUT_DIR, `${pageId}.yaml`), layout);

  res.json({ ok: true });
});

app.delete('/api/pages/:pageId', (req, res) => {
  const { pageId } = req.params;
  const protected_ = ['home'];
  if (protected_.includes(pageId)) return res.status(400).json({ error: `Cannot delete "${pageId}"` });

  const masterPath = path.join(MASTER_DIR, `${pageId}.yaml`);
  const layoutPath = path.join(LAYOUT_DIR, `${pageId}.yaml`);
  if (fs.existsSync(masterPath)) fs.unlinkSync(masterPath);
  if (fs.existsSync(layoutPath)) fs.unlinkSync(layoutPath);

  const meta = readMeta();
  for (const lang of Object.keys(meta.languages)) {
    const transPath = path.join(TRANSLATIONS_DIR, lang, `${pageId}.yaml`);
    if (fs.existsSync(transPath)) fs.unlinkSync(transPath);
    delete meta.translations[`${lang}/${pageId}.yaml`];
  }
  writeMeta(meta);

  res.json({ ok: true });
});

// ─── API: Section Reorder ────────────────────────────────────────────────────

// Bulk reorder sections by providing the full ordered array of section IDs
app.post('/api/layout/:page/reorder-bulk', (req, res) => {
  const { page } = req.params;
  const { order } = req.body; // string[]
  if (!Array.isArray(order)) return res.status(400).json({ error: 'order must be an array' });

  const layoutPath = path.join(LAYOUT_DIR, `${page}.yaml`);
  const layout = readYaml(layoutPath);
  if (!layout?.page_sections) return res.status(404).json({ error: 'Layout not found' });

  // Reassign order values based on position in the provided array
  order.forEach((sectionId, idx) => {
    const s = layout.page_sections.find(p => p.section_id === sectionId);
    if (s) s.order = idx + 1;
  });

  writeYaml(layoutPath, layout);
  res.json({ ok: true });
});

// Move a section up or down by swapping its order with its neighbour
app.post('/api/layout/:page/reorder', (req, res) => {
  const { page } = req.params;
  const { sectionId, direction } = req.body; // direction: 'up' | 'down'

  const layoutPath = path.join(LAYOUT_DIR, `${page}.yaml`);
  const layout = readYaml(layoutPath);
  if (!layout?.page_sections) return res.status(404).json({ error: 'Layout not found' });

  // Sort by current order
  const sections = [...layout.page_sections].sort((a, b) => (a.order || 0) - (b.order || 0));
  const idx = sections.findIndex(s => s.section_id === sectionId);
  if (idx === -1) return res.status(404).json({ error: 'Section not found' });

  const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= sections.length) {
    return res.status(400).json({ error: 'Cannot move further' });
  }

  // Swap order values
  const orderA = sections[idx].order;
  const orderB = sections[swapIdx].order;

  // Find and update in original layout array
  const sA = layout.page_sections.find(s => s.section_id === sections[idx].section_id);
  const sB = layout.page_sections.find(s => s.section_id === sections[swapIdx].section_id);
  if (sA) sA.order = orderB;
  if (sB) sB.order = orderA;

  writeYaml(layoutPath, layout);
  res.json({ ok: true });
});

// ─── API: Card Icon (layout) ─────────────────────────────────────────────────

app.put('/api/layout/:page/card-icon', (req, res) => {
  const { page } = req.params;
  const { sectionId, cardIndex, patch } = req.body;

  const layoutPath = path.join(LAYOUT_DIR, `${page}.yaml`);
  const layout = readYaml(layoutPath) || {};

  if (!layout.section_config) layout.section_config = {};
  if (!layout.section_config[sectionId]) layout.section_config[sectionId] = {};
  if (!Array.isArray(layout.section_config[sectionId].cards)) {
    layout.section_config[sectionId].cards = [];
  }

  // Pad array if needed
  while (layout.section_config[sectionId].cards.length <= cardIndex) {
    layout.section_config[sectionId].cards.push({ icon: { type: '', alignment: 'top' } });
  }

  // If patch contains icon-specific keys, merge into .icon; otherwise merge at card root level
  const iconKeys = ['type', 'alignment', 'color'];
  const isIconPatch = Object.keys(patch).every(k => iconKeys.includes(k));
  if (isIconPatch) {
    const existing = layout.section_config[sectionId].cards[cardIndex].icon || {};
    layout.section_config[sectionId].cards[cardIndex].icon = { ...existing, ...patch };
  } else {
    // Root-level card layout props: linkUrl, buttonUrl, buttonColor
    Object.assign(layout.section_config[sectionId].cards[cardIndex], patch);
  }

  writeYaml(layoutPath, layout);
  res.json({ ok: true });
});

// ─── API: Card layout props (linkUrl, buttonUrl, buttonColor, icon) ───────────
// The existing /api/layout/:page/card-icon already handles icon patches.
// We reuse it for all card-level layout props (linkUrl, buttonUrl, buttonColor).
// The endpoint merges the patch object into layout.section_config[sectionId].cards[cardIndex].
// No additional endpoint needed — the existing one is generic enough.

// ─── API: Section layout config ──────────────────────────────────────────────

// Read/write layout config for a specific section (image, imagePosition, responsiveColumns, buttonUrl, buttonColor)
app.get('/api/layout/:page/section/:sectionId', (req, res) => {
  const { page, sectionId } = req.params;
  const layout = readYaml(path.join(LAYOUT_DIR, `${page}.yaml`)) || {};
  const section = layout.page_sections?.find(s => s.section_id === sectionId) || {};
  const sectionConfig = layout.section_config?.[sectionId] || {};
  res.json({ section, sectionConfig });
});

app.put('/api/layout/:page/section/:sectionId', (req, res) => {
  const { page, sectionId } = req.params;
  const { sectionPatch = {}, configPatch = {} } = req.body;

  const layoutPath = path.join(LAYOUT_DIR, `${page}.yaml`);
  const layout = readYaml(layoutPath) || {};

  // Update page_sections entry
  if (Object.keys(sectionPatch).length > 0) {
    const idx = layout.page_sections?.findIndex(s => s.section_id === sectionId);
    if (idx !== undefined && idx !== -1) {
      Object.assign(layout.page_sections[idx], sectionPatch);
    }
  }

  // Update section_config entry
  if (Object.keys(configPatch).length > 0) {
    if (!layout.section_config) layout.section_config = {};
    if (!layout.section_config[sectionId]) layout.section_config[sectionId] = {};
    // Deep merge for responsiveColumns
    for (const [k, v] of Object.entries(configPatch)) {
      if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
        layout.section_config[sectionId][k] = { ...(layout.section_config[sectionId][k] || {}), ...v };
      } else {
        layout.section_config[sectionId][k] = v;
      }
    }
  }

  writeYaml(layoutPath, layout);
  res.json({ ok: true });
});

// ─── API: Image browser ───────────────────────────────────────────────────────

const FOCAL_POINTS_PATH = path.join(ROOT, 'public/img/.focal-points.json');
function readFocalPoints() {
  try { return JSON.parse(fs.readFileSync(FOCAL_POINTS_PATH, 'utf-8')); } catch { return {}; }
}
function writeFocalPoints(data) {
  fs.writeFileSync(FOCAL_POINTS_PATH, JSON.stringify(data, null, 2));
}

/** Recursively scan a directory for image files, skipping `icons/` subfolders */
function scanImages(dir, relBase) {
  const results = [];
  try {
    for (const entry of fs.readdirSync(dir)) {
      if (entry === 'icons') continue;
      if (entry.startsWith('.')) continue; // skip dotfiles like .focal-points.json
      const fullPath = path.join(dir, entry);
      const relPath = relBase ? `${relBase}/${entry}` : entry;
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        results.push(...scanImages(fullPath, relPath));
      } else if (/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i.test(entry)) {
        results.push({ path: `/${relPath}`, name: entry, folder: relBase === 'img' ? '' : relBase.replace(/^img\/?/, '') });
      }
    }
  } catch { /* non-fatal */ }
  return results;
}

app.get('/api/images', (req, res) => {
  const imgDir = path.join(ROOT, 'public/img');
  const focalPoints = readFocalPoints();
  const images = scanImages(imgDir, 'img').map(img => ({
    ...img,
    focalX: focalPoints[img.path]?.x ?? 50,
    focalY: focalPoints[img.path]?.y ?? 50,
  }));
  res.json({ images });
});

app.post('/api/images/upload', (req, res) => {
  const { filename, data, mimeType } = req.body || {};
  if (!filename || !data) return res.status(400).json({ error: 'filename and data are required' });

  const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif', 'image/svg+xml']);
  const ALLOWED_EXT = /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i;

  // Sanitise filename — strip path traversal, allow only safe chars
  const safeName = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_');
  if (!ALLOWED_EXT.test(safeName)) return res.status(400).json({ error: 'Invalid file type. Allowed: jpg, png, gif, webp, avif, svg' });
  if (mimeType && !ALLOWED_TYPES.has(mimeType)) return res.status(400).json({ error: 'Invalid MIME type' });

  // Decode base64 data-URL  
  const base64Data = data.replace(/^data:[^;]+;base64,/, '');
  const buf = Buffer.from(base64Data, 'base64');
  if (buf.length > 15 * 1024 * 1024) return res.status(400).json({ error: 'File too large (max 15 MB)' });

  const imgDir = path.join(ROOT, 'public/img');
  fs.mkdirSync(imgDir, { recursive: true });

  // Prevent path traversal by verifying the resolved path stays inside imgDir
  const destPath = path.resolve(imgDir, safeName);
  if (!destPath.startsWith(imgDir + path.sep) && destPath !== imgDir) {
    return res.status(400).json({ error: 'Invalid path' });
  }

  fs.writeFileSync(destPath, buf);
  res.json({ ok: true, path: `/img/${safeName}` });
});

app.delete('/api/images/:filename', (req, res) => {
  const safeName = path.basename(req.params.filename).replace(/[^a-zA-Z0-9._-]/g, '_');
  const imgDir = path.join(ROOT, 'public/img');
  const destPath = path.resolve(imgDir, safeName);
  if (!destPath.startsWith(imgDir + path.sep)) return res.status(400).json({ error: 'Invalid path' });
  if (!fs.existsSync(destPath)) return res.status(404).json({ error: 'File not found' });

  // Refuse to delete if referenced in any layout YAML
  const imagePath = `/img/${safeName}`;
  const layoutFiles = fs.readdirSync(LAYOUT_DIR).filter(f => f.endsWith('.yaml'));
  for (const lf of layoutFiles) {
    const raw = fs.readFileSync(path.join(LAYOUT_DIR, lf), 'utf-8');
    if (raw.includes(imagePath)) {
      return res.status(409).json({ error: `Image is referenced in layout/${lf} — remove the reference first` });
    }
  }

  fs.unlinkSync(destPath);
  // Clean up focal point entry
  const fp = readFocalPoints();
  delete fp[imagePath];
  writeFocalPoints(fp);
  res.json({ ok: true });
});

// Rename image (updates all YAML references)
app.post('/api/images/rename', (req, res) => {
  const { oldPath, newName } = req.body || {};
  if (!oldPath || !newName) return res.status(400).json({ error: 'oldPath and newName required' });
  const ALLOWED_EXT = /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i;
  const safeName = path.basename(newName).replace(/[^a-zA-Z0-9._-]/g, '_');
  if (!ALLOWED_EXT.test(safeName)) return res.status(400).json({ error: 'Invalid file extension' });

  const imgDir = path.join(ROOT, 'public/img');
  const oldRel = oldPath.replace(/^\/img\//, '');
  const oldFolder = path.dirname(oldRel);
  const newRel = oldFolder === '.' ? safeName : `${oldFolder}/${safeName}`;
  const srcPath = path.resolve(imgDir, oldRel);
  const destPath = path.resolve(imgDir, newRel);
  if (!srcPath.startsWith(imgDir + path.sep)) return res.status(400).json({ error: 'Invalid path' });
  if (!fs.existsSync(srcPath)) return res.status(404).json({ error: 'File not found' });
  if (fs.existsSync(destPath)) return res.status(409).json({ error: 'A file with that name already exists' });

  fs.renameSync(srcPath, destPath);
  const newImgPath = `/img/${newRel}`;

  // Update all YAML references
  const allYaml = [
    ...fs.readdirSync(LAYOUT_DIR).filter(f => f.endsWith('.yaml')).map(f => path.join(LAYOUT_DIR, f)),
    ...fs.readdirSync(MASTER_DIR).filter(f => f.endsWith('.yaml')).map(f => path.join(MASTER_DIR, f)),
  ];
  for (const yf of allYaml) {
    const raw = fs.readFileSync(yf, 'utf-8');
    if (raw.includes(oldPath)) fs.writeFileSync(yf, raw.split(oldPath).join(newImgPath));
  }

  // Update focal points key
  const fp = readFocalPoints();
  if (fp[oldPath]) { fp[newImgPath] = fp[oldPath]; delete fp[oldPath]; writeFocalPoints(fp); }

  res.json({ ok: true, path: newImgPath });
});

// Move image to a different subfolder
app.post('/api/images/move', (req, res) => {
  const { imgPath, targetFolder } = req.body || {};
  if (!imgPath) return res.status(400).json({ error: 'imgPath required' });

  const imgDir = path.join(ROOT, 'public/img');
  const oldRel = imgPath.replace(/^\/img\//, '');
  const filename = path.basename(oldRel);
  const safeFolder = (targetFolder || '').replace(/[^a-zA-Z0-9/_-]/g, '').replace(/^\/+|\/$/, '');
  const newRel = safeFolder ? `${safeFolder}/${filename}` : filename;
  const srcPath = path.resolve(imgDir, oldRel);
  const destPath = path.resolve(imgDir, newRel);
  if (!srcPath.startsWith(imgDir + path.sep)) return res.status(400).json({ error: 'Invalid path' });
  if (!destPath.startsWith(imgDir + path.sep)) return res.status(400).json({ error: 'Invalid target folder' });
  if (!fs.existsSync(srcPath)) return res.status(404).json({ error: 'File not found' });
  if (srcPath === destPath) return res.json({ ok: true, path: imgPath });
  if (fs.existsSync(destPath)) return res.status(409).json({ error: 'A file with that name already exists in the target folder' });

  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.renameSync(srcPath, destPath);
  const newImgPath = `/img/${newRel}`;

  // Update all YAML references
  const allYaml = [
    ...fs.readdirSync(LAYOUT_DIR).filter(f => f.endsWith('.yaml')).map(f => path.join(LAYOUT_DIR, f)),
    ...fs.readdirSync(MASTER_DIR).filter(f => f.endsWith('.yaml')).map(f => path.join(MASTER_DIR, f)),
  ];
  for (const yf of allYaml) {
    const raw = fs.readFileSync(yf, 'utf-8');
    if (raw.includes(imgPath)) fs.writeFileSync(yf, raw.split(imgPath).join(newImgPath));
  }

  // Update focal points key
  const fp = readFocalPoints();
  if (fp[imgPath]) { fp[newImgPath] = fp[imgPath]; delete fp[imgPath]; writeFocalPoints(fp); }

  res.json({ ok: true, path: newImgPath });
});

// Save focal point for an image
app.put('/api/images/focal-point', (req, res) => {
  const { imgPath, x, y } = req.body || {};
  if (!imgPath || x == null || y == null) return res.status(400).json({ error: 'imgPath, x, y required' });
  const fp = readFocalPoints();
  fp[imgPath] = { x: Math.round(Math.max(0, Math.min(100, x))), y: Math.round(Math.max(0, Math.min(100, y))) };
  writeFocalPoints(fp);
  res.json({ ok: true });
});

// ─── API: SEO Checker ────────────────────────────────────────────────────────

app.get('/api/seo/:page', (req, res) => {
  const page = req.params.page;
  const masterPath = path.join(MASTER_DIR, `${page}.yaml`);
  if (!fs.existsSync(masterPath)) return res.status(404).json({ error: 'Page not found' });

  const master = readYaml(masterPath) || {};
  const languages = getLanguages();
  const results = {};

  for (const lang of languages) {
    let content;
    if (lang.code === 'en') {
      content = master;
    } else {
      const transPath = path.join(TRANSLATIONS_DIR, lang.code, `${page}.yaml`);
      content = fs.existsSync(transPath) ? (readYaml(transPath) || {}) : null;
    }

    const meta = content?.meta || {};
    const title = meta.title || '';
    const description = meta.description || '';

    results[lang.code] = {
      lang: lang.code,
      flag: lang.flag,
      title,
      description,
      titleLength: title.length,
      descriptionLength: description.length,
      titleOk: title.length >= 30 && title.length <= 60,
      descriptionOk: description.length >= 120 && description.length <= 160,
      titleWarn: title.length === 0 ? 'Missing' : title.length < 30 ? 'Too short (< 30)' : title.length > 60 ? 'Too long (> 60)' : 'OK',
      descriptionWarn: description.length === 0 ? 'Missing' : description.length < 120 ? 'Too short (< 120)' : description.length > 160 ? 'Too long (> 160)' : 'OK',
    };
  }

  res.json({ page, results });
});

// ─── API: Blog Posts ─────────────────────────────────────────────────────────

// Newsletter Subscribe
const SUBSCRIBERS_PATH = path.join(ROOT, 'src/content/subscribers.json');

app.post('/api/subscribe', (req, res) => {
  const { email } = req.body || {};
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Valid email required', code: 'INVALID_EMAIL' });
  }
  let subs = [];
  try { subs = JSON.parse(fs.readFileSync(SUBSCRIBERS_PATH, 'utf-8')); } catch { /* new */ }
  if (!subs.includes(email)) {
    subs.push(email);
    fs.mkdirSync(path.dirname(SUBSCRIBERS_PATH), { recursive: true });
    fs.writeFileSync(SUBSCRIBERS_PATH, JSON.stringify(subs, null, 2));
  }
  res.json({ ok: true });
});

app.get('/api/subscribers', (req, res) => {
  try {
    const subs = fs.existsSync(SUBSCRIBERS_PATH) ? JSON.parse(fs.readFileSync(SUBSCRIBERS_PATH, 'utf-8')) : [];
    res.json({ subscribers: subs, count: subs.length });
  } catch { res.json({ subscribers: [], count: 0 }); }
});

const BLOG_DIR = path.join(ROOT, 'src/content/blog');

/** Parse frontmatter + body from markdown text */
function parseFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { frontmatter: {}, body: raw };
  try {
    return { frontmatter: yaml.load(m[1]) || {}, body: m[2] };
  } catch { return { frontmatter: {}, body: raw }; }
}

/** Serialize frontmatter + body back to markdown */
function serializeFrontmatter(fm, body) {
  return `---\n${yaml.dump(fm, { lineWidth: 120, noRefs: true }).trimEnd()}\n---\n${body}`;
}

/** Slugify a title to a safe filename */
function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'post';
}

// List all posts
app.get('/api/blog', (req, res) => {
  fs.mkdirSync(BLOG_DIR, { recursive: true });
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'));
  const posts = files.map(f => {
    const raw = fs.readFileSync(path.join(BLOG_DIR, f), 'utf-8');
    const { frontmatter, body } = parseFrontmatter(raw);
    return {
      slug: f.replace(/\.md$/, ''),
      title: frontmatter.title || f,
      date: frontmatter.date || null,
      author: frontmatter.author || '',
      excerpt: frontmatter.excerpt || '',
      coverImage: frontmatter.coverImage || '',
      tags: frontmatter.tags || [],
      featured: frontmatter.featured || false,
      lang: frontmatter.lang || 'en',
      bodyPreview: body.slice(0, 200),
    };
  });
  // Sort by date descending
  posts.sort((a, b) => (b.date > a.date ? 1 : -1));
  res.json({ posts });
});

// Get single post (full content)
app.get('/api/blog/:slug', (req, res) => {
  const slug = path.basename(req.params.slug).replace(/[^a-zA-Z0-9_-]/g, '');
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Post not found' });
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { frontmatter, body } = parseFrontmatter(raw);
  res.json({ slug, frontmatter, body });
});

// Create post
app.post('/api/blog', (req, res) => {
  const { title = 'New Post', date, author, excerpt, coverImage, tags, featured, lang, body } = req.body || {};
  fs.mkdirSync(BLOG_DIR, { recursive: true });

  let slug = slugify(title);
  // Ensure slug uniqueness
  let counter = 1;
  while (fs.existsSync(path.join(BLOG_DIR, `${slug}.md`))) {
    slug = `${slugify(title)}-${counter++}`;
  }
  const fm = {
    title,
    date: date ? new Date(date) : new Date(),
    author: author || 'EvolverAI Team',
    ...(excerpt ? { excerpt } : {}),
    ...(coverImage ? { coverImage } : {}),
    tags: tags || [],
    featured: featured || false,
    lang: lang || 'en',
  };
  fs.writeFileSync(path.join(BLOG_DIR, `${slug}.md`), serializeFrontmatter(fm, body || ''));
  res.json({ ok: true, slug });
});

// Update post (frontmatter + body)
app.put('/api/blog/:slug', (req, res) => {
  const slug = path.basename(req.params.slug).replace(/[^a-zA-Z0-9_-]/g, '');
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Post not found' });

  const { title, date, author, excerpt, coverImage, tags, featured, lang, body } = req.body || {};
  const current = parseFrontmatter(fs.readFileSync(filePath, 'utf-8'));
  const fm = {
    ...current.frontmatter,
    ...(title !== undefined ? { title } : {}),
    ...(date !== undefined ? { date: new Date(date) } : {}),
    ...(author !== undefined ? { author } : {}),
    ...(excerpt !== undefined ? { excerpt } : {}),
    ...(coverImage !== undefined ? { coverImage } : {}),
    ...(tags !== undefined ? { tags } : {}),
    ...(featured !== undefined ? { featured } : {}),
    ...(lang !== undefined ? { lang } : {}),
  };
  fs.writeFileSync(filePath, serializeFrontmatter(fm, body !== undefined ? body : current.body));
  res.json({ ok: true, slug });
});

// Delete post
app.delete('/api/blog/:slug', (req, res) => {
  const slug = path.basename(req.params.slug).replace(/[^a-zA-Z0-9_-]/g, '');
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Post not found' });
  fs.unlinkSync(filePath);
  res.json({ ok: true });
});

