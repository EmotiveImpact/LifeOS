import { BrainError, prepareExternalRequest, runBrain, type Capability, type ModelAdapter, type Request } from '@life/brain';
import { requireOptionalNativeModule } from 'expo';
import { Platform } from 'react-native';
import { SYSTEM_POLICY, modelPayload } from '@life/brain';

interface DeviceIntelligence { available(): Promise<boolean>; generate(prompt: string): Promise<string> }
const device = Platform.OS === 'web' ? null : requireOptionalNativeModule<DeviceIntelligence>('LifeIntelligence');
const deviceAdapter: ModelAdapter = {
  id: 'os-foundation-model', location: 'device', jobs: ['ask', 'extract', 'draft', 'coach', 'plan-explain'],
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
async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const base = apiBase();
  if (!base) throw new BrainError('UNAVAILABLE', 'The life API is not connected.');
  const token = await tokenProvider?.();
  const headers = new Headers(init?.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (!token && developmentLoopback(new URL(base)) && Platform.OS === 'web') {
    const session = await fetch(`${base}/dev/session`, { method: 'POST', credentials: 'include', signal: init?.signal });
    if (!session.ok) throw new BrainError('UNAVAILABLE', 'The local API could not establish a development session.');
  } else if (!token) throw new BrainError('UNAVAILABLE', 'Sign in is required before sending information to the life API.');
  return fetch(`${base}${path}`, { ...init, credentials: 'include', headers });
}
const networkAdapter: ModelAdapter = {
  id: 'life-api', location: 'cloud', jobs: ['ask', 'extract', 'draft', 'coach', 'plan-explain'],
  available: async () => !!endpoint,
  generate: async (request, signal) => {
    const outgoing = prepareExternalRequest(request);
    const response = await apiFetch('/ai/run', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(outgoing), signal });
    if (!response.ok) {
      if (response.status === 429) throw new BrainError('RATE_LIMITED', 'The request limit has been reached. Your message is saved.');
      throw new BrainError('UNAVAILABLE', response.status === 401 ? 'Please sign in again. Nothing was sent to a model.' : 'The model service is unavailable. Your message is saved.');
    }
    return response.json();
  },
};
export const brain = {
  run: (request: Request, signal?: AbortSignal) => runBrain(request, [deviceAdapter, networkAdapter], signal),
  capabilities: async (): Promise<Capability[]> => [{ id: 'life-rules', location: 'device', jobs: ['ask', 'extract', 'plan-explain'], available: true }, { id: deviceAdapter.id, location: 'device', jobs: deviceAdapter.jobs, available: await deviceAdapter.available() }, { id: networkAdapter.id, location: 'cloud', jobs: networkAdapter.jobs, available: !!endpoint, reason: endpoint ? 'Requires authentication and per-request permission; provider availability is checked by the API.' : 'No life API endpoint configured.' }],
};
