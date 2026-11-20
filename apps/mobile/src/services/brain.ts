import { BrainError, prepareExternalRequest, runBrain, type Capability, type ModelAdapter, type Request, type RunOptions } from '@life/brain';
import { BUSY_NOTE, OFFLINE_NOTE } from './aiQueue';
import { requireOptionalNativeModule } from 'expo';
import { Platform } from 'react-native';
import { SYSTEM_POLICY, modelPayload } from '@life/brain';

interface DeviceIntelligence { available(): Promise<boolean>; generate(prompt: string): Promise<string> }
const device = Platform.OS === 'web' ? null : requireOptionalNativeModule<DeviceIntelligence>('LifeIntelligence');
const deviceAdapter: ModelAdapter = {
  id: 'os-foundation-model', location: 'device', jobs: ['ask', 'extract', 'draft', 'coach', 'plan-explain', 'analyse'],
  // Apple's on-device model has a 4,096-token window shared by the policy, the
  // request and the answer, so history and memories are trimmed to fit.
  maxContextChars: 8000,
  available: async () => !!device && await device.available(),
  generate: async (request, signal) => {
    if (!device || signal.aborted) throw new BrainError('UNAVAILABLE', 'The on-device model is unavailable.');
    return JSON.parse(await device.generate(`${SYSTEM_POLICY}\n${JSON.stringify(modelPayload(request))}`));
  },
};
// Public endpoint only, never an AI key. The backend must authenticate requests.
const endpoint = process.env.EXPO_PUBLIC_LIFE_API_URL;
const developmentLoopback = (url: URL) => __DEV__ && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
function apiBase(): string | null {
  if (!endpoint) return null;
  const url = new URL(endpoint);
  if (url.username || url.password || url.search || url.hash || (url.protocol !== 'https:' && !developmentLoopback(url))) throw new BrainError('UNAVAILABLE', 'The life API needs a secure endpoint.');
  return url.origin;
}
let tokenProvider: (() => Promise<string | null>) | null = null;
/** An auth integration supplies a short-lived session from SecureStore. Never
 * store provider secrets or a fixed production API token in the application. */
export function setBrainSessionProvider(provider: (() => Promise<string | null>) | null) { tokenProvider = provider; }
export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const base = apiBase();
  if (!base) throw new BrainError('UNAVAILABLE', 'The life API is not connected.');
  const token = await tokenProvider?.();
  const headers = new Headers(init?.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (!token && developmentLoopback(new URL(base)) && Platform.OS === 'web') {
    const session = await fetch(`${base}/dev/session`, { method: 'POST', credentials: 'include', signal: init?.signal });
    if (!session.ok) throw new BrainError('UNAVAILABLE', 'The local API could not establish a development session.');
  } else if (!token) throw new BrainError('UNAVAILABLE', 'Sign in is required before sending information to the life API.');
  try { return await fetch(`${base}${path}`, { ...init, credentials: 'include', headers }); }
  catch (error) {
    // No connection: the request waits on this phone (services/aiQueue.ts) instead of failing. A stop is a stop.
    if (init?.signal?.aborted) throw error;
    throw new BrainError('OFFLINE', OFFLINE_NOTE);
  }
}
/** What the life API's refusals mean here (apps/api/src/router.ts). The API's own words are shown when it sends them. */
async function refusal(response: Response): Promise<BrainError> {
  const body = await response.json().catch(() => null) as { error?: string; message?: string } | null;
  const said = typeof body?.message === 'string' && body.message.length <= 300 ? body.message : null;
  switch (body?.error) {
    case 'CONSENT_REQUIRED': return new BrainError('CONSENT_REQUIRED', said ?? 'This needs your OK before it leaves your phone.');
    case 'RATE_LIMITED': return new BrainError('RATE_LIMITED', said ?? 'You’ve used today’s AI allowance. Your message is saved.');
    case 'PRIVATE_MODE': return new BrainError('UNAVAILABLE', 'Private mode is on, so this stays on your phone. Nothing was sent to a model.');
    case 'INVALID_OUTPUT': return new BrainError('INVALID_OUTPUT', 'The answer didn’t pass life’s checks, so nothing was changed.');
    case 'TIMEOUT': return new BrainError('TIMEOUT', 'The request stopped. Nothing was filed.');
    // Every model busy or down: worth another try later, so it waits like an offline request.
    case 'UNAVAILABLE': return new BrainError('OFFLINE', BUSY_NOTE);
  }
  if (response.status === 429) return new BrainError('RATE_LIMITED', 'The request limit has been reached. Your message is saved.');
  return new BrainError('UNAVAILABLE', response.status === 401 ? 'Please sign in again. Nothing was sent to a model.' : 'The model service is unavailable. Your message is saved.');
}
/** The life API checks the model's answer and sends it back unrendered; the runtime checks it again here. `relay`
 * lets it add one notice (an allowance running out) or a support signal (this phone shows its own support screen). */
const networkAdapter: ModelAdapter = {
  id: 'life-api', location: 'cloud', jobs: ['ask', 'extract', 'draft', 'coach', 'plan-explain', 'lesson', 'analyse', 'showMe', 'read-document', 'remember'], relay: true,
  available: async () => !!endpoint,
  generate: async (request, signal) => {
    const outgoing = prepareExternalRequest(request);
    const response = await apiFetch('/ai/run', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(outgoing), signal });
    if (!response.ok) throw await refusal(response);
    return response.json();
  },
};
/** Whether this build points at a life API. Without one, only the phone's own model and rules answer. */
export const apiConfigured = !!endpoint;
export const brain = {
  /** `options.rules: false` sends a job to a model on purpose ("Ask life to read it"); life's own rules answer first otherwise. */
  run: (request: Request, signal?: AbortSignal, options?: RunOptions) => runBrain(request, [deviceAdapter, networkAdapter], signal, options),
  capabilities: async (): Promise<Capability[]> => [{ id: 'life-rules', location: 'device', jobs: ['ask', 'extract', 'plan-explain'], available: true }, { id: deviceAdapter.id, location: 'device', jobs: deviceAdapter.jobs, available: await deviceAdapter.available() }, { id: networkAdapter.id, location: 'cloud', jobs: networkAdapter.jobs, available: !!endpoint, reason: endpoint ? 'Requires authentication and per-request permission; provider availability is checked by the API.' : 'No life API endpoint configured.' }],
};
