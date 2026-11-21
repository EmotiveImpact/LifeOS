import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Fix F-64: screens that nothing links to yet, or that a real account can still reach, held the sample life's figures.
 * Each now has a real or day-one state on a real account. Sample builds keep the board's version.
 */
const root = join(import.meta.dir, '../..');
const read = (path: string) => readFileSync(join(root, path), 'utf8');
const between = (source: string, from: string, to: string) => {
  const start = source.indexOf(from);
  if (start < 0) throw new Error(`missing ${from}`);
  const end = source.indexOf(to, start + from.length);
  return source.slice(start, end < 0 ? undefined : end);
};

describe('the morning brief', () => {
  const today = read('apps/mobile/src/screens/v26/today.tsx');
  const real = between(today, 'function MorningBriefRealV26', 'function MorningBriefSampleV26');

  test('a real account gets its own brief', () => {
    expect(today).toContain('return SHOW_SAMPLES ? <MorningBriefSampleV26 /> : <MorningBriefRealV26 />;');
  });

  test('built from this phone’s sleep and the day’s plan, never the sample’s', () => {
    expect(real).toContain('const body = useBodyToday(), { left } = useDayPlan();');
    expect(real).toContain('body?.sleep?.last');
    expect(real).toContain("'{Nothing planned yet.} Tell Life what’s going on and it plans the day.'");
    for (const sample of ['seed.', 'one bill', '20-minute run', 'first home']) expect({ sample, found: real.includes(sample) }).toEqual({ sample, found: false });
  });

  test('no Listen control pretends to play a brief nobody recorded', () => {
    expect(real).not.toContain('Waveform');
    expect(real).not.toContain('Listen');
    expect(real).not.toContain('brief-playing');
  });

  test('a name or a move with braces or @ in it stays plain words', () => {
    expect(today).toContain("const plainWords = (s: string) => s.replace(/[{}@]/g, '').trim();");
    expect(real).toContain("name ? `Good morning, ${name}` : 'Good morning'");
  });
});

describe('the preview of Today’s numbers', () => {
  const customise = between(read('apps/mobile/src/screens/v26/today.tsx'), 'export function CustomiseV26', '/** Six dots in two columns');

  test('shows what Today will show: this phone’s readings on a real account', () => {
    expect(customise).toContain('const body = useBodyToday(), fuel = useFuelDay();');
    expect(customise).toContain('SHOW_SAMPLES ? metricValue(n, data.prefs.hideNumbers)');
    expect(customise).toContain(': realMetricValue(n, body);');
    expect(customise).toContain('const v = preview(n), area = tintFor(n);');
    expect(customise).not.toContain('const v = metricValue(');
  });
});

describe('documents and renewals', () => {
  const money = read('apps/mobile/src/screens/v26/money.tsx');
  const dayOne = between(money, 'function DocsNotYetV26', 'export function DocDetailV26');

  test('a real account sees the day-one shape, never the sample passport or car insurance', () => {
    expect(money).toContain('export function DocDetailV26() { return SHOW_SAMPLES ? <DocDetailSampleV26 /> : <DocsNotYetV26 screen="docdetail" title="Document" />; }');
    expect(money).toContain('export function RenewalV26() { return SHOW_SAMPLES ? <RenewalSampleV26 /> : <DocsNotYetV26 screen="renewal" title="Renewal" />; }');
    for (const sample of ['seedDocuments', 'photos.passport', "'passport'", 'insuranceRenewal', '14 February']) expect({ sample, found: dayOne.includes(sample) }).toEqual({ sample, found: false });
    expect(dayOne).toContain("nav.go('scan')");
  });
});

describe('scanning a letter', () => {
  const talk = read('apps/mobile/src/screens/v26/talk.tsx');

  test('a real account scans its own letter, never the sample Lambeth bill', () => {
    expect(talk).toContain('return SHOW_SAMPLES ? <ScanSampleV26 /> : <AttachV26 screen="scan" then="chat" />;');
  });

  test('the scan goes into a chat, where Life reads it with you', () => {
    const attach = between(talk, 'export function AttachV26', '/* ───────────────────────── Letter, understood');
    expect(attach).toContain("if (then === 'chat') nav.replace('chat'); else nav.close();");
    expect(attach).toContain("'{Scan a letter or a document,} and Life reads it with you.'");
  });

  test('the camera’s primer keeps its example labelled as one', () => {
    expect(read('apps/mobile/src/screens/v26/firstopen.tsx')).toContain('WHAT LIFE WOULD READ · AN EXAMPLE');
  });
});
