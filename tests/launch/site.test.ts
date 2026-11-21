import { describe, expect, test } from 'bun:test';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { inline, outputs, parseDoc } from '../../apps/site/build';

/**
 * Phase 31's launch documents and the pages made from them. The privacy policy, terms and support page are written
 * once in docs/launch; the website and the app's About screen are generated from them. These checks keep the copies in
 * step and keep the documents true to what the app actually does.
 */
const root = join(import.meta.dir, '../..');
const read = (path: string) => readFileSync(join(root, path), 'utf8');
const launchDocs = readdirSync(join(root, 'docs/launch')).filter(f => f.endsWith('.md'));
const sitePages = readdirSync(join(root, 'apps/site/public')).filter(f => f.endsWith('.html'));

describe('generated copies', () => {
  test('the site pages and the app text match the Markdown', () => {
    for (const [path, text] of Object.entries(outputs())) expect({ path, same: read(path) === text }).toEqual({ path, same: true });
  });

  test('inline Markdown becomes the app’s copy syntax', () => {
    expect(inline('**Draft.** See the [privacy policy](privacy-policy.md) and `apps/site`.')).toBe('{Draft.} See the privacy policy and apps/site.');
  });

  test('headings, paragraphs, lists and tables become blocks', () => {
    const doc = parseDoc('# Title\n\nOne\nparagraph.\n\n## Part\n\n- a\n- **b**\n  carried on\n\n| What | Basis |\n|---|---|\n| Backup | Contract |\n\n### Small\n\n> Quoted');
    expect(doc).toEqual({
      title: 'Title',
      blocks: [
        { kind: 'text', text: 'One paragraph.' },
        { kind: 'heading', text: 'Part' },
        { kind: 'list', items: ['a', '{b} carried on'] },
        { kind: 'table', head: ['What', 'Basis'], rows: [['Backup', 'Contract']] },
        { kind: 'subheading', text: 'Small' },
        { kind: 'text', text: 'Quoted' },
      ],
    });
  });

  test('the About screen shows the real terms, not a promise of them', () => {
    const settings = read('apps/mobile/src/screens/v26/settings.tsx');
    expect(settings).not.toContain('Full terms are published before launch');
    expect(settings).toContain('<LegalText doc={terms} />');
    expect(settings).toContain('<LegalText doc={privacyPolicy} />');
  });
});

describe('the website', () => {
  test('every link between pages goes somewhere', () => {
    for (const page of sitePages) {
      for (const [, href] of read(`apps/site/public/${page}`).matchAll(/href="([^"#:]+)"/g)) {
        expect({ page, href, exists: existsSync(join(root, 'apps/site/public', href)) }).toEqual({ page, href, exists: true });
      }
    }
  });

  test('web deletion makes the same calls as the app', () => {
    const app = read('apps/mobile/src/services/account.ts'), web = read('apps/site/public/delete.js');
    for (const path of ['/auth/email-otp/send-verification-otp', '/auth/sign-in/email-otp', '/account/delete']) {
      expect(app).toContain(`'${path}'`);
      expect(web).toContain(`'${path}'`);
    }
    expect(web).toContain("confirm: 'DELETE'");
  });
});

describe('the documents stay true to the app', () => {
  const policy = read('docs/launch/privacy-policy.md');
  const storePrivacy = read('docs/launch/store-privacy.md');

  test('written in the house style: no em dashes or en dashes', () => {
    for (const file of launchDocs) expect({ file, dashes: (read(`docs/launch/${file}`).match(/[–—]/g) ?? []).length }).toEqual({ file, dashes: 0 });
  });

  test('every Health Connect permission the app asks for is declared', () => {
    const permissions: string[] = JSON.parse(read('apps/mobile/app.json')).expo.android.permissions;
    const health = permissions.filter(p => p.startsWith('android.permission.health.')).map(p => p.split('.').pop()!);
    expect(health.length).toBeGreaterThan(0);
    for (const p of health) expect({ p, declared: storePrivacy.includes(`| ${p} |`) }).toEqual({ p, declared: true });
  });

  test('every outside service the API can be configured for is named in the privacy policy', () => {
    const env = read('apps/api/src/env.ts');
    const named: Record<string, string> = { ANTHROPIC_API_KEY: 'Anthropic', OPENAI_API_KEY: 'OpenAI', GEMINI_API_KEY: 'Google', WHOOP_CLIENT_ID: 'WHOOP', OURA_CLIENT_ID: 'Oura', APPLE_CLIENT_ID: 'Apple', GOOGLE_CLIENT_ID: 'Google', STORAGE_ENDPOINT: 'file storage', DATABASE_URL: 'Neon' };
    for (const [setting, name] of Object.entries(named)) {
      expect(env).toContain(`${setting}:`);
      expect({ setting, named: policy.includes(name) }).toEqual({ setting, named: true });
    }
    for (const service of ['Expo', 'Sentry', 'Open Food Facts', 'Vercel']) expect({ service, named: policy.includes(service) }).toEqual({ service, named: true });
  });

  test('the HealthKit usage text quoted for reviewers is the one the app ships', () => {
    const app = read('apps/mobile/app.json');
    const usage = /"NSHealthShareUsageDescription": "([^"]+)"/.exec(app)?.[1];
    expect(usage).toBeTruthy();
    expect(storePrivacy).toContain(usage!);
  });

  test('the encrypted database stays out of device backups, as the privacy policy says', () => {
    expect(JSON.parse(read('apps/mobile/app.json')).expo.android.allowBackup).toBe(false);
    const swift = read('apps/mobile/modules/life-intelligence/ios/LifeIntelligenceModule.swift');
    expect(swift).toContain('OnCreate {\n      excludeDatabasesFromBackup()');
    expect(swift).toContain('appendingPathComponent("SQLite", isDirectory: true)');
    expect(swift).toContain('values.isExcludedFromBackup = true');
    expect(policy).toContain('left out of iCloud and other phone backups');
  });

  test('copy calls the app Life in the permission prompts', () => {
    const app = read('apps/mobile/app.json');
    expect(app).not.toMatch(/"life (uses|turns|reads)/);
    expect(JSON.parse(app).expo.name).toBe('Life');
  });
});
