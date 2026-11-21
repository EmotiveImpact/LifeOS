import { useEffect, useRef, useState } from 'react';
import { BrainError, type FoodData, type Request } from '@life/brain';
import { useSeed } from '@/state/SeedProvider';
import { apiConfigured, brain } from './brain';
import { photoRequest, photoTrouble, type PhotoKind } from './food';
import { smallPhoto } from './photo';

/**
 * Reading a meal or a label from a photo (Phase 27), the `food` job on Life's vision model.
 *
 * - The photo leaves the phone only after the person's OK for that one photo (`ask`), like every cloud request.
 * - Private mode, or a build with no Life API, never sends it; the person adds the parts themselves.
 * - Nothing is logged here: the answer is items or a label for the person to check (`done`).
 */
export type ReadingStep =
  | { step: 'idle' }
  | { step: 'preparing' }
  | { step: 'ask'; request: Request; kind: PhotoKind }
  | { step: 'reading'; kind: PhotoKind }
  | { step: 'done'; data: FoodData; kind: PhotoKind }
  | { step: 'failed'; message: string };

export function useFoodReading() {
  const { data } = useSeed();
  const privateMode = !!data.prefs.privateMode;
  const [state, setState] = useState<ReadingStep>({ step: 'idle' });
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  const why = privateMode ? 'Private mode is on, so photos stay on your phone. You can add the parts yourself.'
    : !apiConfigured ? 'Reading photos needs Life’s AI, which this build isn’t connected to yet. You can add the parts yourself.' : null;

  const run = async (request: Request, kind: PhotoKind) => {
    controller.current?.abort();
    const running = new AbortController(); controller.current = running;
    setState({ step: 'reading', kind });
    try {
      const result = await brain.run(request, running.signal, { rules: false });
      if (running.signal.aborted) return;
      const read = result.data as FoodData | undefined;
      if (!read || (!read.items?.length && !read.label)) { setState({ step: 'failed', message: 'Life couldn’t find any food in this photo. Try again closer up, or add the parts yourself.' }); return; }
      setState({ step: 'done', data: read, kind });
    } catch (error) {
      if (running.signal.aborted) return;
      if (error instanceof BrainError && error.code === 'CONSENT_REQUIRED') { setState({ step: 'ask', request, kind }); return; }
      setState({ step: 'failed', message: photoTrouble(error) });
    } finally { if (controller.current === running) controller.current = null; }
  };

  return {
    state,
    /** Why a photo can't be read here, or null when it can. */
    why,
    start: async (kind: PhotoKind, uri: string) => {
      if (why) { setState({ step: 'failed', message: why }); return; }
      setState({ step: 'preparing' });
      try { await run(photoRequest(kind, await smallPhoto(uri), privateMode), kind); }
      catch (error) { setState({ step: 'failed', message: photoTrouble(error) }); }
    },
    /** The person's OK for this one photo. */
    allow: () => { if (state.step === 'ask' && !privateMode) void run({ ...state.request, consent: { requestId: state.request.id, locations: ['server', 'cloud'] } }, state.kind); },
    reset: () => { controller.current?.abort(); setState({ step: 'idle' }); },
  };
}
