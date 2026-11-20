import { z } from 'zod';
import type { Auth, Principal } from './auth';
import type { Db } from './db/client';
import { devices } from './db/schema';

type Route = (request: Request, principal: Principal) => Promise<Response>;

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const fail = (status: number, code: string) => json({ error: code }, status);

/** Postgres's "insufficient privilege" (42501), which row-level security raises, possibly wrapped by the driver. */
function refusedByPolicy(error: unknown): boolean {
  for (let e = error as { code?: unknown; errno?: unknown; cause?: unknown } | undefined, depth = 0; e && depth < 4; e = e.cause as typeof e, depth++) {
    if (e.code === '42501' || e.errno === '42501') return true;
  }
  return false;
}

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
  headers.set('access-control-expose-headers', 'set-auth-token');
  headers.append('vary', 'Origin');
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

/**
 * life's API as one Web-standard handler, so it runs on Bun locally and on any host that speaks `fetch` (decision 5).
 * `/health` and `/auth/*` are open; every other path needs a session and returns 401 without one, before routing,
 * so an unknown path doesn't reveal what exists.
 */
export function createApi(options: { db: Db; auth: Auth; now?: () => number; corsOrigins?: string[] }): (request: Request) => Promise<Response> {
  const { db, auth, now = Date.now } = options;
  const cors = new Set(options.corsOrigins ?? []);
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
  };
  const handle = async (request: Request): Promise<Response> => {
    const { pathname } = new URL(request.url);
    try {
      if (pathname === '/health') return request.method === 'GET' ? json({ ok: true, at: new Date(now()).toISOString() }) : fail(405, 'METHOD_NOT_ALLOWED');
      if (pathname === '/auth' || pathname.startsWith('/auth/')) return await auth.handler(request);
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
