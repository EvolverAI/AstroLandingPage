#!/usr/bin/env node
/**
 * EvolverAI — Environment Variable Checker
 * Usage: npm run check-env
 * Validates that all required/recommended env vars are configured.
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('.');
const envPath = path.join(ROOT, '.env.local');

// Load .env.local into process.env
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
} else {
  console.warn('⚠️  .env.local not found — copy .env.example to .env.local and fill in your values.\n');
}

const checks = [
  {
    key: 'ADMIN_TOKEN',
    required: false,
    description: 'Admin API auth token (required in production)',
    validate: v => v && v !== 'your-secret-token-here' && v.length >= 16,
    hint: 'Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"',
  },
  {
    key: 'OPENAI_API_KEY',
    required: false,
    description: 'OpenAI API key (optional — needed for AI translation/copy)',
    validate: v => v && v.startsWith('sk-') && v !== 'sk-your-key-here',
    hint: 'Get one at https://platform.openai.com/api-keys',
  },
  {
    key: 'CONTACT_EMAIL',
    required: false,
    description: 'Contact form recipient email',
    validate: v => v && v.includes('@'),
    hint: 'e.g. info@evolverai.ch',
  },
  {
    key: 'RESEND_API_KEY',
    required: false,
    description: 'Resend.com API key (needed for contact form emails)',
    validate: v => v && v.startsWith('re_') && v !== 're_your-key-here',
    hint: 'Get one at https://resend.com',
  },
];

let ok = 0, warn = 0;

console.log('\n🔍 Checking environment variables...\n');

for (const check of checks) {
  const value = process.env[check.key];
  const valid = check.validate(value);

  if (valid) {
    console.log(`  ✅ ${check.key} — ${check.description}`);
    ok++;
  } else if (check.required) {
    console.log(`  ❌ ${check.key} — MISSING (required)\n     ${check.hint}`);
    warn++;
  } else {
    console.log(`  ⚠️  ${check.key} — not configured (optional)\n     ${check.hint}`);
    warn++;
  }
}

console.log(`\n${ok} configured, ${warn} missing/invalid.\n`);

const hasRequired = checks.filter(c => c.required && !c.validate(process.env[c.key]));
if (hasRequired.length > 0) {
  console.error('❌ Required variables missing. Fix them before deploying.\n');
  process.exit(1);
} else {
  console.log('✅ All required variables are set.\n');
  process.exit(0);
}
