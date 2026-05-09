/**
 * Content loader for the new master/layout/translations architecture.
 * Merges layout (structure) + content (master or translation) at build time.
 */
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml'; // Will need to add this dependency

const CONTENT_DIR = path.resolve('src/content');
const MASTER_DIR = path.join(CONTENT_DIR, 'master');
const LAYOUT_DIR = path.join(CONTENT_DIR, 'layout');
const TRANSLATIONS_DIR = path.join(CONTENT_DIR, 'translations');

const SUPPORTED_LANGUAGES = ['en', 'it', 'de'];
const DEFAULT_LANGUAGE = 'en';

/**
 * Load a YAML file and return parsed content
 */
function loadYaml(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return yaml.load(content);
  } catch (error) {
    console.warn(`Could not load ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Get layout config for a page
 */
export function getLayout(pageId) {
  return loadYaml(path.join(LAYOUT_DIR, `${pageId}.yaml`));
}

/**
 * Get content for a page in a specific language.
 * Falls back to English master if translation is missing.
 */
export function getContent(pageId, language = DEFAULT_LANGUAGE) {
  if (language === DEFAULT_LANGUAGE) {
    return loadYaml(path.join(MASTER_DIR, `${pageId}.yaml`));
  }

  // Try translation first
  const translationPath = path.join(TRANSLATIONS_DIR, language, `${pageId}.yaml`);
  const translation = loadYaml(translationPath);

  if (translation) {
    return translation;
  }

  // Fallback to English master
  console.warn(`No ${language} translation for ${pageId}, falling back to English`);
  return loadYaml(path.join(MASTER_DIR, `${pageId}.yaml`));
}

/**
 * Get merged page data: layout + content for a specific language.
 * This is the main function components should use.
 */
export function getPageData(pageId, language = DEFAULT_LANGUAGE) {
  const layout = getLayout(pageId);
  const content = getContent(pageId, language);

  if (!layout || !content) {
    console.error(`Missing layout or content for page: ${pageId}, lang: ${language}`);
    return null;
  }

  return {
    layout,
    content,
    language,
    pageId,
  };
}

/**
 * Get section content by ID from page content
 */
export function getSectionContent(content, sectionId) {
  return content?.[sectionId] || null;
}

/**
 * Get page sections (ordered) from layout
 */
export function getPageSections(layout) {
  const sections = layout?.page_sections || [];
  return sections.sort((a, b) => (a.order || 0) - (b.order || 0));
}

/**
 * Get section layout config (icons, responsive columns, etc.)
 */
export function getSectionConfig(layout, sectionId) {
  return layout?.section_config?.[sectionId] || {};
}

/**
 * Get default card styling from layout
 */
export function getDefaults(layout) {
  return layout?.defaults || {};
}

/**
 * Get all available languages with metadata
 */
export function getAvailableLanguages() {
  try {
    const metaPath = path.join(TRANSLATIONS_DIR, '.meta.json');
    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));

    const languages = [
      { code: 'en', name: 'English', flag: '🇺🇸' }
    ];

    for (const [code, data] of Object.entries(meta.languages)) {
      languages.push({ code, name: data.name, flag: data.flag });
    }

    return languages;
  } catch {
    return [{ code: 'en', name: 'English', flag: '🇺🇸' }];
  }
}

/**
 * Get all available pages
 */
export function getAvailablePages() {
  try {
    const files = fs.readdirSync(LAYOUT_DIR);
    return files
      .filter(f => f.endsWith('.yaml'))
      .map(f => f.replace('.yaml', ''));
  } catch {
    return ['home'];
  }
}

/**
 * Check if a translation exists for a page/language combo
 */
export function hasTranslation(pageId, language) {
  if (language === DEFAULT_LANGUAGE) return true;
  const filePath = path.join(TRANSLATIONS_DIR, language, `${pageId}.yaml`);
  return fs.existsSync(filePath);
}
