import { and, eq, isNotNull, lte } from 'drizzle-orm';
import type { PgTable } from 'drizzle-orm/pg-core';
import { z } from 'zod';
import type { Db } from './db/client';
import { accountClosures, accounts, aiUsage, devices, files, oauthTokens, phoneTables, sessions, users } from './db/schema';
import type { Storage } from './storage';

/**
 * Files, push and a person's data (BUILD_V26 Phase 23).
 *
 * - Files: the phone asks for a signed link and talks to storage directly. The server picks every key, so nobody
 *   can name another person's file, and a link lasts five minutes. A file that isn't kept goes once it has been read
 *   (`POST /files/delete`), and in any case a day later.
 * - Export: everything the server holds for the person, as one JSON file. Sealed wearable and bank tokens are never
 *   included, only which services are connected.
 * - Delete: every session ends at once and the account closes. Signing in again within the grace period (30 days,
 *   as the delete screen promises) keeps it. After that the sweep deletes the person, every row and every file.
 */

export const LINK_SECONDS = 300;
export const TEMPORARY_FILE_MS = 24 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export const SignBody = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('upload'),
    kind: z.enum(['meal_photo', 'letter', 'document']),
    contentType: z.enum(['image/jpeg', 'image/png', 'image/heic', 'image/webp', 'application/pdf']),
    keep: z.boolean().optional(),
  }),
  z.object({ action: z.literal('read'), id: z.string().uuid() }),
]);
export const FileIdBody = z.object({ id: z.string().uuid() });
/** Expo push tokens only: the server sends through Expo to APNs and FCM (SYSTEM_DESIGN §3). `null` turns push off. */
export const PushBody = z.object({ device: z.string().uuid(), token: z.string().regex(/^Expo(nent)?PushToken\[[A-Za-z0-9_-]{1,200}\]$/).nullable() });
export const DeleteBody = z.object({ confirm: z.literal('DELETE') });

export type SignedLink = { id: string; url: string; method: 'PUT' | 'GET'; headers?: Record<string, string>; expiresAt: string };

/** Removes this person's temporary files nobody came back for. Storage first, so a failure leaves the record to retry. */
export async function tidyFiles(db: Db, storage: Storage, userId: string, now: number) {
  const due = await db.withUser(userId, tx => tx.select({ id: files.id, key: files.key }).from(files).where(and(isNotNull(files.delete_after), lte(files.delete_after, new Date(now)))));
  if (!due.length) return;
  await storage.remove(due.map(f => f.key));
  await db.withUser(userId, async tx => { for (const f of due) await tx.delete(files).where(eq(files.id, f.id)); });
}

export async function signFile(db: Db, storage: Storage, userId: string, body: z.infer<typeof SignBody>, now: number): Promise<SignedLink | null> {
  const expiresAt = new Date(now + LINK_SECONDS * 1000).toISOString();
  if (body.action === 'upload') {
    const id = crypto.randomUUID(), keep = body.keep === true;
    const key = `${keep ? 'keep' : 'tmp'}/${userId}/${id}`;
    await db.withUser(userId, tx => tx.insert(files).values({ id, user_id: userId, key, kind: body.kind, content_type: body.contentType, keep, delete_after: keep ? null : new Date(now + TEMPORARY_FILE_MS), created_at: new Date(now) }));
    const url = await storage.sign('PUT', key, { expiresIn: LINK_SECONDS, contentType: body.contentType });
    return { id, url, method: 'PUT', headers: { 'content-type': body.contentType }, expiresAt };
  }
  // Row-level security hides other people's files, so their ids look exactly like ids that don't exist.
  const [file] = await db.withUser(userId, tx => tx.select().from(files).where(eq(files.id, body.id)));
  if (!file || (file.delete_after && file.delete_after.getTime() <= now)) return null;
  return { id: file.id, url: await storage.sign('GET', file.key, { expiresIn: LINK_SECONDS }), method: 'GET', expiresAt };
}

/** Deletes one of this person's files from storage, then its record. False if there is no such file of theirs. */
export async function deleteFile(db: Db, storage: Storage, userId: string, id: string): Promise<boolean> {
  const [file] = await db.withUser(userId, tx => tx.select({ key: files.key }).from(files).where(eq(files.id, id)));
  if (!file) return false;
  await storage.remove([file.key]);
  await db.withUser(userId, tx => tx.delete(files).where(eq(files.id, id)));
  return true;
}

/** Sets or clears one of this person's phones' push token. False if the phone isn't theirs. */
export async function registerPush(db: Db, userId: string, body: z.infer<typeof PushBody>): Promise<boolean> {
  const updated = await db.withUser(userId, tx => tx.update(devices).set({ push_token: body.token }).where(eq(devices.id, body.device)).returning({ id: devices.id }));
  return updated.length > 0;
}

const withoutOwner = (rows: Record<string, unknown>[]) => rows.map(({ user_id: _owner, ...row }) => row);

/** Everything the server holds for one person. Row-level security means nobody else's rows can be read here. */
export async function exportAccount(db: Db, userId: string, now: number) {
  const [account] = await db.db.select({ id: users.id, name: users.name, email: users.email, emailVerified: users.emailVerified, createdAt: users.createdAt }).from(users).where(eq(users.id, userId));
  const signIns = await db.db.select({ provider: accounts.providerId, since: accounts.createdAt }).from(accounts).where(eq(accounts.userId, userId));
  const [closing] = await db.db.select({ requestedAt: accountClosures.requested_at, deleteAfter: accountClosures.delete_after }).from(accountClosures).where(eq(accountClosures.user_id, userId));
  const held = await db.withUser(userId, async tx => {
    const tables: Record<string, Record<string, unknown>[]> = {};
    for (const [name, table] of Object.entries(phoneTables)) tables[name] = withoutOwner(await tx.select().from(table as unknown as PgTable) as Record<string, unknown>[]);
    const phones = await tx.select({ id: devices.id, platform: devices.platform, name: devices.name, created_at: devices.created_at, last_seen_at: devices.last_seen_at, push_token: devices.push_token }).from(devices);
    const connections = await tx.select({ provider: oauthTokens.provider, scope: oauthTokens.scope, expires_at: oauthTokens.expires_at, created_at: oauthTokens.created_at, updated_at: oauthTokens.updated_at }).from(oauthTokens);
    const stored = await tx.select({ id: files.id, kind: files.kind, content_type: files.content_type, keep: files.keep, delete_after: files.delete_after, created_at: files.created_at }).from(files);
    const usage = withoutOwner(await tx.select().from(aiUsage));
    return { tables, devices: phones.map(({ push_token, ...p }) => ({ ...p, push: push_token !== null })), connections, files: stored, aiUsage: usage };
  });
  return {
    format: 'life-export',
    version: 1,
    exportedAt: new Date(now).toISOString(),
    account: account ?? null,
    signIns,
    closing: closing ?? null,
    ...held,
    about: 'Everything life’s server holds for you. Files themselves are not inside: ask for each one from the app while it is kept. Tokens for connected services are never exported.',
  };
}

/** Deletes a person for good: their files from storage, then their account, which removes every row by cascade. */
export async function purgeAccount(db: Db, storage: Storage | null, userId: string) {
  const recorded = await db.withUser(userId, tx => tx.select({ key: files.key }).from(files));
  if (storage) {
    const listed = [...await storage.list(`tmp/${userId}/`), ...await storage.list(`keep/${userId}/`)];
    await storage.remove([...new Set([...recorded.map(f => f.key), ...listed])]);
  } else if (recorded.length) {
    throw new Error('This account has files but storage is not set up, so it cannot be deleted yet');
  }
  await db.db.delete(users).where(eq(users.id, userId));
}

/** Closes the account: every session ends now, push stops, and the data goes after the grace period (or now, with none). */
export async function closeAccount(db: Db, storage: Storage | null, userId: string, now: number, graceDays: number) {
  if (graceDays <= 0) {
    await purgeAccount(db, storage, userId);
    return { closed: true as const, deleteAfter: new Date(now).toISOString() };
  }
  const deleteAfter = new Date(now + graceDays * DAY_MS);
  await db.withUser(userId, tx => tx.update(devices).set({ push_token: null }));
  await db.db.transaction(async tx => {
    await tx.insert(accountClosures).values({ user_id: userId, requested_at: new Date(now), delete_after: deleteAfter })
      .onConflictDoUpdate({ target: accountClosures.user_id, set: { requested_at: new Date(now), delete_after: deleteAfter } });
    await tx.delete(sessions).where(eq(sessions.userId, userId));
  });
  return { closed: true as const, deleteAfter: deleteAfter.toISOString() };
}

/** The host's scheduled job: deletes every account whose grace period has ended. One failure doesn't stop the rest. */
export async function purgeClosedAccounts(db: Db, storage: Storage | null, now: number) {
  const due = await db.db.select({ userId: accountClosures.user_id }).from(accountClosures).where(lte(accountClosures.delete_after, new Date(now)));
  let purged = 0, failed = 0;
  for (const { userId } of due) {
    try { await purgeAccount(db, storage, userId); purged++; }
    catch (error) { failed++; console.error('purge failed', error instanceof Error ? error.message : error); }
  }
  return { purged, failed };
}

/** Compares secrets without leaking, through timing, how much of a guess was right. */
export function sameSecret(given: string, expected: string): boolean {
  const a = new TextEncoder().encode(given), b = new TextEncoder().encode(expected);
  let diff = a.length ^ b.length;
  for (let i = 0; i < b.length; i++) diff |= (a[i] ?? 0) ^ b[i];
  return diff === 0;
}
