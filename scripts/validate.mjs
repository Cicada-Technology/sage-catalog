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


// ===== models =====
const modelsFile = readJson('models/index.json');
if (!modelsFile || modelsFile.schemaVersion !== 1 || !Array.isArray(modelsFile.models)) {
  errors.push('models/index.json: expected schemaVersion 1 and a models array');
} else {
  if (typeof modelsFile.runtime?.build !== 'string' || !modelsFile.runtime.build) {
    errors.push('models/index.json: runtime.build is required');
  }
  const modelIds = new Set();
  for (const [i, model] of modelsFile.models.entries()) {
    const where = `models/index.json[${i}]`;
    for (const key of ['id', 'displayName', 'family', 'license']) {
      if (typeof model?.[key] !== 'string' || !model[key].trim()) errors.push(`${where}: missing ${key}`);
    }
    if (typeof model?.id === 'string') {
      if (!/^[a-z0-9][a-z0-9._-]{0,159}$/.test(model.id)) errors.push(`${where}: unsafe id ${model.id}`);
      if (modelIds.has(model.id)) errors.push(`${where}: duplicate id ${model.id}`);
      modelIds.add(model.id);
    }
    if (model?.modelId !== undefined) {
      if (typeof model.modelId !== 'string' || !/^[a-z0-9][a-z0-9._-]{0,159}$/.test(model.modelId)) {
        errors.push(`${where}: unsafe modelId`);
      }
    }
    if (typeof model?.toolUse !== 'boolean') errors.push(`${where}: toolUse must be boolean`);
    if (!Number.isFinite(model?.quality)) errors.push(`${where}: quality must be a number`);
    if (!Number.isSafeInteger(model?.contextMax) || model.contextMax <= 0) errors.push(`${where}: bad contextMax`);
    if (!Number.isSafeInteger(model?.ctxDefault) || model.ctxDefault <= 0) errors.push(`${where}: bad ctxDefault`);
    if (model?.ctxMinAgent !== null && (!Number.isSafeInteger(model?.ctxMinAgent) || model.ctxMinAgent < 65536)) {
      errors.push(`${where}: ctxMinAgent must be null or at least 65536`);
    }
    const quant = model?.quant;
    for (const key of ['id', 'quant', 'filename', 'sha256', 'cacheType']) {
      if (typeof quant?.[key] !== 'string' || !quant[key].trim()) errors.push(`${where}.quant: missing ${key}`);
    }
    if (!Number.isSafeInteger(quant?.size) || quant.size <= 0) errors.push(`${where}.quant: bad size`);
    if (!/^[a-f0-9]{64}$/.test(quant?.sha256 ?? '')) errors.push(`${where}.quant: sha256 must be 64 lowercase hex`);
    if (!Number.isSafeInteger(quant?.kvBytesPerToken) || quant.kvBytesPerToken <= 0) errors.push(`${where}.quant: bad kvBytesPerToken`);
    if (typeof quant?.filename === 'string' && (quant.filename.includes('/') || quant.filename.includes('..'))) {
      errors.push(`${where}.quant: unsafe filename`);
    }
    if (quant?.files !== undefined) {
      if (!Array.isArray(quant.files) || quant.files.length === 0) {
        errors.push(`${where}.quant.files: must be a non-empty array when present`);
      } else {
        const filenames = new Set();
        for (const [j, file] of quant.files.entries()) {
          const fwhere = `${where}.quant.files[${j}]`;
          if (typeof file?.filename !== 'string' || !file.filename || file.filename.includes('/') || file.filename.includes('..')) {
            errors.push(`${fwhere}: unsafe filename`);
          } else if (filenames.has(file.filename)) {
            errors.push(`${fwhere}: duplicate filename ${file.filename}`);
          } else {
            filenames.add(file.filename);
          }
          if (!Number.isSafeInteger(file?.size) || file.size <= 0) errors.push(`${fwhere}: bad size`);
          if (!/^[a-f0-9]{64}$/.test(file?.sha256 ?? '')) errors.push(`${fwhere}: sha256 must be 64 lowercase hex`);
          if (file?.path !== undefined && (typeof file.path !== 'string' || !file.path || file.path.includes('..'))) {
            errors.push(`${fwhere}: unsafe path`);
          }
        }
      }
    }
    const sources = model?.sources ?? {};
    const usable = ['huggingface', 'modelscope'].filter((source) => {
      const value = sources[source];
      return value && typeof value.repo === 'string' && typeof value.revision === 'string' && typeof value.path === 'string';
    });
    if (usable.length === 0) errors.push(`${where}: needs a huggingface or modelscope source`);
    for (const source of usable) {
      const value = sources[source];
      if (value.path.startsWith('/') || value.path.includes('..')) errors.push(`${where}.${source}: unsafe path`);
    }
  }
  console.log(`ok: ${modelsFile.models.length} models`);
}

for (const warning of warnings) console.warn(`warn: ${warning}`);
for (const error of errors) console.error(`error: ${error}`);
if (errors.length) process.exit(1);
console.log('catalog ok');
