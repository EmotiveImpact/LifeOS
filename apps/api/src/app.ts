import { z } from 'zod';
import { DeleteBody, FileIdBody, PushBody, SignBody, closeAccount, deleteFile, exportAccount, purgeClosedAccounts, registerPush, sameSecret, signFile, tidyFiles } from './account';
import type { Auth, Principal } from './auth';
import type { Db } from './db/client';
import { devices } from './db/schema';
import { aiCapabilities, runAi, type AiOptions } from './router';
import type { Storage } from './storage';
import { MAX_PULL, MAX_PUSH, forget, forgettable, isTable, pull, push, refusedByPolicy } from './sync';

type Route = (request: Request, principal: Principal) => Promise<Response>;

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const fail = (status: number, code: string) => json({ error: code }, status);

const uuid = z.string().uuid();
/** The calling phone, from the `life-device` header: sync skips its own changes when it pulls. */
const deviceOf = (request: Request) => { const id = request.headers.get('life-device'); return id && uuid.safeParse(id).success ? id : null; };
const ForgetBody = z.object({ table: z.string(), ids: z.array(uuid).min(1).max(MAX_PUSH) });

/** What a phone sends to register itself. Anything else in the body, `user_id` included, is ignored. */
const DeviceBody = z.object({
  id: z.string().uuid(),
  platform: z.enum(['ios', 'android', 'web']),
  name: z.string().max(80).optional(),
});

/**
 * Browsers (the web preview, later a web app) may call from these origins. Phones send no Origin and need no CORS.
 * Sessions are bearer tokens, never cookies, so credentials are not allowed; `set-auth-token` is exposed so a browser
 * can read its session.
 */
function withCors(response: Response, origin: string): Response {
  const headers = new Headers(response.headers);
  headers.set('access-control-allow-origin', origin);
  headers.set('access-control-expose-headers', 'set-auth-token, life-model, life-tier');
  headers.append('vary', 'Origin');
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

/**
 * life's API as one Web-standard handler, so it runs on Bun locally and on any host that speaks `fetch` (decision 5).
 * `/health` and `/auth/*` are open; every other path needs a session and returns 401 without one, before routing,
 * so an unknown path doesn't reveal what exists.
 */
export type ApiOptions = {
  db: Db;
  auth: Auth;
  now?: () => number;
  corsOrigins?: string[];
  /** R2 or S3 (`src/storage.ts`). Without it, `/files/*` answers 503 and nothing else changes. */
  storage?: Storage | null;
  /** Days between "Delete account" and the hard delete. 0 deletes at once. */
  graceDays?: number;
  /** The bearer secret the host's scheduler sends to `POST /jobs/sweep`. Without it the route is closed. */
  jobsSecret?: string;
  /** Cloud models, tiers and allowances (`src/router.ts`). Without models, `/ai/run` answers 503 after its checks. */
  ai?: AiOptions;
};

export function createApi(options: ApiOptions): (request: Request) => Promise<Response> {
  const { db, auth, now = Date.now, storage = null, graceDays = 30, jobsSecret, ai } = options;
  const cors = new Set(options.corsOrigins ?? []);
  const readJson = async (request: Request): Promise<unknown> => request.json().catch(() => null);
  const routes: Record<string, Route> = {
    'GET /me': async (_request, principal) => json({ userId: principal.userId }),
    'POST /devices': async (request, principal) => {
      const parsed = DeviceBody.safeParse(await request.json().catch(() => null));
      if (!parsed.success) return fail(400, 'BAD_REQUEST');
      const { id, platform, name } = parsed.data;
      const seen = new Date(now());
      await db.withUser(principal.userId, tx => tx.insert(devices)
        .values({ id, user_id: principal.userId, platform, name: name ?? null, last_seen_at: seen })
        .onConflictDoUpdate({ target: devices.id, set: { platform, name: name ?? null, last_seen_at: seen } }));
      return json({ id }, 201);
    },
    'POST /sync/push': async (request, principal) => {
      const body = await request.json().catch(() => null) as { operations?: unknown } | null;
      if (!body || !Array.isArray(body.operations)) return fail(400, 'BAD_REQUEST');
      if (body.operations.length > MAX_PUSH) return fail(413, 'TOO_MANY_OPERATIONS');
      const operations = body.operations;
      return json(await db.withUser(principal.userId, tx => push(tx, principal.userId, deviceOf(request), operations)));
    },
    'GET /sync/pull': async (request, principal) => {
      const params = new URL(request.url).searchParams;
      const raw = params.get('cursor'), cursor = raw ? Number(raw) : 0;
      if (!Number.isSafeInteger(cursor) || cursor < 0) return fail(400, 'BAD_CURSOR');
      const limit = Math.min(MAX_PULL, Math.max(1, Number(params.get('limit')) || MAX_PULL));
      return json(await db.withUser(principal.userId, tx => pull(tx, deviceOf(request), cursor, limit)));
    },
    'POST /files/sign': async (request, principal) => {
      if (!storage) return fail(503, 'STORAGE_NOT_CONFIGURED');
      const parsed = SignBody.safeParse(await readJson(request));
      if (!parsed.success) return fail(400, 'BAD_REQUEST');
      // Temporary files nobody came back for go first; a failure here never blocks the person's own request.
      await tidyFiles(db, storage, principal.userId, now()).catch(error => console.error('file tidy failed', error instanceof Error ? error.message : error));
      const link = await signFile(db, storage, principal.userId, parsed.data, now());
      return link ? json(link, parsed.data.action === 'upload' ? 201 : 200) : fail(404, 'NOT_FOUND');
    },
    'POST /files/delete': async (request, principal) => {
      if (!storage) return fail(503, 'STORAGE_NOT_CONFIGURED');
      const parsed = FileIdBody.safeParse(await readJson(request));
      if (!parsed.success) return fail(400, 'BAD_REQUEST');
      return await deleteFile(db, storage, principal.userId, parsed.data.id) ? json({ deleted: true }) : fail(404, 'NOT_FOUND');
    },
    'POST /push/register': async (request, principal) => {
      const parsed = PushBody.safeParse(await readJson(request));
      if (!parsed.success) return fail(400, 'BAD_REQUEST');
      return await registerPush(db, principal.userId, parsed.data) ? json({ device: parsed.data.device }) : fail(404, 'DEVICE_NOT_FOUND');
    },
    'GET /account/export': async (_request, principal) => {
      const at = now(), response = json(await exportAccount(db, principal.userId, at));
      response.headers.set('content-disposition', `attachment; filename="life-export-${new Date(at).toISOString().slice(0, 10)}.json"`);
      return response;
    },
    'POST /account/delete': async (request, principal) => {
      if (!DeleteBody.safeParse(await readJson(request)).success) return fail(400, 'CONFIRM_REQUIRED');
      return json(await closeAccount(db, storage, principal.userId, now(), graceDays));
    },
    'POST /ai/run': async (request, principal) => {
      const reply = await runAi(db, principal.userId, await readJson(request), ai, now(), request.signal);
      const response = json(reply.body, reply.status);
      for (const [name, value] of Object.entries(reply.headers ?? {})) response.headers.set(name, value);
      return response;
    },
    'GET /ai/capabilities': async (_request, principal) => json(await aiCapabilities(db, principal.userId, ai, now())),
    'POST /sync/forget': async (request, principal) => {
      const parsed = ForgetBody.safeParse(await request.json().catch(() => null));
      if (!parsed.success || !isTable(parsed.data.table) || !forgettable.has(parsed.data.table)) return fail(400, 'BAD_REQUEST');
      const { table, ids } = parsed.data as { table: 'memory'; ids: string[] };
      return json({ forgotten: await db.withUser(principal.userId, tx => forget(tx, table, ids)) });
    },
  };
  const handle = async (request: Request): Promise<Response> => {
    const { pathname } = new URL(request.url);
    try {
      if (pathname === '/health') return request.method === 'GET' ? json({ ok: true, at: new Date(now()).toISOString() }) : fail(405, 'METHOD_NOT_ALLOWED');
      if (pathname === '/auth' || pathname.startsWith('/auth/')) return await auth.handler(request);
      // The host's scheduler, with its own secret: deletes accounts whose grace period has ended.
      if (pathname === '/jobs/sweep' && request.method === 'POST') {
        const given = /^Bearer (.+)$/.exec(request.headers.get('authorization') ?? '')?.[1];
        if (!jobsSecret || !given || !sameSecret(given, jobsSecret)) return fail(401, 'UNAUTHENTICATED');
        return json(await purgeClosedAccounts(db, storage, now()));
      }
      const principal = await auth.getPrincipal(request);
      if (!principal) return fail(401, 'UNAUTHENTICATED');
      const route = routes[`${request.method} ${pathname}`];
      return route ? await route(request, principal) : fail(404, 'NOT_FOUND');
    } catch (error) {
      // Row-level security refused the write: the row belongs to someone else.
      if (refusedByPolicy(error)) return fail(403, 'FORBIDDEN');
      // Details go to the host's logs, never to the caller.
      console.error('api error', pathname, error instanceof Error ? error.message : error);
      return fail(500, 'SERVER_ERROR');
    }
  };
  return async request => {
    const origin = request.headers.get('origin');
    const allowed = origin !== null && cors.has(origin);
    if (request.method === 'OPTIONS') {
      if (!allowed) return new Response(null, { status: 204 });
      return withCors(new Response(null, { status: 204, headers: {
        'access-control-allow-methods': 'GET, POST, PUT, PATCH, DELETE',
        'access-control-allow-headers': 'content-type, authorization',
        'access-control-max-age': '600',
      } }), origin);
    }
    const response = await handle(request);
    return allowed ? withCors(response, origin) : response;
  };
}
