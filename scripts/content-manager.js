#!/usr/bin/env node
/**
 * EvolverAI Content Manager CLI
 *
 * Usage:
 *   npm run content status
 *   npm run content validate
 *   npm run content add-language <code> <name> <flag>
 *   npm run content add-page <page-id>
 *   npm run content add-section <page> <section-id> <type>
 *   npm run content edit <page> <section-id>
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { createInterface } from 'node:readline';
import yaml from 'js-yaml';

const ROOT             = path.resolve('.');
const MASTER_DIR       = path.join(ROOT, 'src/content/master');
const LAYOUT_DIR       = path.join(ROOT, 'src/content/layout');
const TRANSLATIONS_DIR = path.join(ROOT, 'src/content/translations');
const META_PATH        = path.join(TRANSLATIONS_DIR, '.meta.json');

// ── Helpers ──────────────────────────────────────────────────────────────────

function readYaml(p) {
  try { return yaml.load(fs.readFileSync(p, 'utf-8')) || {}; }
  catch { return null; }
}

function writeYaml(p, data) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, yaml.dump(data, { lineWidth: 120, noRefs: true }));
}

function readMeta() {
  try { return JSON.parse(fs.readFileSync(META_PATH, 'utf-8')); }
  catch { return { languages: {}, translations: {} }; }
}

function writeMeta(meta) {
  fs.writeFileSync(META_PATH, JSON.stringify(meta, null, 2));
}

function getPages() {
  return fs.readdirSync(MASTER_DIR).filter(f => f.endsWith('.yaml')).map(f => f.replace('.yaml', ''));
}

function getLanguages() {
  const meta = readMeta();
  return [{ code: 'en', name: 'English', flag: '🇺🇸' },
    ...Object.entries(meta.languages).map(([code, d]) => ({ code, name: d.name, flag: d.flag }))];
}

function prompt(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans.trim()); }));
}

function ok(msg)   { console.log(`  ✅ ${msg}`); }
function info(msg) { console.log(`  ℹ  ${msg}`); }
function err(msg)  { console.error(`  ❌ ${msg}`); }

// ── Commands ──────────────────────────────────────────────────────────────────

function cmdStatus() {
  const meta  = readMeta();
  const pages = getPages();
  const langs = Object.keys(meta.languages);

  console.log('\n📊 Content Status\n');
  console.log(`  Pages:     ${pages.join(', ')}`);
  console.log(`  Languages: en (master)${langs.length ? ', ' + langs.join(', ') : ''}\n`);

  for (const page of pages) {
    const masterPath = path.join(MASTER_DIR, `${page}.yaml`);
    const masterStat = fs.statSync(masterPath);
    console.log(`  📄 ${page}`);

    for (const lang of langs) {
      const transPath = path.join(TRANSLATIONS_DIR, lang, `${page}.yaml`);
      const key       = `${lang}/${page}.yaml`;
      const entry     = meta.translations[key];

      if (!fs.existsSync(transPath)) {
        console.log(`     ${lang}: ❌ missing`);
      } else if (!entry) {
        console.log(`     ${lang}: ⚠️  no metadata`);
      } else {
        const translatedAt = new Date(entry.lastTranslated).getTime();
        const outdated     = masterStat.mtimeMs > translatedAt;
        const date         = new Date(entry.lastTranslated).toLocaleDateString();
        console.log(`     ${lang}: ${outdated ? '⚠️  outdated' : '✅ current'} (${date})`);
      }
    }
  }
  console.log('');
}

function cmdValidate() {
  try {
    execSync('node scripts/validate.js', { stdio: 'inherit', cwd: ROOT });
  } catch {
    process.exit(1);
  }
}

function cmdAddLanguage(code, name, flag = '🌐') {
  if (!code || !name) {
    err('Usage: npm run content add-language <code> <name> [flag]');
    err('Example: npm run content add-language es Español 🇪🇸');
    process.exit(1);
  }

  const meta = readMeta();
  if (meta.languages[code]) {
    err(`Language "${code}" already exists.`);
    process.exit(1);
  }

  meta.languages[code] = { name, flag };
  writeMeta(meta);

  const langDir = path.join(TRANSLATIONS_DIR, code);
  fs.mkdirSync(langDir, { recursive: true });

  ok(`Language "${name}" (${code}) added.`);
  info(`Run: npm run translate -- --lang=${code}`);
}

function cmdAddPage(pageId) {
  if (!pageId) {
    err('Usage: npm run content add-page <page-id>');
    err('Example: npm run content add-page hospitality');
    process.exit(1);
  }

  const masterPath = path.join(MASTER_DIR, `${pageId}.yaml`);
  const layoutPath = path.join(LAYOUT_DIR, `${pageId}.yaml`);

  if (fs.existsSync(masterPath)) {
    err(`Page "${pageId}" already exists.`);
    process.exit(1);
  }

  // Scaffold master content
  const masterContent = {
    about: {
      title: `${pageId.charAt(0).toUpperCase() + pageId.slice(1)} Page`,
      description: 'Add your page description here.',
    },
    footer: {
      title: "Let's talk, tell us about your needs",
      description: 'We are here to help you.',
      buttonText: 'Contact Us',
      copyright: 'All rights reserved',
      contact: { email_label: 'Email', phone_label: 'Phone', address_label: 'Address' },
    },
    meta: {
      title: `${pageId.charAt(0).toUpperCase() + pageId.slice(1)} | EvolverAI`,
      description: `EvolverAI ${pageId} page.`,
    },
  };

  // Scaffold layout
  const layoutContent = {
    page_sections: [
      { type: 'content_header', section_id: 'about', order: 1, background_image: '/img/evolverai-web-company-bg.jpg' },
      { type: 'content_header', section_id: 'contact', order: 99, background_image: '/img/evolverai-web-contact-bg.jpg' },
    ],
    defaults: { cards: { responsiveColumns: { mobile: 1, tablet: 2, desktop: 3 } } },
    section_config: {},
  };

  writeYaml(masterPath, masterContent);
  writeYaml(layoutPath, layoutContent);

  // Add to getStaticPaths — remind user
  ok(`Page "${pageId}" scaffolded.`);
  info(`Master:  src/content/master/${pageId}.yaml`);
  info(`Layout:  src/content/layout/${pageId}.yaml`);
  info(`Next: Add "${pageId}" to PAGES array in src/pages/[...slug].astro`);
  info(`Then: npm run translate -- --page=${pageId}`);
}

function cmdAddSection(pageId, sectionId, type = 'cards') {
  if (!pageId || !sectionId) {
    err('Usage: npm run content add-section <page> <section-id> [type]');
    err('Types: cards | content_header | product | hero | divider');
    err('Example: npm run content add-section home testimonials cards');
    process.exit(1);
  }

  const validTypes = ['cards', 'content_header', 'product', 'hero', 'divider'];
  if (!validTypes.includes(type)) {
    err(`Invalid type "${type}". Valid: ${validTypes.join(', ')}`);
    process.exit(1);
  }

  const masterPath = path.join(MASTER_DIR, `${pageId}.yaml`);
  const layoutPath = path.join(LAYOUT_DIR, `${pageId}.yaml`);

  if (!fs.existsSync(masterPath)) {
    err(`Page "${pageId}" not found. Run: npm run content add-page ${pageId}`);
    process.exit(1);
  }

  const master = readYaml(masterPath);
  const layout = readYaml(layoutPath);

  if (master[sectionId]) {
    err(`Section "${sectionId}" already exists in master/${pageId}.yaml`);
    process.exit(1);
  }

  // Add content stub to master
  const contentStubs = {
    cards: { title: `${sectionId} Title`, description: 'Section description.', cards: [{ title: 'Card 1', description: 'Card description.' }] },
    content_header: { title: `${sectionId} Title`, description: 'Section description.' },
    product: { subtitle: `${sectionId} Product`, description: 'Product description.', buttonText: 'Learn More' },
    hero: { title: 'Hero Title', subtitle: 'Hero subtitle.' },
    divider: {},
  };
  master[sectionId] = contentStubs[type];
  writeYaml(masterPath, master);

  // Add section to layout page_sections
  const sections = layout.page_sections || [];
  const maxOrder = sections.reduce((max, s) => Math.max(max, s.order || 0), 0);
  const newSection = { type, section_id: sectionId, order: maxOrder + 1 };
  if (type === 'content_header') newSection.background_image = '/img/evolverai-web-company-bg.jpg';
  sections.push(newSection);
  layout.page_sections = sections;
  writeYaml(layoutPath, layout);

  ok(`Section "${sectionId}" (${type}) added to "${pageId}".`);
  info(`Edit content: src/content/master/${pageId}.yaml → ${sectionId}`);
  info(`Edit layout:  src/content/layout/${pageId}.yaml → section_config.${sectionId}`);
  info(`Translate:    npm run translate -- --page=${pageId}`);
}

function cmdEdit(pageId, sectionId) {
  if (!pageId) {
    err('Usage: npm run content edit <page> [section-id]');
    process.exit(1);
  }

  const masterPath = path.join(MASTER_DIR, `${pageId}.yaml`);
  if (!fs.existsSync(masterPath)) {
    err(`Page "${pageId}" not found.`);
    process.exit(1);
  }

  // If section specified, extract it, open in editor, merge back
  const editor = process.env.EDITOR || process.env.VISUAL || 'nano';

  if (sectionId) {
    const master = readYaml(masterPath);
    if (!master[sectionId]) {
      err(`Section "${sectionId}" not found in master/${pageId}.yaml`);
      process.exit(1);
    }
    // Write section to temp file
    const tmpPath = path.join(ROOT, `.tmp-edit-${pageId}-${sectionId}.yaml`);
    writeYaml(tmpPath, { [sectionId]: master[sectionId] });
    try {
      execSync(`${editor} "${tmpPath}"`, { stdio: 'inherit' });
      const edited = readYaml(tmpPath);
      if (edited && edited[sectionId]) {
        master[sectionId] = edited[sectionId];
        writeYaml(masterPath, master);
        ok(`Section "${sectionId}" saved.`);
      }
    } finally {
      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    }
  } else {
    execSync(`${editor} "${masterPath}"`, { stdio: 'inherit' });
    ok(`Saved ${masterPath}`);
  }
}

// ── Router ────────────────────────────────────────────────────────────────────

const [,, command, ...args] = process.argv;

const HELP = `
EvolverAI Content Manager

Commands:
  status                              Show translation status for all pages
  validate                            Validate all content files
  add-language <code> <name> [flag]   Add a new language
  add-page <page-id>                  Scaffold a new page
  add-section <page> <id> [type]      Add a section to a page
  edit <page> [section-id]            Open content in \$EDITOR

Examples:
  npm run content status
  npm run content add-language es Español 🇪🇸
  npm run content add-page hospitality
  npm run content add-section home testimonials cards
  npm run content edit home hero
`;

switch (command) {
  case 'status':          cmdStatus(); break;
  case 'validate':        cmdValidate(); break;
  case 'add-language':    cmdAddLanguage(args[0], args[1], args[2]); break;
  case 'add-page':        cmdAddPage(args[0]); break;
  case 'add-section':     cmdAddSection(args[0], args[1], args[2]); break;
  case 'edit':            cmdEdit(args[0], args[1]); break;
  default:
    console.log(HELP);
    if (command && command !== '--help' && command !== 'help') {
      err(`Unknown command: "${command}"`);
      process.exit(1);
    }
}
