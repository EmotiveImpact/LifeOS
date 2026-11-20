/**
 * The same thing gets the same id on every phone of one account (Phase 22). Screen entities have keys like
 * `profile:main` or `food_entry:<meal id>`; hashing the key with the account id gives a UUID that two phones work out
 * independently, so the server merges their copies (newer edit wins) instead of keeping two. Before sign-in the
 * phone's own local id is the namespace; signing in moves those rows to the account's ids (`adoptAccount`).
 *
 * The hash only needs to spread keys evenly, not to be secret: ids are scoped by account and row-level security
 * stops one person touching another's rows whatever the id. 128 bits from four 32-bit lanes (cyrb128).
 */
function lanes(text: string): [number, number, number, number] {
  let h1 = 1779033703, h2 = 3144134277, h3 = 1013904242, h4 = 2773480762;
  for (let i = 0; i < text.length; i++) {
    const k = text.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  h1 ^= h2 ^ h3 ^ h4; h2 ^= h1; h3 ^= h1; h4 ^= h1;
  return [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0];
}

const hex = (n: number) => n.toString(16).padStart(8, '0');

/** A version-8 UUID (RFC 9562, "custom") for `namespace` + `table` + `key`. */
export function stableId(namespace: string, table: string, key: string): string {
  const [a, b, c, d] = lanes(`life:${namespace}:${table}:${key}`);
  const h = hex(a) + hex(b) + hex(c) + hex(d);
  const variant = ((parseInt(h[16], 16) & 0x3) | 0x8).toString(16);
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-8${h.slice(13, 16)}-${variant}${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

/** A short fingerprint of some text, to tell whether a screen entity changed since the phone last wrote it. */
export function digest(text: string): string {
  const [a, b] = lanes(text);
  return hex(a) + hex(b);
}
