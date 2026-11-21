import { describe, expect, mock, test } from 'bun:test';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createElement } from '../../apps/mobile/node_modules/react';
import { motion, springs } from '../../apps/mobile/src/design/tokens';

/**
 * Phase 30's quality pass, kept as checks so it holds: motion as MOTION.md describes it (springs from the tokens, no
 * bounce, Reduce Motion respected) and the screen-reader rules the pass fixed (every drag has a swipe-up-or-down way
 * to do the same, every text field is named and stops growing at the largest text size).
 */
const SRC = join(import.meta.dir, '../../apps/mobile/src');
const files = (dir: string): string[] => readdirSync(dir).flatMap(name => {
  const path = join(dir, name);
  return statSync(path).isDirectory() ? files(path) : /\.tsx?$/.test(name) ? [path] : [];
});
const sources = files(SRC).map(path => ({ path: relative(SRC, path), text: readFileSync(path, 'utf8') }));
const offenders = (check: (text: string, path: string) => boolean) => sources.filter(f => check(f.text, f.path)).map(f => f.path);
/** The text of each JSX element opened with `<Tag`, up to the `>` that closes its opening tag (braces balanced). */
const openingTags = (text: string, tag: string) => {
  const out: string[] = [];
  for (let i = text.indexOf(`<${tag}`); i >= 0; i = text.indexOf(`<${tag}`, i + 1)) {
    if (/[\w.]/.test(text[i + tag.length + 1] ?? '')) continue;
    let depth = 0, j = i + 1;
    for (; j < text.length; j++) {
      const c = text[j];
      if (c === '{') depth++;
      else if (c === '}') depth--;
      else if (c === '>' && depth === 0 && text[j - 1] !== '=') break;
    }
    out.push(text.slice(i, j + 1));
  }
  return out;
};

describe('motion, as MOTION.md describes it', () => {
  test('the named springs settle without a visible bounce', () => {
    for (const s of Object.values(springs)) expect(s.damping / (2 * Math.sqrt(s.stiffness * s.mass))).toBeGreaterThanOrEqual(0.95);
    for (const [name, s] of Object.entries(motion)) if (typeof s === 'object' && 'dampingRatio' in s) expect(s.dampingRatio, name).toBeGreaterThanOrEqual(name === 'bouncy' ? 0.9 : 1);
  });
  test('everything animates with Reanimated, never React Native’s own Animated or LayoutAnimation', () => {
    expect(offenders(t => /import\s*\{[^}]*\b(Animated|LayoutAnimation)\b[^}]*\}\s*from\s*'react-native'/.test(t))).toEqual([]);
  });
  test('springs take their settings from the tokens, not numbers written in a screen', () => {
    expect(offenders(t => /withSpring\([^,()]+,\s*\{/.test(t))).toEqual([]);
    expect(offenders(t => /\.springify\(\)(?!\.(dampingRatio\(1\)|damping\(springs\.))/.test(t))).toEqual([]);
    expect(offenders(t => /\.dampingRatio\(0\.[0-8]/.test(t))).toEqual([]);
  });
  test('nothing bounces, flips or spins in', () => {
    expect(offenders(t => /\b(BounceIn\w*|BounceOut\w*|ZoomIn\w*|FlipIn\w*|LightSpeedIn\w*|RotateIn\w*|PinwheelIn|RollIn\w*|StretchIn\w*)\b/.test(t))).toEqual([]);
  });
  test('linear easing only turns the orb’s ring, which spins without end', () => {
    expect(offenders(t => t.includes('Easing.linear'))).toEqual(['design/components/Chrome.tsx']);
  });
  test('every file that animates by hand has a Reduce Motion path', () => {
    expect(offenders(t => /\b(withSpring|withTiming|withRepeat)\(/.test(t) && !/\bcalm\b|useCalmMotion|useReducedMotion/.test(t))).toEqual([]);
  });
});

describe('screen readers', () => {
  test('anything you drag can also be stepped with VoiceOver’s swipe up and down (TalkBack’s volume keys)', () => {
    const bad: string[] = [];
    for (const f of sources) for (const tag of [...openingTags(f.text, 'View'), ...openingTags(f.text, 'Animated.View'), ...openingTags(f.text, 'Press'), ...openingTags(f.text, 'Pressable')]) {
      if (/accessibilityRole=(?:"adjustable"|\{[^}]*'adjustable')/.test(tag) && !tag.includes('accessibilityActions')) bad.push(f.path);
    }
    expect(bad).toEqual([]);
    expect(offenders(t => t.includes('PanResponder.create') && !t.includes('accessibilityActions'))).toEqual([]);
  });
  test('every text field has a name and stops growing at the largest text size', () => {
    const bad: string[] = [];
    for (const f of sources) for (const tag of openingTags(f.text, 'TextInput')) {
      if (!/accessibilityLabel|aria-label/.test(tag) || !tag.includes('maxFontSizeMultiplier')) bad.push(`${f.path}: ${tag.slice(0, 80)}`);
    }
    expect(bad).toEqual([]);
  });
});

describe('a control inside a row or card', () => {
  test('a switch at the end of a row makes the row the switch; a labelled button becomes a named action', async () => {
    mock.module('react-native', () => ({ View: 'View' }));
    const { nestedActionProps, nestedControl } = await import('../../apps/mobile/src/design/a11y');
    let flipped: boolean | null = null, ran = 0, opened = 0;
    const sw = nestedControl(createElement('Switch', { value: false, onChange: (v: boolean) => { flipped = v; }, accessibilityLabel: 'Nudges' }));
    expect(sw?.kind).toBe('switch');
    if (sw?.kind === 'switch') sw.set(!sw.value);
    expect(flipped).toBe(true);
    const plus = nestedControl(createElement('PlusRound', { label: 'Log Oats', onPress: () => { ran++; } }));
    expect(plus).toMatchObject({ kind: 'action', label: 'Log Oats' });
    const props = nestedActionProps(plus, () => { opened++; });
    expect(props.accessibilityActions).toEqual([{ name: 'activate' }, { name: 'nested', label: 'Log Oats' }]);
    props.onAccessibilityAction?.({ nativeEvent: { actionName: 'nested' } } as never);
    props.onAccessibilityAction?.({ nativeEvent: { actionName: 'activate' } } as never);
    expect([ran, opened]).toEqual([1, 1]);
    expect(nestedControl(createElement('Chip', { label: 'Preview' }))).toBeNull();
    expect(nestedControl(createElement('RoundButton', { label: 'Off', onPress: () => {}, disabled: true }))).toBeNull();
    expect(nestedControl('text')).toBeNull();
  });
});
