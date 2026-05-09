#!/usr/bin/env node
/**
 * Watch mode for translations.
 * Monitors src/content/master/ for changes and auto-translates
 * modified pages to all configured languages.
 *
 * Usage: npm run dev:translate
 * Requires OPENAI_API_KEY in .env.local
 */

import { watch } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';

const MASTER_DIR = path.resolve('src/content/master');

console.log('\n👁️  Watching master content for changes...');
console.log(`   Directory: ${MASTER_DIR}`);
console.log('   Press Ctrl+C to stop\n');

// Debounce map: pageId → timeout
const pending = new Map();

watch(MASTER_DIR, { recursive: false }, (event, filename) => {
  if (!filename?.endsWith('.yaml')) return;

  const pageId = filename.replace('.yaml', '');

  // Debounce — wait 1s after last change before translating
  if (pending.has(pageId)) clearTimeout(pending.get(pageId));

  pending.set(pageId, setTimeout(() => {
    pending.delete(pageId);
    console.log(`\n📝 Detected change in master/${filename}`);
    console.log(`   Translating ${pageId}...`);

    try {
      execSync(`node scripts/translate.js --page=${pageId}`, {
        stdio: 'inherit',
        cwd: path.resolve('.'),
      });
    } catch (err) {
      console.error(`   ❌ Translation failed: ${err.message}`);
    }
  }, 1000));
});
