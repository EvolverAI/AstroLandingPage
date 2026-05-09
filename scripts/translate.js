#!/usr/bin/env node
/**
 * EvolverAI Translation Engine
 * Uses OpenAI gpt-4o-mini to translate master content into target languages.
 * 
 * Usage:
 *   npm run translate                    # Translate all outdated content
 *   npm run translate -- --lang=it       # Translate only Italian
 *   npm run translate -- --page=home     # Translate only home page
 *   npm run translate:status             # Show translation status
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import yaml from 'js-yaml';

const MASTER_DIR = path.resolve('src/content/master');
const TRANSLATIONS_DIR = path.resolve('src/content/translations');
const META_PATH = path.join(TRANSLATIONS_DIR, '.meta.json');
const GLOSSARY_PATH = path.resolve('scripts/glossary.yaml');

const MODEL = 'gpt-4o-mini';

// Parse CLI args
const args = process.argv.slice(2);
const flags = {};
args.forEach(arg => {
  if (arg.startsWith('--')) {
    const [key, value] = arg.slice(2).split('=');
    flags[key] = value || true;
  }
});

// Load glossary
function loadGlossary() {
  try {
    return yaml.load(fs.readFileSync(GLOSSARY_PATH, 'utf-8'));
  } catch {
    return { brand_terms: [], technical_terms: [], translation_context: '' };
  }
}

// Load metadata
function loadMeta() {
  try {
    return JSON.parse(fs.readFileSync(META_PATH, 'utf-8'));
  } catch {
    return { languages: {}, translations: {} };
  }
}

// Save metadata
function saveMeta(meta) {
  fs.writeFileSync(META_PATH, JSON.stringify(meta, null, 2));
}

// Compute hash of file content
function fileHash(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return crypto.createHash('md5').update(content).digest('hex');
}

// Get all master pages
function getMasterPages() {
  return fs.readdirSync(MASTER_DIR)
    .filter(f => f.endsWith('.yaml'))
    .map(f => f.replace('.yaml', ''));
}

// Get target languages from meta
function getTargetLanguages(meta) {
  return Object.keys(meta.languages);
}

// Check if translation is outdated
function isOutdated(meta, pageId, language) {
  const key = `${language}/${pageId}.yaml`;
  const entry = meta.translations[key];
  if (!entry) return true;

  const masterPath = path.join(MASTER_DIR, `${pageId}.yaml`);
  const currentHash = fileHash(masterPath);
  return entry.sourceHash !== currentHash;
}

// Extract translatable strings from YAML content (flattened)
function extractStrings(obj, prefix = '') {
  const strings = {};

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'string') {
      strings[fullKey] = value;
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item === 'string') {
          strings[`${fullKey}[${index}]`] = item;
        } else if (typeof item === 'object' && item !== null) {
          Object.assign(strings, extractStrings(item, `${fullKey}[${index}]`));
        }
      });
    } else if (typeof value === 'object' && value !== null) {
      Object.assign(strings, extractStrings(value, fullKey));
    }
  }

  return strings;
}

// Call OpenAI API for translation
async function translateWithOpenAI(strings, targetLang, glossary) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY not set. Add it to .env.local');
    process.exit(1);
  }

  const langNames = { it: 'Italian', de: 'German', es: 'Spanish', fr: 'French', pt: 'Portuguese' };
  const targetLangName = langNames[targetLang] || targetLang;

  const systemPrompt = `You are a professional translator for a corporate technology website.
Translate the following JSON object values from English to ${targetLangName}.
Keep all JSON keys exactly as they are. Only translate the string values.

IMPORTANT RULES:
- Do NOT translate these brand terms: ${glossary.brand_terms.join(', ')}
- Do NOT translate these technical terms: ${glossary.technical_terms.join(', ')}
- The tone should be professional yet approachable
- Marketing copy should sound natural in ${targetLangName}, not like a literal translation
- ${glossary.translation_context}

Return ONLY valid JSON with the same structure.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
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

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

// Rebuild YAML structure from translated flat strings
function rebuildYaml(original, translatedStrings) {
  // Deep clone original
  const result = JSON.parse(JSON.stringify(original));

  function applyTranslations(obj, prefix = '') {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === 'string') {
        if (translatedStrings[fullKey]) {
          obj[key] = translatedStrings[fullKey];
        }
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (typeof item === 'string') {
            const arrayKey = `${fullKey}[${index}]`;
            if (translatedStrings[arrayKey]) {
              value[index] = translatedStrings[arrayKey];
            }
          } else if (typeof item === 'object' && item !== null) {
            applyTranslations(item, `${fullKey}[${index}]`);
          }
        });
      } else if (typeof value === 'object' && value !== null) {
        applyTranslations(value, fullKey);
      }
    }
  }

  applyTranslations(result);
  return result;
}

// Main translation function for a single page/language
async function translatePage(pageId, language, glossary, meta) {
  const masterPath = path.join(MASTER_DIR, `${pageId}.yaml`);
  const masterContent = yaml.load(fs.readFileSync(masterPath, 'utf-8'));

  console.log(`  🔄 Translating ${pageId} → ${language}...`);

  // Extract strings
  const strings = extractStrings(masterContent);
  const stringCount = Object.keys(strings).length;
  console.log(`     ${stringCount} strings to translate`);

  // Translate via OpenAI
  const translated = await translateWithOpenAI(strings, language, glossary);

  // Rebuild YAML structure
  const translatedContent = rebuildYaml(masterContent, translated);

  // Write translation file
  const outputDir = path.join(TRANSLATIONS_DIR, language);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, `${pageId}.yaml`);
  const yamlOutput = `# ${pageId} page content - ${meta.languages[language]?.name || language}\n# Auto-generated by translate.js — do not edit manually unless marking _manual: true\n\n${yaml.dump(translatedContent, { lineWidth: 100, noRefs: true })}`;
  fs.writeFileSync(outputPath, yamlOutput);

  // Update metadata
  const metaKey = `${language}/${pageId}.yaml`;
  meta.translations[metaKey] = {
    lastTranslated: new Date().toISOString(),
    sourceHash: fileHash(masterPath),
    status: 'current',
  };

  console.log(`  ✅ ${pageId}/${language} done (${stringCount} strings)`);
}

// Show translation status
function showStatus(meta) {
  const pages = getMasterPages();
  const languages = getTargetLanguages(meta);

  console.log('\n📊 Translation Status\n');
  console.log(`   Pages: ${pages.join(', ')}`);
  console.log(`   Languages: ${languages.join(', ')}\n`);

  for (const page of pages) {
    console.log(`   📄 ${page}:`);
    for (const lang of languages) {
      const outdated = isOutdated(meta, page, lang);
      const key = `${lang}/${page}.yaml`;
      const entry = meta.translations[key];
      const status = !entry ? '❌ missing' : outdated ? '⚠️  outdated' : '✅ current';
      const date = entry?.lastTranslated ? ` (${new Date(entry.lastTranslated).toLocaleDateString()})` : '';
      console.log(`      ${lang}: ${status}${date}`);
    }
  }
  console.log('');
}

// Main
async function main() {
  const meta = loadMeta();
  const glossary = loadGlossary();

  // Status mode
  if (flags.status || args.includes('status')) {
    showStatus(meta);
    return;
  }

  const pages = flags.page ? [flags.page] : getMasterPages();
  const languages = flags.lang ? [flags.lang] : getTargetLanguages(meta);

  if (languages.length === 0) {
    console.log('No target languages configured. Add languages to translations/.meta.json');
    return;
  }

  console.log(`\n🌍 EvolverAI Translation Engine (${MODEL})\n`);
  console.log(`   Pages: ${pages.join(', ')}`);
  console.log(`   Languages: ${languages.join(', ')}\n`);

  let translated = 0;
  let skipped = 0;

  for (const page of pages) {
    for (const lang of languages) {
      if (!isOutdated(meta, page, lang) && !flags.force) {
        skipped++;
        continue;
      }
      await translatePage(page, lang, glossary, meta);
      translated++;
    }
  }

  saveMeta(meta);

  console.log(`\n📊 Summary: ${translated} translated, ${skipped} already current\n`);
}

main().catch(err => {
  console.error('❌ Translation failed:', err.message);
  process.exit(1);
});
