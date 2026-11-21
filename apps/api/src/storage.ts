/**
 * Object storage for meal photos and scanned letters (MASTER_PLAN §3.1, BUILD_V26 Phase 23): Cloudflare R2 or S3,
 * which both encrypt at rest and both speak the S3 API. The API never streams a file itself; it hands out links
 * signed with AWS Signature Version 4 that let the holder do one thing to one object for a few minutes.
 *
 * Signing uses Web Crypto only, so it runs on Bun and on any host that speaks `fetch`, with no SDK.
 * `tests/api/files-account.test.ts` checks it against the example AWS documents for presigned URLs.
 */
export type StorageConfig = {
  /** The S3 endpoint, for example `https://<account>.r2.cloudflarestorage.com` or `https://s3.eu-west-2.amazonaws.com`. */
  endpoint: string;
  bucket: string;
  /** `auto` for R2; the bucket's region for S3. */
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  /**
   * `https://endpoint/bucket/key` (R2, most S3-compatible stores) or `https://bucket.endpoint/key` (AWS's own
   * style). Defaults to path style everywhere except amazonaws.com.
   */
  pathStyle?: boolean;
  fetch?: (input: string, init?: RequestInit) => Promise<Response>;
};

export type Method = 'GET' | 'PUT' | 'DELETE';

export interface Storage {
  /** A link that allows `method` on `key` for `expiresIn` seconds. An upload link only takes `contentType`. */
  sign(method: Method, key: string, options: { expiresIn: number; contentType?: string }): Promise<string>;
  /** Deletes objects. A key that is already gone is fine. */
  remove(keys: string[]): Promise<void>;
  /** Every key under a prefix. */
  list(prefix: string): Promise<string[]>;
}

const encoder = new TextEncoder();
const hex = (bytes: ArrayBuffer) => [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2, '0')).join('');
const sha256 = async (text: string) => hex(await crypto.subtle.digest('SHA-256', encoder.encode(text)));
async function hmac(key: ArrayBuffer | Uint8Array, text: string): Promise<ArrayBuffer> {
  const raw = key instanceof Uint8Array ? key.slice().buffer : key;
  const k = await crypto.subtle.importKey('raw', raw, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return crypto.subtle.sign('HMAC', k, encoder.encode(text));
}
/** RFC 3986 encoding, as SigV4 wants it: everything but unreserved characters, `!'()*` included. */
const rfc3986 = (value: string) => encodeURIComponent(value).replace(/[!'()*]/g, c => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
const encodePath = (key: string) => key.split('/').map(rfc3986).join('/');
const amzDate = (at: Date) => at.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

function locate(config: Pick<StorageConfig, 'endpoint' | 'bucket' | 'pathStyle'>, key: string) {
  const endpoint = new URL(config.endpoint);
  const pathStyle = config.pathStyle ?? !endpoint.hostname.endsWith('amazonaws.com');
  const host = pathStyle ? endpoint.host : `${config.bucket}.${endpoint.host}`;
  const path = pathStyle ? `/${rfc3986(config.bucket)}/${encodePath(key)}` : `/${encodePath(key)}`;
  return { origin: `${endpoint.protocol}//${host}`, host, path };
}

/**
 * A presigned URL (SigV4, query authentication, unsigned payload). `contentType` is signed as a header, so an
 * upload with any other type is refused by the store. `query` adds parameters such as `list-type=2`.
 */
export async function presign(
  config: Omit<StorageConfig, 'fetch'>,
  request: { method: Method; key: string; expiresIn: number; at: Date; contentType?: string; query?: Record<string, string> },
): Promise<string> {
  if (!Number.isInteger(request.expiresIn) || request.expiresIn < 1 || request.expiresIn > 604800) throw new Error('A signed link lasts between 1 second and 7 days');
  const { origin, host, path } = locate(config, request.key);
  const stamp = amzDate(request.at), day = stamp.slice(0, 8);
  const scope = `${day}/${config.region}/s3/aws4_request`;
  const headers: [string, string][] = [['host', host]];
  if (request.contentType !== undefined) headers.push(['content-type', request.contentType]);
  headers.sort(([a], [b]) => (a < b ? -1 : 1));
  const signedHeaders = headers.map(([name]) => name).join(';');
  const params: Record<string, string> = {
    ...request.query,
    'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
    'X-Amz-Credential': `${config.accessKeyId}/${scope}`,
    'X-Amz-Date': stamp,
    'X-Amz-Expires': String(request.expiresIn),
    'X-Amz-SignedHeaders': signedHeaders,
  };
  const query = Object.keys(params).map(k => [rfc3986(k), rfc3986(params[k])]).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)).map(([k, v]) => `${k}=${v}`).join('&');
  const canonical = [request.method, path, query, headers.map(([k, v]) => `${k}:${v.trim()}\n`).join(''), signedHeaders, 'UNSIGNED-PAYLOAD'].join('\n');
  const toSign = ['AWS4-HMAC-SHA256', stamp, scope, await sha256(canonical)].join('\n');
  let key: ArrayBuffer = await hmac(encoder.encode(`AWS4${config.secretAccessKey}`), day);
  for (const part of [config.region, 's3', 'aws4_request']) key = await hmac(key, part);
  return `${origin}${path}?${query}&X-Amz-Signature=${hex(await hmac(key, toSign))}`;
}

const unescapeXml = (text: string) => text.replace(/&(lt|gt|quot|apos|amp);/g, (_, e: string) => ({ lt: '<', gt: '>', quot: '"', apos: "'", amp: '&' })[e] ?? '');

/** R2 or S3 through signed links: the same code path the phone's uploads use, so there is one way in. */
export function s3Storage(config: StorageConfig, now: () => number = Date.now): Storage {
  const send = config.fetch ?? ((input: string, init?: RequestInit) => fetch(input, init));
  const sign: Storage['sign'] = (method, key, options) => presign(config, { method, key, expiresIn: options.expiresIn, contentType: options.contentType, at: new Date(now()) });
  return {
    sign,
    async remove(keys) {
      for (let i = 0; i < keys.length; i += 8) {
        await Promise.all(keys.slice(i, i + 8).map(async key => {
          const response = await send(await sign('DELETE', key, { expiresIn: 60 }), { method: 'DELETE' });
          if (!response.ok && response.status !== 404) throw new Error(`Storage refused to delete a file (${response.status})`);
        }));
      }
    },
    async list(prefix) {
      const keys: string[] = [];
      let token: string | undefined;
      for (let page = 0; page < 1000; page++) {
        const query: Record<string, string> = { 'list-type': '2', prefix, ...(token ? { 'continuation-token': token } : {}) };
        const url = await presign(config, { method: 'GET', key: '', expiresIn: 60, at: new Date(now()), query });
        const response = await send(url, { method: 'GET' });
        if (!response.ok) throw new Error(`Storage refused to list files (${response.status})`);
        const xml = await response.text();
        for (const match of xml.matchAll(/<Key>([^<]*)<\/Key>/g)) keys.push(unescapeXml(match[1]));
        token = /<IsTruncated>true<\/IsTruncated>/.test(xml) ? unescapeXml(/<NextContinuationToken>([^<]*)<\/NextContinuationToken>/.exec(xml)?.[1] ?? '') || undefined : undefined;
        if (!token) break;
      }
      return keys;
    },
  };
}

/** Storage from the environment, or null when it isn't set up yet (then `/files/*` answers 503). */
export function storageFromEnv(env: { STORAGE_ENDPOINT?: string; STORAGE_BUCKET?: string; STORAGE_REGION?: string; STORAGE_ACCESS_KEY_ID?: string; STORAGE_SECRET_ACCESS_KEY?: string }): Storage | null {
  const { STORAGE_ENDPOINT: endpoint, STORAGE_BUCKET: bucket, STORAGE_REGION: region, STORAGE_ACCESS_KEY_ID: accessKeyId, STORAGE_SECRET_ACCESS_KEY: secretAccessKey } = env;
  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) return null;
  return s3Storage({ endpoint, bucket, region: region || 'auto', accessKeyId, secretAccessKey });
}
