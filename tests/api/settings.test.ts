import { describe, expect, test } from 'bun:test';
import { readEnv } from '../../apps/api/src/env';
import { sealer } from '../../apps/api/src/seal';

const key = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))));
const good = { DATABASE_URL: 'postgres://life_api@db.example/life', BETTER_AUTH_SECRET: 'x'.repeat(40), BETTER_AUTH_URL: 'https://api.example', TOKEN_KEY: key };

describe('settings', () => {
  test('start-up fails fast on a missing secret, naming it but never showing a value', () => {
    const { BETTER_AUTH_SECRET: _drop, ...missing } = good;
    expect(() => readEnv(missing)).toThrow(/BETTER_AUTH_SECRET/);
    try { readEnv({ ...good, TOKEN_KEY: 'short-and-secret' }); } catch (e) {
      expect(String(e)).toContain('TOKEN_KEY');
      expect(String(e)).not.toContain('short-and-secret');
    }
  });

  test('a complete set of settings is accepted', () => {
    expect(readEnv(good).PORT).toBe(8787);
  });
});

describe('sealed tokens', () => {
  test('a sealed token opens with the same key and reveals nothing without it', async () => {
    const box = await sealer(key);
    const sealed = await box.seal('whoop-refresh-token-123');
    expect(sealed).not.toContain('whoop');
    expect(await box.open(sealed)).toBe('whoop-refresh-token-123');
    expect(await box.seal('same')).not.toBe(await box.seal('same'));
    const other = await sealer(btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))));
    await expect(other.open(sealed)).rejects.toThrow();
  });
});
