import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Fix F-51: the six screens Phase 30's walk found without a heading now have one, so VoiceOver's rotor and TalkBack's
 * headings menu can find the top of each. The walk itself ran in the browser (role="heading" on each screen).
 */
const root = join(import.meta.dir, '../..');
const read = (path: string) => readFileSync(join(root, 'apps/mobile/src/screens/v26', path), 'utf8');

describe('every screen has a heading', () => {
  test('the camera, barcode and label screens: the bar’s words', () => {
    expect(read('fuel.tsx')).toContain('numberOfLines={1} accessibilityRole="header">{label}</Text>');
  });
  test('the focus timer: what you’re working on', () => {
    expect(read('today.tsx')).toContain('accessibilityRole="header">Portfolio case study</Text>');
  });
  test('the workout timer: the kind of workout, and whether it’s running', () => {
    expect(read('body.tsx')).toContain("accessibilityRole=\"header\" accessibilityLabel={`${w.kind}, ${running ? 'moving time' : 'paused'}`}");
  });
  test('a chat thread: its title, while the clock button still opens your conversations', () => {
    const talk = read('talk.tsx');
    expect(talk).toContain('accessibilityRole="header" accessibilityLabel="Life, your conversations"');
    expect(talk).toContain("action: { kind: 'icon', icon: 'clock', label: 'Your conversations', onPress: () => nav.go('chathistory') }");
  });
  test('the lock screen previews: the date', () => {
    expect(read('outside.tsx')).toContain('accessibilityRole="header">{lockDate()}</Text>');
  });
});
