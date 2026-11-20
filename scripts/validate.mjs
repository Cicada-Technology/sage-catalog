import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const locales = ['en', 'zh', 'zh-TW', 'ja', 'ko', 'de', 'fr', 'es', 'pt-BR', 'ru', 'ar', 'hi-IN', 'bn', 'id', 'bo'];
const skillCategories = new Set(['admin', 'finance', 'legal', 'docs', 'dev', 'design', 'other']);
const pluginCategories = new Set(['dev', 'productivity', 'integration', 'appearance', 'other']);
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

function checkI18n(dir, ids, label) {
  for (const locale of locales) {
    const file = `${dir}/i18n/${locale}.json`;
    const data = readJson(file);
    if (!data || typeof data !== 'object' || Array.isArray(data)) continue;
    let translated = 0;
    for (const [id, value] of Object.entries(data)) {
      if (!ids.has(id)) errors.push(`${file}: unknown id ${id}`);
      if (!value || typeof value.name !== 'string' || typeof value.description !== 'string') {
        errors.push(`${file}: ${id} must have string name/description`);
      } else if (value.name.trim()) {
        translated += 1;
      }
    }
    if (translated < ids.size) warnings.push(`${file}: ${translated}/${ids.size} ${label} names translated`);
    console.log(`${label} ${locale}: ${translated}/${ids.size}`);
  }
}

// ===== skills =====
const catalog = readJson('skills/skills.json');
const skills = catalog?.skills;
if (!catalog || !Array.isArray(skills)) {
  errors.push('skills/skills.json: missing skills array');
} else {
  const ids = new Set();
  for (const [index, skill] of skills.entries()) {
    const where = `skills[${index}]`;
    for (const key of ['id', 'owner', 'repo', 'branch', 'path', 'url', 'category']) {
      if (typeof skill?.[key] !== 'string' || !skill[key].trim()) errors.push(`${where}: missing ${key}`);
    }
    if (typeof skill?.category === 'string' && !skillCategories.has(skill.category)) {
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
  checkI18n('skills', ids, 'skill');
  console.log(`ok: ${skills.length} skills`);
}

// ===== mcp =====
const mcpFile = readJson('mcp/mcp.json');
const mcpEntries = mcpFile?.entries;
if (!mcpFile || !Array.isArray(mcpEntries)) {
  errors.push('mcp/mcp.json: missing entries array');
} else {
  const ids = new Set();
  for (const [index, entry] of mcpEntries.entries()) {
    const where = `mcp[${index}]`;
    for (const key of ['id', 'serverName', 'category', 'transport', 'repo', 'docs']) {
      if (typeof entry?.[key] !== 'string' || !entry[key].trim()) errors.push(`${where}: missing ${key}`);
    }
    if (entry?.transport === 'stdio' && typeof entry.command !== 'string') errors.push(`${where}: stdio requires command`);
    if (entry?.transport === 'http' && typeof entry.url !== 'string') errors.push(`${where}: http requires url`);
    if (typeof entry?.id === 'string') {
      if (ids.has(entry.id)) errors.push(`${where}: duplicate id ${entry.id}`);
      ids.add(entry.id);
    }
  }
  checkI18n('mcp', ids, 'mcp');
  console.log(`ok: ${mcpEntries.length} mcp`);
}

// ===== plugins =====
const pluginFile = readJson('plugins/plugins.json');
const pluginEntries = pluginFile?.entries;
if (!pluginFile || !Array.isArray(pluginEntries)) {
  errors.push('plugins/plugins.json: missing entries array');
} else {
  const ids = new Set();
  for (const [index, entry] of pluginEntries.entries()) {
    const where = `plugins[${index}]`;
    for (const key of ['id', 'repo', 'indexId', 'category']) {
      if (typeof entry?.[key] !== 'string' || !entry[key].trim()) errors.push(`${where}: missing ${key}`);
    }
    if (typeof entry?.category === 'string' && !pluginCategories.has(entry.category)) {
      errors.push(`${where}: unknown category ${entry.category}`);
    }
    if (typeof entry?.id === 'string') {
      if (ids.has(entry.id)) errors.push(`${where}: duplicate id ${entry.id}`);
      ids.add(entry.id);
    }
  }
  checkI18n('plugins', ids, 'plugin');
  console.log(`ok: ${pluginEntries.length} plugins`);

  const indexFile = readJson('plugins/index.json');
  const indexPlugins = indexFile?.plugins;
  if (!indexFile || indexFile.schemaVersion !== 1 || !Array.isArray(indexPlugins)) {
    errors.push('plugins/index.json: expected schemaVersion 1 and a plugins array');
  } else {
    const indexIds = new Set();
    for (const [i, plugin] of indexPlugins.entries()) {
      const where = `plugins/index.json[${i}]`;
      if (typeof plugin?.id !== 'string' || !plugin.id) errors.push(`${where}: missing id`);
      if (typeof plugin?.repo !== 'string' || !plugin.repo) errors.push(`${where}: missing repo`);
      if (!Array.isArray(plugin?.versions) || plugin.versions.length === 0) {
        errors.push(`${where}: missing versions`);
        continue;
      }
      if (indexIds.has(plugin.id)) errors.push(`${where}: duplicate id ${plugin.id}`);
      indexIds.add(plugin.id);
      for (const [j, version] of plugin.versions.entries()) {
        const vwhere = `${where}.versions[${j}]`;
        if (!/^\d+\.\d+\.\d+$/.test(version?.version ?? '')) errors.push(`${vwhere}: bad version`);
        const hasFiles = version?.files && Object.keys(version.files).length > 0;
        const hasArchive = typeof version?.archive === 'string' && typeof version?.archiveSha256 === 'string';
        if (!hasFiles && !hasArchive) errors.push(`${vwhere}: needs files or archive+archiveSha256`);
      }
    }
    for (const id of ids) if (!indexIds.has(id)) errors.push(`plugins/index.json: missing ${id}`);
    console.log(`ok: ${indexPlugins.length} plugin index entries`);
  }
}

for (const warning of warnings) console.warn(`warn: ${warning}`);
for (const error of errors) console.error(`error: ${error}`);
if (errors.length) process.exit(1);
console.log('catalog ok');
