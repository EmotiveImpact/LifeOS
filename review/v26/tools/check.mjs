// Checks V26 screen files against the kit's rules.
// Usage: node review/v26/tools/check.mjs [screens/file.js ...] [--expect key1,key2]
// With no files it checks every file in screens/. Exits 1 when a rule is broken.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, basename } from 'node:path';
import vm from 'node:vm';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const args = process.argv.slice(2);
const expectAt = args.indexOf('--expect');
const expect = expectAt >= 0 ? args[expectAt + 1].split(',').filter(Boolean) : [];
const files = (expectAt >= 0 ? args.slice(0, expectAt) : args).map(f => basename(f));
const targets = files.length ? files : readdirSync(join(root, 'screens')).filter(f => f.endsWith('.js'));

globalThis.window = globalThis;
globalThis.document = undefined;
const run = p => vm.runInThisContext(readFileSync(join(root, p), 'utf8'), { filename: p });
run('../v25/icons.js'); run('catalogue.js'); run('kit.js');
const K = globalThis.L26, catalogue = new Set(globalThis.L26_CATALOGUE.rows.map(r => r.key));

const kitCss = readFileSync(join(root, 'v26.css'), 'utf8');
const kitClasses = new Set([...kitCss.matchAll(/\.([a-zA-Z][\w-]*)/g)].map(m => m[1]));
const SIZES = new Set(['11', '12.5', '13', '14', '15', '16', '20', '21', '24', '30', '32', '34', '40', '44', '46', '56']);
const HEX_OK = new Set(['#0d0e10', '#08090a', '#0b7a55']);

function styleProblems(css, where) {
  const out = [];
  for (const m of css.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) if (!HEX_OK.has(m[0].toLowerCase())) out.push(`${where}: raw colour ${m[0]} (use a var(--token))`);
  if (/\b(rgba?|hsla?)\(/.test(css)) out.push(`${where}: rgb()/hsl() colour (use a var(--token))`);
  if (/blur|backdrop-filter/.test(css)) out.push(`${where}: blur or backdrop-filter is not allowed`);
  if (/\bborder(-(top|bottom|left|right|width|color|style))?\s*:/.test(css) && !/\bborder\s*:\s*(0|none)\b/.test(css)) out.push(`${where}: borders and dividers are not allowed (separate by fill and spacing)`);
  if (/font-family/.test(css)) out.push(`${where}: font-family must not be set (Inter only)`);
  for (const m of css.matchAll(/font-size\s*:\s*([\d.]+)px/g)) if (!SIZES.has(m[1])) out.push(`${where}: font-size ${m[1]}px is off the type scale`);
  for (const m of css.matchAll(/box-shadow\s*:\s*([^;"}]+)/g)) if (!/^(var\(--(shadow|float)\)|none|inset 0 0 0 \dpx var\(--[\w-]+\))\s*$/.test(m[1].trim())) out.push(`${where}: box-shadow must be var(--shadow) or var(--float)`);
  if (/(linear|radial|conic)-gradient/.test(css) && !/to bottom|to top|circle,/.test(css)) out.push(`${where}: gradient looks decorative (only photo scrims and dot spines are allowed)`);
  return out;
}

let errors = 0, warnings = 0, total = 0;
const before = new Set(Object.keys(K.screens));
run('screens/core.js');
const coreKeys = Object.keys(K.screens).filter(k => !before.has(k));
const owners = Object.fromEntries(coreKeys.map(k => [k, 'core.js']));
for (const f of targets) {
  if (f === 'core.js') continue;
  const had = new Set(Object.keys(K.screens)), hadStyles = K.styles.length;
  try { run('screens/' + f); } catch (e) { console.log(`✗ ${f}: failed to load — ${e.message}`); errors++; continue; }
  for (const k of Object.keys(K.screens)) if (!had.has(k)) owners[k] = f;
  K.styles.slice(hadStyles).forEach(s => { s.file = f; });
}
const extraClasses = {};
for (const s of K.styles) {
  const list = (extraClasses[s.file] ||= new Set());
  for (const m of s.css.matchAll(/\.([a-zA-Z][\w-]*)/g)) list.add(m[1]);
  const pfx = s.prefix.replace(/^\./, '');
  for (const m of s.css.matchAll(/(^|\})\s*([^{}@]+)\{/g)) for (const sel of m[2].split(',')) if (sel.trim() && !sel.trim().startsWith('.' + pfx)) { console.log(`✗ ${s.file}: addCss selector "${sel.trim()}" must start with .${pfx}`); errors++; }
  for (const p of styleProblems(s.css, `${s.file} addCss`)) { console.log('✗ ' + p); errors++; }
}

for (const [key, file] of Object.entries(owners)) {
  if (!targets.includes(file)) continue;
  total++;
  const def = K.screens[key], problems = [], warn = [];
  if (!catalogue.has(key) && !key.startsWith('x-')) problems.push('key is not in the catalogue (new ideas must start with x-)');
  if (!def.note || def.note.length < 20) problems.push('needs a one-line note saying what the screen does');
  if (!def.from) warn.push('no `from` (which references or moves it draws on)');
  let html = '';
  try { html = def.build(''); } catch (e) { problems.push('build() threw: ' + e.message); }
  if (typeof html === 'string' && html) {
    if (html.length < 600) problems.push('screen is nearly empty (' + html.length + ' chars)');
    if (!/class="status/.test(html)) problems.push('missing status() at the top');
    if (!/class="scroll/.test(html) && !/full-photo/.test(html)) problems.push('missing a .scroll area');
    if (/undefined|\[object Object\]|NaN/.test(html.replace(/<svg[\s\S]*?<\/svg>/g, ''))) problems.push('renders "undefined", "NaN" or [object Object]');
    if (/<svg class="i[^"]*" viewBox="0 0 24 24" aria-hidden="true"><\/svg>/.test(html)) problems.push('uses an icon name that does not exist');
    const known = new Set([...kitClasses, ...(extraClasses[file] || [])]);
    const unknown = new Set();
    for (const m of html.matchAll(/class="([^"]*)"/g)) for (const c of m[1].split(/\s+/)) if (c && !known.has(c)) unknown.add(c);
    if (unknown.size) problems.push('unknown classes: ' + [...unknown].join(', '));
    for (const m of html.matchAll(/style="([^"]*)"/g)) problems.push(...styleProblems(m[1], 'inline style'));
    for (const m of html.matchAll(/img\/([\w-]+\.(?:jpg|webp))/g)) if (!existsSync(join(root, 'img', m[1]))) problems.push('photo does not exist: ' + m[1]);
    const primaries = [...html.matchAll(/class="btn press([^"]*)"([^>]*)>/g)].filter(m => !/ghost/.test(m[1]) && !/photo-fill|surface2/.test(m[2])).length;
    if (primaries > 1) warn.push(primaries + ' primary buttons (the rule is one per screen)');
    if (/lorem|ipsum|Item 1|TODO/i.test(html)) problems.push('placeholder text');
    if (/[a-z] — [a-z]/i.test(html.replace(/<[^>]+>/g, ' '))) warn.push('em dash in copy (use a full stop, comma or colon)');
  }
  const uniq = [...new Set(problems)];
  if (uniq.length) { errors += uniq.length; console.log(`✗ ${key} (${file})\n   - ${uniq.join('\n   - ')}`); }
  if (warn.length) { warnings += warn.length; console.log(`! ${key}: ${warn.join('; ')}`); }
}
const missing = expect.filter(k => !K.screens[k]);
if (missing.length) { console.log(`✗ not built yet (${missing.length}): ${missing.join(' ')}`); errors += missing.length; }
console.log(`\n${total} screens checked in ${targets.join(', ')} · ${errors} errors · ${warnings} warnings`);
process.exit(errors ? 1 : 0);
