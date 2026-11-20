import type { TableName } from './schema';
import type { OutboxOp, RejectedOp, RemoteChange, SyncTransport } from './store';

/**
 * The phone's side of sync over the life API (BUILD_V26 Phase 22): `POST /sync/push`, `GET /sync/pull?cursor=` and
 * `POST /sync/forget`, with the session as a bearer token and this phone's id in `life-device` so a pull skips its
 * own changes. No React Native imports, so the tests drive it against the real handler.
 *
 * - Large outboxes go up in batches. If a later batch fails, the batches already stored are still acknowledged, and
 *   the rest stay queued for next time; the server stores a repeated op once, so nothing doubles.
 * - The server never sends `user_id`; pulled rows are given this phone's local scope, which is what the store checks.
 */
export type HttpTransportOptions = {
  /** The API's origin, for example `https://api.life.app`. */
  base: string;
  token: () => Promise<string | null>;
  deviceId: () => Promise<string>;
  fetch?: (input: string, init: RequestInit) => Promise<Response>;
  /** Ops per push request (the server takes at most 500). */
  batch?: number;
};

export class SyncHttpError extends Error {
  constructor(readonly status: number, message: string) { super(message); this.name = 'SyncHttpError'; }
}

export function createHttpTransport(options: HttpTransportOptions): SyncTransport {
  const size = Math.min(500, Math.max(1, options.batch ?? 200));
  const request = async <T>(path: string, init: RequestInit): Promise<T> => {
    const token = await options.token();
    if (!token) throw new SyncHttpError(401, 'Signed out');
    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, 'life-device': await options.deviceId() };
    const response = await (options.fetch ?? fetch)(`${options.base}${path}`, { ...init, headers });
    if (!response.ok) throw new SyncHttpError(response.status, `Sync request failed (${response.status})`);
    return await response.json() as T;
  };
  return {
    async push(_userId: string, operations: OutboxOp[]) {
      const acknowledged: string[] = [], rejected: RejectedOp[] = [];
      for (let i = 0; i < operations.length; i += size) {
        try {
          const body = await request<{ acknowledged?: unknown; rejected?: unknown }>('/sync/push', { method: 'POST', body: JSON.stringify({ operations: operations.slice(i, i + size) }) });
          if (!Array.isArray(body.acknowledged) || !Array.isArray(body.rejected)) throw new SyncHttpError(502, 'Invalid push response');
          acknowledged.push(...body.acknowledged.map(String));
          rejected.push(...(body.rejected as RejectedOp[]).map(r => ({ id: String(r.id), reason: String(r.reason) })));
        } catch (error) {
          if (i === 0) throw error;
          break;
        }
      }
      return { acknowledged, rejected };
    },
    async pull(userId: string, cursor: string | null) {
      const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : '';
      const body = await request<{ changes?: unknown; cursor?: unknown; more?: unknown }>(`/sync/pull${query}`, { method: 'GET' });
      if (!Array.isArray(body.changes) || (body.cursor !== null && typeof body.cursor !== 'string')) throw new SyncHttpError(502, 'Invalid pull response');
      const changes = (body.changes as { table: TableName; op: 'upsert' | 'delete'; row: Record<string, unknown> }[])
        .map(change => ({ table: change.table, op: change.op, row: { ...change.row, user_id: userId } }) as RemoteChange);
      return { changes, cursor: body.cursor as string | null, more: body.more === true };
    },
    async forget(_userId: string, table: TableName, ids: string[]) {
      await request('/sync/forget', { method: 'POST', body: JSON.stringify({ table, ids }) });
    },
  };
}
