import { presign, type StorageConfig } from '../../apps/api/src/storage';

/**
 * A stand-in for S3 or R2 that checks every link the way they do: the signature must match, the link must not have
 * expired, and an upload must carry the content type it was signed for. Objects live in a Map so tests can look.
 */
export function fakeBucket(config: Omit<StorageConfig, 'fetch'>, clock: () => number) {
  const objects = new Map<string, { body: Uint8Array; type: string }>();
  const refuse = (why: string) => new Response(`<Error><Code>${why}</Code></Error>`, { status: 403 });

  async function handle(input: string, init: RequestInit = {}): Promise<Response> {
    const url = new URL(input);
    const method = (init.method ?? 'GET').toUpperCase() as 'GET' | 'PUT' | 'DELETE';
    const q = url.searchParams;
    const date = q.get('X-Amz-Date') ?? '', expires = Number(q.get('X-Amz-Expires'));
    const signedAt = Date.UTC(+date.slice(0, 4), +date.slice(4, 6) - 1, +date.slice(6, 8), +date.slice(9, 11), +date.slice(11, 13), +date.slice(13, 15));
    if (!date || !Number.isFinite(expires) || !q.get('X-Amz-Signature')) return refuse('AccessDenied');
    if (clock() > signedAt + expires * 1000) return refuse('AccessDenied: Request has expired');
    const headers = new Headers(init.headers);
    const signed = (q.get('X-Amz-SignedHeaders') ?? '').split(';');
    const contentType = signed.includes('content-type') ? headers.get('content-type') ?? '' : undefined;
    // Sign the same request again with the secret; any change to the link or a missing header breaks the match.
    const prefix = config.pathStyle === false ? '/' : `/${config.bucket}/`;
    const key = decodeURIComponent(url.pathname.slice(prefix.length));
    const query: Record<string, string> = {};
    for (const [k, v] of q) if (!k.startsWith('X-Amz-')) query[k] = v;
    const again = await presign(config, { method, key, expiresIn: expires, at: new Date(signedAt), contentType, query });
    if (new URL(again).searchParams.get('X-Amz-Signature') !== q.get('X-Amz-Signature')) return refuse('SignatureDoesNotMatch');

    if (q.get('list-type') === '2') {
      const keys = [...objects.keys()].filter(k => k.startsWith(q.get('prefix') ?? '')).sort();
      return new Response(`<?xml version="1.0" encoding="UTF-8"?><ListBucketResult><IsTruncated>false</IsTruncated>${keys.map(k => `<Contents><Key>${k}</Key></Contents>`).join('')}</ListBucketResult>`, { status: 200 });
    }
    if (method === 'PUT') {
      objects.set(key, { body: new Uint8Array(await new Response(init.body ?? null).arrayBuffer()), type: headers.get('content-type') ?? '' });
      return new Response(null, { status: 200 });
    }
    if (method === 'DELETE') { objects.delete(key); return new Response(null, { status: 204 }); }
    const object = objects.get(key);
    return object ? new Response(object.body as BodyInit, { status: 200, headers: { 'content-type': object.type } }) : new Response('<Error><Code>NoSuchKey</Code></Error>', { status: 404 });
  }

  return { objects, fetch: handle };
}
