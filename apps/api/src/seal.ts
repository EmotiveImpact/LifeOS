/**
 * Seals third-party tokens (WHOOP, Oura, Open Banking) before they are stored, so a database copy alone can't use
 * them. AES-256-GCM with a fresh 12-byte nonce per value; the stored text is `v1.<nonce>.<ciphertext>` in base64url.
 */
const b64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64 = (text: string) => Uint8Array.from(atob(text.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));

export async function sealer(keyBase64: string) {
  const raw = Uint8Array.from(atob(keyBase64), c => c.charCodeAt(0));
  if (raw.length !== 32) throw new Error('TOKEN_KEY must be 32 bytes');
  const key = await crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
  return {
    async seal(plain: string): Promise<string> {
      const nonce = crypto.getRandomValues(new Uint8Array(12));
      const box = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, key, new TextEncoder().encode(plain)));
      return `v1.${b64(nonce)}.${b64(box)}`;
    },
    async open(sealed: string): Promise<string> {
      const [version, nonce, box] = sealed.split('.');
      if (version !== 'v1' || !nonce || !box) throw new Error('Not a sealed value');
      return new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(nonce) }, key, unb64(box)));
    },
  };
}
