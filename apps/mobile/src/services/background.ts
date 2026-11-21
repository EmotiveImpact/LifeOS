/**
 * Background work (Phase 29). The web preview has none; `background.native.ts` is the phone's.
 */
export const backgroundSupported = false;
/** Registers or removes the background task. */
export async function setBackgroundWork(_on: boolean): Promise<void> {}
