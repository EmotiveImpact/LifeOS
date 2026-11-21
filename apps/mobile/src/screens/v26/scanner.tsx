/**
 * Android and the web preview: no live code reader yet. VisionCamera's code reader is iPhone only; Android needs its
 * barcode plug-in (Google ML Kit), which waits on Edem's OK (Phase 27 NOTES). Typing the code works everywhere.
 */
export function BarcodeCamera(_props: { active: boolean; onCode: (code: string) => void }) {
  return null;
}

/** Whether this phone scans codes with its camera. */
export const scansCodes = false;
