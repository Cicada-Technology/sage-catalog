import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const locales = ['en', 'zh', 'zh-TW', 'ja', 'ko', 'de', 'fr', 'es', 'pt-BR', 'ru', 'ar', 'hi-IN', 'bn', 'id', 'bo'];
const categories = new Set(['admin', 'finance', 'legal', 'docs', 'dev', 'design', 'other']);
const errors = [];
const warnings = [];

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
  } catch (error) {
    errors.push(`${file}: ${error.message}`);
    return null;
  }
}

const catalog = readJson('skills.json');
const skills = catalog?.skills;
if (!catalog || !Array.isArray(skills)) {
  errors.push('skills.json: missing skills array');
} else {
  const ids = new Set();
  for (const [index, skill] of skills.entries()) {
    const where = `skills[${index}]`;
    for (const key of ['id', 'owner', 'repo', 'branch', 'path', 'url', 'category']) {
      if (typeof skill?.[key] !== 'string' || !skill[key].trim()) {
        errors.push(`${where}: missing ${key}`);
      }
    }
    if (typeof skill?.category === 'string' && !categories.has(skill.category)) {
      errors.push(`${where}: unknown category ${skill.category}`);
    }
    if (typeof skill?.id === 'string') {
      if (ids.has(skill.id)) errors.push(`${where}: duplicate id ${skill.id}`);
      ids.add(skill.id);
      if (!skill.id.startsWith(`${skill.owner}/${skill.repo}:`)) {
        errors.push(`${where}: id must start with ${skill.owner}/${skill.repo}:`);
      }
    }
    if (typeof skill?.url === 'string' && !/^https?:\/\//.test(skill.url)) {
      errors.push(`${where}: url must be http(s)`);
    }
    if (typeof skill?.path === 'string' && (skill.path.startsWith('/') || skill.path.includes('..'))) {
      errors.push(`${where}: unsafe path ${skill.path}`);
    }
  }
  const known = new Set(skills.map((skill) => skill.id));
  for (const locale of locales) {
    const file = `i18n/${locale}.json`;
    const data = readJson(file);
    if (!data || typeof data !== 'object' || Array.isArray(data)) continue;
    let translated = 0;
    for (const [id, value] of Object.entries(data)) {
      if (!known.has(id)) errors.push(`${file}: unknown id ${id}`);
      if (!value || typeof value.name !== 'string' || typeof value.description !== 'string') {
        errors.push(`${file}: ${id} must have string name/description`);
      } else if (value.name.trim()) {
        translated += 1;
      }
    }
    if (translated < skills.length) warnings.push(`${file}: ${translated}/${skills.length} names translated`);
    console.log(`${locale}: ${translated}/${skills.length}`);
  }
}

for (const warning of warnings) console.warn(`warn: ${warning}`);
for (const error of errors) console.error(`error: ${error}`);
if (errors.length) process.exit(1);
console.log(`ok: ${skills?.length ?? 0} skills`);
