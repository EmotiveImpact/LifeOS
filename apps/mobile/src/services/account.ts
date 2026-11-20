import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import { setBrainSessionProvider } from './brain';
import { sessionStore } from './sessionStore';

/**
 * Accounts (BUILD_V26 Phase 21). The phone talks to the life API's Better Auth routes over plain `fetch`, with no
 * client library. The session token arrives in the `set-auth-token` header, lives in SecureStore (memory only in the
 * web preview) and goes out as a bearer header. Identity is only ever the server's session: the phone never sends a
 * user id.
 *
 * With no API configured (`EXPO_PUBLIC_LIFE_API_URL` unset, as in dev builds and screenshots), sign-in stays a local
 * preview, as it was before Phase 21, and nothing leaves the phone.
 */

export type SignInProvider = 'apple' | 'google' | 'email';
/** Why a sign-in didn't finish, in words the sheet can show. */
export type AccountProblem = 'offline' | 'bad-code' | 'too-many' | 'not-ready' | 'failed';
export type AccountResult<T> = { ok: true; data: T; mode: 'account' | 'local-preview' } | { ok: false; problem: AccountProblem };
export interface SignedIn { userId: string; name: string; email: string }

const SESSION_KEY = 'life.session', DEVICE_KEY = 'life.device-id';
const endpoint = process.env.EXPO_PUBLIC_LIFE_API_URL;
const loopback = (url: URL) => __DEV__ && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);

/** The API's origin, or null when none is configured. Plain http is allowed only to this computer in development. */
export function accountBase(): string | null {
  if (!endpoint) return null;
  try {
    const url = new URL(endpoint);
    if (url.username || url.password || (url.protocol !== 'https:' && !loopback(url))) return null;
    return url.origin;
  } catch { return null; }
}

/** True when sign-in goes to a real account; false while it is still a local preview. */
export const accountsLive = () => accountBase() !== null;

export const sessionToken = () => sessionStore.get(SESSION_KEY);
setBrainSessionProvider(sessionToken);

async function call(path: string, body: unknown, token?: string | null, method: 'POST' | 'GET' = 'POST'): Promise<Response | null> {
  const base = accountBase();
  if (!base) return null;
  try {
    return await fetch(`${base}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: method === 'GET' ? undefined : JSON.stringify(body),
    });
  } catch { return null; }
}

function problemOf(response: Response | null, code?: string): AccountProblem {
  if (!response) return 'offline';
  if (response.status === 429 || code === 'TOO_MANY_ATTEMPTS') return 'too-many';
  if (code === 'INVALID_OTP' || code === 'OTP_EXPIRED') return 'bad-code';
  return 'failed';
}

async function errorCode(response: Response): Promise<string | undefined> {
  try { return ((await response.json()) as { code?: string }).code; } catch { return undefined; }
}

/** Keeps the session, then tells the server about this phone so sync and nudges can find it. */
async function keep(response: Response): Promise<AccountResult<SignedIn>> {
  const token = response.headers.get('set-auth-token');
  const body = await response.json().catch(() => null) as { user?: { id?: string; name?: string; email?: string } } | null;
  if (!token || !body?.user?.id) return { ok: false, problem: 'failed' };
  await sessionStore.set(SESSION_KEY, token);
  await registerDevice(token);
  return { ok: true, mode: 'account', data: { userId: body.user.id, name: body.user.name ?? '', email: body.user.email ?? '' } };
}

/** This phone's id for the server: random, made once, kept in SecureStore. Sync uses it to skip the phone's own changes. */
export async function deviceId(): Promise<string> {
  let id = await sessionStore.get(DEVICE_KEY);
  if (!id) { id = Crypto.randomUUID(); await sessionStore.set(DEVICE_KEY, id); }
  return id;
}

async function registerDevice(token: string) {
  const id = await deviceId();
  const platform = Platform.OS === 'ios' || Platform.OS === 'android' ? Platform.OS : 'web';
  const name = platform === 'ios' ? 'iPhone' : platform === 'android' ? 'Android phone' : 'Web preview';
  // A failed registration doesn't undo the sign-in: sync registers again on its first run.
  await call('/devices', { id, platform, name }, token);
}

/** Step one of email sign-in: the server emails a six-digit code. */
export async function sendCode(email: string): Promise<AccountResult<null>> {
  if (!accountsLive()) return { ok: true, mode: 'local-preview', data: null };
  const response = await call('/auth/email-otp/send-verification-otp', { email: email.trim().toLowerCase(), type: 'sign-in' });
  return response?.ok ? { ok: true, mode: 'account', data: null } : { ok: false, problem: problemOf(response, response ? await errorCode(response) : undefined) };
}

/** Step two: the code from the email signs in (and makes the account the first time). */
export async function verifyCode(email: string, code: string): Promise<AccountResult<SignedIn>> {
  if (!/^\d{6}$/.test(code.trim())) return { ok: false, problem: 'bad-code' };
  if (!accountsLive()) return { ok: true, mode: 'local-preview', data: { userId: 'local', name: '', email } };
  const response = await call('/auth/sign-in/email-otp', { email: email.trim().toLowerCase(), otp: code.trim() });
  if (!response?.ok) return { ok: false, problem: problemOf(response, response ? await errorCode(response) : undefined) };
  return keep(response);
}

/**
 * Apple or Google: the phone's own sign-in sheet gives an ID token, which the server checks with Apple or Google.
 * The native sheets need `expo-apple-authentication` and a Google sign-in module, which aren't installed yet
 * (review/phase-21/NOTES.md), so with a live API these answer `not-ready` and the sheet offers email instead.
 */
export type IdTokenSource = (provider: 'apple' | 'google') => Promise<{ token: string; nonce?: string } | null>;
let idTokens: IdTokenSource | null = null;
export function setIdTokenSource(source: IdTokenSource | null) { idTokens = source; }

export async function signInWith(provider: 'apple' | 'google'): Promise<AccountResult<SignedIn>> {
  if (!accountsLive()) return { ok: true, mode: 'local-preview', data: { userId: 'local', name: '', email: '' } };
  if (!idTokens) return { ok: false, problem: 'not-ready' };
  const idToken = await idTokens(provider).catch(() => null);
  if (!idToken) return { ok: false, problem: 'failed' };
  const response = await call('/auth/sign-in/social', { provider, idToken });
  if (!response?.ok) return { ok: false, problem: problemOf(response) };
  return keep(response);
}

/** Ends the session on the server (when it can be reached) and forgets it here either way. */
export async function signOut() {
  const token = await sessionToken();
  if (token) await call('/auth/sign-out', {}, token);
  await sessionStore.remove(SESSION_KEY);
}

/** True when this phone holds a session for a real account (not the local preview). */
export async function isSignedIn(): Promise<boolean> {
  return accountsLive() && !!(await sessionToken());
}

export type AccountDataProblem = 'signed-out' | 'offline' | 'failed';

/** Everything life's server holds for this account (Phase 23 `GET /account/export`). */
export async function exportAccount(): Promise<{ ok: true; data: unknown } | { ok: false; problem: AccountDataProblem }> {
  const token = await sessionToken();
  if (!accountsLive() || !token) return { ok: false, problem: 'signed-out' };
  const response = await call('/account/export', null, token, 'GET');
  if (!response) return { ok: false, problem: 'offline' };
  if (response.status === 401) return { ok: false, problem: 'signed-out' };
  const data = response.ok ? await response.json().catch(() => null) : null;
  return data ? { ok: true, data } : { ok: false, problem: 'failed' };
}

/**
 * Closes the account on the server (Phase 23 `POST /account/delete`). Every session ends there, so the token is
 * forgotten here too. Nothing on this phone changes until the server has said yes.
 */
export async function closeAccount(): Promise<{ ok: true; deleteAfter: string } | { ok: false; problem: AccountDataProblem }> {
  const token = await sessionToken();
  if (!accountsLive() || !token) return { ok: false, problem: 'signed-out' };
  const response = await call('/account/delete', { confirm: 'DELETE' }, token);
  if (!response) return { ok: false, problem: 'offline' };
  if (response.status === 401) { await sessionStore.remove(SESSION_KEY); return { ok: false, problem: 'signed-out' }; }
  const body = response.ok ? await response.json().catch(() => null) as { closed?: boolean; deleteAfter?: string } | null : null;
  if (!body?.closed || !body.deleteAfter) return { ok: false, problem: 'failed' };
  await sessionStore.remove(SESSION_KEY);
  return { ok: true, deleteAfter: body.deleteAfter };
}

/**
 * Gives the server this phone's Expo push token, or `null` to stop push (Phase 23 `POST /push/register`). The token
 * itself comes from `expo-notifications`, which arrives with Phase 29's notifications; until then nothing calls this.
 */
export async function registerPushToken(token: string | null): Promise<boolean> {
  const session = await sessionToken();
  if (!accountsLive() || !session) return false;
  const response = await call('/push/register', { device: await deviceId(), token }, session);
  return response?.ok === true;
}

/** Words for each problem, for the sheet. */
export const problemWords: Record<AccountProblem, string> = {
  offline: 'life couldn’t reach the internet. Check your connection and try again.',
  'bad-code': 'That code didn’t work. Check the email, or send a new code.',
  'too-many': 'Too many tries. Wait a minute, then send a new code.',
  'not-ready': 'That way of signing in arrives with the next update. Use email for now.',
  failed: 'Sign-in didn’t go through. Try again in a moment.',
};
