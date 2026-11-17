import { describe, expect, test } from 'bun:test';
import original from './fixtures/calmer-icons.json';
import { iconAliases, iconPaths } from '../../apps/mobile/src/design/iconPaths';
import { componentSize, palette, type } from '../../apps/mobile/src/design/tokens';

describe('original calmer mockup contract', () => {
  test('every original icon keeps its exact vector paths', () => {
    for (const [name, path] of Object.entries(original)) expect(iconPaths[name as keyof typeof iconPaths]).toBe(path);
  });
  test('navigation resolves to the original home, layers, person and microphone', () => {
    expect(['home-outline', 'layers-outline', 'person-outline', 'mic-outline'].map(name => iconAliases[name as keyof typeof iconAliases])).toEqual(['home', 'layers', 'person', 'mic']);
    expect(componentSize.iconStroke).toBe(1.6);
    expect(componentSize.navIcon).toBe(22);
  });
  test('reference type sizes and readable muted colours are retained', () => {
    expect([type.statement.fontSize, type.statement.lineHeight]).toEqual([24, 31]);
    expect([type.titleSerif.fontSize, type.titleSerif.lineHeight]).toEqual([30, 34]);
    expect([type.body.fontSize, type.body.lineHeight]).toEqual([15, 22]);
    expect(palette.dark.ink2).toBe('#8A8F98');
    expect(palette.light.ink2).toBe('#5C6068');
  });
});
