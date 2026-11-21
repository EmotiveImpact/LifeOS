// Store screenshots from the app's own screens (Phase 31). Run against the release web build with the sample life:
//
//   EXPO_PUBLIC_SAMPLE_DATA=1 npx expo export --platform web --output-dir /tmp/life-web
//   (serve /tmp/life-web on a port, with index.html for unknown paths)
//   node scripts/store-shots.cjs <port> <out-dir>
//
// Each screen is captured at 390 × 844 points, three pixels to the point, in the light appearance. It is then framed
// under its caption at the sizes the stores ask for: 1320 × 2868 for the App Store's 6.9-inch iPhone, 1080 × 1920 for
// Google Play, and Play's 1024 × 500 feature graphic. Needs Playwright with Chromium.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const [port = '8173', out = 'store'] = process.argv.slice(2);
const SHOTS = [
  { name: '1-today', path: '/today?state=checked:calm', caption: 'One clear move at a time' },
  // The web build can't listen, so Talk plays its sample and says so. A phone listens, so that line is left out.
  { name: '2-talk', path: '/talk?state=filed', caption: 'Say it once. Life files it', hide: ['Sample talk.'] },
  { name: '3-readiness', path: '/plan/body/readiness', caption: 'Plan around how you slept' },
  { name: '4-money', path: '/plan/money/money', caption: 'Bills and deadlines, caught early' },
  { name: '5-meal', path: '/confirm', caption: 'Snap a meal, check the portions' },
  { name: '6-lesson', path: '/teach/bite', caption: 'Learn it in five minutes' },
  { name: '7-plan', path: '/plan', caption: 'An Aim, and the steps to it' },
  { name: '8-privacy', path: '/you/settings/privacy', caption: 'Your data stays yours' },
];
// The phone's clock in the shots: 08:10 this morning in London, so the meal reads as breakfast and Today as morning
// whatever time the shots are taken (Phase 31's set said "Breakfast · 00:56").
function morningInLondon(now = new Date()) {
  const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London' }).format(now);
  const noon = Number(new Date(`${day}T12:00:00Z`).toLocaleString('en-GB', { timeZone: 'Europe/London', hour: '2-digit', hourCycle: 'h23' }));
  return new Date(Date.parse(`${day}T08:10:00Z`) - (noon - 12) * 3600000);
}
const STATE = { onboardingDone: true, choices: { appearance: 'System' }, prefs: { dark: false }, flags: { 'memory-hint-seen': true } };
// The app's light tokens (src/design/tokens.ts) and its typeface.
const INK = '#0D0E10', INK2 = '#5C6068', CANVAS = '#F7F7F8', EMBER = '#E5532B';
const fontFile = (weight) => path.join(__dirname, '..', 'node_modules', '@expo-google-fonts', 'inter', weight, `Inter_${weight}.ttf`);
const font = (weight, css) => `@font-face { font-family: Inter; font-weight: ${css}; src: url(data:font/ttf;base64,${fs.readFileSync(fontFile(weight)).toString('base64')}) format('truetype'); }`;
const FONTS = font('400Regular', 400) + font('600SemiBold', 600);

function frame({ width, height, caption, image, screenWidth, captionSize, top, gap }) {
  return `<!doctype html><html><head><style>${FONTS}
    html, body { margin: 0; width: ${width}px; height: ${height}px; overflow: hidden; background: ${CANVAS}; }
    .cap { position: absolute; left: 24px; right: 24px; top: ${top}px; text-align: center; font: 600 ${captionSize}px/1.15 Inter, sans-serif; letter-spacing: -0.02em; color: ${INK}; }
    .cap i { display: block; width: 8px; height: 8px; border-radius: 4px; background: ${EMBER}; margin: 0 auto ${Math.round(captionSize * 0.55)}px; }
    img { position: absolute; left: ${(width - screenWidth) / 2}px; top: ${top + gap}px; width: ${screenWidth}px; border-radius: ${Math.round(screenWidth * 0.11)}px; box-shadow: 0 18px 48px rgba(13,14,16,0.14), 0 2px 8px rgba(13,14,16,0.06); }
  </style></head><body><div class="cap"><i></i>${caption}</div><img src="data:image/png;base64,${image.toString('base64')}"></body></html>`;
}

function feature() {
  return `<!doctype html><html><head><style>${FONTS}
    html, body { margin: 0; width: 1024px; height: 500px; overflow: hidden; background: #08090A; color: #F7F8F8; font-family: Inter, sans-serif; }
    .wrap { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 22px; }
    .mark { font-weight: 600; font-size: 64px; letter-spacing: 0.42em; margin-right: -0.42em; }
    .line { font-size: 30px; color: #8A8F98; }
    .line b { color: #F7F8F8; font-weight: 600; }
    i { width: 12px; height: 12px; border-radius: 6px; background: #FF6B3D; }
  </style></head><body><div class="wrap"><i></i><div class="mark">LIFE</div><div class="line">One clear move <b>at a time.</b></div></div></body></html>`;
}

(async () => {
  for (const dir of ['raw', 'ios', 'play']) fs.mkdirSync(path.join(out, dir), { recursive: true });
  const browser = await chromium.launch();
  const app = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, colorScheme: 'light', reducedMotion: 'reduce', timezoneId: 'Europe/London', locale: 'en-GB' });
  await app.addInitScript(state => { try { localStorage.setItem('life_track_a_v17', JSON.stringify(state)); } catch {} }, STATE);
  await app.clock.setFixedTime(morningInLondon());
  const raws = {};
  for (const shot of SHOTS) {
    const page = await app.newPage();
    page.on('pageerror', e => console.log('page error', shot.path, e.message));
    await page.goto(`http://localhost:${port}${shot.path}`, { waitUntil: 'networkidle', timeout: 120000 });
    await page.waitForTimeout(2500);
    if (shot.hide) await page.evaluate(prefixes => {
      for (const el of document.querySelectorAll('div')) if (el.childElementCount === 0 && prefixes.some(p => el.textContent.startsWith(p))) el.style.visibility = 'hidden';
    }, shot.hide);
    raws[shot.name] = await page.screenshot();
    fs.writeFileSync(path.join(out, 'raw', `${shot.name}.png`), raws[shot.name]);
    await page.close();
    console.log('captured', shot.path);
  }
  const sizes = [
    { dir: 'ios', viewport: { width: 440, height: 956 }, screenWidth: 336, captionSize: 30, top: 64, gap: 116 },
    { dir: 'play', viewport: { width: 360, height: 640 }, screenWidth: 238, captionSize: 23, top: 34, gap: 82 },
  ];
  for (const size of sizes) {
    const ctx = await browser.newContext({ viewport: size.viewport, deviceScaleFactor: 3 });
    const page = await ctx.newPage();
    for (const shot of SHOTS) {
      await page.setContent(frame({ ...size.viewport, ...size, caption: shot.caption, image: raws[shot.name] }), { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: path.join(out, size.dir, `${shot.name}.png`) });
    }
    await ctx.close();
    console.log('framed', size.dir);
  }
  const ctx = await browser.newContext({ viewport: { width: 1024, height: 500 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.setContent(feature(), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(out, 'play-feature.png') });
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
