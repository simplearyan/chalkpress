#!/usr/bin/env node
/**
 * tools/validate.mjs — schema validation for the IITM content repo.
 * Zero dependencies: parses index.md frontmatter and checks storyboard.json
 * against templates/storyboard.schema.json (subset: required keys, enums,
 * patterns, additionalProperties, minItems — enough to catch drift in CI).
 *
 * Usage:
 *   node tools/validate.mjs              # validate everything under content/
 *   node tools/validate.mjs pq-001       # validate one question folder
 *
 * Exit codes: 0 = all valid, 1 = violations found.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SUBJECTS = path.join(ROOT, 'content', 'subjects');
const SCHEMA = JSON.parse(fs.readFileSync(path.join(ROOT, 'templates/storyboard.schema.json'), 'utf8'));

let violations = 0;
const fail = (where, msg) => { violations++; console.error(`  ✗ ${where}: ${msg}`); };

// ── frontmatter (simple subset: flat keys + nested option lists) ─────────
function parseFrontmatter(src, where) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return { data: null, body: src };
  const data = {};
  let currentList = null, currentItem = null;
  for (const raw of m[1].split(/\r?\n/)) {
    if (!raw.trim() || raw.trim().startsWith('#')) continue;
    const indented = /^\s/.test(raw);
    if (/^\s*-\s/.test(raw)) {
      if (!currentList) { fail(where, `list item outside a list: "${raw.trim()}"`); continue; }
      currentItem = {};
      currentList.push(currentItem);
      applyKV(raw.replace(/^\s*-\s*/, ''), currentItem, where);
      continue;
    }
    if (indented && currentItem) {          // continuation of the current list item
      applyKV(raw.trim(), currentItem, where);
      continue;
    }
    const kv = raw.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!kv) { fail(where, `unparseable frontmatter line: "${raw.trim()}"`); continue; }
    const [, key, val] = kv;
    if (val === '' || val === '[]') {
      data[key] = val === '[]' ? [] : (currentList = []);
      currentItem = null;
      continue;
    }
    currentList = null; currentItem = null;
    applyKV(`${key}: ${val}`, data, where);
  }
  return { data, body: src.slice(m[0].length) };
}

function applyKV(line, obj, where) {
  const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
  if (!kv) { fail(where, `bad item line: "${line}"`); return; }
  let [, key, val] = kv;
  val = val.trim();
  if (val.startsWith('"') || val.startsWith("'")) {
    val = val.slice(1).replace(/["']$/, '');       // quoted: keep # and colons intact
  } else {
    val = val.replace(/\s+#.*$/, '').trim();       // bare: strip trailing comment
  }
  if (val === 'true') val = true;
  else if (val === 'false') val = false;
  else if (val !== '' && !isNaN(Number(val)) && !/^0\d/.test(val)) val = Number(val);
  obj[key] = val;
}

// ── mini JSON-Schema (draft-07 subset) checker ───────────────────────────
const PATTERNS = {};
function compile(pat) {
  if (!PATTERNS[pat]) {
    const [body, flags] = pat.startsWith('/') ? [pat.slice(1, -1), ''] : [pat, ''];
    PATTERNS[pat] = new RegExp(body, flags);
  }
  return PATTERNS[pat];
}

function check(value, schema, where, prop = '') {
  if (schema.$ref) {
    const def = schema.$ref.split('/').pop();
    return check(value, SCHEMA.$defs[def], where, prop);
  }
  const t = schema.type;
  if (t === 'object' && typeof value === 'object' && value !== null && !Array.isArray(value)) {
    for (const req of schema.required || []) {
      if (!(req in value)) fail(where, `missing required property "${prop ? prop + '.' : ''}${req}"`);
    }
    if (schema.properties) {
      for (const [k, v] of Object.entries(value)) {
        if (schema.additionalProperties === false && !schema.properties[k]) {
          fail(where, `unknown property "${prop ? prop + '.' : ''}${k}"`);
          continue;
        }
        if (schema.properties[k]) check(v, schema.properties[k], where, prop ? `${prop}.${k}` : k);
      }
    }
    return;
  }
  if (t === 'array' && Array.isArray(value)) {
    if (schema.minItems && value.length < schema.minItems) fail(where, `"${prop}" needs ≥${schema.minItems} items`);
    value.forEach((item, i) => check(item, schema.items, where, `${prop}[${i}]`));
    return;
  }
  if (t === 'integer') {
    if (!Number.isInteger(value)) { fail(where, `"${prop}" must be an integer, got ${JSON.stringify(value)}`); return; }
    if (schema.minimum !== undefined && value < schema.minimum) fail(where, `"${prop}" < ${schema.minimum}`);
    if (schema.maximum !== undefined && value > schema.maximum) fail(where, `"${prop}" > ${schema.maximum}`);
    return;
  }
  if (t === 'number' && typeof value === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum) fail(where, `"${prop}" < ${schema.minimum}`);
    return;
  }
  if (t === 'string') {
    if (typeof value !== 'string') { fail(where, `"${prop}" must be a string`); return; }
    if (schema.pattern && !compile(schema.pattern).test(value)) fail(where, `"${prop}" fails pattern ${schema.pattern}: "${value}"`);
    if (schema.enum && !schema.enum.includes(value)) fail(where, `"${prop}" must be one of ${schema.enum.join('|')}`);
    return;
  }
  if (schema.enum) {
    if (!schema.enum.includes(value)) fail(where, `"${prop}" must be one of ${schema.enum.join('|')}`);
  }
}

// ── cross-checks the schema can't express ────────────────────────────────
function checkTimeline(sb, where) {
  const scenes = [...sb.scenes].sort((a, b) => a.start_ms - b.start_ms);
  if (scenes[0].start_ms !== 0) fail(where, `first scene must start at 0`);
  if (scenes[scenes.length - 1].end_ms !== sb.total_duration_ms) fail(where, `last scene end (${scenes[scenes.length - 1].end_ms}) ≠ total_duration_ms (${sb.total_duration_ms})`);
  for (let i = 0; i < scenes.length; i++) {
    if (scenes[i].end_ms <= scenes[i].start_ms) fail(where, `scene "${scenes[i].id}" end ≤ start`);
    if (i > 0 && scenes[i].start_ms < scenes[i - 1].end_ms) fail(where, `scenes "${scenes[i - 1].id}" and "${scenes[i].id}" overlap`);
  }
  // element ids unique across the whole storyboard (shapes reference them)
  const ids = scenes.flatMap(s => s.elements.map(e => e.id));
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dupes.length) fail(where, `duplicate element ids: ${[...new Set(dupes)].join(', ')}`);
  // shape "of" targets must exist
  for (const s of scenes) for (const e of s.elements) {
    if (e.type === 'shape' && e.of && !ids.includes(e.of)) fail(where, `shape "${e.id}" references missing element "${e.of}"`);
  }
}

// ── main ─────────────────────────────────────────────────────────────────
const only = process.argv[2] || null;
const subjectDirs = fs.readdirSync(SUBJECTS).filter(d => fs.statSync(path.join(SUBJECTS, d)).isDirectory());
let checked = 0;

for (const subject of subjectDirs) {
  const subjDir = path.join(SUBJECTS, subject);
  for (const q of fs.readdirSync(subjDir)) {
    const qDir = path.join(subjDir, q);
    if (!fs.statSync(qDir).isDirectory()) continue;
    if (only && q !== only) continue;
    checked++;
    console.log(`${subject}/${q}`);

    // index.md
    const idxPath = path.join(qDir, 'index.md');
    if (!fs.existsSync(idxPath)) { fail(`${subject}/${q}`, 'missing index.md'); continue; }
    const { data: fm } = parseFrontmatter(fs.readFileSync(idxPath, 'utf8'), `${q}/index.md`);
    if (fm) {
      for (const req of ['id', 'subject', 'topic', 'title', 'answer_type', 'status']) {
        if (!(req in fm)) fail(`${q}/index.md`, `frontmatter missing "${req}"`);
      }
      if (fm.id && fm.id !== q) fail(`${q}/index.md`, `frontmatter id "${fm.id}" ≠ folder name "${q}"`);
      if (fm.subject && fm.subject !== subject) fail(`${q}/index.md`, `frontmatter subject "${fm.subject}" ≠ folder "${subject}"`);
      if (fm.answer_type === 'options' && (!Array.isArray(fm.options) || !fm.options.length)) fail(`${q}/index.md`, 'answer_type options but no options list');
      if (!['draft', 'ai-draft', 'reviewed', 'scripted', 'animated', 'rendered', 'published'].includes(fm.status)) {
        fail(`${q}/index.md`, `unknown status "${fm.status}"`);
      }
    }

    // solution.md / script.md required past draft
    if (fm && !['draft', 'ai-draft'].includes(fm.status)) {
      for (const f of ['solution.md', 'script.md', 'storyboard.json']) {
        if (!fs.existsSync(path.join(qDir, f))) fail(`${q}/`, `status "${fm.status}" requires ${f}`);
      }
    }

    // storyboard.json
    const sbPath = path.join(qDir, 'storyboard.json');
    if (fs.existsSync(sbPath)) {
      let sb;
      try { sb = JSON.parse(fs.readFileSync(sbPath, 'utf8')); }
      catch (e) { fail(`${q}/storyboard.json`, `invalid JSON: ${e.message}`); continue; }
      check(sb, SCHEMA, `${q}/storyboard.json`);
      if (fm && sb.id !== fm.id) fail(`${q}/storyboard.json`, `id "${sb.id}" ≠ index.md id "${fm.id}"`);
      checkTimeline(sb, `${q}/storyboard.json`);
    }
  }
}

if (only && !checked) { console.error(`✗ no question folder named "${only}"`); process.exit(1); }
console.log(violations ? `\n✗ ${violations} violation(s) in ${checked} question(s)` : `\n✓ ${checked} question(s) valid`);
process.exit(violations ? 1 : 0);
