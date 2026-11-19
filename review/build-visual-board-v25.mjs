// Builds review/life-complete-board-v25.html: the complete 221-screen V23 library,
// with the V25 Today, Plan, You and Talk, V24's photographs where a screen has none,
// reference tags, and approve / needs-work controls on every screen.
// Usage: node review/build-visual-board-v25.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const here = fileURLToPath(new URL('.', import.meta.url));
const read = p => readFileSync(join(here, p), 'utf8');
const sha = buf => createHash('sha256').update(buf).digest('hex');

const sourceName = 'life-complete-board-v23.html';
let html = read(sourceName);
const account = JSON.parse(read('v23-screen-accounting.json'));
const keys = new Set(account.rows.map(r => r.key));
if (keys.size !== 221 || account.rows.length !== 221) throw new Error('Expected 221 unique screens in the V23 accounting');

/* The four redesigned screens: their stylesheet, scoped to an isolated surface. */
const css = read('v25/v25.css')
  .replace(/:root, :root\[data-theme="dark"\] \{/, ':host {')
  .replace(/:root\[data-theme="light"\] \.phone \{[^}]*\}\n?/, '')
  .replace(/:root\[data-theme="light"\] \{/, ':host([data-theme="light"]) {')
  + '\n.screen { width: 100%; height: 100%; border-radius: 0; font-family: Inter, system-ui, sans-serif; -webkit-font-smoothing: antialiased; }\n';
if (/:root/.test(css)) throw new Error('Unscoped :root rule left in the V25 screen styles');

const photoNames = ['terrace', 'home', 'work', 'people', 'keys', 'desk'];
const images = Object.fromEntries(photoNames.map(n => [n, 'data:image/webp;base64,' + readFileSync(join(here, 'v25/img', n + '.webp')).toString('base64')]));

const redesigned = {
  today: { title: 'Today · V25', note: 'v17’s level and two-tone briefing, in V19’s order: one next move, the check-in photograph (it shrinks to a line once you check in), your Aim, body at a glance, life is asking, coming up and life knows you. Tap the check-in.' },
  plan: { title: 'Plan · V25', note: 'The Aim photograph leads with the deposit progress. Then area filters, ready when you are, your situation, waiting not forgotten, and your tools. The filters work.' },
  you: { title: 'You · V25', note: 'A steadier foundation: level, focus and streak. Home, Work and People photographs, what life knows, a saved quote, then the four sections.' },
  talk: { title: 'Talk · V25', note: 'The orb listens. What you say appears in two tones and becomes a Ready to file card you approve; nothing is saved until you say so.' },
};
const photos = { areahome: 'terrace', areawork: 'work', household: 'people', glimpse: 'home', birthdaynudge: 'people' };

const tag = (list, text) => Object.fromEntries(list.split(' ').map(k => [k, text]));
const refs = {
  ...tag('today plan you', 'v17 briefing · V19 order · calmer icons · V24 photographs'),
  ...tag('talk chat', 'whisper.rn on-device speech · mem0 memory'),
  ...tag('readiness', 'Atria · readiness drivers (“Why”)'),
  ...tag('sleep sleepplan sleepnight', 'Atria · sleep need, debt, planner and hypnogram'),
  ...tag('load strain loadtrend', 'Atria · strain and pacing to target'),
  ...tag('hrv', 'Atria · HRV qualification and freshness'),
  ...tag('provenance sources', 'Atria · honesty badges and provenance'),
  ...tag('journal insights', 'Atria · journal and insights'),
  ...tag('detected', 'Atria · auto-detected walks and workouts'),
  ...tag('coach', 'Atria · coach from your data'),
  ...tag('signals illness stress forecast cycle fitnessage zones regularity', 'NOOP engine list · ideas only, built ourselves'),
  ...tag('snap confirm mealresult', 'Cal AI · result card, health score, macros and tips'),
  ...tag('cook', 'Cal AI · recipes from a photo of ingredients'),
  ...tag('mealplan fuelplan', 'Cal AI · weekly meal plans'),
  ...tag('sayit describeexercise', 'Cal AI · voice input'),
  ...tag('barcode labelscan foodsearch', 'Open Food Facts lookups'),
  ...tag('habits strength habitnew', 'Loop Habit Tracker · habit strength that forgives misses (ideas only)'),
  ...tag('budget weekbudget', 'Actual Budget · envelope budgeting'),
  ...tag('money txn', 'Actual Budget · rules and bank import'),
  ...tag('networth', 'Maybe · net-worth timeline (ideas only)'),
  ...tag('devices devicesetup connectfail', 'Gadgetbridge · pairing flows (ideas only)'),
  ...tag('teachoffer', 'Your Fenny app · the “Teach me” offer line'),
  ...tag('lessonready bite bitedrawn teachplay', 'Your Fenny app · lesson film and drawing kit'),
  ...tag('predict puzzle', 'Your Fenny app · guess before reveal'),
  ...tag('tellback gaps lessonrecap gotit', 'Your Fenny app · strengths and gaps (“Show me”)'),
  ...tag('drawkit', 'Fenny Drawing Kit · 30 devices, 208 things'),
  ...tag('recall learned', 'ts-fsrs · spaced recall'),
  ...tag('memory knows', 'mem0 · life’s memory, self-hosted'),
  ...tag('orb orbnext', 'Board v17 orb family (mountOrb)'),
};
for (const k of [...Object.keys(redesigned), ...Object.keys(photos), ...Object.keys(refs)]) {
  if (!keys.has(k)) throw new Error('Unknown screen key: ' + k);
}

/* Page text: title, header and introduction. */
const swap = (from, to, label) => {
  if (!html.includes(from)) throw new Error('Could not find ' + label);
  html = html.replace(from, to);
};
html = html.replace(/<title>[^<]*<\/title>/, '<title>life · V25 · the best of every version · complete board</title>');
swap('Complete app · v19 · living feed', 'Complete app · V25 · for your approval', 'header mark');
const heroStart = html.indexOf('<section class="col" style="gap:24px">');
const heroEnd = html.indexOf('</section>', heroStart) + '</section>'.length;
if (heroStart < 0) throw new Error('Could not find the hero');
const refList = [
  ['Atria (MIT)', 'readiness “Why”, strain pacing, sleep planner and hypnogram, honesty badges, journal'],
  ['Cal AI (MIT)', 'meal result card with health score, macros and tips; recipes from a photo; meal plans'],
  ['Loop Habit Tracker (ideas only)', 'habit strength that forgives misses, history heatmap'],
  ['Actual Budget (MIT) · Maybe (ideas only)', 'envelope budgets; net-worth timeline'],
  ['Gadgetbridge (ideas only)', 'device pairing flows'],
  ['Your Fenny app', 'lesson film, guess before reveal, strengths and gaps, the drawing kit'],
  ['mem0 · whisper.rn · ts-fsrs', 'memory, on-device speech, spaced recall'],
];
const hero = `<section class="col" style="gap:24px">
    <span class="eyebrow"><i></i>V25 · the best of every version · for your approval</span>
    <h1 class="h-hero">life, brought together.</h1>
    <p class="p-lead">All <span id="countScreens">221</span> screens, in one place. Today, Plan, You and Talk are redesigned from the best of v17, V19, the calmer mockup and V24. Every other screen keeps its established design from V23, with V24’s photographs where a screen had none. Approve or flag each screen under it; your choices stay in this browser until you press <b>Copy for Claude</b>. Numbers, dates and connection states are illustrative.</p>
  </section>
  <section class="col v25-intro">
    <div class="v25-grid">
      <div class="v25-panel"><b>Kept from each version</b><ul>
        <li><b>v17</b> · the two-tone briefing, level, mood photograph, body numbers, life knows you, the orb</li>
        <li><b>V19</b> · the order of Today, and a check-in that shrinks once it’s done</li>
        <li><b>Calmer mockup / V23</b> · your icon set, readable contrast, Plan’s ready and waiting groups</li>
        <li><b>V24</b> · the photographs, Talk’s Ready to file card, Coming up with date boxes</li></ul></div>
      <div class="v25-panel"><b>References carried forward</b><ul>${refList.map(([a, b]) => `<li><b>${a}</b> · ${b}</li>`).join('')}</ul></div>
      <div class="v25-panel"><b>How to review</b><p>Under every screen: <b>Approve</b> or <b>Needs work</b> with a note. The bar at the bottom counts your progress, hides what you’ve approved, jumps to the next screen to review and copies your decisions for Claude. Tap any screen to open it full size.</p></div>
    </div>
  </section>`;
html = html.slice(0, heroStart) + hero + html.slice(heroEnd);

const lead = 'All <span id="countScreens">221</span> screens, in one place. Today, Plan, You and Talk are redesigned from the best of v17, V19, the calmer mockup and V24. Every other screen keeps its established design from V23, with V24’s photographs where a screen had none. Approve or flag each screen under it; your choices stay in this browser until you press <b>Copy for Claude</b>. Numbers, dates and connection states are illustrative.';
const data = { css, lead, redesigned, photos, refs, rows: account.rows.map(({ key, title, chapter }) => ({ key, title, chapter })) };
const layer = `
<style id="v25-board-layer">${read('v25/board-layer.css')}</style>
<script id="v25-icons">${read('v25/icons.js')}</script>
<script id="v25-orb">(function(){${read('v25/orb.js')}})();</script>
<script id="v25-data">window.LIFE_V25_IMG=${JSON.stringify(images)};window.LIFE_V25_BOARD=${JSON.stringify(data)};</script>
<script id="v25-screens">${read('v25/v25.js')}</script>
<script id="v25-layer">${read('v25/board-layer.js')}</script>
`;
html += layer;
const out = join(here, 'life-complete-board-v25.html');
writeFileSync(out, html);

const rows = account.rows.map(r => ({
  ...r,
  v25: redesigned[r.key] ? 'redesigned in V25' : photos[r.key] ? 'carried from V23 · photograph added where none existed' : 'carried from V23',
  reference: refs[r.key] || null,
}));
writeFileSync(join(here, 'v25-screen-accounting.json'), JSON.stringify({ originalScreens: 221, originalChapters: account.originalChapters, uniqueKeys: keys.size, rows }, null, 2) + '\n');
writeFileSync(join(here, 'VISUAL_BOARD_V25.json'), JSON.stringify({
  version: 25,
  output: 'review/life-complete-board-v25.html',
  outputSha256: sha(readFileSync(out)),
  source: { file: 'review/' + sourceName, sha256: sha(readFileSync(join(here, sourceName))) },
  redesigned: Object.keys(redesigned),
  photographs: photos,
  references: Object.keys(refs).length,
  renderVerification: 'pending — open the board and read window.__V25_AUDIT',
}, null, 2) + '\n');
console.log('Wrote', out, (html.length / 1e6).toFixed(2) + ' MB');
