#!/usr/bin/env node
/**
 * EvolverAI Content Validator
 * Checks all master and translation YAML files for required fields,
 * structural integrity, and translation completeness.
 *
 * Usage:
 *   npm run validate              # validate everything
 *   npm run validate -- --strict  # fail on missing translations too
 */

import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

const ROOT             = path.resolve('.');
const MASTER_DIR       = path.join(ROOT, 'src/content/master');
const LAYOUT_DIR       = path.join(ROOT, 'src/content/layout');
const TRANSLATIONS_DIR = path.join(ROOT, 'src/content/translations');
const META_PATH        = path.join(TRANSLATIONS_DIR, '.meta.json');

const strict = process.argv.includes('--strict');
const errors   = [];
const warnings = [];

function err(msg)  { errors.push(`  ✗ ${msg}`); }
function warn(msg) { warnings.push(`  ⚠ ${msg}`); }

function loadYaml(filePath) {
  try {
    return yaml.load(fs.readFileSync(filePath, 'utf-8'));
  } catch (e) {
    err(`Cannot parse YAML: ${path.relative(ROOT, filePath)} — ${e.message}`);
    return null;
  }
}

function loadMeta() {
  try { return JSON.parse(fs.readFileSync(META_PATH, 'utf-8')); }
  catch { return { languages: {}, translations: {} }; }
}

// ── 1. Check master files exist and have required top-level keys ─────────────

const REQUIRED_SECTIONS = {
  home:    ['hero', 'about', 'services', 'footer', 'meta'],
  b2b:     ['about', 'footer', 'meta'],
  wfm:     ['about', 'overview', 'footer', 'meta'],
  elysia:  ['about', 'overview', 'footer', 'meta'],
  academy: ['about', 'overview', 'footer', 'meta'],
};

console.log('\n📋 Validating master content files...');
const masterFiles = fs.readdirSync(MASTER_DIR).filter(f => f.endsWith('.yaml'));

for (const file of masterFiles) {
  const pageId  = file.replace('.yaml', '');
  const content = loadYaml(path.join(MASTER_DIR, file));
  if (!content) continue;

  const required = REQUIRED_SECTIONS[pageId] || ['meta'];
  for (const section of required) {
    if (!content[section]) {
      err(`master/${file}: missing required section "${section}"`);
    }
  }

  // Check meta has title and description
  if (content.meta) {
    if (!content.meta.title)       err(`master/${file}: meta.title is empty`);
    if (!content.meta.description) err(`master/${file}: meta.description is empty`);
  }

  // Check footer has required fields
  if (content.footer) {
    if (!content.footer.title)      warn(`master/${file}: footer.title is empty`);
    if (!content.footer.buttonText) warn(`master/${file}: footer.buttonText is empty`);
  }

  console.log(`  ✓ master/${file}`);
}

// ── 2. Check layout files exist for every master file ────────────────────────

console.log('\n📐 Validating layout files...');
for (const file of masterFiles) {
  const layoutPath = path.join(LAYOUT_DIR, file);
  if (!fs.existsSync(layoutPath)) {
    err(`layout/${file}: missing (every master page needs a layout file)`);
    continue;
  }

  const layout = loadYaml(layoutPath);
  if (!layout) continue;

  if (!layout.page_sections || !Array.isArray(layout.page_sections)) {
    err(`layout/${file}: missing page_sections array`);
  } else if (layout.page_sections.length === 0) {
    warn(`layout/${file}: page_sections is empty`);
  } else {
    // Check each section has required fields
    for (const section of layout.page_sections) {
      if (!section.type)       err(`layout/${file}: section missing "type" field`);
      if (!section.section_id) err(`layout/${file}: section missing "section_id" field`);
      if (section.order === undefined) warn(`layout/${file}: section "${section.section_id}" missing "order"`);
    }
  }

  console.log(`  ✓ layout/${file}`);
}

// ── 3. Check translation files ───────────────────────────────────────────────

console.log('\n🌍 Validating translation files...');
const meta = loadMeta();
const languages = Object.keys(meta.languages);

for (const lang of languages) {
  const langDir = path.join(TRANSLATIONS_DIR, lang);
  if (!fs.existsSync(langDir)) {
    warn(`translations/${lang}/: directory missing`);
    continue;
  }

  for (const file of masterFiles) {
    const pageId    = file.replace('.yaml', '');
    const transPath = path.join(langDir, file);

    if (!fs.existsSync(transPath)) {
      const msg = `translations/${lang}/${file}: missing (run "npm run translate -- --lang=${lang} --page=${pageId}")`;
      strict ? err(msg) : warn(msg);
      continue;
    }

    const master = loadYaml(path.join(MASTER_DIR, file));
    const trans  = loadYaml(transPath);
    if (!master || !trans) continue;

    // Check top-level keys match master
    const masterKeys = Object.keys(master).filter(k => k !== 'meta');
    const transKeys  = Object.keys(trans).filter(k => k !== 'meta');
    const missing    = masterKeys.filter(k => !transKeys.includes(k));

    if (missing.length > 0) {
      const msg = `translations/${lang}/${file}: missing sections: ${missing.join(', ')}`;
      strict ? err(msg) : warn(msg);
    } else {
      console.log(`  ✓ translations/${lang}/${file}`);
    }
  }
}

// ── 4. Cross-reference layout section_ids against master content ──────────────────────

console.log('\n🔗 Cross-referencing layout section_ids with master content...');
for (const file of masterFiles) {
  const pageId = file.replace('.yaml', '');
  const layoutPath = path.join(LAYOUT_DIR, file);
  if (!fs.existsSync(layoutPath)) continue;

  const master = loadYaml(path.join(MASTER_DIR, file));
  const layout = loadYaml(layoutPath);
  if (!master || !layout?.page_sections) continue;

  const masterKeys = new Set(Object.keys(master));
  const seenIds = new Set();

  for (const section of layout.page_sections) {
    const sid = section.section_id;
    if (!sid) continue;

    // Check section_id exists in master
    if (!masterKeys.has(sid)) {
      err(`layout/${file}: section_id "${sid}" not found in master/${file}`);
    }

    // Check for duplicate section_ids
    if (seenIds.has(sid)) {
      err(`layout/${file}: duplicate section_id "${sid}"`);
    }
    seenIds.add(sid);

    // Check background_image path exists in public/
    if (section.background_image) {
      const imgPath = path.join(ROOT, 'public', section.background_image);
      if (!fs.existsSync(imgPath)) {
        warn(`layout/${file}: background_image "${section.background_image}" not found in public/`);
      }
    }
  }

  console.log(`  ✓ layout/${file} cross-referenced`);
}

// ── 5. Check blog post coverImage paths ─────────────────────────────────────────────────

const BLOG_DIR = path.join(ROOT, 'src/content/blog');
if (fs.existsSync(BLOG_DIR)) {
  console.log('\n📝 Checking blog post coverImage paths...');
  const blogFiles = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'));
  for (const file of blogFiles) {
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf-8');
    const m = raw.match(/^---[\s\S]*?---/);
    if (!m) continue;
    const coverMatch = m[0].match(/coverImage:\s*(.+)/);
    if (coverMatch) {
      const imgPath = coverMatch[1].trim().replace(/['"]*/g, '');
      const fullPath = path.join(ROOT, 'public', imgPath);
      if (!fs.existsSync(fullPath)) {
        warn(`blog/${file}: coverImage "${imgPath}" not found in public/`);
      }
    }
  }
  console.log(`  ✓ ${blogFiles.length} blog post(s) checked`);
}

// ── 6. Summary ───────────────────────────────────────────────────────────────

console.log('\n' + '─'.repeat(50));

if (warnings.length > 0) {
  console.log(`\n⚠️  ${warnings.length} warning(s):`);
  warnings.forEach(w => console.log(w));
}

if (errors.length > 0) {
  console.log(`\n❌ ${errors.length} error(s):`);
  errors.forEach(e => console.log(e));
  console.log('\nValidation failed. Fix errors before building.\n');
  process.exit(1);
} else {
  console.log(`\n✅ Validation passed${warnings.length > 0 ? ` (${warnings.length} warnings)` : ''}.\n`);
  process.exit(0);
}
