import { beforeAll, describe, expect, mock, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Fix F-10. Help's "Email us" and "Report a number" open a new email to the support address, with the app's version
 * and the phone's system filled in. Nothing else about the person goes in, and a build without an address says so
 * instead of pretending a message went.
 */
const root = join(import.meta.dir, '../..');
const read = (path: string) => readFileSync(join(root, path), 'utf8');

const opened: string[] = [];
let mailApp = true;
type Support = typeof import('../../apps/mobile/src/services/support');
let support: Support;

beforeAll(async () => {
  mock.module('expo-device', () => ({ osName: 'iOS', osVersion: '18.2', deviceName: 'Ama’s iPhone' }));
  mock.module('expo-constants', () => ({ default: { expoConfig: { version: '1.0.0' }, nativeBuildVersion: '41' } }));
  mock.module('expo-linking', () => ({ openURL: async (url: string) => { if (!mailApp) throw new Error('No app handles mailto'); opened.push(url); } }));
  support = await import('../../apps/mobile/src/services/support');
});

/** Splits a mailto link into its address, subject and body. */
function parse(link: string) {
  const url = new URL(link);
  return { scheme: url.protocol, to: url.pathname, subject: url.searchParams.get('subject'), body: url.searchParams.get('body') };
}

describe('Help reaches a person', () => {
  test('only a plain email address is used, so nothing odd can ride along in the link', () => {
    expect(support.supportAddressFrom(' help@life.example ')).toBe('help@life.example');
    expect(support.supportAddressFrom('help@mail.life.example')).toBe('help@mail.life.example');
    for (const bad of [undefined, '', 'help', 'help@life', 'help@life.', 'a b@life.example', 'help@life.example?cc=x@y.z', '<help@life.example>', 'help@life.example#x'])
      expect(support.supportAddressFrom(bad)).toBeNull();
  });

  test('"Email us" starts a message with the version and the phone’s system, and nothing about the person', () => {
    const mail = parse(support.supportLink('question', 'help@life.example')!);
    expect(mail).toEqual({ scheme: 'mailto:', to: 'help@life.example', subject: 'A question about Life', body: 'Hello,\n\n\n\nSent from Life 1.0.0 (41) on iOS 18.2' });
  });

  test('"Report a number" asks for the number, where it was and what was expected', () => {
    const mail = parse(support.supportLink('number', 'help@life.example')!);
    expect(mail.subject).toBe('A number in Life looks wrong');
    expect(mail.body).toBe('Hello,\n\nThis number looks wrong:\n\nWhere I saw it:\n\nWhat I expected:\n\n\n\nSent from Life 1.0.0 (41) on iOS 18.2');
  });

  test('without an address nothing opens, and Help can say support isn’t connected', async () => {
    expect(support.supportLink('question', null)).toBeNull();
    opened.length = 0;
    expect(await support.openSupport('question', null)).toBe('not-set');
    expect(opened).toEqual([]);
  });

  test('the mail app opens when there is one, and Help can say when there isn’t', async () => {
    opened.length = 0; mailApp = true;
    expect(await support.openSupport('number', 'help@life.example')).toBe('opened');
    expect(opened).toHaveLength(1);
    expect(opened[0]).toStartWith('mailto:help@life.example?subject=');
    mailApp = false;
    expect(await support.openSupport('number', 'help@life.example')).toBe('no-mail-app');
    mailApp = true;
  });

  test('Help uses it for both, and no longer only remembers the tap', () => {
    const settings = read('apps/mobile/src/screens/v26/settings.tsx');
    const help = settings.slice(settings.indexOf('export function HelpV26'), settings.indexOf('function LinkChevIcon'));
    expect(help).toContain("onPress={() => { void write('question'); }}");
    expect(help).toContain("onPress={() => { void write('number'); }}");
    expect(help).toContain('Support isn’t connected in this build yet, so nothing was sent.');
    expect(help).toContain('This phone has no mail app set up. Write to ${supportAddress} from any email.');
    expect(settings).not.toContain('support-report');
    expect(settings).not.toContain('support-email');
    expect(settings).not.toContain('Opens your mail app once support is connected');
  });

  test('the address is set per build, never written into the code', () => {
    const service = read('apps/mobile/src/services/support.ts');
    expect(service).toContain('supportAddressFrom(process.env.EXPO_PUBLIC_SUPPORT_EMAIL)');
    expect(service).not.toMatch(/['"`][^'"`\s]+@[a-z0-9-]+\.[a-z]{2,}['"`]/i);
    // The phone's own name often carries its owner's ("Ama’s iPhone"), so it never goes in.
    expect(service).not.toContain('deviceName');
  });

  test('the privacy policy already covers emails to support', () => {
    expect(read('docs/launch/privacy-policy.md')).toContain('| Emails to support |');
    expect(read('docs/launch/record-of-processing.md')).toContain('people who email support');
  });
});
