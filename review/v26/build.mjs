// Builds the V26 board into one file, board.html, that shows every screen wherever it is opened.
// Usage: node review/v26/build.mjs
//
// Everything is written into the page itself: the styles, every screen already drawn, and the
// photographs. So the board still shows where scripts do not run (file previews) and when there
// is no server. Where scripts do run they add what moves: the orb, tap-through states, the review
// buttons and dark mode.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import vm from 'node:vm';

const root = fileURLToPath(new URL('.', import.meta.url));
const read = p => readFileSync(join(root, p), 'utf8');
const first = ['core.js', 'picture.js'];
const screenFiles = [...first, ...readdirSync(join(root, 'screens')).filter(f => f.endsWith('.js') && !first.includes(f)).sort()];
const files = ['../v25/icons.js', '../v25/orb.js', 'catalogue.js', 'kit.js', ...screenFiles.map(f => 'screens/' + f), 'board-markup.js', 'board.js'];
const skipped = [];
// A file that is still being written must not take the whole board down with it.
const good = files.filter(p => { try { new vm.Script(read(p), { filename: p }); return true; } catch (err) { skipped.push(p + ' (' + err.message + ')'); return false; } });
const blocks = good.map(p => `<script>\n/* ── ${p} ── */\n${read(p).replace(/<\/script/gi, '<\\/script')}\n</script>`).join('\n');

// Draw the whole board now, with the same code the page runs, minus the two files that need a browser.
const box = { console };
box.window = box; box.document = undefined;
const ctx = vm.createContext(box);
for (const p of good) if (!/orb\.js$|board\.js$/.test(p)) vm.runInContext(read(p), ctx, { filename: p });
const B = box.L26_BOARD, K = box.L26;

// An empty orb gets a still ring of its ten dots. mountOrb clears it and draws the live one.
const still = size => {
  const dot = Math.max(2.6, size / 12), R = size / 2 - Math.max(2, size / 14) - dot / 2, c = size / 2;
  let s = '';
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 - Math.PI / 2; s += `<circle cx="${(c + Math.cos(a) * R).toFixed(2)}" cy="${(c + Math.sin(a) * R).toFixed(2)}" r="${(dot / 2).toFixed(2)}"/>`; }
  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" fill="currentColor" style="display:block" aria-hidden="true">${s}</svg>`;
};
const withOrbs = html => html.replace(/<span\b([^>]*\bdata-orb="[^"]*"[^>]*)><\/span>/g, (all, attrs) => {
  const size = Number((attrs.match(/data-size="(\d+)"/) || attrs.match(/width:\s*(\d+)px/) || [0, 22])[1]);
  return `<span${attrs}>${still(size)}</span>`;
});
const screensHtml = withOrbs(B.screens({ filled: true }));
const drawn = (screensHtml.match(/class="status/g) || []).length;

// Photographs go in once each. The rule matches the inline style every photo already carries.
const photos = readdirSync(join(root, 'img')).filter(f => /\.(jpg|webp)$/.test(f)).sort();
const photoCss = photos.map(f => `[style*="img/${f}"]{background-image:url(data:image/${f.endsWith('.webp') ? 'webp' : 'jpeg'};base64,${readFileSync(join(root, 'img', f)).toString('base64')})!important}`).join('\n');

let html = read('index.html');
const put = (find, replace, what) => { if (!find.test(html)) throw new Error('build: could not find ' + what + ' in index.html'); html = html.replace(find, replace); };
put(/<html lang="en-GB" data-theme="light">/, () => '<html lang="en-GB" data-theme="light" class="static">', 'the <html> tag');
put(/<link rel="stylesheet" href="v26\.css">/, () => `<style>\n${read('v26.css')}\n</style>\n<style>\n/* Styles the screen files add for themselves */\n${K.styles.map(s => s.css).join('\n')}\n</style>\n<style>\n/* Photographs */\n${photoCss}\n</style>\n<script>document.documentElement.classList.remove('static')</script>`, 'the stylesheet link');
put(/<b id="progress"><\/b>/, () => `<b id="progress">${B.progress}</b>`, '#progress');
put(/(<select id="jump"[^>]*>.*?)(<\/select>)/, (all, open, close) => open + B.jump() + close, '#jump');
put(/<div class="moves" id="moves"><\/div>/, () => `<div class="moves" id="moves">${B.moves()}</div>`, '#moves');
put(/<div id="screens"><\/div>/, () => `<div id="screens">${screensHtml}</div>`, '#screens');
put(/<div class="refs" id="refs"><\/div>/, () => `<div class="refs" id="refs">${B.refs()}</div>`, '#refs');
html = html.replace(/<script src="[^"]+"><\/script>\n?/g, '');
put(/<\/body>/, () => `${blocks}\n</body>`, '</body>');
writeFileSync(join(root, 'board.html'), html);

const total = Object.keys(K.screens).length;
console.log(`Wrote review/v26/board.html · ${(html.length / 1048576).toFixed(1)} MB · ${drawn} of ${total} screens drawn into the page · ${photos.length} photographs · ${screenFiles.length} screen files`);
if (skipped.length) console.log('SKIPPED incomplete: ' + skipped.join('; '));
if (B.failed.length) console.log('COULD NOT DRAW: ' + B.failed.join('; '));
if (drawn < total || skipped.length || B.failed.length) process.exitCode = 1;
