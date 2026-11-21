import { describe, expect, test } from 'bun:test';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';

/**
 * The Maestro flows (apps/mobile/.maestro, Phase 30) run on a phone or simulator, not here. These checks keep them
 * honest between device runs: every file a flow points at exists, and every id a flow taps is still on a field.
 */
const root = join(import.meta.dir, '../../apps/mobile/.maestro');
const src = join(import.meta.dir, '../../apps/mobile/src');
const walk = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]);
const flows = walk(root).filter(f => f.endsWith('.yaml') && !f.endsWith('config.yaml'));
const parse = (file: string) => readFileSync(file, 'utf8').split(/^---$/m).map(doc => Bun.YAML.parse(doc));

function* commands(list: unknown): Generator<[string, unknown]> {
  for (const c of Array.isArray(list) ? list : []) {
    if (typeof c === 'string') { yield [c, null]; continue; }
    for (const [name, arg] of Object.entries(c as Record<string, unknown>)) {
      yield [name, arg];
      if (name === 'runFlow' && arg && typeof arg === 'object' && 'commands' in arg) yield* commands((arg as { commands: unknown }).commands);
    }
  }
}

describe('Maestro flows', () => {
  test('the workspace lists the four core flows, and they exist', () => {
    const config = Bun.YAML.parse(readFileSync(join(root, 'config.yaml'), 'utf8')) as { flows: string[] };
    expect(config.flows).toEqual(['onboarding.yaml', 'talk-file.yaml', 'snap-meal.yaml', 'lesson.yaml']);
    for (const f of config.flows) expect(existsSync(join(root, f))).toBe(true);
  });

  test('every flow is for Life and every file it runs, scripts or media it adds is there', () => {
    expect(flows.length).toBeGreaterThanOrEqual(10);
    for (const file of flows) {
      const docs = parse(file);
      expect((docs[0] as { appId?: string }).appId, relative(root, file)).toBe('app.life.os');
      for (const [name, arg] of commands(docs[docs.length - 1])) {
        const paths = name === 'runFlow' && typeof arg === 'string' ? [arg]
          : name === 'runFlow' && arg && typeof arg === 'object' && 'file' in arg ? [(arg as { file: string }).file]
          : name === 'runScript' ? [typeof arg === 'string' ? arg : (arg as { file: string }).file]
          : name === 'addMedia' ? (arg as string[]) : [];
        for (const p of paths) expect(existsSync(join(dirname(file), p)), `${relative(root, file)} → ${p}`).toBe(true);
      }
    }
  });

  test('every id a flow taps is a testID in the app', () => {
    const code = walk(src).filter(f => f.endsWith('.tsx')).map(f => readFileSync(f, 'utf8')).join('\n');
    const ids = new Set<string>();
    for (const file of flows) for (const [name, arg] of commands(parse(file).at(-1))) if (name === 'tapOn' && arg && typeof arg === 'object' && 'id' in arg) ids.add((arg as { id: string }).id);
    expect(ids.size).toBeGreaterThan(0);
    for (const id of ids) expect(code.includes(`testID="${id}"`), id).toBe(true);
  });
});
